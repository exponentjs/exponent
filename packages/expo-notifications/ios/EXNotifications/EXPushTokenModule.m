// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXNotifications/EXPushTokenModule.h>

#import <UMCore/UMEventEmitterService.h>

static const NSString *onDevicePushTokenEventName = @"onDevicePushToken";

@interface EXPushTokenModule ()

@property (nonatomic, assign) BOOL isListening;
@property (nonatomic, assign) BOOL isBeingObserved;
@property (nonatomic, assign) BOOL isSettlingPromise;
@property (nonatomic, weak) EXPushTokenManager *pushTokenManager;

@property (nonatomic, weak) id<UMEventEmitterService> eventEmitter;

@property (nonatomic, strong) UMPromiseResolveBlock getDevicePushTokenResolver;
@property (nonatomic, strong) UMPromiseRejectBlock getDevicePushTokenRejecter;

@end

@implementation EXPushTokenModule

UM_EXPORT_MODULE(ExpoPushTokenManager);

# pragma mark - Exported methods

UM_EXPORT_METHOD_AS(getDevicePushTokenAsync,
                    getDevicePushTokenResolving:(UMPromiseResolveBlock)resolve rejecting:(UMPromiseRejectBlock)reject)
{
  if (_getDevicePushTokenRejecter) {
    reject(@"E_AWAIT_PROMISE", @"Another async call to this method is in progress. Await the first Promise.", nil);
    return;
  }

  _getDevicePushTokenResolver = resolve;
  _getDevicePushTokenRejecter = reject;
  [self setIsSettlingPromise:YES];

  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  });
}

# pragma mark - UMModuleRegistryConsumer

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _pushTokenManager = [moduleRegistry getSingletonModuleForName:@"PushTokenManager"];
}

# pragma mark - UMEventEmitter

- (NSArray<NSString *> *)supportedEvents
{
  return @[(NSString *)onDevicePushTokenEventName];
}

- (void)startObserving
{
  [self setIsBeingObserved:YES];
}

- (void)stopObserving
{
  [self setIsBeingObserved:NO];
}

- (BOOL)shouldListen
{
  return _isBeingObserved || _isSettlingPromise;
}

- (void)updateListeningState
{
  if ([self shouldListen] && !_isListening) {
    [_pushTokenManager addListener:self];
    _isListening = YES;
  } else if (![self shouldListen] && _isListening) {
    [_pushTokenManager removeListener:self];
    _isListening = NO;
  }
}

# pragma mark - EXPushTokenListener

- (void)onDidRegisterWithDeviceToken:(NSData *)devicePushToken
{
  NSMutableString *stringToken = [NSMutableString string];
  const char *bytes = [devicePushToken bytes];
  for (int i = 0; i < [devicePushToken length]; i++) {
    [stringToken appendFormat:@"%02.2hhx", bytes[i]];
  }

  if (_getDevicePushTokenResolver) {
    _getDevicePushTokenResolver(stringToken);
    [self onGetDevicePushTokenPromiseSettled];
  }

  if (_isBeingObserved) {
    [_eventEmitter sendEventWithName:(NSString *)onDevicePushTokenEventName
                                body:@{ @"devicePushToken": stringToken }];
  }
}

- (void)onDidFailToRegisterWithError:(NSError *)error
{
  if (_getDevicePushTokenRejecter) {
    NSString *message = @"Notification registration failed: ";

    // A common error, localizedDescription may not be helpful.
    if (error.code == 3000 && [NSCocoaErrorDomain isEqualToString:error.domain]) {
      message = [message stringByAppendingString:@"\"Push Notifications\" capability hasn't been added to the app in current environment: "];
    }

    message = [message stringByAppendingFormat:@"%@", error.localizedDescription];
    _getDevicePushTokenRejecter(@"E_REGISTRATION_FAILED", message, error);
    [self onGetDevicePushTokenPromiseSettled];
  }
}

- (void)onGetDevicePushTokenPromiseSettled
{
  _getDevicePushTokenResolver = nil;
  _getDevicePushTokenRejecter = nil;
  [self setIsSettlingPromise:NO];
}

# pragma mark - Internal state

- (void)setIsBeingObserved:(BOOL)isBeingObserved
{
  _isBeingObserved = isBeingObserved;
  [self updateListeningState];
}

- (void)setIsSettlingPromise:(BOOL)isSettlingPromise
{
  _isSettlingPromise = isSettlingPromise;
  [self updateListeningState];
}

@end
