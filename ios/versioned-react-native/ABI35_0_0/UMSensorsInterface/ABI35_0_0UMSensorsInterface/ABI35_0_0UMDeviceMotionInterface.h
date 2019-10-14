// Copyright 2018-present 650 Industries. All rights reserved.

@protocol ABI35_0_0UMDeviceMotionInterface

- (float)getGravity;
- (void)sensorModuleDidSubscribeForDeviceMotionUpdates:(id)scopedSensorModule withHandler:(void (^)(NSDictionary *event))handlerBlock;
- (void)sensorModuleDidUnsubscribeForDeviceMotionUpdates:(id)scopedSensorModule;
- (void)setDeviceMotionUpdateInterval:(NSTimeInterval)intervalMs;
- (BOOL)isDeviceMotionAvailable;

@end
