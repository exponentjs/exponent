// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXSensors/EXSensorsManager.h>
#import <CoreMotion/CoreMotion.h>

// Gravity on the planet this module supports (currently just Earth) represented as m/s^2.
static const float EXGravity = 9.80665;

@interface EXSensorsManager ()

@property (nonatomic, strong) CMMotionManager *manager;
@property (nonatomic, strong) CMAltimeter *altimeter;
@property (nonatomic, strong) NSMutableDictionary *accelerometerHandlers;
@property (nonatomic, strong) NSMutableDictionary *barometerHandlers;
@property (nonatomic, strong) NSMutableDictionary *deviceMotionHandlers;
@property (nonatomic, strong) NSMutableDictionary *gyroscopeHandlers;
@property (nonatomic, strong) NSMutableDictionary *magnetometerHandlers;
@property (nonatomic, strong) NSMutableDictionary *magnetometerUncalibratedHandlers;

@end

@implementation EXSensorsManager

UM_REGISTER_MODULE();

+ (const NSArray<Protocol *> *)exportedInterfaces
{
  return @[@protocol(EXSensorsManager)];
}

- (instancetype)init
{
  if (self = [super init]) {
    _accelerometerHandlers = [[NSMutableDictionary alloc] init];
    _barometerHandlers = [[NSMutableDictionary alloc] init];
    _deviceMotionHandlers = [[NSMutableDictionary alloc] init];
    _gyroscopeHandlers = [[NSMutableDictionary alloc] init];
    _magnetometerHandlers = [[NSMutableDictionary alloc] init];
    _magnetometerUncalibratedHandlers = [[NSMutableDictionary alloc] init];
  }
  return self;
}

- (CMMotionManager *)manager
{
  if (!_manager) {
    _manager = [[CMMotionManager alloc] init];
  }
  return _manager;
}

- (CMAltimeter *)altimeter
{
  if (!_altimeter) {
    _altimeter = [[CMAltimeter alloc] init];
  }
  return _altimeter;
}

- (void)dealloc
{
  [[self manager] stopAccelerometerUpdates];
  [[self manager] stopDeviceMotionUpdates];
  [[self manager] stopGyroUpdates];
  [[self manager] stopMagnetometerUpdates];
  [self.altimeter stopRelativeAltitudeUpdates];
}

- (void)sensorModuleDidSubscribeForAccelerometerUpdates:(id)scopedSensorModule
                                            withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([[self manager] isAccelerometerAvailable]) {
    _accelerometerHandlers[scopedSensorModule] = handlerBlock;
  }
  if (![[self manager] isAccelerometerActive]) {
    [[self manager] setAccelerometerUpdateInterval:0.1f];
    __weak EXSensorsManager *weakSelf = self;
    [[self manager] startAccelerometerUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMAccelerometerData *data, NSError *error) {
      __strong EXSensorsManager *strongSelf = weakSelf;
      if (strongSelf) {
        for (void (^handler)(NSDictionary *) in strongSelf.accelerometerHandlers.allValues) {
          handler(@{
                    @"x": [NSNumber numberWithDouble:data.acceleration.x],
                    @"y": [NSNumber numberWithDouble:data.acceleration.y],
                    @"z": [NSNumber numberWithDouble:data.acceleration.z]
                    });
        }
      }
    }];
  }
}

- (void)sensorModuleDidUnsubscribeForAccelerometerUpdates:(id)scopedSensorModule
{
  [_accelerometerHandlers removeObjectForKey:scopedSensorModule];
  if (_accelerometerHandlers.count == 0) {
    [[self manager] stopAccelerometerUpdates];
  }
}

- (void)setAccelerometerUpdateInterval:(NSTimeInterval)intervalMs
{
  [[self manager] setAccelerometerUpdateInterval:intervalMs];
}

- (BOOL)isAccelerometerAvailable
{
  return [[self manager] isAccelerometerAvailable];
}

- (void)sensorModuleDidSubscribeForBarometerUpdates:(id)scopedSensorModule
                                        withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([self isBarometerAvailable]) {
    _barometerHandlers[scopedSensorModule] = handlerBlock;
  }
  __weak EXSensorsManager *weakSelf = self;
  [[self altimeter] startRelativeAltitudeUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMAltitudeData * _Nullable data, NSError * _Nullable error) {
    __strong EXSensorsManager *strongSelf = weakSelf;
    if (strongSelf && data) {
      for (void (^handler)(NSDictionary *) in strongSelf.barometerHandlers.allValues) {
        handler(@{
                  @"pressure": @([data.pressure doubleValue] * 10.0), // conversion from kPa to hPa
                  @"relativeAltitude": data.relativeAltitude,
                  });
      }
    }
  }];
}

