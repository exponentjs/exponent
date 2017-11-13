/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <JavaScriptCore/JavaScriptCore.h>

#import <ReactABI23_0_0/ABI23_0_0RCTBridge.h>

@protocol ABI23_0_0RCTJSEnvironment <NSObject>

/**
 * The JSContext used by the bridge.
 */
@property (nonatomic, readonly, strong) JSContext *jsContext;
/**
 * The raw JSGlobalContextRef used by the bridge.
 */
@property (nonatomic, readonly, assign) JSGlobalContextRef jsContextRef;

@end

@interface ABI23_0_0RCTBridge (ABI23_0_0RCTJSEnvironment) <ABI23_0_0RCTJSEnvironment>

@end
