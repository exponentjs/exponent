// Copyright 2018-present 650 Industries. All rights reserved.

#import <UMReactNativeAdapter/UMNativeModulesProxy.h>
#import <UMReactNativeAdapter/UMViewManagerAdapter.h>
#import <UMReactNativeAdapter/UMNativeModulesProxy.h>
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>
#import <UMReactNativeAdapter/UMViewManagerAdapterClassesRegistry.h>
#import <UMReactNativeAdapter/UMModuleRegistryHolderReactModule.h>

@interface UMModuleRegistryAdapter ()

@property (nonatomic, strong) UMModuleRegistryProvider *moduleRegistryProvider;
@property (nonatomic, strong) UMViewManagerAdapterClassesRegistry *viewManagersClassesRegistry;

@end

@implementation UMModuleRegistryAdapter

- (instancetype)initWithModuleRegistryProvider:(UMModuleRegistryProvider *)moduleRegistryProvider
{
  if (self = [super init]) {
    _moduleRegistryProvider = moduleRegistryProvider;
    _viewManagersClassesRegistry = [[UMViewManagerAdapterClassesRegistry alloc] init];
  }
  return self;
}

- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge
{
  return [self extraModulesForModuleRegistry:[_moduleRegistryProvider moduleRegistry]];
}

- (NSArray<id<RCTBridgeModule>> *)extraModulesForModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  NSMutableArray<id<RCTBridgeModule>> *extraModules = [NSMutableArray array];
  
  UMNativeModulesProxy *nativeModulesProxy = [[UMNativeModulesProxy alloc] initWithModuleRegistry:moduleRegistry];
  
  [extraModules addObject:nativeModulesProxy];
  
  for (UMViewManager *viewManager in [moduleRegistry getAllViewManagers]) {
    Class viewManagerAdapterClass = [_viewManagersClassesRegistry viewManagerAdapterClassForViewManager:viewManager];
    [extraModules addObject:[[viewManagerAdapterClass alloc] initWithViewManager:viewManager]];
  }

  // Silence React Native warning `Base module "%s" does not exist`
  // occurring when view manager class is subclassing another class
  // that is not RCTViewManager (in our case all the view manager adapters
  // subclass UMViewManagerAdapter, so RN expects to find UMViewManagerAdapter
  // exported.
  [extraModules addObject:[[UMViewManagerAdapter alloc] init]];

  // It is possible that among internal modules there are some RCTBridgeModules --
  // let's add them to extraModules here.
  for (id<UMInternalModule> module in [moduleRegistry getAllInternalModules]) {
    if ([module conformsToProtocol:@protocol(RCTBridgeModule)]) {
      id<RCTBridgeModule> reactBridgeModule = (id<RCTBridgeModule>)module;
      [extraModules addObject:reactBridgeModule];
    }
  }
  
  // Adding the way to access the module registry from RCTBridgeModules.
  [extraModules addObject:[[UMModuleRegistryHolderReactModule alloc] initWithModuleRegistry:moduleRegistry]];

  // One could add some modules to the Module Registry after creating it.
  // Here is our last call for finalizing initialization.
  [moduleRegistry initialize];
  return extraModules;
}

@end
