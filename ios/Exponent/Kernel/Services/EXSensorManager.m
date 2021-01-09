// Copyright 2015-present 650 Industries. All rights reserved.

#import "EXKernel.h"
#import "EXSensorManager.h"
#import <CoreMotion/CoreMotion.h>

// Gravity on the planet this module supports (currently just Earth) represented as m/s^2.
static const float EXGravity = 9.80665;

@interface EXSensorManager ()

@property (nonatomic, strong) CMMotionManager *manager;
@property (nonatomic, strong) CMAltimeter *altimeter;
@property (nonatomic, strong) NSMutableDictionary *accelerometerHandlers;
@property (nonatomic, strong) NSMutableDictionary *barometerHandlers;
@property (nonatomic, strong) NSMutableDictionary *deviceMotionHandlers;
@property (nonatomic, strong) NSMutableDictionary *gyroscopeHandlers;
@property (nonatomic, strong) NSMutableDictionary *magnetometerHandlers;
@property (nonatomic, strong) NSMutableDictionary *magnetometerUncalibratedHandlers;

@end

@implementation EXSensorManager

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
  [self.manager stopAccelerometerUpdates];
  [self.manager stopDeviceMotionUpdates];
  [self.manager stopGyroUpdates];
  [self.manager stopMagnetometerUpdates];
  [self.altimeter stopRelativeAltitudeUpdates];
}

- (void)sensorModuleDidSubscribeForAccelerometerUpdatesOfExperience:experienceId
                                            withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([self.manager isAccelerometerAvailable]) {
    self.accelerometerHandlers[experienceId] = handlerBlock;
  }
  if (![self.manager isAccelerometerActive]) {
    [self.manager setAccelerometerUpdateInterval:0.1f];
    [self.manager startAccelerometerUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMAccelerometerData *data, NSError *error) {
      for (void (^handler)(NSDictionary *) in self.accelerometerHandlers.allValues) {
        handler(@{
                  @"x": [NSNumber numberWithDouble:data.acceleration.x],
                  @"y": [NSNumber numberWithDouble:data.acceleration.y],
                  @"z": [NSNumber numberWithDouble:data.acceleration.z]
                  });
      }
    }];
  }
}

- (void)sensorModuleDidUnsubscribeForAccelerometerUpdatesOfExperience:experienceId
{
  [self.accelerometerHandlers removeObjectForKey:experienceId];
  if (self.accelerometerHandlers.count == 0) {
    [self.manager stopAccelerometerUpdates];
  }
}

- (void)setAccelerometerUpdateInterval:(NSTimeInterval)intervalMs
{
  [self.manager setAccelerometerUpdateInterval:intervalMs];
}

- (void)sensorModuleDidSubscribeForDeviceMotionUpdatesOfExperience:(NSString *)experienceId
                                           withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([self.manager isDeviceMotionAvailable]) {
    self.deviceMotionHandlers[experienceId] = handlerBlock;
  }
  if (![self.manager isDeviceMotionActive]) {
    [self activateDeviceMotionUpdates];
  }
}

- (void)sensorModuleDidUnsubscribeForDeviceMotionUpdatesOfExperience:(NSString *)experienceId
{
  [self.deviceMotionHandlers removeObjectForKey:experienceId];
  if (self.deviceMotionHandlers.count == 0 && self.magnetometerHandlers.count == 0) {
    [self.manager stopDeviceMotionUpdates];
  }
}

- (void)setDeviceMotionUpdateInterval:(NSTimeInterval)intervalMs
{
  [self.manager setDeviceMotionUpdateInterval:intervalMs];
}

- (void)sensorModuleDidSubscribeForGyroscopeUpdatesOfExperience:(NSString *)experienceId
                                        withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([self.manager isGyroAvailable]) {
    self.gyroscopeHandlers[experienceId] = handlerBlock;
  }
  if (![self.manager isGyroActive]) {
    [self.manager setGyroUpdateInterval:0.1f];
    [self.manager startGyroUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMGyroData *data, NSError *error) {
      for (void (^handler)(NSDictionary *) in self.gyroscopeHandlers.allValues) {
        handler(@{
                  @"x": [NSNumber numberWithDouble:data.rotationRate.x],
                  @"y": [NSNumber numberWithDouble:data.rotationRate.y],
                  @"z": [NSNumber numberWithDouble:data.rotationRate.z]
                  });
      }
    }];
  }
}

- (void)sensorModuleDidUnsubscribeForGyroscopeUpdatesOfExperience:(NSString *)experienceId
{
  [self.gyroscopeHandlers removeObjectForKey:experienceId];
  if (self.gyroscopeHandlers.count == 0) {
    [self.manager stopGyroUpdates];
  }
}

- (void)setGyroscopeUpdateInterval:(NSTimeInterval)intervalMs
{
  [self.manager setGyroUpdateInterval:intervalMs];
}

- (void)sensorModuleDidSubscribeForMagnetometerUpdatesOfExperience:(NSString *)experienceId
                                           withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([self.manager isDeviceMotionAvailable]) {
    self.magnetometerHandlers[experienceId] = handlerBlock;
  }
  if (![self.manager isDeviceMotionActive]) {
    [self activateDeviceMotionUpdates];
  }
}

