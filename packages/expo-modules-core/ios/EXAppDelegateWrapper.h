// Copyright © 2018 650 Industries. All rights reserved.

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "EXModuleRegistryAdapter.h"

NS_ASSUME_NONNULL_BEGIN

NS_SWIFT_NAME(AppDelegateWrapper)
@interface EXAppDelegateWrapper : UIResponder <UIApplicationDelegate>

@property (nonatomic, strong) EXModuleRegistryAdapter *moduleRegistryAdapter;

@end

NS_ASSUME_NONNULL_END
