// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXFont/EXFontScalersManager.h>

#import <UMCore/UMDefines.h>
#import <EXFont/EXFont.h>

#import <objc/runtime.h>

static NSPointerArray *currentFontScalers;

@implementation UIFont (EXFontLoader)

- (UIFont *)EXFontWithSize:(CGFloat)fontSize
{
  for (id<EXFontScaler> fontScaler in currentFontScalers) {
    UIFont *scaledFont = [fontScaler scaledFont:self toSize:fontSize];
    if (scaledFont) {
      return scaledFont;
    }
  }

  return [self EXFontWithSize:fontSize];
}

@end

/**
 * A singleton module responsible for overriding UIFont's
 * fontWithSize: method which is used for scaling fonts.
 * We need this one, central place to store the scalers
 * as for now to get rid of timing problems when backgrounding/
 * foregrounding apps.
 */

@implementation EXFontScalersManager

UM_REGISTER_SINGLETON_MODULE(FontScalersManager);

+ (void)initialize
{
  static dispatch_once_t initializeCurrentFontScalersOnce;
  dispatch_once(&initializeCurrentFontScalersOnce, ^{
    currentFontScalers = [NSPointerArray weakObjectsPointerArray];

    Class uiFont = [UIFont class];
    SEL uiUpdate = @selector(fontWithSize:);
    SEL exUpdate = @selector(EXFontWithSize:);

    method_exchangeImplementations(class_getInstanceMethod(uiFont, uiUpdate),
                                   class_getInstanceMethod(uiFont, exUpdate));
  });
}

- (void)registerFontScaler:(id<EXFontScaler>)fontScaler
{
  [currentFontScalers compact];
  [currentFontScalers addPointer:(__bridge void * _Nullable)(fontScaler)];
}

@end
