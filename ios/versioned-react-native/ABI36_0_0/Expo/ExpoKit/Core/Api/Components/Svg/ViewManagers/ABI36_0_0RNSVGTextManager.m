/**
 * Copyright (c) 2015-present, Horcrux.
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "ABI36_0_0RNSVGTextManager.h"

#import "ABI36_0_0RNSVGText.h"
#import "ABI36_0_0RCTConvert+RNSVG.h"

@implementation ABI36_0_0RNSVGTextManager

ABI36_0_0RCT_EXPORT_MODULE()

- (ABI36_0_0RNSVGRenderable *)node
{
  return [ABI36_0_0RNSVGText new];
}

ABI36_0_0RCT_EXPORT_VIEW_PROPERTY(textAnchor, ABI36_0_0RNSVGTextAnchor)
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(dx, id, ABI36_0_0RNSVGText)
{
    view.deltaX = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLengthArray:json];
}
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(dy, id, ABI36_0_0RNSVGText)
{
    view.deltaY = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLengthArray:json];
}
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(positionX, id, ABI36_0_0RNSVGText)
{
    view.positionX = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLengthArray:json];
}

ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(positionY, id, ABI36_0_0RNSVGText)
{
    view.positionY = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLengthArray:json];
}
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(x, id, ABI36_0_0RNSVGText)
{
    view.positionX = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLengthArray:json];
}

ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(y, id, ABI36_0_0RNSVGText)
{
    view.positionY = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLengthArray:json];
}
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(rotate, id, ABI36_0_0RNSVGText)
{
    view.rotate = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLengthArray:json];
}
ABI36_0_0RCT_EXPORT_VIEW_PROPERTY(font, NSDictionary)
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(inlineSize, id, ABI36_0_0RNSVGText)
{
    view.inlineSize = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLength:json];
}
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(textLength, id, ABI36_0_0RNSVGText)
{
    view.textLength = [ABI36_0_0RCTConvert ABI36_0_0RNSVGLength:json];
}
ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(baselineShift, id, ABI36_0_0RNSVGText)
{
    if ([json isKindOfClass:[NSString class]]) {
        NSString *stringValue = (NSString *)json;
        view.baselineShift = stringValue;
    } else {
        view.baselineShift = [NSString stringWithFormat:@"%f", [json doubleValue]];
    }
}
ABI36_0_0RCT_EXPORT_VIEW_PROPERTY(lengthAdjust, NSString)
ABI36_0_0RCT_EXPORT_VIEW_PROPERTY(alignmentBaseline, NSString)

ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(fontSize, id, ABI36_0_0RNSVGText)
{
    if ([json isKindOfClass:[NSString class]]) {
        NSString *stringValue = (NSString *)json;
        view.font = @{ @"fontSize": stringValue };
    } else {
        NSNumber* number = (NSNumber*)json;
        double num = [number doubleValue];
        view.font = @{@"fontSize": [NSNumber numberWithDouble:num] };
    }
}

ABI36_0_0RCT_CUSTOM_VIEW_PROPERTY(fontWeight, id, ABI36_0_0RNSVGText)
{
    if ([json isKindOfClass:[NSString class]]) {
        NSString *stringValue = (NSString *)json;
        view.font = @{ @"fontWeight": stringValue };
    } else {
        NSNumber* number = (NSNumber*)json;
        double num = [number doubleValue];
        view.font = @{@"fontWeight": [NSNumber numberWithDouble:num] };
    }
}

@end
