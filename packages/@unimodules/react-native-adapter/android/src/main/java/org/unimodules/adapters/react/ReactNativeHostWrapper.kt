package org.unimodules.adapters.react

import android.app.Application
import androidx.collection.ArrayMap
import com.facebook.infer.annotation.Assertions
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.JSIModule
import com.facebook.react.bridge.JSIModulePackage
import com.facebook.react.bridge.JSIModuleSpec
import com.facebook.react.bridge.JavaScriptContextHolder
import com.facebook.react.bridge.JavaScriptExecutorFactory
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMarker
import com.facebook.react.bridge.ReactMarkerConstants
import com.facebook.react.common.LifecycleState
import com.facebook.react.devsupport.RedBoxHandler
import com.facebook.react.uimanager.UIImplementationProvider
import org.unimodules.core.interfaces.ReactNativeHostHandler
import java.lang.reflect.Method

class ReactNativeHostWrapper(
  application: Application,
  private val host: ReactNativeHost
) : ReactNativeHost(application) {
  private val reactNativeHostHandlers = ExpoModulesPackageList.getPackageList()
    .flatMap { it.createReactNativeHostHandlers(application) }
  private val methodMap: ArrayMap<String, Method> = ArrayMap()

  override fun createReactInstanceManager(): ReactInstanceManager {
    return reactNativeHostHandlers.asSequence()
      .map(ReactNativeHostHandler::createReactInstanceManager)
      .firstOrNull() ?: super.createReactInstanceManager()
  }

  override fun getRedBoxHandler(): RedBoxHandler? {
    return invokeDelegateMethod("getRedBoxHandler")
  }

  override fun getJavaScriptExecutorFactory(): JavaScriptExecutorFactory? {
    return invokeDelegateMethod("getJavaScriptExecutorFactory")
  }

  override fun getUIImplementationProvider(): UIImplementationProvider {
    return invokeDelegateMethod("getUIImplementationProvider")
  }

  override fun getJSIModulePackage(): JSIModulePackage? {
    val userJSIModulePackage = invokeDelegateMethod<JSIModulePackage?>("getJSIModulePackage")
    return JSIModuleContainerPackage(userJSIModulePackage)
  }

  override fun getJSMainModuleName(): String {
    return invokeDelegateMethod("getJSMainModuleName")
  }

  override fun getJSBundleFile(): String? {
    return reactNativeHostHandlers.asSequence()
      .map(ReactNativeHostHandler::getJSBundleFile)
      .firstOrNull() ?: invokeDelegateMethod<String?>("getJSBundleFile")
  }

  override fun getBundleAssetName(): String? {
    return reactNativeHostHandlers.asSequence()
      .map(ReactNativeHostHandler::getBundleAssetName)
      .firstOrNull() ?: invokeDelegateMethod<String?>("getBundleAssetName")
  }

  override fun getUseDeveloperSupport(): Boolean {
    return host.useDeveloperSupport
  }

  override fun getPackages(): MutableList<ReactPackage> {
    return invokeDelegateMethod("getPackages")
  }

  //endregion

  //region Internals

  inner class JSIModuleContainerPackage(userJSIModulePackage: JSIModulePackage?) : JSIModulePackage {
    private val userJSIModulePackage = userJSIModulePackage
    override fun getJSIModules(
      reactApplicationContext: ReactApplicationContext,
      jsContext: JavaScriptContextHolder
    ): List<JSIModuleSpec<JSIModule>> {
      reactNativeHostHandlers.forEach { handler ->
        handler.onRegisterJSIModules(reactApplicationContext, jsContext)
      }
      userJSIModulePackage?.getJSIModules(reactApplicationContext, jsContext)
      return emptyList()
    }
  }

  private fun <T> invokeDelegateMethod(name: String): T {
    var method = methodMap[name]
    if (method == null) {
      method = ReactNativeHost::class.java.getDeclaredMethod(name)
      method.isAccessible = true
      methodMap[name] = method
    }
    return method!!.invoke(host) as T
  }

  //endregion
}
