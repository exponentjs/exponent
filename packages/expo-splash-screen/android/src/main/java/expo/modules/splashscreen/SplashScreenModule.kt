package expo.modules.splashscreen

import android.content.Context

import android.content.Context
import android.content.pm.PackageManager
import com.facebook.react.ReactRootView
import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.Promise
import org.unimodules.core.errors.CurrentActivityNotFoundException
import org.unimodules.core.interfaces.ActivityProvider
import org.unimodules.core.interfaces.ExpoMethod
import java.lang.Exception

// Below import must be kept unversioned even in versioned code to provide a redirection from
// versioned code realm to unversioned code realm.
// Without this import any `SplashScreen.anyMethodName(...)` invocation on JS side ends up
// in versioned SplashScreen kotlin object that stores no information about the ExperienceActivity.
import expo.modules.splashscreen.singletons.SplashScreen

class SplashScreenModule(context: Context) : ExportedModule(context) {
  companion object {
    private const val NAME = "ExpoSplashScreen"
    private const val ERROR_TAG = "ERR_SPLASH_SCREEN"
  }

  private lateinit var activityProvider: ActivityProvider

  override fun getName(): String {
    return NAME
  }

  override fun onCreate(moduleRegistry: ModuleRegistry) {
    activityProvider = moduleRegistry.getModule(ActivityProvider::class.java)
    val activity = activityProvider.currentActivity
    if (activity == null) {
      return
    }
    try {
      val ai = context.packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA);

      val isEnabled = ai.metaData.getBoolean("expo.modules.splashscreen.ENABLED", false);
      if (isEnabled) {
        var resizeMode = SplashScreenImageResizeMode.fromString(ai.metaData.getString("expo.modules.splashscreen.RESIZE_MODE"));
        if (resizeMode == null) {
          resizeMode = SplashScreenImageResizeMode.CONTAIN
        }

        val statusBarTranslucent = ai.metaData.getBoolean("expo.modules.splashscreen.STATUS_BAR_TRANSLUCENT", false);

        SplashScreen.show(activity, resizeMode, ReactRootView::class.java, statusBarTranslucent);
      }
    } catch (error: Exception) {}
    
  }

  @ExpoMethod
  fun preventAutoHideAsync(promise: Promise) {
    val activity = activityProvider.currentActivity
    if (activity == null) {
      promise.reject(CurrentActivityNotFoundException())
      return
    }
    SplashScreen.preventAutoHide(
      activity,
      { hasEffect -> promise.resolve(hasEffect) },
      { m -> promise.reject(ERROR_TAG, m) }
    )
  }

  @ExpoMethod
  fun hideAsync(promise: Promise) {
    val activity = activityProvider.currentActivity
    if (activity == null) {
      promise.reject(CurrentActivityNotFoundException())
      return
    }
    SplashScreen.hide(
      activity,
      { hasEffect -> promise.resolve(hasEffect) },
      { m -> promise.reject(ERROR_TAG, m) }
    )
  }
}
