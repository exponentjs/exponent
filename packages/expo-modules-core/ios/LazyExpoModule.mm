//
//  LazyExpoModule.mm
//  ExpoModulesCore
//
//  Created by Marc Rousavy on 09.07.21.
//

#import <Foundation/Foundation.h>
#import "LazyExpoModule.h"
#import <jsi/jsi.h>
#import "EXExportedModule.h"
#import "JSIConverter.h"

namespace expo {

using namespace facebook;

std::vector<jsi::PropNameID> LazyExpoModule::getPropertyNames(jsi::Runtime& rt) {
  std::vector<jsi::PropNameID> result;
  
  for (NSString *constantName : [[_expoModule constantsToExport] allKeys]) {
    result.push_back(jsi::PropNameID::forUtf8(rt, constantName.UTF8String));
  }
  for (NSString *methodName : [[_expoModule getExportedMethods] allKeys]) {
    result.push_back(jsi::PropNameID::forUtf8(rt, methodName.UTF8String));
  }
  
  return result;
}
  
jsi::Value LazyExpoModule::get(jsi::Runtime& runtime, const jsi::PropNameID& propName) {
  auto nameUtf8 = propName.utf8(runtime);
  auto name = [NSString stringWithUTF8String:nameUtf8.c_str()];
  
  id constant = [[_expoModule constantsToExport] objectForKey:name];
  if (constant != nil) {
    return convertObjCObjectToJSIValue(runtime, constant);
  }
  
  auto selectorName = [[_expoModule getExportedMethods] objectForKey:name];
  if (selectorName != nil) {
    return createFunctionForModuleSelector(runtime, name, selectorName);
  }
  
  return jsi::Value::undefined();
}

jsi::Function LazyExpoModule::createFunctionForModuleSelector(jsi::Runtime &runtime, NSString *jsFunctionName, NSString *selectorName) {
  auto selectorComponents = [[selectorName componentsSeparatedByString:@":"] count];
  // - 3 is for resolver and rejecter of the promise and the last, empty component
  auto selectorArgsCount = (unsigned int)(selectorComponents - 3);
  
  auto func = [this, jsFunctionName, selectorArgsCount](jsi::Runtime &runtime,
                                                        const jsi::Value &thisValue,
                                                        const jsi::Value *args,
                                                        size_t argsCount) -> jsi::Value {
    NSLog(@"Calling \"%@\"...", jsFunctionName);
    if (selectorArgsCount != argsCount) {
      auto message = "Invalid Arguments: \"" + std::string(jsFunctionName.UTF8String) + "\" expects " + std::to_string(selectorArgsCount) + " arguments, but was called with " + std::to_string(argsCount) + "!";
      throw jsi::JSError(runtime, message);
    }
    
    auto arguments = expo::convertJSICStyleArrayToNSArray(runtime, args, argsCount, _callInvoker);
    
    auto function = jsi::Function::createFromHostFunction(runtime,
                                                          jsi::PropNameID::forAscii(runtime, "f"),
                                                          2,
                                                          [this, jsFunctionName, arguments](jsi::Runtime &runtime,
                                                                                            const jsi::Value&,
                                                                                            const jsi::Value *args,
                                                                                            size_t count) -> jsi::Value {
      auto resolve = std::make_shared<jsi::Function>(args[0].asObject(runtime).asFunction(runtime));
      auto reject = std::make_shared<jsi::Function>(args[1].asObject(runtime).asFunction(runtime));
      
      auto resolver = ^(id result){
        _callInvoker->invokeAsync(^{
          auto jsiValue = expo::convertObjCObjectToJSIValue(runtime, result);
          resolve->call(runtime, jsiValue);
        });
      };
      auto rejecter = ^(NSString *code, NSString *message, NSError *error){
        _callInvoker->invokeAsync(^{
          auto jsError = jsi::JSError(runtime, message.UTF8String);
          reject->call(runtime, jsError.value());
        });
      };
      
      [_expoModule callExportedMethod:jsFunctionName
                        withArguments:arguments
                             resolver:resolver
                             rejecter:rejecter];
      
      return jsi::Value::undefined();
    });
    
    auto promise = runtime.global().getPropertyAsFunction(runtime, "Promise").callAsConstructor(runtime, function);
    return promise;
  };
  return jsi::Function::createFromHostFunction(runtime,
                                               jsi::PropNameID::forUtf8(runtime, jsFunctionName.UTF8String),
                                               selectorArgsCount,
                                               func);
}

} // namespace expo