- (void)sensorModuleDidUnsubscribeForBarometerUpdates:(id)scopedSensorModule
{
  [_barometerHandlers removeObjectForKey:scopedSensorModule];
  if (_barometerHandlers.count == 0) {
    [[self altimeter] stopRelativeAltitudeUpdates];
  }
}

- (void)setBarometerUpdateInterval:(NSTimeInterval)intervalMs
{
  // Do nothing
}

- (BOOL)isBarometerAvailable
{
  return [CMAltimeter isRelativeAltitudeAvailable];
}

- (void)sensorModuleDidSubscribeForDeviceMotionUpdates:(id)scopedSensorModule
                                           withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([[self manager] isDeviceMotionAvailable]) {
    _deviceMotionHandlers[scopedSensorModule] = handlerBlock;
  }
  if (![[self manager] isDeviceMotionActive]) {
    [self activateDeviceMotionUpdates];
  }
}

- (void)sensorModuleDidUnsubscribeForDeviceMotionUpdates:(id)scopedSensorModule
{
  [_deviceMotionHandlers removeObjectForKey:scopedSensorModule];
  if (_deviceMotionHandlers.count == 0 && _magnetometerHandlers.count == 0) {
    [[self manager] stopDeviceMotionUpdates];
  }
}

- (void)setDeviceMotionUpdateInterval:(NSTimeInterval)intervalMs
{
  [[self manager] setDeviceMotionUpdateInterval:intervalMs];
}

- (BOOL)isDeviceMotionAvailable
{
  return [[self manager] isDeviceMotionAvailable];
}

- (void)sensorModuleDidSubscribeForGyroscopeUpdates:(id)scopedSensorModule
                                        withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([[self manager] isGyroAvailable]) {
    _gyroscopeHandlers[scopedSensorModule] = handlerBlock;
  }
  if (![[self manager] isGyroActive]) {
    [[self manager] setGyroUpdateInterval:0.1f];
    __weak EXSensorsManager *weakSelf = self;
    [[self manager] startGyroUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMGyroData *data, NSError *error) {
      __strong EXSensorsManager *strongSelf = weakSelf;
      if (strongSelf) {
        for (void (^handler)(NSDictionary *) in strongSelf.gyroscopeHandlers.allValues) {
          // https://docs-assets.developer.apple.com/published/96e9d46b41/ab00c9d5-4f3d-475b-8020-95066068a18d.png
          handler(@{
                    @"x": [NSNumber numberWithDouble:data.rotationRate.x],
                    @"y": [NSNumber numberWithDouble:data.rotationRate.y],
                    @"z": [NSNumber numberWithDouble:data.rotationRate.z]
                    });
        }
      }
    }];
  }
}

- (void)sensorModuleDidUnsubscribeForGyroscopeUpdates:(id)scopedSensorModule
{
  [_gyroscopeHandlers removeObjectForKey:scopedSensorModule];
  if (_gyroscopeHandlers.count == 0) {
    [[self manager] stopGyroUpdates];
  }
}

- (void)setGyroscopeUpdateInterval:(NSTimeInterval)intervalMs
{
  [[self manager] setGyroUpdateInterval:intervalMs];
}

- (BOOL)isGyroAvailable
{
  return [[self manager] isGyroAvailable];
}

- (void)sensorModuleDidSubscribeForMagnetometerUpdates:(id)scopedSensorModule
                                           withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([[self manager] isDeviceMotionAvailable]) {
    _magnetometerHandlers[scopedSensorModule] = handlerBlock;
  }
  if (![[self manager] isDeviceMotionActive]) {
    [self activateDeviceMotionUpdates];
  }
}

- (void)sensorModuleDidUnsubscribeForMagnetometerUpdates:(id)scopedSensorModule
{
  [_magnetometerHandlers removeObjectForKey:scopedSensorModule];
  if (_deviceMotionHandlers.count == 0 && _magnetometerHandlers.count == 0) {
    [[self manager] stopDeviceMotionUpdates];
  }
}

- (void)setMagnetometerUpdateInterval:(NSTimeInterval)intervalMs
{
  [[self manager] setDeviceMotionUpdateInterval:intervalMs];
}

- (BOOL)isMagnetometerAvailable
{
  return [self isDeviceMotionAvailable];
}

