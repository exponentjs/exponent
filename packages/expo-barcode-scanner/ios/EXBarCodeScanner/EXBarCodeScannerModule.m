// Copyright 2016-present 650 Industries. All rights reserved.

#import <EXBarCodeScanner/EXBarCodeScannerModule.h>
#import <EXBarCodeScanner/EXBarCodeScannerUtils.h>
#import <EXBarCodeScanner/EXBarCodeCameraRequester.h>
#import <ExpoModulesCore/EXImageLoaderInterface.h>
#import <ExpoModulesCore/EXPermissionsInterface.h>
#import <ExpoModulesCore/EXPermissionsMethodsDelegate.h>

@interface EXBarCodeScannerModule ()

@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;
@property (nonatomic, weak) id<EXImageLoaderInterface> imageLoader;
@property (nonatomic, weak) id<EXPermissionsInterface> permissionsManager;

@end

@implementation EXBarCodeScannerModule

UM_EXPORT_MODULE(ExpoBarCodeScannerModule);

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
  _imageLoader = [moduleRegistry getModuleImplementingProtocol:@protocol(EXImageLoaderInterface)];
  _permissionsManager = [moduleRegistry getModuleImplementingProtocol:@protocol(EXPermissionsInterface)];
  [EXPermissionsMethodsDelegate registerRequesters:@[[EXBareCodeCameraRequester new]] withPermissionsManager:_permissionsManager];
}

- (NSDictionary *)constantsToExport
{
  NSMutableDictionary* barCodeTypes = [NSMutableDictionary dictionary];
  // We export the valid bar code types as string literal which matches the documentation.
  // The consumer can use the string literal (e.g qr) or the constant exports
  [[[EXBarCodeScannerUtils validBarCodeTypes] allKeys] enumerateObjectsUsingBlock:^(
    id  _Nonnull key, NSUInteger idx, BOOL * _Nonnull stop) {
    barCodeTypes[key] = key;
  }];
  return @{
           @"Type": @{
               @"front": @(EXCameraTypeFront),
               @"back" : @(EXCameraTypeBack),
               },
           @"BarCodeType": [NSDictionary dictionaryWithDictionary:barCodeTypes],
           };
}

UM_EXPORT_METHOD_AS(getPermissionsAsync,
                    getPermissionsAsync:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  [EXPermissionsMethodsDelegate getPermissionWithPermissionsManager:_permissionsManager
                                                      withRequester:[EXBareCodeCameraRequester class]
                                                            resolve:resolve
                                                             reject:reject];
}

UM_EXPORT_METHOD_AS(requestPermissionsAsync,
                    requestPermissionsAsync:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  [EXPermissionsMethodsDelegate askForPermissionWithPermissionsManager:_permissionsManager
                                                         withRequester:[EXBareCodeCameraRequester class]
                                                               resolve:resolve
                                                                reject:reject];
}

UM_EXPORT_METHOD_AS(scanFromURLAsync,
                    scanFromURLAsync:(NSString *)url
                    barCodeTypes:(NSArray *)barCodeTypes
                    resolver:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  // We only support QR codes, so barCodeTypes is ignored
  NSURL *imageURL = [NSURL URLWithString:url];
  [_imageLoader loadImageForURL:imageURL completionHandler:^(NSError *error, UIImage *loadedImage) {
    if (error != nil) {
      reject(@"E_IMAGE_RETRIEVAL_ERROR", @"Could not get the image", error);
      return;
    }
    
    CIDetector *detector = [CIDetector detectorOfType:CIDetectorTypeQRCode
                                              context:nil
                                              options:@{CIDetectorAccuracy:CIDetectorAccuracyHigh}];
    if (detector)  {
      NSArray *features = [detector featuresInImage:[[CIImage alloc] initWithCGImage:loadedImage.CGImage]];
      
      NSMutableArray *result = [NSMutableArray arrayWithCapacity:1];
      for (CIQRCodeFeature *feature in features)  {
        [result addObject:[EXBarCodeScannerUtils ciQRCodeFeatureToDicitionary:feature barCodeType:AVMetadataObjectTypeQRCode]];
      }
      
      resolve(result);
    } else {
      reject(@"E_SCANNER_INIT_FAILED", @"Could not initialize the barcode scanner", nil);
    }
  }];
}

@end
