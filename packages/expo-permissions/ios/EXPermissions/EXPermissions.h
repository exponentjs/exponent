// Copyright 2016-present 650 Industries. All rights reserved.

#import <UMCore/UMExportedModule.h>
#import <UMCore/UMModuleRegistryConsumer.h>
#import <UMPermissionsInterface/UMPermissionsInterface.h>
#import <EXPermissions/EXPermissionBaseRequester.h>

FOUNDATION_EXPORT NSString * const EXPermissionExpiresNever;

typedef enum EXPermissionStatus {
  EXPermissionStatusDenied,
  EXPermissionStatusGranted,
  EXPermissionStatusUndetermined,
} EXPermissionStatus;

@interface EXPermissions : UMExportedModule <UMPermissionsInterface, UMModuleRegistryConsumer>

- (NSDictionary *)getPermissionsForResource:(NSString *)resource;

+ (NSString *)permissionStringForStatus:(EXPermissionStatus)status;

- (id<EXPermissionRequester>)getPermissionRequesterForType:(NSString *)type;

+ (EXPermissionStatus)statusForPermissions:(NSDictionary *)permissions;

- (void)askForGlobalPermission:(NSString *)permissionType
                  withResolver:(void (^)(NSDictionary *))resolver
                  withRejecter:(UMPromiseRejectBlock)reject;

- (UMModuleRegistry *)getModuleRegistry;

@end
