/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "ABI31_0_0RCTConvert.h"

#import <objc/message.h>

#import <CoreText/CoreText.h>

#import "ABI31_0_0RCTDefines.h"
#import "ABI31_0_0RCTImageSource.h"
#import "ABI31_0_0RCTParserUtils.h"
#import "ABI31_0_0RCTUtils.h"

@implementation ABI31_0_0RCTConvert

ABI31_0_0RCT_CONVERTER(id, id, self)

ABI31_0_0RCT_CONVERTER(BOOL, BOOL, boolValue)
ABI31_0_0RCT_NUMBER_CONVERTER(double, doubleValue)
ABI31_0_0RCT_NUMBER_CONVERTER(float, floatValue)
ABI31_0_0RCT_NUMBER_CONVERTER(int, intValue)

ABI31_0_0RCT_NUMBER_CONVERTER(int64_t, longLongValue);
ABI31_0_0RCT_NUMBER_CONVERTER(uint64_t, unsignedLongLongValue);

ABI31_0_0RCT_NUMBER_CONVERTER(NSInteger, integerValue)
ABI31_0_0RCT_NUMBER_CONVERTER(NSUInteger, unsignedIntegerValue)

/**
 * This macro is used for creating converter functions for directly
 * representable json values that require no conversion.
 */
