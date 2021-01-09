// Copyright 2015-present 650 Industries. All rights reserved.

#import <UMCore/UMExportedModule.h>
#import <UMCore/UMEventEmitter.h>
#import <UMCore/UMModuleRegistryConsumer.h>
#import <EXSensors/EXSensorsManager.h>

@interface EXBaseSensorModule : UMExportedModule <UMEventEmitter, UMModuleRegistryConsumer>

@property (nonatomic, weak, readonly) id sensorManager;

@end
