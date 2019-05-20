// Copyright 2017-present 650 Industries. All rights reserved.

#import <AVFoundation/AVFoundation.h>

#import <ReactABI32_0_0/ABI32_0_0RCTBridgeModule.h>

#import "ABI32_0_0EXScopedEventEmitter.h"
#import "ABI32_0_0EXAVObject.h"

typedef NS_OPTIONS(NSUInteger, ABI32_0_0EXAudioInterruptionMode)
{
  ABI32_0_0EXAudioInterruptionModeMixWithOthers = 0,
  ABI32_0_0EXAudioInterruptionModeDoNotMix      = 1,
  ABI32_0_0EXAudioInterruptionModeDuckOthers    = 2
};

typedef NS_OPTIONS(NSUInteger, ABI32_0_0EXAudioRecordingOptionBitRateStrategy)
{
  ABI32_0_0EXAudioRecordingOptionBitRateStrategyConstant            = 0,
  ABI32_0_0EXAudioRecordingOptionBitRateStrategyLongTermAverage     = 1,
  ABI32_0_0EXAudioRecordingOptionBitRateStrategyVariableConstrained = 2,
  ABI32_0_0EXAudioRecordingOptionBitRateStrategyVariable            = 3
};

@protocol ABI32_0_0EXAVScopedModuleDelegate

- (void)moduleDidBackground:(id)scopedModule;
- (void)moduleDidForeground:(id)scopedModule;
- (void)moduleWillDeallocate:(id)scopedModule;
- (NSError *)setActive:(BOOL)active forModule:(id)scopedModule;
- (NSError *)setCategory:(NSString *)category withOptions:(AVAudioSessionCategoryOptions)options forModule:(id)scopedModule;

@end

@interface ABI32_0_0EXAV : ABI32_0_0EXScopedEventEmitter <ABI32_0_0RCTBridgeModule>

- (void)handleMediaServicesReset:(NSNotification *)notification;
- (void)handleAudioSessionInterruption:(NSNotification *)notification;

- (NSError *)promoteAudioSessionIfNecessary;

- (NSError *)demoteAudioSessionIfPossible;

- (void)registerVideoForAudioLifecycle:(NSObject<ABI32_0_0EXAVObject> *)video;

- (void)unregisterVideoForAudioLifecycle:(NSObject<ABI32_0_0EXAVObject> *)video;

@end
