// Copyright 2015-present 650 Industries. All rights reserved.

#import <ABI34_0_0UMCore/ABI34_0_0UMModuleRegistry.h>
#import <ABI34_0_0UMCore/ABI34_0_0UMAppLifecycleListener.h>
#import <ABI34_0_0UMCore/ABI34_0_0UMEventEmitterService.h>
#import <ABI34_0_0UMCore/ABI34_0_0UMAppLifecycleService.h>
#import <ABI34_0_0EXSensors/ABI34_0_0EXBaseSensorModule.h>

@interface ABI34_0_0EXBaseSensorModule () <ABI34_0_0UMAppLifecycleListener>

@property (nonatomic, weak) id sensorManager;
@property (nonatomic, weak) id<ABI34_0_0UMEventEmitterService> eventEmitter;
@property (nonatomic, weak) id<ABI34_0_0UMAppLifecycleService> lifecycleManager;

@property (nonatomic, weak) ABI34_0_0UMModuleRegistry *moduleRegistry;
@property (nonatomic, assign, getter=isWatching) BOOL watching;

@end

@implementation ABI34_0_0EXBaseSensorModule

# pragma mark - ABI34_0_0EXBaseSensorModule

- (id)getSensorServiceFromModuleRegistry:(ABI34_0_0UMModuleRegistry *)moduleRegistry
{
  NSAssert(false, @"You've subclassed ABI34_0_0EXBaseSensorModule, but didn't override the `getSensorServiceFromModuleRegistry` method.");
  return nil;
}

- (void)setUpdateInterval:(double)updateInterval onSensorService:(id)sensorService
{
  NSAssert(false, @"You've subclassed ABI34_0_0EXBaseSensorModule, but didn't override the `setUpdateInterval:onSensorService:` method.");
}

- (BOOL)isAvailable:(id)sensorService
{
  NSAssert(false, @"You've subclassed ABI34_0_0EXBaseSensorModule, but didn't override the `isAvailable` method.");
  return NO;
}

- (void)subscribeToSensorService:(id)sensorService withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  NSAssert(false, @"You've subclassed ABI34_0_0EXBaseSensorModule, but didn't override the `subscribeToSensorService:withHandler:` method.");
}

- (void)unsubscribeFromSensorService:(id)sensorService
{
  NSAssert(false, @"You've subclassed ABI34_0_0EXBaseSensorModule, but didn't override the `unsubscribeFromSensorService:` method.");
}

- (const NSString *)updateEventName
{
  NSAssert(false, @"You've subclassed ABI34_0_0EXBaseSensorModule, but didn't override the `updateEventName` method.");
  return nil;
}

# pragma mark - ABI34_0_0UMModuleRegistryConsumer

- (void)setModuleRegistry:(ABI34_0_0UMModuleRegistry *)moduleRegistry
{
  if (_moduleRegistry) {
    [_lifecycleManager unregisterAppLifecycleListener:self];
  }
  
  _lifecycleManager = nil;
  _eventEmitter = nil;
  [self stopObserving];
  _sensorManager = nil;
  
  if (moduleRegistry) {
    _eventEmitter = [moduleRegistry getModuleImplementingProtocol:@protocol(ABI34_0_0UMEventEmitterService)];
    _lifecycleManager = [moduleRegistry getModuleImplementingProtocol:@protocol(ABI34_0_0UMAppLifecycleService)];
    _sensorManager = [self getSensorServiceFromModuleRegistry:moduleRegistry];
  }
  
  if (_lifecycleManager) {
    [_lifecycleManager registerAppLifecycleListener:self];
  }
}

# pragma mark - ABI34_0_0UMEventEmitter

- (NSArray<NSString *> *)supportedEvents
{
  return @[(NSString *)[self updateEventName]];
}

- (void)startObserving {
  [self setWatching:YES];
  __weak ABI34_0_0EXBaseSensorModule *weakSelf = self;
  [self subscribeToSensorService:_sensorManager withHandler:^(NSDictionary *event) {
    __strong ABI34_0_0EXBaseSensorModule *strongSelf = weakSelf;
    if (strongSelf) {
      __strong id<ABI34_0_0UMEventEmitterService> eventEmitter = strongSelf.eventEmitter;
      if (eventEmitter) {
        [eventEmitter sendEventWithName:(NSString *)[strongSelf updateEventName] body:event];
      }
    }
  }];
}

- (void)stopObserving {
  [self setWatching:NO];
  [self unsubscribeFromSensorService:_sensorManager];
}

ABI34_0_0UM_EXPORT_METHOD_AS(setUpdateInterval, setUpdateInterval:(nonnull NSNumber *)intervalMs resolve:(ABI34_0_0UMPromiseResolveBlock)resolve reject:(ABI34_0_0UMPromiseRejectBlock)rejecter) {
  [self setUpdateInterval:([intervalMs doubleValue] / 1000) onSensorService:_sensorManager];
  resolve(nil);
}

ABI34_0_0UM_EXPORT_METHOD_AS(isAvailableAsync, isAvailableAsync:(ABI34_0_0UMPromiseResolveBlock)resolve rejecter:(ABI34_0_0UMPromiseRejectBlock)reject)
{
  resolve(@([self isAvailable:_sensorManager]));
}

# pragma mark - ABI34_0_0UMAppLifecycleListener

- (void)onAppBackgrounded {
  if ([self isWatching]) {
    [self unsubscribeFromSensorService:_sensorManager];
  }
}

- (void)onAppForegrounded {
  if ([self isWatching]) {
    [self startObserving];
  }
}

@end
