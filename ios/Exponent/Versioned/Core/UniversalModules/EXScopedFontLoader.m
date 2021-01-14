// Copyright © 2019-present 650 Industries. All rights reserved.

#if __has_include(<EXFont/EXFontLoader.h>)
#import "EXScopedFontLoader.h"
#import "EXConstantsBinding.h"
#import <UMConstantsInterface/UMConstantsInterface.h>
#import <UMFileSystemInterface/UMFilePermissionModuleInterface.h>

NS_ASSUME_NONNULL_BEGIN

NSString * const EXFontFamilyPrefix = @"ExpoFont-";

@interface EXScopedFontLoader ()

@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;

@end

@implementation EXScopedFontLoader

- (instancetype)init {
  return [super initWithFontFamilyPrefix:EXFontFamilyPrefix];
}

- (void)setModuleRegistry:(nullable UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
  [super setModuleRegistry:moduleRegistry];
}

- (void)loadAsyncWithFontFamilyName:(NSString *)fontFamilyName
                       withLocalUri:(NSString *)localUri
                           resolver:(UMPromiseResolveBlock)resolve
                           rejecter:(UMPromiseRejectBlock)reject
{
  id<UMFilePermissionModuleInterface> permissionsModule = [_moduleRegistry getModuleImplementingProtocol:@protocol(UMFilePermissionModuleInterface)];
  if (permissionsModule) {
    NSURL *localUrl = [NSURL URLWithString:localUri];
    if (!([permissionsModule getPathPermissions:localUrl.path] & UMFileSystemPermissionRead)) {
      reject(@"ERR_LOCATION_ACCESS_UNAUTHORIZED",
             [NSString stringWithFormat:@"You aren't authorized to load font file from: %@", localUri],
             nil);
      return;
    }
  }

  [super loadAsyncWithFontFamilyName:fontFamilyName withLocalUri:localUri resolver:resolve rejecter:reject];
}

@end

NS_ASSUME_NONNULL_END

#endif
