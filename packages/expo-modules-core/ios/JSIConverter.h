//
//  JSIConverter.h
//  ExpoModulesCore
//
//  Created by Marc Rousavy on 09.07.21.
//

#pragma once

#import <jsi/jsi.h>
#import <ReactCommon/CallInvoker.h>
#import <React/RCTBridgeModule.h>

// -----------------------------------------------------------------------------------------------------
//                             Converts Objective-C values to JSI values
// -----------------------------------------------------------------------------------------------------
// source: https://github.com/mrousavy/react-native-vision-camera/blob/main/ios/React%20Utils/JSIUtils.h

namespace expo {

using namespace facebook;
using namespace facebook::react;

// NSNumber -> boolean
jsi::Value convertNSNumberToJSIBoolean(jsi::Runtime& runtime, NSNumber* value);

// NSNumber -> number
jsi::Value convertNSNumberToJSINumber(jsi::Runtime& runtime, NSNumber* value);

// NSNumber -> string
jsi::String convertNSStringToJSIString(jsi::Runtime& runtime, NSString* value);

// NSDictionary -> {}
jsi::Object convertNSDictionaryToJSIObject(jsi::Runtime& runtime, NSDictionary* value);

// NSArray -> []
jsi::Array convertNSArrayToJSIArray(jsi::Runtime& runtime, NSArray* value);

// id -> ???
jsi::Value convertObjCObjectToJSIValue(jsi::Runtime& runtime, id value);

// string -> NSString
NSString* convertJSIStringToNSString(jsi::Runtime& runtime, const jsi::String& value);

// any... -> NSArray
NSArray* convertJSICStyleArrayToNSArray(jsi::Runtime& runtime, const jsi::Value* array, size_t length, std::shared_ptr<CallInvoker> jsInvoker);

// NSArray -> any...
jsi::Value* convertNSArrayToJSICStyleArray(jsi::Runtime& runtime, NSArray* array);

// [] -> NSArray
NSArray* convertJSIArrayToNSArray(jsi::Runtime& runtime, const jsi::Array& value, std::shared_ptr<CallInvoker> jsInvoker);

// {} -> NSDictionary
NSDictionary* convertJSIObjectToNSDictionary(jsi::Runtime& runtime, const jsi::Object& value, std::shared_ptr<CallInvoker> jsInvoker);

// any -> id
id convertJSIValueToObjCObject(jsi::Runtime& runtime, const jsi::Value& value, std::shared_ptr<CallInvoker> jsInvoker);

// (any...) => any -> (void)(id, id)
RCTResponseSenderBlock convertJSIFunctionToCallback(jsi::Runtime& runtime, const jsi::Function& value, std::shared_ptr<CallInvoker> jsInvoker);

}
