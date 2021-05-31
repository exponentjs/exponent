// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXInAppPurchases/EXInAppPurchasesModule.h>

@interface EXInAppPurchasesModule ()

@property (weak, nonatomic) UMModuleRegistry *moduleRegistry;
@property (nonatomic, assign) BOOL queryingItems;
@property (nonatomic, weak) id <UMEventEmitterService> eventEmitter;
@property (strong, nonatomic) NSMutableDictionary *promises;
@property (strong, nonatomic) NSMutableDictionary *pendingTransactions;
@property (strong, nonatomic) NSMutableSet *retrievedItems;
@property (strong, nonatomic) SKProductsRequest *request;

@end

static NSString * const kEXPurchasesUpdatedEventName = @"Expo.purchasesUpdated";
static NSString * const kEXQueryHistoryKey = @"QUERY_HISTORY";
static NSString * const kEXQueryPurchasableKey = @"QUERY_PURCHASABLE";
static NSString * const kEXInAppSubPeriod = @"P0D";

static const int OK = 0;
static const int USER_CANCELED = 1;
static const int ERROR = 2;
static const int DEFERRED = 3;

@implementation EXInAppPurchasesModule

UM_EXPORT_MODULE(ExpoInAppPurchases);

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
  _eventEmitter = [moduleRegistry getModuleImplementingProtocol:@protocol(UMEventEmitterService)];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[kEXPurchasesUpdatedEventName];
}

- (void)startObserving {}
- (void)stopObserving {}

# pragma mark - Exported Methods

UM_EXPORT_METHOD_AS(connectAsync,
                    connectAsync:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  // Initialize listener and object properties
  [[SKPaymentQueue defaultQueue] addTransactionObserver:self];

  _promises = [NSMutableDictionary dictionary];
  _pendingTransactions = [NSMutableDictionary dictionary];
  _retrievedItems = [NSMutableSet set];

  _queryingItems = NO;
  resolve(nil);
}

UM_EXPORT_METHOD_AS(getProductsAsync,
                    getProductsAsync:(NSArray *)productIDs
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  [self setPromise:kEXQueryPurchasableKey resolve:resolve reject:reject];

  for (NSString *identifier in productIDs) {
    [_retrievedItems addObject:identifier];
  }
  _queryingItems = YES;
  [self requestProducts:productIDs];
}

UM_EXPORT_METHOD_AS(purchaseItemAsync,
                    purchaseItemAsync:(NSString *)productIdentifier
                    replace:(NSString *)purchaseToken // ignore on iOS
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  if (![SKPaymentQueue canMakePayments]) {
    reject(@"E_MISSING_PERMISSIONS", @"User cannot make payments", nil);
    return;
  }
  if (![_retrievedItems containsObject:productIdentifier]) {
    reject(@"E_ITEM_NOT_QUERIED", @"Must query item from store before calling purchase", nil);
    return;
  }

  // Make the request
  BOOL promiseSet = [self setPromise:productIdentifier resolve:resolve reject:reject];
  if (promiseSet) {
    _queryingItems = NO;
    [self requestProducts:@[productIdentifier]];
  }
}

