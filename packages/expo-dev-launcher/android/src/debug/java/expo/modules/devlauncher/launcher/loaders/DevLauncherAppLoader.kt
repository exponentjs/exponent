package expo.modules.devlauncher.launcher.loaders

import android.content.Context
import android.content.Intent
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactContext
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * An abstract class of app loader. An object of this class will launch provided `Intent` with all the needed setup.
 *
 * We want to be able to launch expo apps and vanilla RN apps. However, the way of loading app is pretty similar in those cases.
 * So we created a basic loader class.
 *
 * This class responsibilities:
 * - starts a new Activity
 * - wires up lifecycle methods needed to correctly configure an app
 *
 * Children responsibilities:
 * - provides a correct bundle URL
 * - hooks into lifecycle methods to add additional configuration
 *
 * Lifecycle methods:
 * - `onDelegateWillBeCreated` - is called before the `ReactActivityDelegate` constructor. It's called in the constructor of the Activity.
 * - `onCreate` - is called after `Activity.onCreate`, but before `ReactActivityDelegate.onCreate`.
 * - `onReactContext` - is called after the `ReactContext` was loaded.
 */
abstract class DevLauncherAppLoader(
  private val appHost: ReactNativeHost,
  private val context: Context,
  private val controller: DevLauncherControllerInterface
) {
  private var continuation: Continuation<Boolean>? = null
  private var reactContextWasInitialized = false

  fun createOnDelegateWillBeCreatedListener(): (ReactActivity) -> Unit {
    return { activity ->
      onDelegateWillBeCreated(activity)

      require(appHost.reactInstanceManager.currentReactContext == null) { "App react context shouldn't be created before." }
      appHost.reactInstanceManager.addReactInstanceEventListener(object : ReactInstanceManager.ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) {
          if (reactContextWasInitialized) {
            return
          }

          controller.onAppLoaded(context)
          onReactContext(context)
          appHost.reactInstanceManager.removeReactInstanceEventListener(this)
          reactContextWasInitialized = true
          continuation!!.resume(true)
        }
      })

      activity.lifecycle.addObserver(object : LifecycleObserver {
        @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
        fun onCreate() {
          onCreate(activity)
          activity.lifecycle.removeObserver(this)
        }
      })
    }
  }

  open suspend fun launch(intent: Intent): Boolean {
    return suspendCoroutine { callback ->
      if (injectBundleLoader()) {
        continuation = callback
        launchIntent(intent)
        return@suspendCoroutine
      }
      callback.resume(false)
    }
  }

  protected open fun onDelegateWillBeCreated(activity: ReactActivity) = Unit
  protected open fun onCreate(activity: ReactActivity) = Unit
  protected open fun onReactContext(context: ReactContext) = Unit

  open fun getAppName(): String? {
    return null
  }

  abstract fun injectBundleLoader(): Boolean

  private fun launchIntent(intent: Intent) {
    context.applicationContext.startActivity(intent)
  }
}
