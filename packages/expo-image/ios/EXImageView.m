// Copyright 2020-present 650 Industries. All rights reserved.

#import <expo-image/EXImageView.h>
#import <expo-image/EXImageBorders.h>
#import <expo-image/EXImageCornerRadii.h>
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTI18nUtil.h>
#import <React/RCTBorderDrawing.h>

static NSString * const sourceUriKey = @"uri";
static NSString * const sourceScaleKey = @"scale";
static NSString * const sourceWidthKey = @"width";
static NSString * const sourceHeightKey = @"height";

@interface EXImageView ()

@property (nonatomic, weak) RCTBridge *bridge;
@property (nonatomic, strong) SDAnimatedImageView *imageView;
@property (nonatomic, strong) NSDictionary *source;
@property (nonatomic, assign) RCTResizeMode resizeMode;
@property (nonatomic, assign) BOOL needsReload;
@property (nonatomic, assign) CGSize intrinsicContentSize;
@property (nonatomic, strong) EXImageCornerRadii *cornerRadii;
@property (nonatomic, strong) EXImageBorders *borders;
@property (nonatomic, strong) NSMutableDictionary<NSString *, CALayer *> *cachedBorderLayers;

@end

@implementation EXImageView

- (instancetype)initWithBridge:(RCTBridge *)bridge
{
  if (self = [super init]) {
    _bridge = bridge;
    _needsReload = NO;
    _resizeMode = RCTResizeModeCover;
    _intrinsicContentSize = CGSizeZero;
    _reactLayoutDirection = UIUserInterfaceLayoutDirectionLeftToRight;
    _cornerRadii = [EXImageCornerRadii new];
    _borders = [EXImageBorders new];
    _cachedBorderLayers = [NSMutableDictionary dictionary];
    _imageView = [[SDAnimatedImageView alloc] initWithFrame:self.bounds];
    _imageView.contentMode = [EXImageTypes resizeModeToContentMode:_resizeMode];
    _imageView.autoresizingMask = (UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight);
    _imageView.layer.masksToBounds = YES;
    
    [self addSubview:_imageView];
  }
  return self;
}

- (void)dealloc
{
  // Stop any active operations or downloads
  [_imageView sd_cancelCurrentImageLoad];
}

# pragma mark -  Custom prop setters

- (void)setSource:(NSDictionary *)source
{
  _source = source;
  // TODO: Implement equatable image source abstraction
  _needsReload = YES;
}

