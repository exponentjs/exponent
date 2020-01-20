// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXNotifications/EXNotificationPermissionsModule.h>

#import <UMPermissionsInterface/UMPermissionsInterface.h>
#import <UMPermissionsInterface/UMPermissionsMethodsDelegate.h>

#import <EXNotifications/EXUserFacingNotificationsPermissionsRequester.h>

@interface EXNotificationPermissionsModule ()

@property (nonatomic, weak) id<UMPermissionsInterface> permissionsManager;
@property (nonatomic, strong) EXUserFacingNotificationsPermissionsRequester *requester;

@end

@implementation EXNotificationPermissionsModule

UM_EXPORT_MODULE(ExpoNotificationPermissionsModule);

- (instancetype)init
{
  if (self = [super init]) {
    _requester = [[EXUserFacingNotificationsPermissionsRequester alloc] initWithMethodQueue:self.methodQueue];
  }
  return self;
}

# pragma mark - Exported methods

UM_EXPORT_METHOD_AS(getPermissionsAsync,
                    getPermissionsAsync:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  [UMPermissionsMethodsDelegate getPermissionWithPermissionsManager:_permissionsManager
                                                      withRequester:[EXUserFacingNotificationsPermissionsRequester class]
                                                            resolve:resolve
                                                             reject:reject];
}

UM_EXPORT_METHOD_AS(requestPermissionsAsync,
                    requestPermissionsAsync:(NSDictionary *)requestedPermissions
                    requester:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  [_requester requestPermissions:requestedPermissions withResolver:resolve rejecter:reject];
}

# pragma mark - UMModuleRegistryConsumer

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry {
  _permissionsManager = [moduleRegistry getModuleImplementingProtocol:@protocol(UMPermissionsInterface)];
  [UMPermissionsMethodsDelegate registerRequesters:@[_requester]
                            withPermissionsManager:_permissionsManager];
}

@end