#if ABI31_0_0RCT_DEBUG
#define ABI31_0_0RCT_JSON_CONVERTER(type)           \
+ (type *)type:(id)json                    \
{                                          \
  if ([json isKindOfClass:[type class]]) { \
    return json;                           \
  } else if (json) {                       \
    ABI31_0_0RCTLogConvertError(json, @#type);      \
  }                                        \
  return nil;                              \
}
#else
#define ABI31_0_0RCT_JSON_CONVERTER(type)           \
+ (type *)type:(id)json { return json; }
#endif

ABI31_0_0RCT_JSON_CONVERTER(NSArray)
ABI31_0_0RCT_JSON_CONVERTER(NSDictionary)
ABI31_0_0RCT_JSON_CONVERTER(NSString)
ABI31_0_0RCT_JSON_CONVERTER(NSNumber)

ABI31_0_0RCT_CUSTOM_CONVERTER(NSSet *, NSSet, [NSSet setWithArray:json])
ABI31_0_0RCT_CUSTOM_CONVERTER(NSData *, NSData, [json dataUsingEncoding:NSUTF8StringEncoding])

+ (NSIndexSet *)NSIndexSet:(id)json
{
  json = [self NSNumberArray:json];
  NSMutableIndexSet *indexSet = [NSMutableIndexSet new];
  for (NSNumber *number in json) {
    NSInteger index = number.integerValue;
    if (ABI31_0_0RCT_DEBUG && index < 0) {
      ABI31_0_0RCTLogError(@"Invalid index value %lld. Indices must be positive.", (long long)index);
    }
    [indexSet addIndex:index];
  }
  return indexSet;
}

+ (NSURL *)NSURL:(id)json
{
  NSString *path = [self NSString:json];
  if (!path) {
    return nil;
  }

  @try { // NSURL has a history of crashing with bad input, so let's be safe

    NSURL *URL = [NSURL URLWithString:path];
    if (URL.scheme) { // Was a well-formed absolute URL
      return URL;
    }

    // Check if it has a scheme
    if ([path rangeOfString:@":"].location != NSNotFound) {
      path = [path stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
      URL = [NSURL URLWithString:path];
      if (URL) {
        return URL;
      }
    }

    // Assume that it's a local path
    path = path.stringByRemovingPercentEncoding;
    if ([path hasPrefix:@"~"]) {
      // Path is inside user directory
      path = path.stringByExpandingTildeInPath;
    } else if (!path.absolutePath) {
      // Assume it's a resource path
      path = [[NSBundle mainBundle].resourcePath stringByAppendingPathComponent:path];
    }
    if (!(URL = [NSURL fileURLWithPath:path])) {
      ABI31_0_0RCTLogConvertError(json, @"a valid URL");
    }
    return URL;
  }
  @catch (__unused NSException *e) {
    ABI31_0_0RCTLogConvertError(json, @"a valid URL");
    return nil;
  }
}

ABI31_0_0RCT_ENUM_CONVERTER(NSURLRequestCachePolicy, (@{
                                               @"default": @(NSURLRequestUseProtocolCachePolicy),
                                               @"reload": @(NSURLRequestReloadIgnoringLocalCacheData),
                                               @"force-cache": @(NSURLRequestReturnCacheDataElseLoad),
                                               @"only-if-cached": @(NSURLRequestReturnCacheDataDontLoad),
                                               }), NSURLRequestUseProtocolCachePolicy, integerValue)


+ (NSURLRequest *)NSURLRequest:(id)json
{
  if ([json isKindOfClass:[NSString class]]) {
    NSURL *URL = [self NSURL:json];
    return URL ? [NSURLRequest requestWithURL:URL] : nil;
  }
  if ([json isKindOfClass:[NSDictionary class]]) {
    NSString *URLString = json[@"uri"] ?: json[@"url"];

    NSURL *URL;
    NSString *bundleName = json[@"bundle"];
    if (bundleName) {
      URLString = [NSString stringWithFormat:@"%@.bundle/%@", bundleName, URLString];
    }

    URL = [self NSURL:URLString];
    if (!URL) {
      return nil;
    }

    NSData *body = [self NSData:json[@"body"]];
    NSString *method = [self NSString:json[@"method"]].uppercaseString ?: @"GET";
    NSURLRequestCachePolicy cachePolicy = [self NSURLRequestCachePolicy:json[@"cache"]];
    NSDictionary *headers = [self NSDictionary:json[@"headers"]];
    if ([method isEqualToString:@"GET"] && headers == nil && body == nil && cachePolicy == NSURLRequestUseProtocolCachePolicy) {
      return [NSURLRequest requestWithURL:URL];
    }

    if (headers) {
      __block BOOL allHeadersAreStrings = YES;
      [headers enumerateKeysAndObjectsUsingBlock:^(NSString *key, id header, BOOL *stop) {
        if (![header isKindOfClass:[NSString class]]) {
          ABI31_0_0RCTLogError(@"Values of HTTP headers passed must be  of type string. "
                      "Value of header '%@' is not a string.", key);
          allHeadersAreStrings = NO;
          *stop = YES;
        }
      }];
      if (!allHeadersAreStrings) {
        // Set headers to nil here to avoid crashing later.
        headers = nil;
      }
    }

    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:URL];
    request.HTTPBody = body;
    request.HTTPMethod = method;
    request.cachePolicy = cachePolicy;
    request.allHTTPHeaderFields = headers;
    return [request copy];
  }
  if (json) {
    ABI31_0_0RCTLogConvertError(json, @"a valid URLRequest");
  }
  return nil;
}

+ (ABI31_0_0RCTFileURL *)ABI31_0_0RCTFileURL:(id)json
{
  NSURL *fileURL = [self NSURL:json];
  if (!fileURL.fileURL) {
    ABI31_0_0RCTLogError(@"URI must be a local file, '%@' isn't.", fileURL);
    return nil;
  }
  if (![[NSFileManager defaultManager] fileExistsAtPath:fileURL.path]) {
    ABI31_0_0RCTLogError(@"File '%@' could not be found.", fileURL);
    return nil;
  }
  return fileURL;
}

+ (NSDate *)NSDate:(id)json
{
  if ([json isKindOfClass:[NSNumber class]]) {
    return [NSDate dateWithTimeIntervalSince1970:[self NSTimeInterval:json]];
  } else if ([json isKindOfClass:[NSString class]]) {
    static NSDateFormatter *formatter;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      formatter = [NSDateFormatter new];
      formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ";
      formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
      formatter.timeZone = [NSTimeZone timeZoneWithName:@"UTC"];
    });
    NSDate *date = [formatter dateFromString:json];
    if (!date) {
      ABI31_0_0RCTLogError(@"JSON String '%@' could not be interpreted as a date. "
                  "Expected format: YYYY-MM-DD'T'HH:mm:ss.sssZ", json);
    }
    return date;
  } else if (json) {
    ABI31_0_0RCTLogConvertError(json, @"a date");
  }
  return nil;
}

+ (NSLocale *)NSLocale:(id)json
{
  if ([json isKindOfClass:[NSString class]]) {
    NSLocale *locale = [[NSLocale alloc] initWithLocaleIdentifier:json];
    if (!locale) {
      ABI31_0_0RCTLogError(@"JSON String '%@' could not be interpreted as a valid locale. ", json);
    }
    return locale;
  } else if (json) {
    ABI31_0_0RCTLogConvertError(json, @"a locale");
  }
  return nil;
}

// JS Standard for time is milliseconds
ABI31_0_0RCT_CUSTOM_CONVERTER(NSTimeInterval, NSTimeInterval, [self double:json] / 1000.0)

