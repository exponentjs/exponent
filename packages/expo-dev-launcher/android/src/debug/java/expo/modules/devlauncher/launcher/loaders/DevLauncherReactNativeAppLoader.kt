package expo.modules.devlauncher.launcher.loaders

import android.content.Context
import android.net.Uri
import com.facebook.react.ReactNativeHost
import expo.modules.devlauncher.helpers.injectReactInterceptor
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface

class DevLauncherReactNativeAppLoader(
  private val url: Uri,
  private val appHost: ReactNativeHost,
  private val context: Context,
  controller: DevLauncherControllerInterface
) : DevLauncherAppLoader(appHost, context, controller) {
  override fun injectBundleLoader(): Boolean {
    return injectReactInterceptor(context, appHost, url)
  }
}
