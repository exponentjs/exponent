// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXFont/EXFontProcessorInterface.h>

@protocol EXFontManagerInterface

- (void)addFontProcessor:(id<EXFontProcessorInterface>)processor;

@end
