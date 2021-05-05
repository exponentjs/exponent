package expo.modules.splashscreen.singletons

import android.app.Activity
import android.util.Log
import android.view.ViewGroup
import expo.modules.splashscreen.NativeResourcesBasedSplashScreenViewProvider
import expo.modules.splashscreen.SplashScreenController
import expo.modules.splashscreen.SplashScreenImageResizeMode
import expo.modules.splashscreen.SplashScreenViewProvider
import org.unimodules.core.interfaces.SingletonModule
import java.util.*

object SplashScreen : SingletonModule {
  private const val TAG = "SplashScreen"

  override fun getName(): String {
    return "SplashScreen"
  }

  private val controllers = WeakHashMap<Activity, SplashScreenController>()
  private  var autoHideEnabled = true

  /**
   * Show SplashScreen by mounting it in ContentView.
   *
   * Use this call only if you're providing custom [SplashScreenViewProvider], otherwise use default [SplashScreen.show].
   *
   * @param activity Target Activity for SplashScreen to be mounted in.
   * @param splashScreenViewProvider Provider that created properly configured SplashScreenView
   * @param rootViewClass Class that is looked for in view hierarchy while autohiding is enabled.
   * @param statusBarTranslucent Flag determining StatusBar translucency in a way ReactNative see it.
   * @param successCallback Callback to be called once SplashScreen is mounted in view hierarchy.
   * @param failureCallback Callback to be called once SplashScreen cannot be mounted.
   * @throws [expo.modules.splashscreen.exceptions.NoContentViewException] when [SplashScreen.show] is called before [Activity.setContentView] (when no ContentView is present for given activity).
   */
  @JvmStatic
  @JvmOverloads
  fun show(
    activity: Activity,
    splashScreenViewProvider: SplashScreenViewProvider,
    rootViewClass: Class<out ViewGroup>,
    statusBarTranslucent: Boolean,
    successCallback: () -> Unit = {},
    failureCallback: (reason: String) -> Unit = { Log.w(TAG, it) }
  ) {
    // SplashScreen.show can only be called once per activity
    if (controllers.containsKey(activity)) {
      return failureCallback("'SplashScreen.show' has already been called for this activity.")
    }

    SplashScreenStatusBar.configureTranslucent(activity, statusBarTranslucent)

    val controller = SplashScreenController(activity, rootViewClass, splashScreenViewProvider)
    controllers[activity] = controller
    controller.showSplashScreen(autoHideEnabled, successCallback)
  }

  /**
   * Show SplashScreen by mounting it in ContentView.
   *
   * Default method for mounting SplashScreen in your app.
   *
   * @param activity Target Activity for SplashScreen to be mounted in.
   * @param resizeMode SplashScreen imageView resizeMode.
   * @param rootViewClass Class that is looked for in view hierarchy while autohiding is enabled.
   * @param statusBarTranslucent Flag determining StatusBar translucency in a way ReactNative see it.
   * @param splashScreenViewProvider
   * @param successCallback Callback to be called once SplashScreen is mounted in view hierarchy.
   * @param failureCallback Callback to be called once SplashScreen cannot be mounted.
   * @throws [expo.modules.splashscreen.exceptions.NoContentViewException] when [SplashScreen.show] is called before [Activity.setContentView] (when no ContentView is present for given activity).
   */
  @JvmStatic
  @JvmOverloads
  fun show(
    activity: Activity,
    resizeMode: SplashScreenImageResizeMode,
    rootViewClass: Class<out ViewGroup>,
    statusBarTranslucent: Boolean,
    splashScreenViewProvider: SplashScreenViewProvider = NativeResourcesBasedSplashScreenViewProvider(resizeMode),
    successCallback: () -> Unit = {},
    failureCallback: (reason: String) -> Unit = { Log.w(TAG, it) }
  ) {
    show(activity, splashScreenViewProvider, rootViewClass, statusBarTranslucent, successCallback, failureCallback)
  }

  /**
   * Configures whether SplashScreen will autoHide after showing.
   * @param successCallback Callback to be called once SplashScreen has applied the configuration.
   * @param failureCallback Callback to be called upon failure in applying the autohide configuration.
   */
  fun setSplashScreenAutoHideEnabled(
    splashScreenAutoHideEnabled: Boolean,
  ) {
    autoHideEnabled = splashScreenAutoHideEnabled
  }

  /**
   * Prevents SplashScreen from autoHiding once App View Hierarchy is mounted for given activity.
   * @param successCallback Callback to be called once SplashScreen could be successfully prevented from autohinding.
   * @param failureCallback Callback to be called upon failure in preventing SplashScreen from autohiding.
   */
  fun preventAutoHide(
          activity: Activity,
          successCallback: (hasEffect: Boolean) -> Unit,
          failureCallback: (reason: String) -> Unit
  ) {
    if (!controllers.containsKey(activity)) {
      return failureCallback("No native splash screen registered for provided activity. Please configure your application's main Activity to call 'SplashScreen.show' (https://github.com/expo/expo/tree/master/packages/expo-splash-screen#-configure-android).")
    }

    controllers[activity]?.preventAutoHide(successCallback, failureCallback)
  }

  @JvmStatic
  fun preventAutoHide(activity: Activity) {
    preventAutoHide(activity, {}, {})
  }

  /**
   * Hides SplashScreen for given activity.
   * @param successCallback Callback to be called once SplashScreen is removed from view hierarchy.
   * @param failureCallback Callback to be called upon failure in hiding SplashScreen.
   */
  fun hide(
    activity: Activity,
    successCallback: (hasEffect: Boolean) -> Unit,
    failureCallback: (reason: String) -> Unit
  ) {
    if (!controllers.containsKey(activity)) {
      return failureCallback("No native splash screen registered for provided activity. Please configure your application's main Activity to call 'SplashScreen.show' (https://github.com/expo/expo/tree/master/packages/expo-splash-screen#-configure-android).")
    }

    controllers[activity]?.hideSplashScreen(successCallback, failureCallback)
  }

  @JvmStatic
  fun hide(activity: Activity) {
    hide(activity, {}, {})
  }
}
