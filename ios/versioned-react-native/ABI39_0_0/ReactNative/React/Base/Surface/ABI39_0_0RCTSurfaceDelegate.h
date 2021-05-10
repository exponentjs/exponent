/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>

#import <ABI39_0_0React/ABI39_0_0RCTSurfaceStage.h>

NS_ASSUME_NONNULL_BEGIN

@class ABI39_0_0RCTSurface;

@protocol ABI39_0_0RCTSurfaceDelegate <NSObject>

@optional

/**
 * Notifies a receiver that a surface transitioned to a new stage.
 * See `ABI39_0_0RCTSurfaceStage` for more details.
 */
- (void)surface:(ABI39_0_0RCTSurface *)surface didChangeStage:(ABI39_0_0RCTSurfaceStage)stage;

/**
 * Notifies a receiver that root view got a new (intrinsic) size during the last
 * layout pass.
 */
- (void)surface:(ABI39_0_0RCTSurface *)surface didChangeIntrinsicSize:(CGSize)intrinsicSize;

@end

NS_ASSUME_NONNULL_END