// JS standard for time zones is minutes.
ABI31_0_0RCT_CUSTOM_CONVERTER(NSTimeZone *, NSTimeZone, [NSTimeZone timeZoneForSecondsFromGMT:[self double:json] * 60.0])

NSNumber *ABI31_0_0RCTConvertEnumValue(const char *typeName, NSDictionary *mapping, NSNumber *defaultValue, id json)
{
  if (!json) {
    return defaultValue;
  }
  if ([json isKindOfClass:[NSNumber class]]) {
    NSArray *allValues = mapping.allValues;
    if ([allValues containsObject:json] || [json isEqual:defaultValue]) {
      return json;
    }
    ABI31_0_0RCTLogError(@"Invalid %s '%@'. should be one of: %@", typeName, json, allValues);
    return defaultValue;
  }
  if (ABI31_0_0RCT_DEBUG && ![json isKindOfClass:[NSString class]]) {
    ABI31_0_0RCTLogError(@"Expected NSNumber or NSString for %s, received %@: %@",
                typeName, [json classForCoder], json);
  }
  id value = mapping[json];
  if (ABI31_0_0RCT_DEBUG && !value && [json description].length > 0) {
    ABI31_0_0RCTLogError(@"Invalid %s '%@'. should be one of: %@", typeName, json, [[mapping allKeys] sortedArrayUsingSelector: @selector(caseInsensitiveCompare:)]);
  }
  return value ?: defaultValue;
}

NSNumber *ABI31_0_0RCTConvertMultiEnumValue(const char *typeName, NSDictionary *mapping, NSNumber *defaultValue, id json)
{
  if ([json isKindOfClass:[NSArray class]]) {
    if ([json count] == 0) {
      return defaultValue;
    }
    long long result = 0;
    for (id arrayElement in json) {
      NSNumber *value = ABI31_0_0RCTConvertEnumValue(typeName, mapping, defaultValue, arrayElement);
      result |= value.longLongValue;
    }
    return @(result);
  }
  return ABI31_0_0RCTConvertEnumValue(typeName, mapping, defaultValue, json);
}

