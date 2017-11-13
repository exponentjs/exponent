
#import "ABI23_0_0EXViewShot.h"
#import <AVFoundation/AVFoundation.h>
#import <ReactABI23_0_0/UIView+ReactABI23_0_0.h>
#import <ReactABI23_0_0/ABI23_0_0RCTUtils.h>
#import <ReactABI23_0_0/ABI23_0_0RCTConvert.h>
#import <ReactABI23_0_0/ABI23_0_0RCTUIManager.h>
#import <ReactABI23_0_0/ABI23_0_0RCTBridge.h>

#import "ABI23_0_0EXFileSystem.h"


@implementation ABI23_0_0EXViewShot

ABI23_0_0RCT_EXPORT_MODULE(ABI23_0_0RNViewShot)

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return self.bridge.uiManager.methodQueue;
}

// forked from ABI23_0_0RN implementation
// https://github.com/facebook/ReactABI23_0_0-native/blob/f35b372883a76b5666b016131d59268b42f3c40d/ReactABI23_0_0/Modules/ABI23_0_0RCTUIManager.m#L1367

ABI23_0_0RCT_EXPORT_METHOD(takeSnapshot:(nonnull NSNumber *)target
                  withOptions:(NSDictionary *)options
                  resolve:(ABI23_0_0RCTPromiseResolveBlock)resolve
                  reject:(ABI23_0_0RCTPromiseRejectBlock)reject)
{
  [self.bridge.uiManager addUIBlock:^(__unused ABI23_0_0RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    
    // Get view
    UIView *view;
    view = viewRegistry[target];
    if (!view) {
      reject(ABI23_0_0RCTErrorUnspecified, [NSString stringWithFormat:@"No view found with ReactABI23_0_0Tag: %@", target], nil);
      return;
    }
    
    // Get options
    CGSize size = [ABI23_0_0RCTConvert CGSize:options];
    NSString *format = [ABI23_0_0RCTConvert NSString:options[@"format"] ?: @"png"];
    NSString *result = [ABI23_0_0RCTConvert NSString:options[@"result"] ?: @"file"];
    
    // Capture image
    if (size.width < 0.1 || size.height < 0.1) {
      size = view.bounds.size;
    }
    UIGraphicsBeginImageContextWithOptions(size, NO, 0);
    BOOL success = [view drawViewHierarchyInRect:(CGRect){CGPointZero, size} afterScreenUpdates:YES];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    if (!success || !image) {
      reject(ABI23_0_0RCTErrorUnspecified, @"Failed to capture view snapshot", nil);
      return;
    }
    
    // Convert image to data (on a background thread)
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      
      NSData *data;
      if ([format isEqualToString:@"png"]) {
        data = UIImagePNGRepresentation(image);
      } else if ([format isEqualToString:@"jpeg"] || [format isEqualToString:@"jpg"]) {
        CGFloat quality = [ABI23_0_0RCTConvert CGFloat:options[@"quality"] ?: @1];
        data = UIImageJPEGRepresentation(image, quality);
      } else {
        reject(ABI23_0_0RCTErrorUnspecified, [NSString stringWithFormat:@"Unsupported image format: %@. Try one of: png | jpg | jpeg", format], nil);
        return;
      }
      
      NSError *error = nil;
      NSString *res = nil;
      if ([result isEqualToString:@"file"]) {
        // Save to a temp file
        NSString *fileName = [[[[NSUUID UUID] UUIDString] stringByAppendingString:@"."] stringByAppendingString:format];
        NSString *directory = [self.bridge.scopedModules.fileSystem.cachesDirectory stringByAppendingPathComponent:@"ViewShot"];
        [ABI23_0_0EXFileSystem ensureDirExistsWithPath:directory];
        NSString *path = [directory stringByAppendingPathComponent:fileName];
        if (path) {
          if ([data writeToFile:path options:(NSDataWritingOptions)0 error:&error]) {
            res = [NSURL fileURLWithPath:path].absoluteString;
          }
        }
      }
      else if ([result isEqualToString:@"base64"]) {
        // Return as a base64 raw string
        res = [data base64EncodedStringWithOptions: NSDataBase64Encoding64CharacterLineLength];
      }
      else if ([result isEqualToString:@"data-uri"]) {
        // Return as a base64 data uri string
        NSString *base64 = [data base64EncodedStringWithOptions: NSDataBase64Encoding64CharacterLineLength];
        res = [NSString stringWithFormat:@"data:image/%@;base64,%@", format, base64];
      }
      else {
        reject(ABI23_0_0RCTErrorUnspecified, [NSString stringWithFormat:@"Unsupported result: %@. Try one of: file | base64 | data-uri", result], nil);
        return;
      }
      if (res != nil) {
        resolve(res);
        return;
      }
      
      // If we reached here, something went wrong
      if (error != nil) reject(ABI23_0_0RCTErrorUnspecified, error.localizedDescription, error);
      else reject(ABI23_0_0RCTErrorUnspecified, @"viewshot unknown error", nil);
    });
  }];
}


@end
