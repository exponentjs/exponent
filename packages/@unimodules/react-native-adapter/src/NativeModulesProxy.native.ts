// @ts-ignore
import { NativeModules, TurboModuleRegistry } from 'react-native';

import { ProxyNativeModule } from './NativeModulesProxy.types';

const NativeProxy = NativeModules.NativeUnimoduleProxy;
const modulesConstantsKey = 'modulesConstants';
const exportedMethodsKey = 'exportedMethods';

type MethodInfo = {
  name: string;
  key: any;
  argumentsCount: number;
};

function validateMethodCall(moduleName: string, methodInfo: MethodInfo, args: unknown[]) {
  const { name: methodName, argumentsCount } = methodInfo;
  if (argumentsCount !== args.length) {
    throw new Error(
      `Native method ${moduleName}.${methodName} expects ${argumentsCount} ${
        argumentsCount === 1 ? 'argument' : 'arguments'
      } but received ${args.length}`
    );
  }
}

const NativeModulesProxy: { [moduleName: string]: ProxyNativeModule } = {};

if (NativeProxy) {
  Object.keys(NativeProxy[exportedMethodsKey]).forEach(moduleName => {
    const turboModule = TurboModuleRegistry.get(moduleName);
    NativeModulesProxy[moduleName] = NativeProxy[modulesConstantsKey][moduleName] || {};
    NativeProxy[exportedMethodsKey][moduleName].forEach((methodInfo: MethodInfo) => {
      NativeModulesProxy[moduleName][methodInfo.name] = turboModule
        ? async (...args: unknown[]): Promise<any> => {
            validateMethodCall(moduleName, methodInfo, args);
            return await turboModule.callMethod(methodInfo.name, args);
          }
        : async (...args: unknown[]): Promise<any> => {
            validateMethodCall(moduleName, methodInfo, args);
            return await NativeProxy.callMethod(moduleName, methodInfo.key, args);
          };
    });

    // These are called by EventEmitter (which is a wrapper for NativeEventEmitter)
    // only on iOS and they use iOS-specific native module, EXReactNativeEventEmitter.
    //
    // On Android only {start,stop}Observing are called on the native module
    // and these should be exported as Expo methods.
    NativeModulesProxy[moduleName].addListener = (...args) =>
      NativeModules.UMReactNativeEventEmitter.addProxiedListener(moduleName, ...args);
    NativeModulesProxy[moduleName].removeListeners = (...args) =>
      NativeModules.UMReactNativeEventEmitter.removeProxiedListeners(moduleName, ...args);
  });
} else {
  console.warn(
    `The "UMNativeModulesProxy" native module is not exported through NativeModules; verify that @unimodules/react-native-adapter's native code is linked properly`
  );
}

export default NativeModulesProxy;
