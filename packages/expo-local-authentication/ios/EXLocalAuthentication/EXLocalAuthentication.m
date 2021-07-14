// Copyright 2018-present 650 Industries. All rights reserved.

#import <LocalAuthentication/LocalAuthentication.h>

#import <UMCore/UMUtilities.h>
#import <EXLocalAuthentication/EXLocalAuthentication.h>

typedef NS_ENUM(NSInteger, EXAuthenticationType) {
  EXAuthenticationTypeFingerprint = 1,
  EXAuthenticationTypeFacialRecognition = 2,
};

typedef NS_ENUM(NSInteger, EXSecurityLevel) {
  EXSecurityLevelNone = 0,
  EXSecurityLevelSecret = 1,
  EXSecurityLevelBiometric = 2,
};

@implementation EXLocalAuthentication

UM_EXPORT_MODULE(ExpoLocalAuthentication)

UM_EXPORT_METHOD_AS(supportedAuthenticationTypesAsync,
                    supportedAuthenticationTypesAsync:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  NSMutableArray *results = [NSMutableArray array];
  if ([[self class] isTouchIdDevice]) {
    [results addObject:@(EXAuthenticationTypeFingerprint)];
  }
  if ([[self class] isFaceIdDevice]) {
    [results addObject:@(EXAuthenticationTypeFacialRecognition)];
  }
  resolve(results);
}

UM_EXPORT_METHOD_AS(hasHardwareAsync,
                    hasHardwareAsync:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  LAContext *context = [LAContext new];
  NSError *error = nil;

  BOOL isSupported = [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error];
  BOOL isAvailable;

  if (@available(iOS 11.0.1, *)) {
    isAvailable = isSupported || error.code != LAErrorBiometryNotAvailable;
  } else {
    isAvailable = isSupported || error.code != LAErrorTouchIDNotAvailable;
  }

  resolve(@(isAvailable));
}

UM_EXPORT_METHOD_AS(isEnrolledAsync,
                    isEnrolledAsync:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  LAContext *context = [LAContext new];
  NSError *error = nil;

  BOOL isSupported = [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error];
  BOOL isEnrolled;
  
  isEnrolled = (isSupported && error == nil) || error.code == LAErrorBiometryLockout;
  
  resolve(@(isEnrolled));
}

UM_EXPORT_METHOD_AS(getEnrolledLevelAsync,
                    getEnrolledLevelAsync:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  LAContext *context = [LAContext new];
  NSError *error = nil;

  int level = EXSecurityLevelNone;
  
  BOOL isAuthenticationSupported = [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthentication error:&error];
  if (isAuthenticationSupported && error == nil) {
    level = EXSecurityLevelSecret;
  }
  BOOL isBiometricsSupported = [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error];
  if (isBiometricsSupported && error == nil) {
    level = EXSecurityLevelBiometric;
  }

  resolve(@(level));
}

UM_EXPORT_METHOD_AS(authenticateAsync,
                    authenticateWithOptions:(NSDictionary *)options
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  NSString *warningMessage;
  NSString *reason = options[@"promptMessage"];
  NSString *cancelLabel = options[@"cancelLabel"];
  NSString *fallbackLabel = options[@"fallbackLabel"];
  NSString *disableDeviceFallback = options[@"disableDeviceFallback"];

  if ([[self class] isFaceIdDevice]) {
    NSString *usageDescription = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"NSFaceIDUsageDescription"];

    if (!usageDescription) {
      warningMessage = @"FaceID is available but has not been configured. To enable FaceID, provide `NSFaceIDUsageDescription`.";
    }
  }

  LAContext *context = [LAContext new];

  if (fallbackLabel != nil) {
    context.localizedFallbackTitle = fallbackLabel;
  }

  if (cancelLabel != nil) {
    context.localizedCancelTitle = cancelLabel;
  }

  if (@available(iOS 11.0, *)) {
    context.interactionNotAllowed = false;
  }

  if ([disableDeviceFallback boolValue]) {
    if (warningMessage) {
      // If the warning message is set (NSFaceIDUsageDescription is not configured) then we can't use
      // authentication with biometrics — it would crash, so let's just resolve with no success.
      // We could reject, but we already resolve even if there are any errors, so sadly we would need to introduce a breaking change.
      return resolve(@{
        @"success": @NO,
        @"error": @"missing_usage_description",
        @"warning": warningMessage
      });
    }
    [context evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
          localizedReason:reason
                    reply:^(BOOL success, NSError *error) {
                      resolve(@{
                                @"success": @(success),
                                @"error": error == nil ? [NSNull null] : [self convertErrorCode:error],
                                @"warning": UMNullIfNil(warningMessage),
                                });
                    }];
  } else {
    [context evaluatePolicy:LAPolicyDeviceOwnerAuthentication
          localizedReason:reason
                    reply:^(BOOL success, NSError *error) {
                      resolve(@{
                                @"success": @(success),
                                @"error": error == nil ? [NSNull null] : [self convertErrorCode:error],
                                @"warning": UMNullIfNil(warningMessage),
                                });
                    }];
  }

}

- (NSString *)convertErrorCode:(NSError *)error
{
  switch (error.code) {
    case LAErrorSystemCancel:
      return @"system_cancel";
    case LAErrorAppCancel:
      return @"app_cancel";
    case LAErrorTouchIDLockout:
      return @"lockout";
    case LAErrorUserFallback:
      return @"user_fallback";
    case LAErrorUserCancel:
      return @"user_cancel";
    case LAErrorTouchIDNotAvailable:
      return @"not_available";
    case LAErrorInvalidContext:
      return @"invalid_context";
    case LAErrorTouchIDNotEnrolled:
      return @"not_enrolled";
    case LAErrorPasscodeNotSet:
      return @"passcode_not_set";
    case LAErrorAuthenticationFailed:
      return @"authentication_failed";
    default:
      return [@"unknown: " stringByAppendingFormat:@"%ld, %@", (long) error.code, error.localizedDescription];
  }
}

+ (BOOL)isFaceIdDevice
{
  static BOOL isFaceIDDevice = NO;

  if (@available(iOS 11.0.1, *)) {
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
      LAContext *context = [LAContext new];
      [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:nil];
      isFaceIDDevice = context.biometryType == LABiometryTypeFaceID;
    });
  }

  return isFaceIDDevice;
}

+ (BOOL)isTouchIdDevice
{
  static BOOL isTouchIDDevice = NO;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    LAContext *context = [LAContext new];
    [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:nil];
    if (@available(iOS 11.0.1, *)) {
      isTouchIDDevice = context.biometryType == LABiometryTypeTouchID;
    } else {
      isTouchIDDevice = true;
    }
  });

  return isTouchIDDevice;
}

@end
