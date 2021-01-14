// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXFont/EXReactFontManager.h>
#import <React/RCTFont.h>
#import <EXFont/EXFontManagerInterface.h>
#import <UMCore/UMAppLifecycleService.h>
#import <objc/runtime.h>

static dispatch_once_t initializeCurrentFontProcessorsOnce;

static NSPointerArray *currentFontProcessors;

@implementation RCTFont (EXReactFontManager)

+ (UIFont *)EXUpdateFont:(UIFont *)uiFont
              withFamily:(NSString *)family
                    size:(NSNumber *)size
                  weight:(NSString *)weight
                   style:(NSString *)style
                 variant:(NSArray<NSDictionary *> *)variant
         scaleMultiplier:(CGFloat)scaleMultiplier
{
  UIFont *font;
  for (id<EXFontProcessorInterface> fontProcessor in currentFontProcessors) {
    font = [fontProcessor updateFont:uiFont withFamily:family size:size weight:weight style:style variant:variant scaleMultiplier:scaleMultiplier];
    if (font) {
      return font;
    }
  }

  return [self EXUpdateFont:uiFont withFamily:family size:size weight:weight style:style variant:variant scaleMultiplier:scaleMultiplier];
}

@end

/**
 * This class is responsible for allowing other modules to register as font processors in React Native.
 *
 * A font processor is an object conforming to UMFontProcessorInterface and is capable of
 * providing an instance of UIFont for given (family, size, weight, style, variant, scaleMultiplier).
 *
 * To be able to hook into React Native's way of processing fonts we:
 *  - add a new class method to RCTFont, `UMUpdateFont:withFamily:size:weight:style:variant:scaleMultiplier`
 *    with UMReactFontManager category.
 *  - add a new static variable `currentFontProcessors` holding an array of... font processors. This variable
 *    is shared between the RCTFont's category and UMReactFontManager class.
 *  - when UMReactFontManager is initialized, we exchange implementations of RCTFont.updateFont...
 *    and RCTFont.UMUpdateFont... After the class initialized, which happens only once, calling `RCTFont updateFont`
 *    calls in fact implementation we've defined up here and calling `RCTFont UMUpdateFont` falls back
 *    to the default implementation. (This is why we call `[self UMUpdateFont]` at the end of that function,
 *    though it seems like an endless loop, in fact we dispatch to another implementation.)
 *  - When some module adds a font processor using UMFontManagerInterface, UMReactFontManager adds a weak pointer to it
 *    to currentFontProcessors array.
 *  - Implementation logic of `RCTFont.EXUpdateFont` uses current value of currentFontProcessors when processing arguments.
 */

@interface EXReactFontManager ()

@property (nonatomic, strong) NSMutableSet *fontProcessors;

@end

@implementation EXReactFontManager

UM_REGISTER_MODULE();

- (instancetype)init
{
  if (self = [super init]) {
    _fontProcessors = [NSMutableSet set];
  }
  return self;
}

+ (const NSArray<Protocol *> *)exportedInterfaces
{
  return @[@protocol(EXFontManagerInterface)];
}

+ (void)initialize
{
  dispatch_once(&initializeCurrentFontProcessorsOnce, ^{
    currentFontProcessors = [NSPointerArray weakObjectsPointerArray];
  });

  Class rtcClass = [RCTFont class];
  SEL rtcUpdate = @selector(updateFont:withFamily:size:weight:style:variant:scaleMultiplier:);
  SEL exUpdate = @selector(EXUpdateFont:withFamily:size:weight:style:variant:scaleMultiplier:);
  
  method_exchangeImplementations(class_getClassMethod(rtcClass, rtcUpdate),
                                 class_getClassMethod(rtcClass, exUpdate));
}

- (void)addFontProcessor:(id<EXFontProcessorInterface>)processor
{
  [_fontProcessors addObject:processor];
  [currentFontProcessors compact];
  [currentFontProcessors addPointer:(__bridge void * _Nullable)(processor)];
}

@end
