// Copyright 2019-present 650 Industries. All rights reserved.

#import <UMReactNativeAdapter/UMExportedModuleSpecJSI.h>
#import <UMCore/UMExportedModule.h>

namespace unimodules {

static facebook::jsi::Value __hostFunction_ExportedModuleSpecJSI_callMethod(
                                                                            facebook::jsi::Runtime &rt,
                                                                            facebook::react::TurboModule &turboModule,
                                                                            const facebook::jsi::Value* args,
  size_t count)
{
  UMExportedModule *exportedModule = (UMExportedModule *)static_cast<facebook::react::ObjCTurboModule &>(turboModule).instance_;
  NSDictionary *exportedMethods = [exportedModule getExportedMethods];
  std::string exportedMethodName = args[0].asString(rt).utf8(rt);
  NSString *exportedMethodNameString = [[NSString alloc] initWithUTF8String:exportedMethodName.c_str()];
  NSString *selectorString = exportedMethods[exportedMethodNameString];
  SEL selector = NSSelectorFromString(selectorString);

  // copied from JSCRuntime.cpp
  const unsigned maxStackArgCount = 8;
  facebook::jsi::Value stackArgs[maxStackArgCount];
  std::unique_ptr<facebook::jsi::Value[]> heapArgs;
  facebook::jsi::Value* internalArgs;
  facebook::jsi::Array internalArgsArray = args[1].asObject(rt).asArray(rt);
  size_t internalArgsCount = internalArgsArray.length(rt);
  if (internalArgsCount > maxStackArgCount) {
    heapArgs = std::make_unique<facebook::jsi::Value[]>(internalArgsCount);
    for (size_t i = 0; i < internalArgsCount; i++) {
      heapArgs[i] = internalArgsArray.getValueAtIndex(rt, i);
    }
    internalArgs = heapArgs.get();
  } else {
    for (size_t i = 0; i < internalArgsCount; i++) {
      stackArgs[i] = internalArgsArray.getValueAtIndex(rt, i);
    }
    internalArgs = stackArgs;
  }

  return static_cast<facebook::react::ObjCTurboModule &>(turboModule)
      .invokeObjCMethod(
          rt, facebook::react::PromiseKind, exportedMethodName, selector, internalArgs, internalArgsCount);
}

ExportedModuleSpecJSI::ExportedModuleSpecJSI(id instance,
                                             std::shared_ptr<facebook::react::CallInvoker> jsInvoker,
                                             std::shared_ptr<facebook::react::CallInvoker> nativeInvoker,
                                             id<RCTTurboModulePerformanceLogger> perfLogger)
  : ObjCTurboModule([NSStringFromClass([instance class]) UTF8String], instance, jsInvoker, nativeInvoker, perfLogger) {
    // call with:
    // [methodName, [args]]
  methodMap_["callMethod"] = MethodMetadata {2, __hostFunction_ExportedModuleSpecJSI_callMethod};
}

} // namespace unimodules