UM_EXPORT_METHOD_AS(finishTransactionAsync,
                    finishTransactionAsync:(NSString *)transactionId
                    consume:(BOOL)consume // ignore on iOS
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  SKPaymentTransaction *transaction = _pendingTransactions[transactionId];
  _pendingTransactions[transactionId] = nil;
  if (transaction != nil) {
    [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
  }
  resolve(nil);
}

UM_EXPORT_METHOD_AS(getPurchaseHistoryAsync,
                    getPurchaseHistoryAsync:(BOOL)refresh // ignore on iOS
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  BOOL promiseSet = [self setPromise:kEXQueryHistoryKey resolve:resolve reject:reject];

  if (promiseSet) {
    // Request history
    [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
  }
}

UM_EXPORT_METHOD_AS(disconnectAsync,
                    disconnectAsync:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
  resolve(nil);
}

# pragma mark - Helper Methods

- (void)requestProducts:(NSArray *)productIdentifiers
{
  SKProductsRequest *productsRequest = [[SKProductsRequest alloc]
                                        initWithProductIdentifiers:[NSSet setWithArray:productIdentifiers]];
  // Keep a strong reference to the request
  _request = productsRequest;

  // Here we are the delegate since this class also implements SKProductsRequestDelegate
  productsRequest.delegate = self;

  // This will return in the productsRequest method below
  [productsRequest start];
}

- (void)handleQuery:(SKProductsResponse *)response {
  NSMutableArray *result = [NSMutableArray array];

  for (SKProduct *validProduct in response.products) {
    if (!validProduct.localizedDescription) { continue; } // skip product with nil values - this can happen if it is in review "rejected" state
    NSDictionary *productData = [self getProductData:validProduct];
    [result addObject:productData];
  }

  _queryingItems = NO;
  NSDictionary *res = [self formatResults:result withResponseCode:OK];
  [self resolvePromise:kEXQueryPurchasableKey value:res];
}

-(void)handlePurchase:(SKProductsResponse *)response {
  for (NSString *invalidIdentifier in response.invalidProductIdentifiers) {
    NSDictionary *results = [self formatResults:SKErrorStoreProductNotAvailable];
    [self resolvePromise:invalidIdentifier value:results];
  }

  for (SKProduct *validProduct in response.products) {
    if (!validProduct.localizedDescription) { continue; } // skip product with nil values - this can happen if it is in review "rejected" state
    [self purchase:validProduct];
  }
}

- (void)purchase:(SKProduct *)product
{
  SKPayment *payment = [SKPayment paymentWithProduct:product];
  [[SKPaymentQueue defaultQueue] addPayment:payment];
}

# pragma mark - StoreKit Transaction Observer Methods

/*
 This function is called both when purchasing an item and querying for item data
 */
- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response
{
  if (_queryingItems) {
    [self handleQuery:response];
  } else {
    [self handlePurchase:response];
  }
}

- (void)paymentQueueRestoreCompletedTransactionsFinished:(SKPaymentQueue *)queue
{
  NSMutableArray *results = [NSMutableArray array];

  for (SKPaymentTransaction *transaction in queue.transactions) {
    SKPaymentTransactionState transactionState = transaction.transactionState;
    if (transactionState == SKPaymentTransactionStateRestored || transactionState == SKPaymentTransactionStatePurchased) {
      NSDictionary * transactionData = [self getTransactionData:transaction acknowledged:YES];
      [results addObject:transactionData];

      [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
    }
  }

  NSDictionary *response = [self formatResults:results withResponseCode:OK];
  [self resolvePromise:kEXQueryHistoryKey value:response];
}

- (void)paymentQueue:(SKPaymentQueue *)queue restoreCompletedTransactionsFailedWithError:(NSError *)error {
  NSDictionary *response = [self formatResults:error.code];
  [self resolvePromise:kEXQueryHistoryKey value:response];
}

/*
 This method handles transactions from the transaction queue which may or may not be initiated by the user.
 Transactions must be removed from the queue after they are processed by calling finishTransaction.
 */
- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions
{
  for (SKPaymentTransaction *transaction in transactions) {
    switch(transaction.transactionState) {
      case SKPaymentTransactionStatePurchasing: {
        break;
      }
      case SKPaymentTransactionStatePurchased: {
        // Save transaction to be finished later
        _pendingTransactions[transaction.transactionIdentifier] = transaction;

        // Emit results
        NSArray *results = @[[self getTransactionData:transaction acknowledged:NO]];
        NSDictionary *response = [self formatResults:results withResponseCode:OK];
        [_eventEmitter sendEventWithName:kEXPurchasesUpdatedEventName body:response];

        // Resolve promise
        [self resolvePromise:transaction.payment.productIdentifier value:nil];
        break;
      }
      case SKPaymentTransactionStateRestored: {
        // Finish transaction right away since the developer has a record of this transaction via purchase history
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        break;
      }
      case SKPaymentTransactionStateDeferred: {
        // Emit results with deferred response code
        NSArray *results = @[[self getTransactionData:transaction acknowledged:NO]];
        NSDictionary *response = [self formatResults:results withResponseCode:DEFERRED];
        [_eventEmitter sendEventWithName:kEXPurchasesUpdatedEventName body:response];

        // Resolve promise
        [self resolvePromise:transaction.payment.productIdentifier value:nil];
        break;
      }
      case SKPaymentTransactionStateFailed: {
        // Emit results
        if (transaction.error.code == SKErrorPaymentCancelled){
          NSDictionary *response = [self formatResults:@[] withResponseCode:USER_CANCELED];
          [_eventEmitter sendEventWithName:kEXPurchasesUpdatedEventName body:response];
        } else {
          NSDictionary *response = [self formatResults:transaction.error.code];
          [_eventEmitter sendEventWithName:kEXPurchasesUpdatedEventName body:response];
        }

        // Finish transaction and resolve promise
        [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
        [self resolvePromise:transaction.payment.productIdentifier value:nil];
        break;
      }
    }
  }
}

# pragma mark - Handling Promises

// Returns a boolean indicating the promise was successfully set. Otherwise, we should return immediately
- (BOOL)setPromise:(NSString*)key resolve:(UMPromiseResolveBlock)resolve reject:(UMPromiseRejectBlock)reject
{
  NSArray *promise = _promises[key];

  if (promise == nil) {
    _promises[key] = @[resolve, reject];
    return YES;
  } else {
    reject(@"E_UNFINISHED_PROMISE", @"Must wait for promise to resolve before recalling function.", nil);
    return NO;
  }
}

- (void)resolvePromise:(NSString*)key value:(id)value
{
  NSArray *currentPromise = _promises[key];

  if (currentPromise != nil) {
    UMPromiseResolveBlock resolve = currentPromise[0];
    _promises[key] = nil;

    resolve(value);
  }
}

- (void)rejectPromise:(NSString*)key code:(NSString*)code message:(NSString*)message error:(NSError*) error
{
  NSArray* currentPromise = _promises[key];

  if (currentPromise != nil) {
    UMPromiseRejectBlock reject = currentPromise[1];
    _promises[key] = nil;

    reject(code, message, error);
  }
}

# pragma mark - Formatting Response

- (NSDictionary *)getProductData:(SKProduct *)product
{
  // Use with caution: P0D also implies non-renewable subscription.
  NSString *subscriptionPeriod = [self getSubscriptionPeriod:product];
  NSNumber *type = [subscriptionPeriod isEqualToString:kEXInAppSubPeriod] ? @(0) : @(1);

  NSDecimalNumber *oneMillion = [[NSDecimalNumber alloc] initWithInt:1000000];
  NSDecimalNumber *priceAmountMicros = [product.price decimalNumberByMultiplyingBy:oneMillion];
  NSString *description = product.localizedDescription ?: @"";
  NSString *title = product.localizedTitle ?: @"";

  NSNumberFormatter *priceFormatter = [[NSNumberFormatter alloc] init];
  priceFormatter.numberStyle = NSNumberFormatterCurrencyStyle;
  priceFormatter.locale = product.priceLocale;
  NSString *price = [priceFormatter stringFromNumber:product.price];

  return @{
           @"description": description,
           @"price": price,
           @"priceAmountMicros": priceAmountMicros,
           @"priceCurrencyCode": product.priceLocale.currencyCode,
           @"productId": product.productIdentifier,
           @"subscriptionPeriod": subscriptionPeriod,
           @"title": title,
           @"type": type
           };
}

- (NSDictionary *)getTransactionData:(SKPaymentTransaction *)transaction acknowledged:(BOOL)acknowledged
{
  NSData *receiptData = [NSData dataWithContentsOfURL:[[NSBundle mainBundle] appStoreReceiptURL]];

  // Get original transaction info if any
  SKPaymentTransaction *originalTransaction = transaction.originalTransaction;
  NSString *originalTransactionId = originalTransaction ? originalTransaction.transactionIdentifier : NSString.string;
  NSNumber *originalTransactionTime = originalTransaction ?
  @(originalTransaction.transactionDate.timeIntervalSince1970 * 1000) : @(0);

  return @{
           @"acknowledged": @(acknowledged),
           @"productId": transaction.payment.productIdentifier,
           @"orderId": transaction.transactionIdentifier,
           @"purchaseState": @(transaction.transactionState),
           @"purchaseTime": @(transaction.transactionDate.timeIntervalSince1970 * 1000),
           @"transactionReceipt": [receiptData base64EncodedStringWithOptions:0],
           @"originalPurchaseTime": originalTransactionTime,
           @"originalOrderId": originalTransactionId
           };
}

- (NSString *)getSubscriptionPeriod:(SKProduct *)product
{
  // Subscription period specified in ISO 8601 format to match Android implementation (e.g. P3M = 3 months)
  if (@available(iOS 11.2, *)) {
    NSString *unit = [self getUnit:product];
    unsigned long numUnits = (unsigned long)product.subscriptionPeriod.numberOfUnits;
    return [NSString stringWithFormat:@"P%lu%@", numUnits, unit];
  }

  // Default to P0D if we can't get this info so we assume all products are in app
  return kEXInAppSubPeriod;
}

- (NSString *)getUnit:(SKProduct *)product
{
  if (@available(iOS 11.2, *)) {
    switch(product.subscriptionPeriod.unit) {
      case SKProductPeriodUnitDay: {
        return @"D";
      }
      case SKProductPeriodUnitWeek: {
        return @"W";
      }
      case SKProductPeriodUnitMonth: {
        return @"M";
      }
      case SKProductPeriodUnitYear: {
        return @"Y";
      }
    }
  }
  return NSString.string;
}

- (NSDictionary *)formatResults:(NSArray *)results withResponseCode:(NSInteger)responseCode
{
  return @{
           @"results": results,
           @"responseCode": @(responseCode),
           };
}

- (NSDictionary *)formatResults:(SKErrorCode)errorCode
{
  int convertedErrorCode = [self errorCodeNativeToJS:errorCode];
  return @{
           @"results": @[],
           @"responseCode": @(ERROR),
           @"errorCode": @(convertedErrorCode),
           };
}

// Convert native error code to match TS enum IAPErrorCode
- (int)errorCodeNativeToJS:(SKErrorCode)errorCode
{
  switch(errorCode) {
    case SKErrorUnknown:
    case SKErrorUnsupportedPlatform:
      return 0; // UNKNOWN
    case SKErrorClientInvalid:
    case SKErrorPaymentInvalid:
    case SKErrorPaymentNotAllowed:
    case SKErrorPaymentCancelled:
    case SKErrorOverlayCancelled:
      return 1; // PAYMENT_INVALID
    case SKErrorOverlayTimeout:
      return 4; // SERVICE_TIMEOUT
    case SKErrorStoreProductNotAvailable:
      return 6; // ITEM_UNAVAILABLE
    case SKErrorCloudServiceRevoked:
    case SKErrorCloudServicePermissionDenied:
    case SKErrorCloudServiceNetworkConnectionFailed:
      return 10; // CLOUD_SERVICE
    case SKErrorPrivacyAcknowledgementRequired:
      return 11; // PRIVACY_UNACKNOWLEDGED
    case SKErrorUnauthorizedRequestData:
      return 12; // UNAUTHORIZED_REQUEST
    case SKErrorInvalidSignature:
    case SKErrorInvalidOfferPrice:
    case SKErrorInvalidOfferIdentifier:
    case SKErrorOverlayInvalidConfiguration:
    case SKErrorIneligibleForOffer:
      return 13; // INVALID_IDENTIFIER
    case SKErrorMissingOfferParams:
      return 14; // MISSING_PARAMS
    default:
      return 0; // UNKNOWN
  }
}

@end
