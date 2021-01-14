// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFont/EXFontRegistry.h>

@interface EXFontRegistry ()

@property (nonatomic, strong, readonly) NSMutableDictionary *registry;

@end

@implementation EXFontRegistry

- (instancetype)init
{
  if (self = [super init]) {
    _registry = [NSMutableDictionary dictionary];
  }
  return self;
}

- (EXFont *)fontForName:(NSString *)name
{
  return _registry[name];
}

- (void)setFont:(EXFont *)font forName:(NSString *)name
{
  _registry[name] = font;
}

@end
