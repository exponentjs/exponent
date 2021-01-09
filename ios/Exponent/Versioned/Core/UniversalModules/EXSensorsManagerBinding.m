#if __has_include(<EXSensors/EXSensorsManager.h>)

// Copyright © 2018 650 Industries. All rights reserved.

#import "EXSensorsManagerBinding.h"

@interface EXSensorsManagerBinding ()

@property (nonatomic, strong) NSString *experienceId;
@property (nonatomic, weak) id<EXSensorsManagerBindingDelegate> kernelService;

@end

@implementation EXSensorsManagerBinding

- (instancetype)initWithExperienceId:(NSString *)experienceId andKernelService:(id<EXSensorsManagerBindingDelegate>)kernelService
{
  if (self = [super init]) {
    _experienceId = experienceId;
    _kernelService = kernelService;
  }
  return self;
}

- (void)sensorModuleDidSubscribeForAccelerometerUpdates:(id)scopedSensorModule withHandler:(void (^)(NSDictionary *))handlerBlock {
  [_kernelService sensorModuleDidSubscribeForAccelerometerUpdatesOfExperience:_experienceId withHandler:handlerBlock];
}

- (void)sensorModuleDidSubscribeForDeviceMotionUpdates:(id)scopedSensorModule withHandler:(void (^)(NSDictionary *))handlerBlock {
  [_kernelService sensorModuleDidSubscribeForDeviceMotionUpdatesOfExperience:_experienceId withHandler:handlerBlock];
}

- (void)sensorModuleDidSubscribeForGyroscopeUpdates:(id)scopedSensorModule withHandler:(void (^)(NSDictionary *))handlerBlock {
  [_kernelService sensorModuleDidSubscribeForGyroscopeUpdatesOfExperience:_experienceId withHandler:handlerBlock];
}

- (void)sensorModuleDidSubscribeForMagnetometerUncalibratedUpdates:(id)scopedSensorModule withHandler:(void (^)(NSDictionary *))handlerBlock {
  [_kernelService sensorModuleDidSubscribeForMagnetometerUncalibratedUpdatesOfExperience:_experienceId withHandler:handlerBlock];
}

- (void)sensorModuleDidSubscribeForMagnetometerUpdates:(id)scopedSensorModule withHandler:(void (^)(NSDictionary *))handlerBlock {
  [_kernelService sensorModuleDidSubscribeForMagnetometerUpdatesOfExperience:_experienceId withHandler:handlerBlock];
}

- (void)sensorModuleDidSubscribeForBarometerUpdates:(id)scopedSensorModule withHandler:(void (^)(NSDictionary *))handlerBlock {
  [_kernelService sensorModuleDidSubscribeForBarometerUpdatesOfExperience:_experienceId withHandler:handlerBlock];
}

- (void)sensorModuleDidUnsubscribeForAccelerometerUpdates:(id)scopedSensorModule {
  [_kernelService sensorModuleDidUnsubscribeForAccelerometerUpdatesOfExperience:_experienceId];
}

- (void)sensorModuleDidUnsubscribeForDeviceMotionUpdates:(id)scopedSensorModule {
  [_kernelService sensorModuleDidUnsubscribeForDeviceMotionUpdatesOfExperience:_experienceId];
}

- (void)sensorModuleDidUnsubscribeForGyroscopeUpdates:(id)scopedSensorModule {
  [_kernelService sensorModuleDidUnsubscribeForGyroscopeUpdatesOfExperience:_experienceId];
}

- (void)sensorModuleDidUnsubscribeForMagnetometerUncalibratedUpdates:(id)scopedSensorModule {
  [_kernelService sensorModuleDidUnsubscribeForMagnetometerUncalibratedUpdatesOfExperience:_experienceId];
}

- (void)sensorModuleDidUnsubscribeForMagnetometerUpdates:(id)scopedSensorModule {
  [_kernelService sensorModuleDidUnsubscribeForMagnetometerUpdatesOfExperience:_experienceId];
}

- (void)sensorModuleDidUnsubscribeForBarometerUpdates:(id)scopedSensorModule {
  [_kernelService sensorModuleDidUnsubscribeForBarometerUpdatesOfExperience:_experienceId];
}

- (void)setAccelerometerUpdateInterval:(NSTimeInterval)intervalMs {
  [_kernelService setAccelerometerUpdateInterval:intervalMs];
}

- (BOOL)isAccelerometerAvailable {
  return [_kernelService isAccelerometerAvailable];
}

- (void)setDeviceMotionUpdateInterval:(NSTimeInterval)intervalMs {
  [_kernelService setDeviceMotionUpdateInterval:intervalMs];
}

- (float)getGravity {
  return [_kernelService getGravity];
}

- (BOOL)isDeviceMotionAvailable {
  return [_kernelService isDeviceMotionAvailable];
}

- (void)setGyroscopeUpdateInterval:(NSTimeInterval)intervalMs {
  [_kernelService setGyroscopeUpdateInterval:intervalMs];
}

- (BOOL)isGyroAvailable {
  return [_kernelService isGyroAvailable];
}

- (void)setMagnetometerUncalibratedUpdateInterval:(NSTimeInterval)intervalMs {
  [_kernelService setMagnetometerUncalibratedUpdateInterval:intervalMs];
}

- (BOOL)isMagnetometerUncalibratedAvailable {
  return [_kernelService isMagnetometerUncalibratedAvailable];
}

- (void)setMagnetometerUpdateInterval:(NSTimeInterval)intervalMs {
  [_kernelService setMagnetometerUpdateInterval:intervalMs];
}

- (BOOL)isMagnetometerAvailable {
  return [_kernelService isMagnetometerAvailable];
}

- (void)setBarometerUpdateInterval:(NSTimeInterval)intervalMs {
  [_kernelService setBarometerUpdateInterval:intervalMs];
}

- (BOOL)isBarometerAvailable {
  return [_kernelService isBarometerAvailable];
}

@end

#endif
