#import <UMCore/UMUIManager.h>
#import <UMCore/UMEventEmitterService.h>
#import <EXAdsAdMob/EXAdsAdMobRewarded.h>
#import <UMCore/UMUtilitiesInterface.h>

static NSString *const EXAdsAdMobRewardedUserDidEarnReward = @"rewardedVideoUserDidEarnReward";
static NSString *const EXAdsAdMobRewardedDidLoad = @"rewardedVideoDidLoad";
static NSString *const EXAdsAdMobRewardedDidFailToLoad = @"rewardedVideoDidFailToLoad";
static NSString *const EXAdsAdMobRewardedDidPresent = @"rewardedVideoDidPresent";
static NSString *const EXAdsAdMobRewardedDidFailToPresent = @"rewardedVideoDidFailToPresent";
static NSString *const EXAdsAdMobRewardedDidDismiss = @"rewardedVideoDidDismiss";

@interface EXAdsAdMobRewarded ()

@property (nonatomic, weak) id<UMEventEmitterService> eventEmitter;
@property (nonatomic, weak) id<UMUtilitiesInterface> utilities;
@property (nonatomic, strong) GADRewardedAd *rewardedAd;

@end

@implementation EXAdsAdMobRewarded {
    NSString *_adUnitID;
    BOOL _hasListeners;
    UMPromiseResolveBlock _requestAdResolver;
    UMPromiseRejectBlock _requestAdRejecter;
    UMPromiseResolveBlock _showAdResolver;
}

UM_EXPORT_MODULE(ExpoAdsAdMobRewardedVideoAdManager);

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
    _utilities = [moduleRegistry getModuleImplementingProtocol:@protocol(UMUtilitiesInterface)];
    _eventEmitter = [moduleRegistry getModuleImplementingProtocol:@protocol(UMEventEmitterService)];
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[
        EXAdsAdMobRewardedUserDidEarnReward,
        EXAdsAdMobRewardedDidLoad,
        EXAdsAdMobRewardedDidFailToLoad,
        EXAdsAdMobRewardedDidPresent,
        EXAdsAdMobRewardedDidFailToPresent,
        EXAdsAdMobRewardedDidDismiss,
    ];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)_maybeSendEventWithName:(NSString *)name body:(id)body {
    if (_hasListeners) {
        [_eventEmitter sendEventWithName:name body:body];
    }
}

- (void)stopObserving {
    _hasListeners = NO;
}

UM_EXPORT_METHOD_AS(setAdUnitID,
                    setAdUnitID:(NSString *)adUnitID
                    resolver:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
    _adUnitID = adUnitID;
    resolve(nil);
}

UM_EXPORT_METHOD_AS(requestAd,
                    requestAdWithAdditionalRequestParams:(NSDictionary *)additionalRequestParams
                    serverSideVerificationOptions:(NSDictionary *)ssvOptions
                    resolver:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
    if (_requestAdRejecter == nil) {
        _requestAdResolver = resolve;
        _requestAdRejecter = reject;
        
        self.rewardedAd = [[GADRewardedAd alloc] initWithAdUnitID:_adUnitID];
        GADRequest *request = [GADRequest request];
        if (additionalRequestParams) {
            GADExtras *extras = [[GADExtras alloc] init];
            extras.additionalParameters = additionalRequestParams;
            [request registerAdNetworkExtras:extras];
        }
        if(ssvOptions) {
            GADServerSideVerificationOptions *options = [[GADServerSideVerificationOptions alloc] init];
            if(ssvOptions[@"userId"] && [ssvOptions[@"userId"] isKindOfClass:[NSString class]]) {
                options.userIdentifier = ssvOptions[@"userId"];
            }
            if(ssvOptions[@"customData"] && [ssvOptions[@"customData"] isKindOfClass:[NSString class]]) {
                options.customRewardString = ssvOptions[@"customData"];
            }
            self.rewardedAd.serverSideVerificationOptions = options;
        }
        UM_WEAKIFY(self);
        dispatch_async(dispatch_get_main_queue(), ^{
            UM_ENSURE_STRONGIFY(self);
            [self.rewardedAd loadRequest:request
                       completionHandler:^(GADRequestError * _Nullable error) {
                UM_ENSURE_STRONGIFY(self);
                if (error) {
                    [self _maybeSendEventWithName:EXAdsAdMobRewardedDidFailToLoad
                                             body:@{ @"name": [error description] }];
                    self->_requestAdRejecter(@"E_AD_REQUEST_FAILED", [error description], error);
                    [self _cleanupRequestAdPromise];
                } else {
                    [self _maybeSendEventWithName:EXAdsAdMobRewardedDidLoad body:nil];
                    self->_requestAdResolver(nil);
                    [self _cleanupRequestAdPromise];
                }
            }];
        });
    } else {
        reject(@"E_AD_REQUESTING", @"An ad is already being requested, await the previous promise.", nil);
    }
}

