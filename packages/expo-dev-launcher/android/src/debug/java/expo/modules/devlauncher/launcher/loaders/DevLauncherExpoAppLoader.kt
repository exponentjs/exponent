package expo.modules.devlauncher.launcher.loaders

import android.content.Context
import android.graphics.Color
import android.util.Log
import android.view.View
import com.facebook.react.ReactActivity
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.appearance.AppearanceModule
import expo.modules.devlauncher.helpers.isValidColor
import expo.modules.devlauncher.helpers.setProtectedDeclaredField
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import expo.modules.devlauncher.launcher.configurators.DevLauncherExpoActivityConfigurator
import expo.modules.devlauncher.launcher.manifest.DevLauncherManifest
import expo.modules.devlauncher.launcher.manifest.DevLauncherUserInterface

abstract class DevLauncherExpoAppLoader(
  private val manifest: DevLauncherManifest,
  appHost: ReactNativeHost,
  context: Context,
  controller: DevLauncherControllerInterface,
  private val activityConfigurator: DevLauncherExpoActivityConfigurator =
    DevLauncherExpoActivityConfigurator(manifest, context)
) : DevLauncherAppLoader(appHost, context, controller) {
  override fun onCreate(activity: ReactActivity) = with(activityConfigurator) {
    applyOrientation(activity)
    applyStatusBarConfiguration(activity)
    applyTaskDescription(activity)
  }

  override fun onReactContext(context: ReactContext) {
    context.currentActivity?.run {
      val rootView = findViewById<View>(android.R.id.content).rootView
      applyBackgroundColor(rootView)
    }

    applyUserInterfaceStyle(context)
  }

  private fun applyUserInterfaceStyle(context: ReactContext) {
    val userInterfaceStyle = when (manifest.userInterfaceStyle) {
      DevLauncherUserInterface.DARK -> "dark"
      DevLauncherUserInterface.LIGHT -> "light"
      else -> return
    }

    context.getNativeModule(AppearanceModule::class.java)?.let { appearanceModule ->
      try {
        appearanceModule::class.java.setProtectedDeclaredField(
          obj = appearanceModule,
          filedName = "mOverrideColorScheme",
          newValue = object : AppearanceModule.OverrideColorScheme {
            override fun getScheme(): String {
              return userInterfaceStyle
            }
          },
          predicate = { currentValue -> currentValue == null }
        )

        appearanceModule::class.java.setProtectedDeclaredField(
          obj = appearanceModule,
          filedName = "mColorScheme",
          newValue = userInterfaceStyle
        )
      } catch (e: Exception) {
        Log.w("DevLauncher", e)
      }
    }
  }

  private fun applyBackgroundColor(view: View) {
    val backgroundColor = manifest.backgroundColor ?: return
    if (!isValidColor(backgroundColor)) {
      return
    }
    view.setBackgroundColor(Color.parseColor(backgroundColor))
  }

  override fun getAppName(): String? {
    return manifest.name
  }
}
