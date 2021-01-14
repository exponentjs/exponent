// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFont/EXFontLoader.h>
#import <EXFont/EXFontLoaderProcessor.h>
#import <EXFont/EXFontManagerInterface.h>
#import <EXFont/EXFontScaler.h>
#import <EXFont/EXFont.h>
#import <objc/runtime.h>
#import <EXFont/EXFontRegistry.h>
#import <EXFont/EXFontScalersManager.h>

@interface EXFontLoader ()

@property (nonatomic, strong) EXFontScaler *scaler;
@property (nonatomic, strong) EXFontLoaderProcessor *processor;
@property (nonatomic, strong) EXFontRegistry *registry;

@end

@implementation EXFontLoader

UM_EXPORT_MODULE(ExpoFontLoader);

- (instancetype)init
{
  if (self = [super init]) {
    _scaler = [[EXFontScaler alloc] init];
    _registry = [[EXFontRegistry alloc] init];
    _processor = [[EXFontLoaderProcessor alloc] initWithRegistry:_registry];
  }
  return self;
}

- (instancetype)initWithFontFamilyPrefix:(NSString *)prefix
{
  if (self = [super init]) {
    _scaler = [[EXFontScaler alloc] init];
    _registry = [[EXFontRegistry alloc] init];
    _processor = [[EXFontLoaderProcessor alloc] initWithFontFamilyPrefix:prefix registry:_registry];
  }
  return self;
}


- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  if (moduleRegistry) {
    id<EXFontManagerInterface> manager = [moduleRegistry getModuleImplementingProtocol:@protocol(EXFontManagerInterface)];
    [manager addFontProcessor:_processor];

    id<EXFontScalersManager> scalersManager = [moduleRegistry getSingletonModuleForName:@"FontScalersManager"];
    [scalersManager registerFontScaler:_scaler];
  }
}

UM_EXPORT_METHOD_AS(loadAsync,
                    loadAsyncWithFontFamilyName:(NSString *)fontFamilyName
                    withLocalUri:(NSString *)path
                    resolver:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  if ([_registry fontForName:fontFamilyName]) {
    reject(@"ERR_FONT_ALREADY_LOADED",
           [NSString stringWithFormat:@"Font with family name '%@' has already been loaded.", fontFamilyName],
           nil);
    return;
  }

  NSURL *uriString = [[NSURL alloc] initWithString:path];
  NSData *data = [[NSFileManager defaultManager] contentsAtPath:[uriString path]];
  if (!data) {
    reject(@"ERR_FONT_FILE_NOT_FOUND",
           [NSString stringWithFormat:@"File '%@' for font '%@' doesn't exist", path, fontFamilyName],
           nil);
    return;
  }

  CGDataProviderRef provider = CGDataProviderCreateWithCFData((__bridge CFDataRef)data);
  CGFontRef font = CGFontCreateWithDataProvider(provider);
  CGDataProviderRelease(provider);
  if (!font) {
    reject(@"ERR_FONT_FILE_INVALID",
           [NSString stringWithFormat:@"File '%@' isn't a valid font file.", path],
           nil);
    return;
  }

  [_registry setFont:[[EXFont alloc] initWithCGFont:font] forName:fontFamilyName];
  resolve(nil);
}

@end
