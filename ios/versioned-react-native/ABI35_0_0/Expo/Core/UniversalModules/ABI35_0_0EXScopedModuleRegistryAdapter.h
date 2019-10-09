// Copyright © 2018 650 Industries. All rights reserved.

#import <ABI35_0_0UMReactNativeAdapter/ABI35_0_0UMModuleRegistryAdapter.h>

@interface ABI35_0_0EXScopedModuleRegistryAdapter : ABI35_0_0UMModuleRegistryAdapter

- (ABI35_0_0UMModuleRegistry *)moduleRegistryForParams:(NSDictionary *)params forExperienceId:(NSString *)experienceId withKernelServices:(NSDictionary *)kernelServices;

@end
