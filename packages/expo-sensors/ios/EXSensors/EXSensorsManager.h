// Copyright 2015-present 650 Industries. All rights reserved.

#import <UMCore/UMInternalModule.h>

@protocol EXSensorsManager

- (void)sensorModuleDidSubscribeForAccelerometerUpdates:(id)scopedSensorModule
                                            withHandler:(void (^)(NSDictionary *event))handlerBlock;
- (void)sensorModuleDidUnsubscribeForAccelerometerUpdates:(id)scopedSensorModule;
- (void)setAccelerometerUpdateInterval:(NSTimeInterval)intervalMs;
- (BOOL)isAccelerometerAvailable;

- (void)sensorModuleDidSubscribeForBarometerUpdates:(id)scopedSensorModule
                                        withHandler:(void (^)(NSDictionary *event))handlerBlock;
- (void)sensorModuleDidUnsubscribeForBarometerUpdates:(id)scopedSensorModule;
- (void)setBarometerUpdateInterval:(NSTimeInterval)intervalMs;
- (BOOL)isBarometerAvailable;

- (float)getGravity;
- (void)sensorModuleDidSubscribeForDeviceMotionUpdates:(id)scopedSensorModule
                                           withHandler:(void (^)(NSDictionary *event))handlerBlock;
- (void)sensorModuleDidUnsubscribeForDeviceMotionUpdates:(id)scopedSensorModule;
- (void)setDeviceMotionUpdateInterval:(NSTimeInterval)intervalMs;
- (BOOL)isDeviceMotionAvailable;

- (void)sensorModuleDidSubscribeForGyroscopeUpdates:(id)scopedSensorModule
                                        withHandler:(void (^)(NSDictionary *event))handlerBlock;
- (void)sensorModuleDidUnsubscribeForGyroscopeUpdates:(id)scopedSensorModule;
- (void)setGyroscopeUpdateInterval:(NSTimeInterval)intervalMs;
- (BOOL)isGyroAvailable;

- (void)sensorModuleDidSubscribeForMagnetometerUpdates:(id)scopedSensorModule
                                           withHandler:(void (^)(NSDictionary *event))handlerBlock;
- (void)sensorModuleDidUnsubscribeForMagnetometerUpdates:(id)scopedSensorModule;
- (void)setMagnetometerUpdateInterval:(NSTimeInterval)intervalMs;
- (BOOL)isMagnetometerAvailable;

- (void)sensorModuleDidSubscribeForMagnetometerUncalibratedUpdates:(id)scopedSensorModule
                                                       withHandler:(void (^)(NSDictionary *event))handlerBlock;
- (void)sensorModuleDidUnsubscribeForMagnetometerUncalibratedUpdates:(id)scopedSensorModule;
- (void)setMagnetometerUncalibratedUpdateInterval:(NSTimeInterval)intervalMs;
- (BOOL)isMagnetometerUncalibratedAvailable;

@end

@interface EXSensorsManager : NSObject <UMInternalModule, EXSensorsManager>

@end
