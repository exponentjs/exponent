// Copyright 2020-present 650 Industries. All rights reserved.

#import <expo-image/EXImageViewManager.h>
#import <expo-image/EXImageView.h>
#if __has_include(<SDWebImageSVGCoder/SDImageSVGCoder.h>)
#import <SDWebImageSVGCoder/SDImageSVGCoder.h>
#endif
#import <SDWebImageSVGKitPlugin/SDImageSVGKCoder.h>
#import <SDWebImage/SDImageCodersManager.h>

#import <React/RCTImageShadowView.h>

@implementation EXImageViewManager

RCT_EXPORT_MODULE(ExpoImage)

- (RCTShadowView *)shadowView
{
  return [RCTImageShadowView new];
}

+ (void)initialize
{
  id<SDImageCoder> svgCoder;

  // 1. SDWebImageSVGCoder is a non-dependency which users can
  //    add to their own Podfiles, if they would like to use it
  //    to decode SVGs on iOS 13+.
  // 2. It only works on iOS 13+, we cannot use it on older versions
  //    of iOS.
  //
  // Therefore to use SVGCoder we have to know it is available
  // and we are running on iOS 13+.
#if __has_include(<SDWebImageSVGCoder/SDImageSVGCoder.h>)
  if (@available(iOS 13, *)) {
    svgCoder = [SDImageSVGCoder sharedCoder];
  } else {
    svgCoder = [SDImageSVGKCoder sharedCoder];
  }
#else
  svgCoder = [SDImageSVGKCoder sharedCoder];
#endif

  if (![[SDImageCodersManager sharedManager].coders containsObject:svgCoder]) {
    [[SDImageCodersManager sharedManager] addCoder:svgCoder];
  }
}

RCT_EXPORT_VIEW_PROPERTY(source, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(resizeMode, RCTResizeMode)

RCT_EXPORT_VIEW_PROPERTY(onLoadStart, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onProgress, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLoad, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(tintColor, UIColor)

- (UIView *)view
{
  return [[EXImageView alloc] initWithBridge:self.bridge];
}

@end
