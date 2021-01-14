// Copyright 2015-present 650 Industries. All rights reserved.

#import <Foundation/Foundation.h>
#import <EXFont/EXFontProcessorInterface.h>
#import <EXFont/EXFontRegistry.h>

@interface EXFontLoaderProcessor : NSObject <EXFontProcessorInterface>

- (instancetype)initWithFontFamilyPrefix:(NSString *)prefix
                                registry:(EXFontRegistry *)registry;

- (instancetype)initWithRegistry:(EXFontRegistry *)registry;

@end
