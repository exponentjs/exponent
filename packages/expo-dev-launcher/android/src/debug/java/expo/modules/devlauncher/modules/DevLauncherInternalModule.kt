package expo.modules.devlauncher.modules

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import expo.modules.devlauncher.DevLauncherController.Companion.wasInitialized
import expo.modules.devlauncher.helpers.getAppUrlFromDevLauncherUrl
import expo.modules.devlauncher.helpers.isDevLauncherUrl
import expo.modules.devlauncher.koin.DevLauncherKoinComponent
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import expo.modules.devlauncher.launcher.DevLauncherIntentRegistryInterface
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.koin.core.component.inject

private const val ON_NEW_DEEP_LINK_EVENT = "expo.modules.devlauncher.onnewdeeplink"
private const val CLIENT_PACKAGE_NAME = "host.exp.exponent"
private val CLIENT_HOME_QR_SCANNER_DEEP_LINK = Uri.parse("expo-home://qr-scanner")

class DevLauncherInternalModule(reactContext: ReactApplicationContext?)
  : ReactContextBaseJavaModule(reactContext), DevLauncherKoinComponent {
  private val controller: DevLauncherControllerInterface by inject()
  private val intentRegistry: DevLauncherIntentRegistryInterface by inject()

  override fun initialize() {
    super.initialize()
    if (wasInitialized()) {
      intentRegistry.subscribe(this::onNewPendingIntent)
    }
  }

  override fun invalidate() {
    super.invalidate()
    if (wasInitialized()) {
      intentRegistry.unsubscribe(this::onNewPendingIntent)
    }
  }

  override fun getName() = "EXDevLauncherInternal"

  @ReactMethod
  fun loadApp(url: String, promise: Promise) {
    GlobalScope.launch {
      try {
        val parsedUrl = Uri.parse(url.trim())
        val appUrl = if (isDevLauncherUrl(parsedUrl)) {
          requireNotNull(getAppUrlFromDevLauncherUrl(parsedUrl)) { "The provided url doesn't contain the app url." }
        } else {
          parsedUrl
        }
        controller.loadApp(appUrl)
      } catch (e: Exception) {
        promise.reject("ERR_DEV_LAUNCHER_CANNOT_LOAD_APP", e.message, e)
        return@launch
      }
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun getRecentlyOpenedApps(promise: Promise) {
    promise.resolve(Arguments
      .createMap()
      .apply {
        controller.getRecentlyOpenedApps().forEach { (key, value) ->
          putString(key, value)
        }
      })
  }

  @ReactMethod
  fun openCamera(promise: Promise) {
    val packageManager = reactApplicationContext.packageManager

    packageManager.getLaunchIntentForPackage(CLIENT_PACKAGE_NAME)
      ?.let {
        tryToDeepLinkIntoQRScannerDirectly(it)
        promise.resolve(null)
        return
      }

    // try to open the Play Store app...
    if (openLink(Uri.parse("market://details?id=$CLIENT_PACKAGE_NAME"))) {
      return
    }

    // ...app isn't installed so fallback to the Play Store website
    if (openLink(Uri.parse("https://play.google.com/store/apps/details?id=$CLIENT_PACKAGE_NAME"))) {
      return
    }

    promise.reject("ERR_DEVELOPMENT_CLIENT_CANNOT_OPEN_CAMERA", "Couldn't find the Expo Go app.")
  }

  @ReactMethod
  fun getPendingDeepLink(promise: Promise) {
    promise.resolve(intentRegistry.intent?.data?.toString())
  }

  private fun onNewPendingIntent(intent: Intent) {
    intent.data?.toString()?.let {
      reactApplicationContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(ON_NEW_DEEP_LINK_EVENT, it)
    }
  }

  private fun tryToDeepLinkIntoQRScannerDirectly(fallback: Intent) {
    if (openLink(CLIENT_HOME_QR_SCANNER_DEEP_LINK)) {
      return
    }

    reactApplicationContext.startActivity(fallback)
  }

  private fun openLink(uri: Uri): Boolean {
    return try {
      reactApplicationContext.startActivity(
        Intent(Intent.ACTION_VIEW, uri).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      )
      true
    } catch (_: ActivityNotFoundException) {
      false
    }
  }
}
