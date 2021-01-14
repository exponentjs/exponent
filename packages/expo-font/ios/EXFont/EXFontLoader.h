// Copyright 2015-present 650 Industries. All rights reserved.

#import <UMCore/UMExportedModule.h>
#import <UMCore/UMModuleRegistryConsumer.h>

@interface EXFontLoader : UMExportedModule <UMModuleRegistryConsumer>

- (instancetype)initWithFontFamilyPrefix:(NSString *)prefix;
- (void)loadAsyncWithFontFamilyName:(NSString *)fontFamilyName
                       withLocalUri:(NSString *)path
                           resolver:(UMPromiseResolveBlock)resolve
                           rejecter:(UMPromiseRejectBlock)reject;

@end