ABI31_0_0RCT_ENUM_CONVERTER(NSLineBreakMode, (@{
  @"clip": @(NSLineBreakByClipping),
  @"head": @(NSLineBreakByTruncatingHead),
  @"tail": @(NSLineBreakByTruncatingTail),
  @"middle": @(NSLineBreakByTruncatingMiddle),
  @"wordWrapping": @(NSLineBreakByWordWrapping),
}), NSLineBreakByTruncatingTail, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(NSTextAlignment, (@{
  @"auto": @(NSTextAlignmentNatural),
  @"left": @(NSTextAlignmentLeft),
  @"center": @(NSTextAlignmentCenter),
  @"right": @(NSTextAlignmentRight),
  @"justify": @(NSTextAlignmentJustified),
}), NSTextAlignmentNatural, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(NSUnderlineStyle, (@{
  @"solid": @(NSUnderlineStyleSingle),
  @"double": @(NSUnderlineStyleDouble),
  @"dotted": @(NSUnderlinePatternDot | NSUnderlineStyleSingle),
  @"dashed": @(NSUnderlinePatternDash | NSUnderlineStyleSingle),
}), NSUnderlineStyleSingle, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0RCTBorderStyle, (@{
  @"solid": @(ABI31_0_0RCTBorderStyleSolid),
  @"dotted": @(ABI31_0_0RCTBorderStyleDotted),
  @"dashed": @(ABI31_0_0RCTBorderStyleDashed),
}), ABI31_0_0RCTBorderStyleSolid, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0RCTTextDecorationLineType, (@{
  @"none": @(ABI31_0_0RCTTextDecorationLineTypeNone),
  @"underline": @(ABI31_0_0RCTTextDecorationLineTypeUnderline),
  @"line-through": @(ABI31_0_0RCTTextDecorationLineTypeStrikethrough),
  @"underline line-through": @(ABI31_0_0RCTTextDecorationLineTypeUnderlineStrikethrough),
}), ABI31_0_0RCTTextDecorationLineTypeNone, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(NSWritingDirection, (@{
  @"auto": @(NSWritingDirectionNatural),
  @"ltr": @(NSWritingDirectionLeftToRight),
  @"rtl": @(NSWritingDirectionRightToLeft),
}), NSWritingDirectionNatural, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(UITextAutocapitalizationType, (@{
  @"none": @(UITextAutocapitalizationTypeNone),
  @"words": @(UITextAutocapitalizationTypeWords),
  @"sentences": @(UITextAutocapitalizationTypeSentences),
  @"characters": @(UITextAutocapitalizationTypeAllCharacters)
}), UITextAutocapitalizationTypeSentences, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(UITextFieldViewMode, (@{
  @"never": @(UITextFieldViewModeNever),
  @"while-editing": @(UITextFieldViewModeWhileEditing),
  @"unless-editing": @(UITextFieldViewModeUnlessEditing),
  @"always": @(UITextFieldViewModeAlways),
}), UITextFieldViewModeNever, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(UIKeyboardType, (@{
  @"default": @(UIKeyboardTypeDefault),
  @"ascii-capable": @(UIKeyboardTypeASCIICapable),
  @"numbers-and-punctuation": @(UIKeyboardTypeNumbersAndPunctuation),
  @"url": @(UIKeyboardTypeURL),
  @"number-pad": @(UIKeyboardTypeNumberPad),
  @"phone-pad": @(UIKeyboardTypePhonePad),
  @"name-phone-pad": @(UIKeyboardTypeNamePhonePad),
  @"email-address": @(UIKeyboardTypeEmailAddress),
  @"decimal-pad": @(UIKeyboardTypeDecimalPad),
  @"twitter": @(UIKeyboardTypeTwitter),
  @"web-search": @(UIKeyboardTypeWebSearch),
  // Added for Android compatibility
  @"numeric": @(UIKeyboardTypeDecimalPad),
}), UIKeyboardTypeDefault, integerValue)

#if !TARGET_OS_TV
ABI31_0_0RCT_MULTI_ENUM_CONVERTER(UIDataDetectorTypes, (@{
  @"phoneNumber": @(UIDataDetectorTypePhoneNumber),
  @"link": @(UIDataDetectorTypeLink),
  @"address": @(UIDataDetectorTypeAddress),
  @"calendarEvent": @(UIDataDetectorTypeCalendarEvent),
  @"none": @(UIDataDetectorTypeNone),
  @"all": @(UIDataDetectorTypeAll),
}), UIDataDetectorTypePhoneNumber, unsignedLongLongValue)

#if WEBKIT_IOS_10_APIS_AVAILABLE
ABI31_0_0RCT_MULTI_ENUM_CONVERTER(WKDataDetectorTypes, (@{
 @"phoneNumber": @(WKDataDetectorTypePhoneNumber),
 @"link": @(WKDataDetectorTypeLink),
 @"address": @(WKDataDetectorTypeAddress),
 @"calendarEvent": @(WKDataDetectorTypeCalendarEvent),
 @"trackingNumber": @(WKDataDetectorTypeTrackingNumber),
 @"flightNumber": @(WKDataDetectorTypeFlightNumber),
 @"lookupSuggestion": @(WKDataDetectorTypeLookupSuggestion),
 @"none": @(WKDataDetectorTypeNone),
 @"all": @(WKDataDetectorTypeAll),
 }), WKDataDetectorTypePhoneNumber, unsignedLongLongValue)
 #endif // WEBKIT_IOS_10_APIS_AVAILABLE

 #endif // !TARGET_OS_TV

ABI31_0_0RCT_ENUM_CONVERTER(UIKeyboardAppearance, (@{
  @"default": @(UIKeyboardAppearanceDefault),
  @"light": @(UIKeyboardAppearanceLight),
  @"dark": @(UIKeyboardAppearanceDark),
}), UIKeyboardAppearanceDefault, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(UIReturnKeyType, (@{
  @"default": @(UIReturnKeyDefault),
  @"go": @(UIReturnKeyGo),
  @"google": @(UIReturnKeyGoogle),
  @"join": @(UIReturnKeyJoin),
  @"next": @(UIReturnKeyNext),
  @"route": @(UIReturnKeyRoute),
  @"search": @(UIReturnKeySearch),
  @"send": @(UIReturnKeySend),
  @"yahoo": @(UIReturnKeyYahoo),
  @"done": @(UIReturnKeyDone),
  @"emergency-call": @(UIReturnKeyEmergencyCall),
}), UIReturnKeyDefault, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(UIViewContentMode, (@{
  @"scale-to-fill": @(UIViewContentModeScaleToFill),
  @"scale-aspect-fit": @(UIViewContentModeScaleAspectFit),
  @"scale-aspect-fill": @(UIViewContentModeScaleAspectFill),
  @"redraw": @(UIViewContentModeRedraw),
  @"center": @(UIViewContentModeCenter),
  @"top": @(UIViewContentModeTop),
  @"bottom": @(UIViewContentModeBottom),
  @"left": @(UIViewContentModeLeft),
  @"right": @(UIViewContentModeRight),
  @"top-left": @(UIViewContentModeTopLeft),
  @"top-right": @(UIViewContentModeTopRight),
  @"bottom-left": @(UIViewContentModeBottomLeft),
  @"bottom-right": @(UIViewContentModeBottomRight),
  // Cross-platform values
  @"cover": @(UIViewContentModeScaleAspectFill),
  @"contain": @(UIViewContentModeScaleAspectFit),
  @"stretch": @(UIViewContentModeScaleToFill),
}), UIViewContentModeScaleAspectFill, integerValue)

#if !TARGET_OS_TV
ABI31_0_0RCT_ENUM_CONVERTER(UIBarStyle, (@{
  @"default": @(UIBarStyleDefault),
  @"black": @(UIBarStyleBlack),
}), UIBarStyleDefault, integerValue)
#endif

static void convertCGStruct(const char *type, NSArray *fields, CGFloat *result, id json)
{
  NSUInteger count = fields.count;
  if ([json isKindOfClass:[NSArray class]]) {
    if (ABI31_0_0RCT_DEBUG && [json count] != count) {
      ABI31_0_0RCTLogError(@"Expected array with count %llu, but count is %llu: %@", (unsigned long long)count, (unsigned long long)[json count], json);
    } else {
      for (NSUInteger i = 0; i < count; i++) {
        result[i] = [ABI31_0_0RCTConvert CGFloat:ABI31_0_0RCTNilIfNull(json[i])];
      }
    }
  } else if ([json isKindOfClass:[NSDictionary class]]) {
    for (NSUInteger i = 0; i < count; i++) {
      result[i] = [ABI31_0_0RCTConvert CGFloat:ABI31_0_0RCTNilIfNull(json[fields[i]])];
    }
  } else if (json) {
    ABI31_0_0RCTLogConvertError(json, @(type));
  }
}

/**
 * This macro is used for creating converter functions for structs that consist
 * of a number of CGFloat properties, such as CGPoint, CGRect, etc.
 */
#define ABI31_0_0RCT_CGSTRUCT_CONVERTER(type, values)                \
+ (type)type:(id)json                                       \
{                                                           \
  static NSArray *fields;                                   \
  static dispatch_once_t onceToken;                         \
  dispatch_once(&onceToken, ^{                              \
    fields = values;                                        \
  });                                                       \
  type result;                                              \
  convertCGStruct(#type, fields, (CGFloat *)&result, json); \
  return result;                                            \
}

ABI31_0_0RCT_CUSTOM_CONVERTER(CGFloat, CGFloat, [self double:json])

ABI31_0_0RCT_CGSTRUCT_CONVERTER(CGPoint, (@[@"x", @"y"]))
ABI31_0_0RCT_CGSTRUCT_CONVERTER(CGSize, (@[@"width", @"height"]))
ABI31_0_0RCT_CGSTRUCT_CONVERTER(CGRect, (@[@"x", @"y", @"width", @"height"]))
ABI31_0_0RCT_CGSTRUCT_CONVERTER(UIEdgeInsets, (@[@"top", @"left", @"bottom", @"right"]))

ABI31_0_0RCT_ENUM_CONVERTER(CGLineJoin, (@{
  @"miter": @(kCGLineJoinMiter),
  @"round": @(kCGLineJoinRound),
  @"bevel": @(kCGLineJoinBevel),
}), kCGLineJoinMiter, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(CGLineCap, (@{
  @"butt": @(kCGLineCapButt),
  @"round": @(kCGLineCapRound),
  @"square": @(kCGLineCapSquare),
}), kCGLineCapButt, intValue)

ABI31_0_0RCT_CGSTRUCT_CONVERTER(CGAffineTransform, (@[
  @"a", @"b", @"c", @"d", @"tx", @"ty"
]))

+ (UIColor *)UIColor:(id)json
{
  if (!json) {
    return nil;
  }
  if ([json isKindOfClass:[NSArray class]]) {
    NSArray *components = [self NSNumberArray:json];
    CGFloat alpha = components.count > 3 ? [self CGFloat:components[3]] : 1.0;
    return [UIColor colorWithRed:[self CGFloat:components[0]]
                           green:[self CGFloat:components[1]]
                            blue:[self CGFloat:components[2]]
                           alpha:alpha];
  } else if ([json isKindOfClass:[NSNumber class]]) {
    NSUInteger argb = [self NSUInteger:json];
    CGFloat a = ((argb >> 24) & 0xFF) / 255.0;
    CGFloat r = ((argb >> 16) & 0xFF) / 255.0;
    CGFloat g = ((argb >> 8) & 0xFF) / 255.0;
    CGFloat b = (argb & 0xFF) / 255.0;
    return [UIColor colorWithRed:r green:g blue:b alpha:a];
  } else {
    ABI31_0_0RCTLogConvertError(json, @"a UIColor. Did you forget to call processColor() on the JS side?");
    return nil;
  }
}

+ (CGColorRef)CGColor:(id)json
{
  return [self UIColor:json].CGColor;
}

+ (ABI31_0_0YGValue)ABI31_0_0YGValue:(id)json
{
  if (!json) {
    return ABI31_0_0YGValueUndefined;
  } else if ([json isKindOfClass:[NSNumber class]]) {
    return (ABI31_0_0YGValue) { [json floatValue], ABI31_0_0YGUnitPoint };
  } else if ([json isKindOfClass:[NSString class]]) {
    NSString *s = (NSString *) json;
    if ([s isEqualToString:@"auto"]) {
      return (ABI31_0_0YGValue) { ABI31_0_0YGUndefined, ABI31_0_0YGUnitAuto };
    } else if ([s hasSuffix:@"%"]) {
      return (ABI31_0_0YGValue) { [[s substringToIndex:s.length] floatValue], ABI31_0_0YGUnitPercent };
    } else {
      ABI31_0_0RCTLogConvertError(json, @"a ABI31_0_0YGValue. Did you forget the % or pt suffix?");
    }
  } else {
    ABI31_0_0RCTLogConvertError(json, @"a ABI31_0_0YGValue.");
  }
  return ABI31_0_0YGValueUndefined;
}

NSArray *ABI31_0_0RCTConvertArrayValue(SEL type, id json)
{
  __block BOOL copy = NO;
  __block NSArray *values = json = [ABI31_0_0RCTConvert NSArray:json];
  [json enumerateObjectsUsingBlock:^(id jsonValue, NSUInteger idx, __unused BOOL *stop) {
    id value = ((id(*)(Class, SEL, id))objc_msgSend)([ABI31_0_0RCTConvert class], type, jsonValue);
    if (copy) {
      if (value) {
        [(NSMutableArray *)values addObject:value];
      }
    } else if (value != jsonValue) {
      // Converted value is different, so we'll need to copy the array
      values = [[NSMutableArray alloc] initWithCapacity:values.count];
      for (NSUInteger i = 0; i < idx; i++) {
        [(NSMutableArray *)values addObject:json[i]];
      }
      if (value) {
        [(NSMutableArray *)values addObject:value];
      }
      copy = YES;
    }
  }];
  return values;
}

ABI31_0_0RCT_ARRAY_CONVERTER(NSURL)
ABI31_0_0RCT_ARRAY_CONVERTER(ABI31_0_0RCTFileURL)
ABI31_0_0RCT_ARRAY_CONVERTER(UIColor)

/**
 * This macro is used for creating converter functions for directly
 * representable json array values that require no conversion.
 */
#if ABI31_0_0RCT_DEBUG
#define ABI31_0_0RCT_JSON_ARRAY_CONVERTER_NAMED(type, name) ABI31_0_0RCT_ARRAY_CONVERTER_NAMED(type, name)
#else
#define ABI31_0_0RCT_JSON_ARRAY_CONVERTER_NAMED(type, name) + (NSArray *)name##Array:(id)json { return json; }
#endif
#define ABI31_0_0RCT_JSON_ARRAY_CONVERTER(type) ABI31_0_0RCT_JSON_ARRAY_CONVERTER_NAMED(type, type)

ABI31_0_0RCT_JSON_ARRAY_CONVERTER(NSArray)
ABI31_0_0RCT_JSON_ARRAY_CONVERTER(NSString)
ABI31_0_0RCT_JSON_ARRAY_CONVERTER_NAMED(NSArray<NSString *>, NSStringArray)
ABI31_0_0RCT_JSON_ARRAY_CONVERTER(NSDictionary)
ABI31_0_0RCT_JSON_ARRAY_CONVERTER(NSNumber)

// Can't use ABI31_0_0RCT_ARRAY_CONVERTER due to bridged cast
+ (NSArray *)CGColorArray:(id)json
{
  NSMutableArray *colors = [NSMutableArray new];
  for (id value in [self NSArray:json]) {
    [colors addObject:(__bridge id)[self CGColor:value]];
  }
  return colors;
}

static id ABI31_0_0RCTConvertPropertyListValue(id json)
{
  if (!json || json == (id)kCFNull) {
    return nil;
  }

  if ([json isKindOfClass:[NSDictionary class]]) {
    __block BOOL copy = NO;
    NSMutableDictionary *values = [[NSMutableDictionary alloc] initWithCapacity:[json count]];
    [json enumerateKeysAndObjectsUsingBlock:^(NSString *key, id jsonValue, __unused BOOL *stop) {
      id value = ABI31_0_0RCTConvertPropertyListValue(jsonValue);
      if (value) {
        values[key] = value;
      }
      copy |= value != jsonValue;
    }];
    return copy ? values : json;
  }

  if ([json isKindOfClass:[NSArray class]]) {
    __block BOOL copy = NO;
    __block NSArray *values = json;
    [json enumerateObjectsUsingBlock:^(id jsonValue, NSUInteger idx, __unused BOOL *stop) {
      id value = ABI31_0_0RCTConvertPropertyListValue(jsonValue);
      if (copy) {
        if (value) {
          [(NSMutableArray *)values addObject:value];
        }
      } else if (value != jsonValue) {
        // Converted value is different, so we'll need to copy the array
        values = [[NSMutableArray alloc] initWithCapacity:values.count];
        for (NSUInteger i = 0; i < idx; i++) {
          [(NSMutableArray *)values addObject:json[i]];
        }
        if (value) {
          [(NSMutableArray *)values addObject:value];
        }
        copy = YES;
      }
    }];
    return values;
  }

  // All other JSON types are supported by property lists
  return json;
}

+ (NSPropertyList)NSPropertyList:(id)json
{
  return ABI31_0_0RCTConvertPropertyListValue(json);
}

ABI31_0_0RCT_ENUM_CONVERTER(css_backface_visibility_t, (@{
  @"hidden": @NO,
  @"visible": @YES
}), YES, boolValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGOverflow, (@{
  @"hidden": @(ABI31_0_0YGOverflowHidden),
  @"visible": @(ABI31_0_0YGOverflowVisible),
  @"scroll": @(ABI31_0_0YGOverflowScroll),
}), ABI31_0_0YGOverflowVisible, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGDisplay, (@{
  @"flex": @(ABI31_0_0YGDisplayFlex),
  @"none": @(ABI31_0_0YGDisplayNone),
}), ABI31_0_0YGDisplayFlex, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGFlexDirection, (@{
  @"row": @(ABI31_0_0YGFlexDirectionRow),
  @"row-reverse": @(ABI31_0_0YGFlexDirectionRowReverse),
  @"column": @(ABI31_0_0YGFlexDirectionColumn),
  @"column-reverse": @(ABI31_0_0YGFlexDirectionColumnReverse)
}), ABI31_0_0YGFlexDirectionColumn, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGJustify, (@{
  @"flex-start": @(ABI31_0_0YGJustifyFlexStart),
  @"flex-end": @(ABI31_0_0YGJustifyFlexEnd),
  @"center": @(ABI31_0_0YGJustifyCenter),
  @"space-between": @(ABI31_0_0YGJustifySpaceBetween),
  @"space-around": @(ABI31_0_0YGJustifySpaceAround),
  @"space-evenly": @(ABI31_0_0YGJustifySpaceEvenly)
}), ABI31_0_0YGJustifyFlexStart, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGAlign, (@{
  @"flex-start": @(ABI31_0_0YGAlignFlexStart),
  @"flex-end": @(ABI31_0_0YGAlignFlexEnd),
  @"center": @(ABI31_0_0YGAlignCenter),
  @"auto": @(ABI31_0_0YGAlignAuto),
  @"stretch": @(ABI31_0_0YGAlignStretch),
  @"baseline": @(ABI31_0_0YGAlignBaseline),
  @"space-between": @(ABI31_0_0YGAlignSpaceBetween),
  @"space-around": @(ABI31_0_0YGAlignSpaceAround)
}), ABI31_0_0YGAlignFlexStart, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGDirection, (@{
  @"inherit": @(ABI31_0_0YGDirectionInherit),
  @"ltr": @(ABI31_0_0YGDirectionLTR),
  @"rtl": @(ABI31_0_0YGDirectionRTL),
}), ABI31_0_0YGDirectionInherit, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGPositionType, (@{
  @"absolute": @(ABI31_0_0YGPositionTypeAbsolute),
  @"relative": @(ABI31_0_0YGPositionTypeRelative)
}), ABI31_0_0YGPositionTypeRelative, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0YGWrap, (@{
  @"wrap": @(ABI31_0_0YGWrapWrap),
  @"nowrap": @(ABI31_0_0YGWrapNoWrap),
  @"wrap-reverse": @(ABI31_0_0YGWrapWrapReverse)
}), ABI31_0_0YGWrapNoWrap, intValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0RCTPointerEvents, (@{
  @"none": @(ABI31_0_0RCTPointerEventsNone),
  @"box-only": @(ABI31_0_0RCTPointerEventsBoxOnly),
  @"box-none": @(ABI31_0_0RCTPointerEventsBoxNone),
  @"auto": @(ABI31_0_0RCTPointerEventsUnspecified)
}), ABI31_0_0RCTPointerEventsUnspecified, integerValue)

ABI31_0_0RCT_ENUM_CONVERTER(ABI31_0_0RCTAnimationType, (@{
  @"spring": @(ABI31_0_0RCTAnimationTypeSpring),
  @"linear": @(ABI31_0_0RCTAnimationTypeLinear),
  @"easeIn": @(ABI31_0_0RCTAnimationTypeEaseIn),
  @"easeOut": @(ABI31_0_0RCTAnimationTypeEaseOut),
  @"easeInEaseOut": @(ABI31_0_0RCTAnimationTypeEaseInEaseOut),
  @"keyboard": @(ABI31_0_0RCTAnimationTypeKeyboard),
}), ABI31_0_0RCTAnimationTypeEaseInEaseOut, integerValue)

@end

@interface ABI31_0_0RCTImageSource (Packager)

@property (nonatomic, assign) BOOL packagerAsset;

@end

@implementation ABI31_0_0RCTConvert (Deprecated)

/* This method is only used when loading images synchronously, e.g. for tabbar icons */
+ (UIImage *)UIImage:(id)json
{
  if (!json) {
    return nil;
  }

  ABI31_0_0RCTImageSource *imageSource = [self ABI31_0_0RCTImageSource:json];
  if (!imageSource) {
    return nil;
  }

  __block UIImage *image;
  if (!ABI31_0_0RCTIsMainQueue()) {
    // It seems that none of the UIImage loading methods can be guaranteed
    // thread safe, so we'll pick the lesser of two evils here and block rather
    // than run the risk of crashing
    ABI31_0_0RCTLogWarn(@"Calling [ABI31_0_0RCTConvert UIImage:] on a background thread is not recommended");
    ABI31_0_0RCTUnsafeExecuteOnMainQueueSync(^{
      image = [self UIImage:json];
    });
    return image;
  }

  NSURL *URL = imageSource.request.URL;
  NSString *scheme = URL.scheme.lowercaseString;
  if ([scheme isEqualToString:@"file"]) {
    image = ABI31_0_0RCTImageFromLocalAssetURL(URL);
    if (!image) {
      ABI31_0_0RCTLogConvertError(json, @"an image. File not found.");
    }
  } else if ([scheme isEqualToString:@"data"]) {
    image = [UIImage imageWithData:[NSData dataWithContentsOfURL:URL]];
  } else if ([scheme isEqualToString:@"http"] && imageSource.packagerAsset) {
    image = [UIImage imageWithData:[NSData dataWithContentsOfURL:URL]];
  } else {
    ABI31_0_0RCTLogConvertError(json, @"an image. Only local files or data URIs are supported.");
    return nil;
  }

  CGFloat scale = imageSource.scale;
  if (!scale && imageSource.size.width) {
    // If no scale provided, set scale to image width / source width
    scale = CGImageGetWidth(image.CGImage) / imageSource.size.width;
  }

  if (scale) {
    image = [UIImage imageWithCGImage:image.CGImage
                                scale:scale
                          orientation:image.imageOrientation];
  }

  if (!CGSizeEqualToSize(imageSource.size, CGSizeZero) &&
      !CGSizeEqualToSize(imageSource.size, image.size)) {
    ABI31_0_0RCTLogError(@"Image source %@ size %@ does not match loaded image size %@.",
                URL.path.lastPathComponent,
                NSStringFromCGSize(imageSource.size),
                NSStringFromCGSize(image.size));
  }

  return image;
}

+ (CGImageRef)CGImage:(id)json
{
  return [self UIImage:json].CGImage;
}

@end
