package org.unimodules.core.interfaces

import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.JavaScriptContextHolder
import com.facebook.react.bridge.ReactApplicationContext

interface ReactNativeHostHandler {
  /**
   * Given chance for modules to customize {@link ReactInstanceManager}
   *
   * @return instance of {@link ReactInstanceManager}, or null if not to override
   */
  fun createReactInstanceManager(): ReactInstanceManager? {
    return null
  }

  /**
   * Given chance for modules to override react bundle file.
   * e.g. for expo-updates
   *
   * @return custom path to bundle file, or null if not to override
   */
  fun getJSBundleFile(): String? {
    return null
  }

  /**
   * Given chance for modules to override react bundle asset name.
   * e.g. for expo-updates
   *
   * @return custom bundle asset name, or null if not to override
   */
  fun getBundleAssetName(): String? {
    return null
  }

  /**
   * Given chance for JSI modules to register, e.g. for react-native-reanimated
   */
  fun onRegisterJSIModules(reactApplicationContext: ReactApplicationContext, jsContext: JavaScriptContextHolder) {
  }
}
