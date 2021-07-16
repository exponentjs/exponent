package expo.modules.splashscreen

import android.content.Context
import expo.modules.splashscreen.singletons.SplashScreen
import org.unimodules.core.BasePackage
import org.unimodules.core.ExportedModule
import org.unimodules.core.interfaces.ReactActivityLifecycleListener
import org.unimodules.core.interfaces.SingletonModule

class SplashScreenPackage : BasePackage() {
  override fun createExportedModules(context: Context): List<ExportedModule> {
    return listOf(SplashScreenModule(context))
  }

  override fun createSingletonModules(context: Context?): List<SingletonModule> {
    return listOf(SplashScreen)
  }

  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
    return listOf(SplashScreenReactActivityLifecycleListener(activityContext))
  }
}
