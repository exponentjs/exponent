package expo.modules.devlauncher.launcher

import android.content.Intent
import android.net.Uri
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactContext
import expo.modules.devlauncher.DevLauncherController
import expo.modules.devlauncher.launcher.manifest.DevLauncherManifest

interface DevLauncherControllerInterface {
  suspend fun loadApp(url: Uri, mainActivity: ReactActivity? = null)
  fun onAppLoaded(context: ReactContext)
  fun onAppLoadedWithError()
  fun getRecentlyOpenedApps(): Map<String, String?>
  fun navigateToLauncher()
  fun maybeSynchronizeDevMenuDelegate()
  fun maybeInitDevMenuDelegate(context: ReactContext)
  fun getCurrentReactActivityDelegate(activity: ReactActivity, delegateSupplierDevLauncher: DevLauncherReactActivityDelegateSupplier): ReactActivityDelegate
  fun handleIntent(intent: Intent?, activityToBeInvalidated: ReactActivity?): Boolean

  val manifest: DevLauncherManifest?
  val devClientHost: DevLauncherClientHost
  val mode: DevLauncherController.Mode
  val appHost: ReactNativeHost
  val latestLoadedApp: Uri?
}
