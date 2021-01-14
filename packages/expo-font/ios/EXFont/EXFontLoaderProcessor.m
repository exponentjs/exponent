// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFont/EXFontLoaderProcessor.h>
#import <EXFont/EXFont.h>
#import <objc/runtime.h>

@interface EXFontLoaderProcessor ()

@property (nonatomic, copy) NSString *fontFamilyPrefix;
@property (nonatomic, strong) EXFontRegistry *registry;

@end

@implementation EXFontLoaderProcessor

- (instancetype)initWithFontFamilyPrefix:(NSString *)prefix
                                registry:(EXFontRegistry *)registry
{
  if (self = [super init]) {
    _fontFamilyPrefix = prefix;
    _registry = registry;
  }
  return self;
}

- (instancetype)initWithRegistry:(EXFontRegistry *)registry
{
  return [self initWithFontFamilyPrefix:nil registry:registry];
}

- (UIFont *)updateFont:(UIFont *)uiFont
              withFamily:(NSString *)family
                    size:(NSNumber *)size
                  weight:(NSString *)weight
                   style:(NSString *)style
                 variant:(NSArray<NSDictionary *> *)variant
         scaleMultiplier:(CGFloat)scaleMultiplier
{
  const CGFloat defaultFontSize = 14;
  EXFont *exFont = nil;

  // Did we get a new family, and if so, is it associated with an EXFont?
  if (_fontFamilyPrefix && [family hasPrefix:_fontFamilyPrefix]) {
    NSString *suffix = [family substringFromIndex:_fontFamilyPrefix.length];
    exFont = [_registry fontForName:suffix];
  } else if (!_fontFamilyPrefix) {
    exFont = [_registry fontForName:family];
  }

  // Did the passed-in UIFont come from an EXFont?
  if (!exFont && uiFont) {
    exFont = objc_getAssociatedObject(uiFont, EXFontAssocKey);
  }

  // If it's an EXFont, generate the corresponding UIFont, else fallback to React Native's built-in method
  if (exFont) {
    CGFloat computedSize = [size doubleValue] ?: uiFont.pointSize ?: defaultFontSize;
    if (scaleMultiplier > 0.0 && scaleMultiplier != 1.0) {
      computedSize = round(computedSize * scaleMultiplier);
    }
    return [exFont UIFontWithSize:computedSize];
  }

  return nil;
}

@end
