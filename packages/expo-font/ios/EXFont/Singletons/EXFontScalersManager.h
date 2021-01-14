// Copyright 2018-present 650 Industries. All rights reserved.

#import <UMCore/UMSingletonModule.h>

@protocol EXFontScaler

- (UIFont *)scaledFont:(UIFont *)font toSize:(CGFloat)fontSize;

@end

@protocol EXFontScalersManager

- (void)registerFontScaler:(id<EXFontScaler>)scaler;

@end

@interface EXFontScalersManager : UMSingletonModule <EXFontScalersManager>

@end
