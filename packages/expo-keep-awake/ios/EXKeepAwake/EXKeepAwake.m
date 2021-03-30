// Copyright 2018-present 650 Industries. All rights reserved.

#import <UMCore/UMModuleRegistry.h>
#import <EXKeepAwake/EXKeepAwake.h>
#import <UMCore/UMAppLifecycleService.h>
#import <UMCore/UMUtilities.h>

@interface EXKeepAwake () <UMAppLifecycleListener>

@property (nonatomic, weak) id<UMAppLifecycleService> lifecycleManager;
@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;

@end

@implementation EXKeepAwake {
  NSMutableSet *_activeTags;
}

- (instancetype)init {
  self = [super init];
  _activeTags = [NSMutableSet set];
  return self;
}

UM_EXPORT_MODULE(ExpoKeepAwake);

# pragma mark - UMModuleRegistryConsumer

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  if (_moduleRegistry) {
    [_lifecycleManager unregisterAppLifecycleListener:self];
  }
  
  _lifecycleManager = nil;
  
  if (moduleRegistry) {
    _lifecycleManager = [moduleRegistry getModuleImplementingProtocol:@protocol(UMAppLifecycleService)];
  }
  
  if (_lifecycleManager) {
    [_lifecycleManager registerAppLifecycleListener:self];
  }
}

UM_EXPORT_METHOD_AS(isAvailableAsync,
                    isAvailableAsync:(UMPromiseResolveBlock)resolve
                            rejecter:(UMPromiseRejectBlock)reject)
{
  resolve(@YES);
}

UM_EXPORT_METHOD_AS(activate, activate:(NSString *)tag
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  if(![self shouldBeActive]) {
    [UMUtilities performSynchronouslyOnMainThread:^{
      [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    }];
  }
  [_activeTags addObject:tag];
  resolve(@YES);
}

UM_EXPORT_METHOD_AS(deactivate, deactivate:(NSString *)tag
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  [_activeTags removeObject:tag];
  if (![self shouldBeActive]) {
    [UMUtilities performSynchronouslyOnMainThread:^{
      [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
    }];
  }
  resolve(@YES);
}

# pragma mark - UMAppLifecycleListener

- (void)onAppBackgrounded {
  [UMUtilities performSynchronouslyOnMainThread:^{
    [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
  }];
}

- (void)onAppForegrounded {
  if ([self shouldBeActive]) {
    [UMUtilities performSynchronouslyOnMainThread:^{
      [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    }];
  }
}

- (BOOL)shouldBeActive {
  return [_activeTags count] > 0;
}

@end
