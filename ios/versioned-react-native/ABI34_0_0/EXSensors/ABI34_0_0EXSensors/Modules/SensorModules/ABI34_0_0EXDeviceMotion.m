// Copyright 2015-present 650 Industries. All rights reserved.

#import <ABI34_0_0EXSensors/ABI34_0_0EXDeviceMotion.h>
#import <ABI34_0_0UMSensorsInterface/ABI34_0_0UMDeviceMotionInterface.h>

@implementation ABI34_0_0EXDeviceMotion

ABI34_0_0UM_EXPORT_MODULE(ExponentDeviceMotion);

- (NSDictionary *)constantsToExport
{
  if (self.sensorManager) {
    return @{ @"Gravity" : @([self.sensorManager getGravity]) };
  } else {
    return @{ @"Gravity" : [NSNull null] };
  }
}

- (const NSString *)updateEventName
{
  return @"deviceMotionDidUpdate";
}

- (id)getSensorServiceFromModuleRegistry:(ABI34_0_0UMModuleRegistry *)moduleRegistry
{
  return [moduleRegistry getModuleImplementingProtocol:@protocol(ABI34_0_0UMDeviceMotionInterface)];
}

- (void)setUpdateInterval:(double)updateInterval onSensorService:(id)sensorService
{
  [sensorService setDeviceMotionUpdateInterval:updateInterval];
}

- (BOOL)isAvailable:(id)sensorService
{
  return [sensorService isDeviceMotionAvailable];
}

- (void)subscribeToSensorService:(id)sensorService withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  [sensorService sensorModuleDidSubscribeForDeviceMotionUpdates:self withHandler:handlerBlock];
}

- (void)unsubscribeFromSensorService:(id)sensorService
{
  [sensorService sensorModuleDidUnsubscribeForDeviceMotionUpdates:self];
}

@end
