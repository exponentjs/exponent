/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>

#import "ABI34_0_0RCTAnimatedNode.h"

@class ABI34_0_0RCTValueAnimatedNode;

@protocol ABI34_0_0RCTValueAnimatedNodeObserver <NSObject>

- (void)animatedNode:(ABI34_0_0RCTValueAnimatedNode *)node didUpdateValue:(CGFloat)value;

@end

@interface ABI34_0_0RCTValueAnimatedNode : ABI34_0_0RCTAnimatedNode

- (void)setOffset:(CGFloat)offset;
- (void)flattenOffset;
- (void)extractOffset;

@property (nonatomic, assign) CGFloat value;
@property (nonatomic, weak) id<ABI34_0_0RCTValueAnimatedNodeObserver> valueObserver;

@end
