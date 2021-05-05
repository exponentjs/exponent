// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXSplashScreen/EXSplashScreenModule.h>
#import <EXSplashScreen/EXSplashScreenService.h>
#import <UMCore/UMAppLifecycleService.h>
#import <UMCore/UMUtilities.h>

@interface EXSplashScreenModule ()

@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;
@property (nonatomic, weak) id<UMUtilitiesInterface> utilities;

@end

@implementation EXSplashScreenModule

UM_EXPORT_MODULE(ExpoSplashScreen);

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
  _utilities = [moduleRegistry getModuleImplementingProtocol:@protocol(UMUtilitiesInterface)];
  [[moduleRegistry getModuleImplementingProtocol:@protocol(UMAppLifecycleService)] registerAppLifecycleListener:self];
}

UM_EXPORT_METHOD_AS(hideAsync,
                    hideWithResolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  UM_WEAKIFY(self);
  dispatch_async(dispatch_get_main_queue(), ^{
    UM_ENSURE_STRONGIFY(self);
    UIViewController *currentViewController = self.utilities.currentViewController;
    [[self splashScreenService] hideSplashScreenFor:currentViewController
                                    successCallback:^(BOOL hasEffect){ resolve(@(hasEffect)); }
                                    failureCallback:^(NSString *message){ reject(@"ERR_SPLASH_SCREEN_CANNOT_HIDE", message, nil); }];
  });
}

UM_EXPORT_METHOD_AS(preventAutoHideAsync,
                    preventAutoHideWithResolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  UM_WEAKIFY(self);
  dispatch_async(dispatch_get_main_queue(), ^{
    UM_ENSURE_STRONGIFY(self);
    UIViewController *currentViewController = self.utilities.currentViewController;
    [[self splashScreenService] preventSplashScreenAutoHideFor:currentViewController
                                               successCallback:^(BOOL hasEffect){ resolve(@(hasEffect)); }
                                               failureCallback:^(NSString *message){ reject(@"ERR_SPLASH_SCREEN_CANNOT_PREVENT_AUTOHIDE", message, nil); }];
  });
}

UM_EXPORT_METHOD_AS(setSplashScreenAutoHideEnabled,
                    setSplashScreenAutoHideEnabled:(BOOL)splashScreenAutoHideEnabled
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  [[self splashScreenService] setSplashScreenAutoHideEnabled:splashScreenAutoHideEnabled];
  resolve(nil);
}

# pragma mark - UMAppLifecycleListener

- (void)onAppBackgrounded {}

- (void)onAppForegrounded {}

- (void)onAppContentDidAppear
{
  UM_WEAKIFY(self);
  dispatch_async(dispatch_get_main_queue(), ^{
    UM_ENSURE_STRONGIFY(self);
    UIViewController* currentViewController = self.utilities.currentViewController;
    [[self splashScreenService] onAppContentDidAppear:currentViewController];
  });
}

- (void)onAppContentWillReload
{
  UM_WEAKIFY(self);
  dispatch_async(dispatch_get_main_queue(), ^{
    UM_ENSURE_STRONGIFY(self);
    UIViewController* currentViewController = self.utilities.currentViewController;
    [[self splashScreenService] onAppContentWillReload:currentViewController];
  });
}

# pragma mark - internals

/**
 * Tries to obtain singleton module that is registered as "SplashScreen".
 * Silent agreement is that registered module conforms to "EXSplashScreenService" protocol.
 */
- (id<EXSplashScreenService>)splashScreenService
{
  return [self.moduleRegistry getSingletonModuleForName:@"SplashScreen"];
}

@end