- (void)sensorModuleDidSubscribeForMagnetometerUncalibratedUpdates:(id)scopedSensorModule
                                                       withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([[self manager] isMagnetometerAvailable]) {
    _magnetometerUncalibratedHandlers[scopedSensorModule] = handlerBlock;
  }
  if (![[self manager] isMagnetometerActive]) {
    [[self manager] setMagnetometerUpdateInterval:0.1f];
    __weak EXSensorsManager *weakSelf = self;
    [[self manager] startMagnetometerUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMMagnetometerData *data, NSError *error) {
      __strong EXSensorsManager *strongSelf = weakSelf;
      if (strongSelf) {
        for (void (^handler)(NSDictionary *) in strongSelf.magnetometerUncalibratedHandlers.allValues) {
          handler(@{
                    @"x": [NSNumber numberWithDouble:data.magneticField.x],
                    @"y": [NSNumber numberWithDouble:data.magneticField.y],
                    @"z": [NSNumber numberWithDouble:data.magneticField.z]
                    });
        }
      }
    }];
  }
}

- (void)sensorModuleDidUnsubscribeForMagnetometerUncalibratedUpdates:(id)scopedSensorModule
{
  [_magnetometerUncalibratedHandlers removeObjectForKey:scopedSensorModule];
  if (_magnetometerUncalibratedHandlers.count == 0) {
    [[self manager] stopMagnetometerUpdates];
  }
}

- (void)setMagnetometerUncalibratedUpdateInterval:(NSTimeInterval)intervalMs
{
  [[self manager] setMagnetometerUpdateInterval:intervalMs];
}

- (BOOL)isMagnetometerUncalibratedAvailable
{
  return [[self manager] isMagnetometerAvailable];
}

- (float)getGravity
{
  return EXGravity;
}

- (float)radiansToDegrees:(double)radians
{
    return radians * 180 / M_PI;
}

// Match https://www.w3.org/TR/orientation-event/
- (void)activateDeviceMotionUpdates
{
  float interval = 1.0f / 60.0f;
  [[self manager] setDeviceMotionUpdateInterval:interval];
  __weak EXSensorsManager *weakSelf = self;
  [[self manager] startDeviceMotionUpdatesUsingReferenceFrame:CMAttitudeReferenceFrameXArbitraryCorrectedZVertical toQueue:[NSOperationQueue mainQueue] withHandler:^(CMDeviceMotion *data, NSError *error) {
    __strong EXSensorsManager *strongSelf = weakSelf;
    if (!strongSelf) {
      return;
    }
    UIDeviceOrientation orientation = [[UIDevice currentDevice] orientation];
    int orientationDegrees;
    switch (orientation) {
      case UIDeviceOrientationPortrait:
        orientationDegrees = 0;
        break;
      case UIDeviceOrientationLandscapeLeft:
        orientationDegrees = -90;
        break;
      case UIDeviceOrientationLandscapeRight:
        orientationDegrees = 90;
        break;
      case UIDeviceOrientationPortraitUpsideDown:
        orientationDegrees = 180;
        break;
      default:
        orientationDegrees = 0;
        break;
    }
    
    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithDictionary:@{
                             @"acceleration": [NSNull null],
                             @"accelerationIncludingGravity": @{
                                 @"x": @((data.userAcceleration.x + data.gravity.x) * EXGravity),
                                 @"y": @((data.userAcceleration.y + data.gravity.y) * EXGravity),
                                 @"z": @((data.userAcceleration.z + data.gravity.z) * EXGravity)
                                 },
                             @"rotation": @{
                                 @"alpha": @(data.attitude.yaw),
                                 @"beta": @(data.attitude.pitch),
                                 @"gamma": @(data.attitude.roll),
                                 },
                             @"rotationRate": [NSNull null],
                             @"orientation": @(orientationDegrees),
                             @"interval": @(interval),
                             }];
    
    if ([[strongSelf manager] isGyroAvailable]) {
      result[@"acceleration"] = @{
        @"x": @(data.userAcceleration.x * EXGravity),
        @"y": @(data.userAcceleration.y * EXGravity),
        @"z": @(data.userAcceleration.z * EXGravity)
      };
      // Rate of rotation of the hosting device in space expressed in degrees per second.
      result[@"rotationRate"] = @{
        @"alpha": @([strongSelf radiansToDegrees:data.rotationRate.x]),
        @"beta": @([strongSelf radiansToDegrees:data.rotationRate.y]),
        @"gamma": @([strongSelf radiansToDegrees:data.rotationRate.z])
      };
    }

    // DeviceMotionUpdates handle DeviceMotion data as well as magnetic field
    for (void (^handler)(NSDictionary *) in strongSelf.deviceMotionHandlers.allValues) {
      handler(result);
    }
    
    for (void (^handler)(NSDictionary *) in strongSelf.magnetometerHandlers.allValues) {
      handler(@{
                @"x": [NSNumber numberWithDouble:data.magneticField.field.x],
                @"y": [NSNumber numberWithDouble:data.magneticField.field.y],
                @"z": [NSNumber numberWithDouble:data.magneticField.field.z]
                });
    }
  }];
}

@end


