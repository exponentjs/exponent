//
//  LazyExpoModule.h
//  ExpoModulesCore
//
//  Created by Marc Rousavy on 09.07.21.
//

#pragma once

#import <jsi/jsi.h>
#import "EXExportedModule.h"
#import <React-callinvoker/ReactCommon/CallInvoker.h>

namespace expo {

using namespace facebook;

class JSI_EXPORT LazyExpoModule: public jsi::HostObject {
public:
  explicit LazyExpoModule(EXExportedModule *expoModule,
                          std::shared_ptr<react::CallInvoker> callInvoker) :
    _expoModule(expoModule), _callInvoker(callInvoker) {}
  
public:
  jsi::Value get(jsi::Runtime &runtime, const jsi::PropNameID &name) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& rt) override;
  
private:
  EXExportedModule *_expoModule; // ARC pointer
  std::shared_ptr<react::CallInvoker> _callInvoker;
  
private:
  jsi::Function createFunctionForModuleSelector(jsi::Runtime &runtime, NSString *jsFunctionName, NSString *selectorName);
};

}
