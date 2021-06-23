// Copyright © 2018 650 Industries. All rights reserved.

#define UM_EXPORTED_METHODS_PREFIX __um_export__
#define UM_PROPSETTERS_PREFIX __um_set__
#define UM_PROPINFO_PREFIX __um_propinfo__

#define UM_DO_CONCAT(A, B) A ## B
#define UM_CONCAT(A, B) UM_DO_CONCAT(A, B)

#define UM_EXPORT_METHOD_AS(external_name, method) \
  _UM_EXTERN_METHOD(external_name, method) \
  - (void)method

#define _UM_EXTERN_METHOD(external_name, method) \
  + (const UMMethodInfo *)UM_CONCAT(UM_EXPORTED_METHODS_PREFIX, UM_CONCAT(external_name, UM_CONCAT(__LINE__, __COUNTER__))) { \
  static UMMethodInfo config = {#external_name, #method}; \
  return &config; \
  }

#define UM_VIEW_PROPERTY_INFO(external_name, type, viewPropPath, viewPropType) \
  + (const UMPropInfo *)UM_CONCAT(UM_PROPINFO_PREFIX, external_name) { \
  static UMPropInfo config = {#external_name, #type, viewPropPath, viewPropType}; \
  return &config; \
} \

#define UM_VIEW_PROPERTY(external_name, type, viewClass) \
  UM_VIEW_PROPERTY_INFO(external_name, type, nil, nil) \
  - (void)UM_CONCAT(UM_PROPSETTERS_PREFIX, external_name):(type)value view:(viewClass *)view

#define UM_VIEW_PROPERTY_ANIMATED(external_name, type, viewClass) \
  UM_VIEW_PROPERTY_INFO(external_name, type, #external_name, #type) \
  - (void)UM_CONCAT(UM_PROPSETTERS_PREFIX, external_name):(type)value view:(viewClass *)view { \
    view.external_name = value; \
  }

#define _UM_DEFINE_CUSTOM_LOAD(_custom_load_code) \
  extern void UMRegisterModule(Class); \
  + (void)load { \
    UMRegisterModule(self); \
    _custom_load_code \
  }

#define UM_EXPORT_MODULE_WITH_CUSTOM_LOAD(external_name, _custom_load_code) \
  _UM_DEFINE_CUSTOM_LOAD(_custom_load_code) \
  + (const NSString *)exportedModuleName { return @#external_name; }

#define UM_EXPORT_MODULE(external_name) \
  UM_EXPORT_MODULE_WITH_CUSTOM_LOAD(external_name,)

#define UM_REGISTER_MODULE(_custom_load_code) \
  _UM_DEFINE_CUSTOM_LOAD(_custom_load_code)

#define UM_REGISTER_SINGLETON_MODULE_WITH_CUSTOM_LOAD(singleton_name, _custom_load_code) \
  extern void UMRegisterSingletonModule(Class); \
  + (const NSString *)name { \
    return @#singleton_name; \
  } \
  \
  + (void)load { \
    UMRegisterSingletonModule(self); \
    _custom_load_code \
  }

#define UM_REGISTER_SINGLETON_MODULE(singleton_name) \
  UM_REGISTER_SINGLETON_MODULE_WITH_CUSTOM_LOAD(singleton_name,)

#define UM_WEAKIFY(var) \
__weak __typeof(var) UMWeak_##var = var;

#define UM_STRONGIFY(var) \
_Pragma("clang diagnostic push") \
_Pragma("clang diagnostic ignored \"-Wshadow\"") \
__strong __typeof(var) var = UMWeak_##var; \
_Pragma("clang diagnostic pop")

#define UM_ENSURE_STRONGIFY(var) \
UM_STRONGIFY(var); \
if (var == nil) { return; }

// Converts nil -> [NSNull null]
#define UMNullIfNil(value) (value ?: [NSNull null])

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

typedef struct UMMethodInfo {
  const char *const jsName;
  const char *const objcName;
} UMMethodInfo;

typedef struct UMPropInfo {
  const char *const jsName;
  const char *const type;
  const char *const viewPropPath;
  const char *const viewPropType;
} UMPropInfo;

typedef struct UMModuleInfo {
  const char *const jsName;
  const char *const internalName;
} UMModuleInfo;

typedef void (^UMDirectEventBlock)(NSDictionary *body);
typedef void (^UMPromiseResolveBlock)(id result);
typedef void (^UMPromiseRejectBlock)(NSString *code, NSString *message, NSError *error);

#pragma mark - Externs

// These should be defined by the concrete platform adapter
extern void UMLogInfo(NSString *format, ...);
extern void UMLogWarn(NSString *format, ...);
extern void UMLogError(NSString *format, ...);
extern void UMFatal(NSError *);
extern NSError * UMErrorWithMessage(NSString *);
extern UIApplication *UMSharedApplication(void);
