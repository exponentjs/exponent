/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <Foundation/Foundation.h>

#import "ABI41_0_0RCTNativeSampleTurboModuleSpec.h"

/**
 * Sample iOS-specific impl of a TurboModule, conforming to the spec protocol.
 * This class is also 100% compatible with the NativeModule system.
 */
@interface ABI41_0_0RCTSampleTurboModule : NSObject <ABI41_0_0NativeSampleTurboModuleSpec>

@end