UM_EXPORT_METHOD_AS(showAd,
                    showAd:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
    if (_showAdResolver == nil && self.rewardedAd.isReady) {
        _showAdResolver = resolve;
        UM_WEAKIFY(self);
        dispatch_async(dispatch_get_main_queue(), ^{
            UM_ENSURE_STRONGIFY(self);
            [self.rewardedAd presentFromRootViewController:self.utilities.currentViewController delegate:self];
        });
    } else if (self.rewardedAd.isReady) {
        reject(@"E_AD_BEING_SHOWN", @"Ad is already being shown, await the previous promise.", nil);
    } else {
        reject(@"E_AD_NOT_READY", @"Ad is not ready.", nil);
    }
}

UM_EXPORT_METHOD_AS(dismissAd,
                    dismissAd:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
    UM_WEAKIFY(self);
    dispatch_async(dispatch_get_main_queue(), ^{
        UM_ENSURE_STRONGIFY(self);
        UIViewController *presentedViewController = self.utilities.currentViewController;
        if (presentedViewController != nil && [NSStringFromClass([presentedViewController class]) isEqualToString:@"GADInterstitialViewController"]) {
            [presentedViewController dismissViewControllerAnimated:true completion:^{
                resolve(nil);
            }];
        } else {
            reject(@"E_AD_NOT_SHOWN", @"Ad is not being shown.", nil);
        }
    });
}

UM_EXPORT_METHOD_AS(getIsReady,
                    getIsReady:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
    resolve([NSNumber numberWithBool:self.rewardedAd.isReady]);
}


- (void)_cleanupRequestAdPromise
{
    _requestAdResolver = nil;
    _requestAdRejecter = nil;
}

- (void)rewardedAd:(GADRewardedAd *)rewardedAd userDidEarnReward:(GADAdReward *)reward {
    [self _maybeSendEventWithName:EXAdsAdMobRewardedUserDidEarnReward
                             body:@{ @"type": reward.type, @"amount": reward.amount }];
}

- (void)rewardedAdDidPresent:(GADRewardedAd *)rewardedAd {
    [self _maybeSendEventWithName:EXAdsAdMobRewardedDidPresent body:nil];
    _showAdResolver(nil);
    _showAdResolver = nil;
}

- (void)rewardedAd:(GADRewardedAd *)rewardedAd didFailToPresentWithError:(NSError *)error
{
    [self _maybeSendEventWithName:EXAdsAdMobRewardedDidFailToPresent
                             body:@{ @"name": [error description] }];
    _requestAdRejecter(@"E_AD_REQUEST_FAILED", [error description], error);
    [self _cleanupRequestAdPromise];
}

- (void)rewardedAdDidDismiss:(GADRewardedAd *)rewardedAd {
    [self _maybeSendEventWithName:EXAdsAdMobRewardedDidDismiss body:nil];
}

@end

