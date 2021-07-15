package expo.modules.devlauncher.launcher.loaders

import android.content.Context
import android.net.Uri
import com.facebook.react.ReactNativeHost
import expo.modules.devlauncher.helpers.injectReactInterceptor
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import expo.modules.devlauncher.launcher.manifest.DevLauncherManifest

/**
 * Implementation of DevLauncherExpoAppLoader which is used for loading locally served projects in
 * development.
 */
class DevLauncherLocalAppLoader(
  private val manifest: DevLauncherManifest,
  private val appHost: ReactNativeHost,
  private val context: Context,
  controller: DevLauncherControllerInterface
) : DevLauncherExpoAppLoader(manifest, appHost, context, controller) {
  override fun injectBundleLoader(): Boolean {
    return injectReactInterceptor(context, appHost, Uri.parse(manifest.bundleUrl))
  }
}
