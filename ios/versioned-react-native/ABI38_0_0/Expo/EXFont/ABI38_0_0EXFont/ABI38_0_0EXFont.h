// Copyright 2015-present 650 Industries. All rights reserved.

#import <Foundation/Foundation.h>

static const char *ABI38_0_0EXFontAssocKey = "ABI38_0_0EXFont";

@interface ABI38_0_0EXFont : NSObject

- (instancetype)initWithCGFont:(CGFontRef)cgFont;
- (UIFont *)UIFontWithSize:(CGFloat)fsize;

@end