- (void)sensorModuleDidUnsubscribeForMagnetometerUpdatesOfExperience:(NSString *)experienceId
{
  [self.magnetometerHandlers removeObjectForKey:experienceId];
  if (self.deviceMotionHandlers.count == 0 && self.magnetometerHandlers.count == 0) {
    [self.manager stopDeviceMotionUpdates];
  }
}

- (void)setMagnetometerUpdateInterval:(NSTimeInterval)intervalMs
{
  [self.manager setDeviceMotionUpdateInterval:intervalMs];
}

- (void)sensorModuleDidSubscribeForMagnetometerUncalibratedUpdatesOfExperience:(NSString *)experienceId
                                                       withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([self.manager isMagnetometerAvailable]) {
    self.magnetometerUncalibratedHandlers[experienceId] = handlerBlock;
  }
  if (![self.manager isMagnetometerActive]) {
    [self.manager setMagnetometerUpdateInterval:0.1f];
    [self.manager startMagnetometerUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMMagnetometerData *data, NSError *error) {
      for (void (^handler)(NSDictionary *) in self.magnetometerUncalibratedHandlers.allValues) {
        handler(@{
                  @"x": [NSNumber numberWithDouble:data.magneticField.x],
                  @"y": [NSNumber numberWithDouble:data.magneticField.y],
                  @"z": [NSNumber numberWithDouble:data.magneticField.z]
                  });
      }
    }];
  }
}

- (void)sensorModuleDidUnsubscribeForMagnetometerUncalibratedUpdatesOfExperience:(NSString *)experienceId
{
  [self.magnetometerUncalibratedHandlers removeObjectForKey:experienceId];
  if (self.magnetometerUncalibratedHandlers.count == 0) {
    [self.manager stopMagnetometerUpdates];
  }
}

- (void)setMagnetometerUncalibratedUpdateInterval:(NSTimeInterval)intervalMs
{
  [self.manager setMagnetometerUpdateInterval:intervalMs];
}

- (float)getGravity
{
  return EXGravity;
}

- (void)activateDeviceMotionUpdates
{
  [self.manager setDeviceMotionUpdateInterval:0.1f];
  [self.manager
   startDeviceMotionUpdatesUsingReferenceFrame:CMAttitudeReferenceFrameXArbitraryCorrectedZVertical
   toQueue:[NSOperationQueue mainQueue]
   withHandler:^(CMDeviceMotion *data, NSError *error) {
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
     
     NSDictionary *result = @{
                              @"acceleration": @{
                                  @"x": @(data.userAcceleration.x * EXGravity),
                                  @"y": @(data.userAcceleration.y * EXGravity),
                                  @"z": @(data.userAcceleration.z * EXGravity)
                                  },
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
                              @"rotationRate" :@{
                                  @"alpha": @(data.rotationRate.z),
                                  @"beta": @(data.rotationRate.y),
                                  @"gamma": @(data.rotationRate.x)
                                  },
                              @"orientation": @(orientationDegrees)
                              };
     
     // DeviceMotionUpdates handle DeviceMotion data as well as magnetic field
     for (void (^handler)(NSDictionary *) in self.deviceMotionHandlers.allValues) {
       handler(result);
     }
     
     for (void (^handler)(NSDictionary *) in self.magnetometerHandlers.allValues) {
       handler(@{
                 @"x": [NSNumber numberWithDouble:data.magneticField.field.x],
                 @"y": [NSNumber numberWithDouble:data.magneticField.field.y],
                 @"z": [NSNumber numberWithDouble:data.magneticField.field.z]
                 });
     }
   }];
}

- (void)sensorModuleDidSubscribeForBarometerUpdatesOfExperience:(NSString *)experienceId withHandler:(void (^)(NSDictionary *event))handlerBlock
{
  if ([self isBarometerAvailable]) {
    _barometerHandlers[experienceId] = handlerBlock;
  }
  
  __weak EXSensorManager *weakSelf = self;
  [[self altimeter] startRelativeAltitudeUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMAltitudeData * _Nullable data, NSError * _Nullable error) {
    __strong EXSensorManager *strongSelf = weakSelf;
    if (strongSelf && data) {
      for (void (^handler)(NSDictionary *) in strongSelf.barometerHandlers.allValues) {
        handler(@{
                  @"pressure": @([data.pressure intValue] * 10), // conversion from kPa to hPa
                  @"relativeAltitude": data.relativeAltitude,
                  });
      }
    }
  }];
}

- (void)sensorModuleDidUnsubscribeForBarometerUpdatesOfExperience:(NSString *)experienceId
{
  [_barometerHandlers removeObjectForKey:experienceId];
  if (_barometerHandlers.count == 0) {
    [_altimeter stopRelativeAltitudeUpdates];
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

- (BOOL)isAccelerometerAvailable {
  return [self.manager isAccelerometerAvailable];
}

- (BOOL)isDeviceMotionAvailable {
  return [self.manager isDeviceMotionAvailable];
}

- (BOOL)isGyroAvailable {
  return [self.manager isGyroAvailable];
}

- (BOOL)isMagnetometerAvailable {
  return [self.manager isMagnetometerAvailable];
}

- (BOOL)isMagnetometerUncalibratedAvailable {
  return [self.manager isMagnetometerAvailable];
}

@end
