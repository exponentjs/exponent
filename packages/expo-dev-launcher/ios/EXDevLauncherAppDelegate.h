// Copyright 2015-present 650 Industries. All rights reserved.

#import <UIKit/UIKit.h>

#import <UMCore/UMSingletonModule.h>

#import "EXDevLauncherController.h"

NS_ASSUME_NONNULL_BEGIN

@interface EXDevLauncherAppDelegate : UMSingletonModule<UIApplicationDelegate, EXDevLauncherControllerDelegate>

- (const NSInteger)priority;

@end

NS_ASSUME_NONNULL_END
