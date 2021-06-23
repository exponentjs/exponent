// Copyright 2018-present 650 Industries. All rights reserved.

#import <UMCore/UMDefines.h>
#import <UMReactNativeAdapter/UMViewManagerAdapterClassesRegistry.h>
#import <UMReactNativeAdapter/UMViewManagerAdapter.h>
#import <objc/runtime.h>

#define QUOTE(str) #str
#define EXPAND_AND_QUOTE(str) QUOTE(str)

static const NSString *viewManagerAdapterModuleNamePrefix = @"ViewManagerAdapter_";

static IMP directEventBlockImplementation = nil;
static dispatch_once_t directEventBlockImplementationOnceToken;

@interface UMViewManagerAdapterClassesRegistry ()

@property (nonatomic, strong) NSMutableDictionary<Class, Class> *viewManagerAdaptersClasses;

@end

@implementation UMViewManagerAdapterClassesRegistry

- (instancetype)init
{
  if (self = [super init]) {
    _viewManagerAdaptersClasses = [NSMutableDictionary dictionary];
  }
  return self;
}

- (Class)viewManagerAdapterClassForViewManager:(UMViewManager *)viewManager
{
  Class viewManagerClass = [viewManager class];
  if (_viewManagerAdaptersClasses[viewManagerClass] == nil) {
    _viewManagerAdaptersClasses[(id <NSCopying>)viewManagerClass] = [self _createViewManagerAdapterClassForViewManager:viewManager];
  }
  return _viewManagerAdaptersClasses[viewManagerClass];
}

- (Class)_createViewManagerAdapterClassForViewManager:(UMViewManager *)viewManager
{
  const char *viewManagerClassName = [[viewManagerAdapterModuleNamePrefix stringByAppendingString:[viewManager viewName]] UTF8String];
  Class viewManagerAdapterClass = objc_allocateClassPair([UMViewManagerAdapter class], viewManagerClassName, 0);
  
  [self _ensureDirectEventBlockImplementationIsPresent];
  for (NSString *eventName in [viewManager supportedEvents]) {
    class_addMethod(object_getClass(viewManagerAdapterClass), NSSelectorFromString([@"propConfig_" stringByAppendingString:eventName]), directEventBlockImplementation, "@@:");
  }
  
  Class viewManagerClass = [viewManager class];
  [[viewManager getPropsNames] enumerateKeysAndObjectsUsingBlock:^(id propName, id obj, BOOL *stop) {
    SEL propInfoSelector = NSSelectorFromString([@EXPAND_AND_QUOTE(UM_PROPINFO_PREFIX) stringByAppendingString:propName]);
    if ([viewManagerClass respondsToSelector:propInfoSelector]) {
      IMP imp = [viewManagerClass methodForSelector:propInfoSelector];
      const UMPropInfo *propInfo = ((const UMPropInfo *(*)(id, SEL))imp)(viewManagerClass, propInfoSelector);
      
      // Animated props contain extra information on how the prop can be set directly on the view.
      // These props follow an optimized code-path that bypasses the view-manager.
      if (propInfo->viewPropType && propInfo->viewPropPath) {
        NSString *viewPropType = [NSString stringWithUTF8String:propInfo->viewPropType];
        NSString *viewPropPath = [NSString stringWithUTF8String:propInfo->viewPropPath];
        class_addMethod(object_getClass(viewManagerAdapterClass), NSSelectorFromString([@"propConfig_" stringByAppendingString:propName]), imp_implementationWithBlock(^{
          return @[viewPropType, viewPropPath];
        }), "@@:");
      }
    }
  }];
  
  return viewManagerAdapterClass;
}

- (void)_ensureDirectEventBlockImplementationIsPresent
{
  dispatch_once(&directEventBlockImplementationOnceToken, ^{
    directEventBlockImplementation = imp_implementationWithBlock(^{
      return @[@"RCTDirectEventBlock"];
    });
  });
}

@end
