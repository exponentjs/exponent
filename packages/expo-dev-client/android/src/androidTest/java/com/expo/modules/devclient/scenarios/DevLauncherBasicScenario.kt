package com.expo.modules.devclient.scenarios

import android.app.Activity
import android.app.Application
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.launchActivity
import androidx.test.platform.app.InstrumentationRegistry
import com.expo.modules.devclient.interceptors.DevLauncherTestInterceptor
import com.expo.modules.devclient.interceptors.DevMenuTestInterceptor
import com.expo.modules.devclient.selectors.Views
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import expo.modules.devlauncher.DevLauncherController
import expo.modules.devlauncher.koin.DevLauncherKoinContext
import expo.modules.devlauncher.launcher.DevLauncherActivity
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import expo.modules.devmenu.DevMenuDefaultSettings
import expo.modules.devmenu.DevMenuManager
import java.lang.ref.WeakReference

internal typealias ReactNativeHostCreator = (application: Application) -> ReactNativeHost
internal typealias DevMenuTestInterceptorCreator = () -> expo.modules.devmenu.tests.DevMenuTestInterceptor
internal typealias DevLauncherTestInterceptorCreator = () -> expo.modules.devlauncher.tests.DevLauncherTestInterceptor
internal typealias KoinDeclaration = () -> Unit

internal class DevLauncherBasicScenario(
  private val reactNativeHostCreator: ReactNativeHostCreator? = null,
  private val devMenuTestInterceptorCreator: DevMenuTestInterceptorCreator? = null,
  private val devLauncherTestInterceptorCreator: DevLauncherTestInterceptorCreator? = null,
  private val koinDeclaration: KoinDeclaration? = null,
  private val launcherClass: Class<*>? = null
) : AutoCloseable {
  private var basicScenario: ActivityScenario<DevLauncherActivity>? = null
  private var appHost: WeakReference<ReactNativeHost?> = WeakReference(null)

  fun setUp() {
    DevLauncherKoinContext.reinitialize()

    val appContext = InstrumentationRegistry.getInstrumentation().targetContext.applicationContext as Application
    val rnHost = reactNativeHostCreator?.invoke(appContext) ?: defaultRNHost(appContext)
    val devMenuTestInterceptor = devMenuTestInterceptorCreator?.invoke()
      ?: defaultDevMenuTestInterceptor()
    val devLauncherTestInterceptor = devLauncherTestInterceptorCreator?.invoke()
      ?: defaultDevLauncherTestInterceptor()

    DevMenuManager.testInterceptor = devMenuTestInterceptor
    DevLauncherKoinContext.app.koin.declare(devLauncherTestInterceptor)
    koinDeclaration?.invoke()

    DevLauncherController.initialize(appContext, rnHost, launcherClass = launcherClass)

    appHost = WeakReference(rnHost)
  }

  fun teardown() {
    basicScenario?.close()
  }

  fun launch() {
    basicScenario = launchActivity()

    Views.DevLauncher.main.isDisplayed()
  }

  @Suppress("UNCHECKED_CAST")
  fun <T : Activity> onAppActivity(activityAction: ActivityScenario.ActivityAction<T>) {
    activityAction.perform(
      appHost.get()!!.reactInstanceManager.currentReactContext!!.currentActivity as T
    )
  }

  fun onLauncherActivity(activityAction: ActivityScenario.ActivityAction<DevLauncherActivity>) {
    basicScenario!!.onActivity(activityAction)
  }

  fun launcherController(): DevLauncherControllerInterface {
    return DevLauncherKoinContext.app.koin.get()
  }

  fun koin() = DevLauncherKoinContext.app.koin

  private fun defaultRNHost(application: Application): ReactNativeHost {
    return object : ReactNativeHost(application) {
      override fun getUseDeveloperSupport(): Boolean {
        return false
      }

      override fun getPackages(): List<ReactPackage> {
        return listOf(MainReactPackage(null))
      }
    }
  }

  private fun defaultDevMenuTestInterceptor(): expo.modules.devmenu.tests.DevMenuTestInterceptor {
    return DevMenuTestInterceptor(object : DevMenuDefaultSettings() {
      override var showsAtLaunch: Boolean
        get() = false
        set(_) {}

      override var isOnboardingFinished: Boolean
        get() = true
        set(_) {}
    })
  }

  private fun defaultDevLauncherTestInterceptor(): expo.modules.devlauncher.tests.DevLauncherTestInterceptor {
    return DevLauncherTestInterceptor()
  }

  override fun close() {
    teardown()
  }

  inline fun <R> setUpAndLaunch(block: (DevLauncherBasicScenario) -> R) {
    setUp()
    launch()
    (this as AutoCloseable).use {
      block(this)
    }
  }
}
