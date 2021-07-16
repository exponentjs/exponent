package org.unimodules.adapters.react

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.KeyEvent
import androidx.collection.ArrayMap
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactRootView
import com.facebook.react.modules.core.PermissionListener
import java.lang.reflect.Method

class ReactActivityDelegateWrapper(
  private val activity: ReactActivity,
  private val delegate: ReactActivityDelegate
) : ReactActivityDelegate(activity, null) {
  private val reactActivityLifecycleListeners = ExpoModulesPackageList.getPackageList()
    .flatMap { it.createReactActivityLifecycleListeners(activity) }
  private val methodMap: ArrayMap<String, Method> = ArrayMap()

  //region ReactActivityDelegate

  override fun getLaunchOptions(): Bundle? {
    return invokeDelegateMethod("getLaunchOptions")
  }

  override fun createRootView(): ReactRootView {
    return invokeDelegateMethod("createRootView")
  }

  override fun getReactNativeHost(): ReactNativeHost {
    return invokeDelegateMethod("getReactNativeHost")
  }

  override fun getReactInstanceManager(): ReactInstanceManager {
    return delegate.reactInstanceManager
  }

  override fun getMainComponentName(): String {
    return delegate.mainComponentName
  }

  override fun loadApp(appKey: String?) {
    return invokeDelegateMethod("loadApp", arrayOf(String::class.java), arrayOf(appKey))
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    invokeDelegateMethod<Unit, Bundle?>("onCreate", arrayOf(Bundle::class.java), arrayOf(savedInstanceState))
    reactActivityLifecycleListeners.forEach { listener ->
      listener.onCreate(activity, savedInstanceState)
    }
  }

  override fun onResume() {
    invokeDelegateMethod<Unit>("onResume")
    reactActivityLifecycleListeners.forEach { listener ->
      listener.onResume(activity)
    }
  }

  override fun onPause() {
    reactActivityLifecycleListeners.forEach { listener ->
      listener.onPause(activity)
    }
    return invokeDelegateMethod("onPause")
  }

  override fun onDestroy() {
    reactActivityLifecycleListeners.forEach { listener ->
      listener.onDestroy(activity)
    }
    return invokeDelegateMethod("onDestroy")
  }

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    delegate.onActivityResult(requestCode, resultCode, data)
  }

  override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    return delegate.onKeyDown(keyCode, event)
  }

  override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
    return delegate.onKeyUp(keyCode, event)
  }

  override fun onKeyLongPress(keyCode: Int, event: KeyEvent?): Boolean {
    return delegate.onKeyLongPress(keyCode, event)
  }

  override fun onBackPressed(): Boolean {
    return delegate.onBackPressed()
  }

  override fun onNewIntent(intent: Intent?): Boolean {
    return delegate.onNewIntent(intent)
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    delegate.onWindowFocusChanged(hasFocus)
  }

  override fun requestPermissions(permissions: Array<out String>?, requestCode: Int, listener: PermissionListener?) {
    delegate.requestPermissions(permissions, requestCode, listener)
  }

  override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>?, grantResults: IntArray?) {
    delegate.onRequestPermissionsResult(requestCode, permissions, grantResults)
  }

  override fun getContext(): Context {
    return invokeDelegateMethod("getContext")
  }

  override fun getPlainActivity(): Activity {
    return invokeDelegateMethod("getPlainActivity")
  }

  //endregion

  //region Internals

  private fun <T> invokeDelegateMethod(name: String): T {
    var method = methodMap[name]
    if (method == null) {
      method = ReactActivityDelegate::class.java.getDeclaredMethod(name)
      method.isAccessible = true
      methodMap[name] = method
    }
    return method!!.invoke(delegate) as T
  }

  private fun <T, A> invokeDelegateMethod(name: String,
                                          argTypes: Array<Class<*>>,
                                          args: Array<A>): T {
    var method = methodMap[name]
    if (method == null) {
      method = ReactActivityDelegate::class.java.getDeclaredMethod(name, *argTypes)
      method.isAccessible = true
      methodMap[name] = method
    }
    return method!!.invoke(delegate, *args) as T
  }

  //endregion
}
