// Copyright 2018-present 650 Industries. All rights reserved.

@protocol EXFontProcessorInterface

- (UIFont *)updateFont:(UIFont *)uiFont
            withFamily:(NSString *)family
                  size:(NSNumber *)size
                weight:(NSString *)weight
                 style:(NSString *)style
               variant:(NSArray<NSDictionary *> *)variant
       scaleMultiplier:(CGFloat)scaleMultiplier;

@end