- (void)setResizeMode:(RCTResizeMode)resizeMode
{
  if (_resizeMode == resizeMode) {
    return;
  }
  
  // Update resize-mode. Image repeat is handled in the completion-block
  // and requires a reload of the image for the post-process function to run.
  _needsReload = _needsReload || (resizeMode == RCTResizeModeRepeat) || (_resizeMode == RCTResizeModeRepeat);
  _resizeMode = resizeMode;
  _imageView.contentMode = [EXImageTypes resizeModeToContentMode:resizeMode];
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps
{
  if (_needsReload) {
    _needsReload = NO;
    [self updateImageWith:self.frame.size];
  }
}

- (void)updateImageWith:(CGSize)imageSize
{
  // We want to call onError, onLoadEnd for the previous image load
  // before calling onLoadStart for the next image load.
  [self sd_cancelCurrentImageLoad];
  
  if (self.onLoadStart) {
    self.onLoadStart(@{});
  }
  
  NSURL *imageURL = [RCTConvert NSURL:_source[sourceUriKey]];
  NSNumber *scale = _source[sourceScaleKey];
  NSNumber *width = _source[sourceWidthKey];
  NSNumber *height = _source[sourceHeightKey];
  RCTResizeMode resizeMode = _resizeMode;
  
  // For local assets, the intrinsic image size is passed down in the source.
  // This means we can set it immediately without having to wait for the
  // image content to load.
  if (width && height) {
    [self updateIntrinsicContentSize:CGSizeMake(width.doubleValue, height.doubleValue) internalAsset:YES];
  }
  
  NSMutableDictionary *context = [NSMutableDictionary new];
  
  // Only apply custom scale factors when neccessary. The scale factor
  // affects how the image is rendered when resizeMode `center` and `repeat`
  // are used. On animated images, applying a scale factor may cause
  // re-encoding of the data, which should be avoided when possible.
  if (scale && scale.doubleValue != 1.0) {
    [context setValue:scale forKey:SDWebImageContextImageScaleFactor];
  }
  if([[imageURL pathExtension] isEqualToString:@"svg"]) {
    // We need to set size for the svg image which prevents using viewPort
    // This solution is rather naive, it should be done by downloading the image first,
    // checking if svg coder can decode the NSData and then creating image view
    // with context options
    [context setObject: @(imageSize) forKey: SDWebImageContextImageThumbnailPixelSize];
  }
  [_imageView sd_setImageWithURL:imageURL
                placeholderImage:nil
                         options:SDWebImageAvoidAutoSetImage
                         context:context
                        progress:[self progressBlock]
                       completed:[self completionBlock]];
}

- (SDImageLoaderProgressBlock)progressBlock
{
  __weak EXImageView *weakSelf = self;
  return ^(NSInteger receivedSize, NSInteger expectedSize, NSURL * _Nullable targetURL) {
    __strong EXImageView *strongSelf = weakSelf;
    if (!strongSelf) {
      // Nothing to do
      return;
    }
    
    if (strongSelf.onProgress) {
      strongSelf.onProgress(@{
        @"loaded": @(receivedSize),
        @"total": @(expectedSize)
                            });
    }
  };
}

- (SDExternalCompletionBlock)completionBlock
{
  RCTResizeMode resizeMode = _resizeMode;
  NSNumber *width = _source && _source[sourceWidthKey] ? _source[sourceWidthKey] : nil;
  NSNumber *height = _source && _source[sourceHeightKey] ? _source[sourceHeightKey] : nil;
  UIColor *tintColor = _tintColor;
  
  __weak EXImageView *weakSelf = self;
  return ^(UIImage * _Nullable image, NSError * _Nullable error, SDImageCacheType cacheType, NSURL * _Nullable imageURL) {
    __strong EXImageView *strongSelf = weakSelf;
    if (!strongSelf) {
      // Nothing to do
      return;
    }
    
    // Modifications to the image like changing the resizing-mode or cap-insets
    // cannot be handled using a SDWebImage transformer, because they don't change
    // the image-data and this causes this "meta" data to be lost in the SDWebImage caching process.
    if (image) {
      if (tintColor) {
        image = [image imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
      }
      if (resizeMode == RCTResizeModeRepeat) {
        image = [image resizableImageWithCapInsets:UIEdgeInsetsZero resizingMode:UIImageResizingModeTile];
      }
    }
    
    // When no explicit source image size was specified, use the dimensions
    // of the loaded image as the intrinsic content size.
    if (!width && !height) {
      [strongSelf updateIntrinsicContentSize:image.size internalAsset:NO];
    }
    
    // Update image
    strongSelf.imageView.image = image;
    
    if (error && strongSelf.onError) {
      strongSelf.onError(@{
        @"error": error.localizedDescription,
        @"ios": @{
            @"code": @(error.code),
            @"domain": error.domain,
            @"description": error.localizedDescription,
            @"helpAnchor": error.helpAnchor ?: [NSNull null],
            @"failureReason": error.localizedFailureReason ?: [NSNull null],
            @"recoverySuggestion": error.localizedRecoverySuggestion ?: [NSNull null]
        }
                         });
    } else if (image && strongSelf.onLoad) {
      strongSelf.onLoad(@{
        @"cacheType": @([EXImageTypes convertToCacheTypeEnum:cacheType]),
        @"source": @{
            @"url": imageURL.absoluteString,
            @"width": @(image.size.width),
            @"height": @(image.size.height),
            @"mediaType": [EXImageTypes sdImageFormatToMediaType:image.sd_imageFormat] ?: [NSNull null]
        }
                        });
    }
  };
}


- (void)setBackgroundColor:(UIColor *)backgroundColor
{
  if (![_imageView.backgroundColor isEqual:backgroundColor]) {
    _imageView.backgroundColor = backgroundColor;
    [self.layer setNeedsDisplay];
  }
}

- (void)reactSetFrame:(CGRect)frame
{
  CGSize oldSize = self.bounds.size;
  [super reactSetFrame:frame];
  if (!CGSizeEqualToSize(self.bounds.size, oldSize)) {
    [self.layer setNeedsDisplay];
  }
}

- (void)displayLayer:(CALayer *)layer
{
  if (CGSizeEqualToSize(layer.bounds.size, CGSizeZero)) {
    return;
  }
  
  CGRect bounds = self.bounds;
  [_cornerRadii updateShadowPathForLayer:self.layer bounds:bounds];
  [_cornerRadii updateClipMaskForLayer:_imageView.layer bounds:bounds];
  
  RCTCornerRadii cornerRadii = [_cornerRadii radiiForBounds:bounds];
  [_borders updateLayersForView:_imageView cornerRadii:cornerRadii bounds:bounds cachedLayers:_cachedBorderLayers];
}

- (void)setReactLayoutDirection:(UIUserInterfaceLayoutDirection)layoutDirection
{
  if (_reactLayoutDirection != layoutDirection) {
    _reactLayoutDirection = layoutDirection;
    _cornerRadii.layoutDirection = layoutDirection;
    _borders.layoutDirection = layoutDirection;
    [self.layer setNeedsDisplay];
  }
  
  if ([self respondsToSelector:@selector(setSemanticContentAttribute:)]) {
    self.semanticContentAttribute = layoutDirection == UIUserInterfaceLayoutDirectionLeftToRight
    ? UISemanticContentAttributeForceLeftToRight
    : UISemanticContentAttributeForceRightToLeft;
  }
}

# pragma mark -  Intrinsic content size

- (CGSize)intrinsicContentSize
{
  return _intrinsicContentSize;
}

- (void)updateIntrinsicContentSize:(CGSize)intrinsicContentSize internalAsset:(BOOL)internalAsset
{
  if (!CGSizeEqualToSize(_intrinsicContentSize, intrinsicContentSize)) {
    _intrinsicContentSize = intrinsicContentSize;
    
    // Only inform Yoga of the intrinsic image size when needed.
    // Yoga already knows about the size of the internal assets, and
    // only needs to be informed about the intrinsic content size when
    // no size styles were provided to the component. Always updating
    // the intrinsicContentSize will cause unnecessary layout passes
    // which we want to avoid.
    if (!internalAsset && CGRectIsEmpty(self.bounds)) {
      [_bridge.uiManager setIntrinsicContentSize:intrinsicContentSize forView:self];
    }
  }
}

#pragma mark - Border Radius

#define borderRadius(side, corner2)                      \
-(CGFloat)border##side##Radius                           \
{                                                        \
return [_cornerRadii radiusForCorner:corner2];           \
}                                                        \
-(void)setBorder##side##Radius : (CGFloat)radius         \
{                                                        \
if ([_cornerRadii setRadius:radius corner:corner2]) {    \
[self.layer setNeedsDisplay];                          \
}                                                        \
}

borderRadius(,EXImageCornerAll)
borderRadius(TopLeft, EXImageCornerTopLeft)
borderRadius(TopRight, EXImageCornerTopRight)
borderRadius(TopStart, EXImageCornerTopStart)
borderRadius(TopEnd, EXImageCornerTopEnd)
borderRadius(BottomLeft, EXImageCornerBottomLeft)
borderRadius(BottomRight, EXImageCornerBottomRight)
borderRadius(BottomStart, EXImageCornerBottomStart)
borderRadius(BottomEnd, EXImageCornerBottomEnd)


#pragma mark Border Color / Width / Style

#define borderEdge(side, border2)                         \
-(CGColorRef)border##side##Color                          \
{                                                         \
return [_borders colorForBorder:border2];                 \
}                                                         \
-(void)setBorder##side##Color : (CGColorRef)color         \
{                                                         \
if ([_borders setColor:color border:border2]) {           \
[self.layer setNeedsDisplay];                           \
}                                                         \
}                                                         \
-(CGFloat)border##side##Width                             \
{                                                         \
return [_borders widthForBorder:border2];                 \
}                                                         \
-(void)setBorder##side##Width : (CGFloat)width            \
{                                                         \
if ([_borders setWidth:width border:border2]) {           \
[self.layer setNeedsDisplay];                           \
}                                                         \
}                                                         \
-(RCTBorderStyle)border##side##Style                      \
{                                                         \
return [_borders styleForBorder:border2];                 \
}                                                         \
-(void)setBorder##side##Style : (RCTBorderStyle)style     \
{                                                         \
if ([_borders setStyle:style border:border2]) {           \
[self.layer setNeedsDisplay];                           \
}                                                         \
}

borderEdge(,EXImageBorderAll)
borderEdge(Top,EXImageBorderTop)
borderEdge(Right,EXImageBorderRight)
borderEdge(Bottom,EXImageBorderBottom)
borderEdge(Left,EXImageBorderLeft)
borderEdge(Start,EXImageBorderStart)
borderEdge(End,EXImageBorderEnd)

#pragma mark - Tint color

- (void)setTintColor:(UIColor *)tintColor
{
  if (![_tintColor isEqual:tintColor]) {
    _tintColor = tintColor;
    _imageView.tintColor = tintColor;
    _needsReload = YES;
  }
}

@end
