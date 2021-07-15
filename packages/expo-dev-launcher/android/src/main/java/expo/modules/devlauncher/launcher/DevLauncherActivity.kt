package expo.modules.devlauncher.launcher

import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.ReactContext
import expo.interfaces.devmenu.DevMenuManagerInterface
import expo.interfaces.devmenu.DevMenuManagerProviderInterface
import expo.modules.devlauncher.DevLauncherController
import expo.modules.devlauncher.koin.DevLauncherKoinComponent
import expo.modules.devlauncher.splashscreen.DevLauncherSplashScreen
import expo.modules.devlauncher.splashscreen.DevLauncherSplashScreenProvider
import org.koin.core.component.inject

const val SEARCH_FOR_ROOT_VIEW_INTERVAL = 20L

class DevLauncherActivity : ReactActivity(), ReactInstanceManager.ReactInstanceEventListener, DevLauncherKoinComponent {
  private val controller: DevLauncherControllerInterface by inject()
  private var devMenuManager: DevMenuManagerInterface? = null
  private var splashScreen: DevLauncherSplashScreen? = null
  private var rootView: ViewGroup? = null
  private lateinit var contentView: ViewGroup
  private val handler = Handler()

  override fun getMainComponentName() = "main"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return object : ReactActivityDelegate(this, mainComponentName) {

      override fun getReactNativeHost() = controller.devClientHost

      override fun getLaunchOptions() = Bundle().apply {
        putBoolean("isSimulator", isSimulator)
      }
    }
  }

  override fun onStart() {
    overridePendingTransition(0, 0)
    super.onStart()
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    contentView = findViewById(android.R.id.content) ?: return
    splashScreen = DevLauncherSplashScreenProvider()
      .attachSplashScreenViewAsync(this)
    searchForRootView()
  }

  override fun onPostCreate(savedInstanceState: Bundle?) {
    super.onPostCreate(savedInstanceState)
    controller.maybeSynchronizeDevMenuDelegate()
    reactInstanceManager.currentReactContext?.let {
      onReactContextInitialized(it)
      return
    }

    reactInstanceManager.addReactInstanceEventListener(this)
  }

  override fun onPause() {
    overridePendingTransition(0, 0)
    super.onPause()
  }

  override fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
    devMenuManager?.onTouchEvent(ev)
    return super.dispatchTouchEvent(ev)
  }

  override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
    return devMenuManager?.onKeyEvent(keyCode, event) == true || super.onKeyUp(keyCode, event)
  }

  override fun onReactContextInitialized(context: ReactContext) {
    reactInstanceManager.removeReactInstanceEventListener(this)
    setUpDevMenuDelegateIfPresent(context)
  }

  private fun setUpDevMenuDelegateIfPresent(context: ReactContext) {
    controller.maybeInitDevMenuDelegate(context)

    val devMenuManagerProvider = context
      .catalystInstance
      .nativeModules
      .find { nativeModule ->
        nativeModule is DevMenuManagerProviderInterface
      } as? DevMenuManagerProviderInterface

    this.devMenuManager = devMenuManagerProvider?.getDevMenuManager()
  }

  private val isSimulator
    get() = Build.FINGERPRINT.contains("vbox") || Build.FINGERPRINT.contains("generic")

  private fun searchForRootView() {
    if (rootView != null) {
      return
    }
    // RootView is successfully found in first check (nearly impossible for first call)
    findRootView(contentView)?.let { return@searchForRootView handleRootView(it) }
    handler.postDelayed({ searchForRootView() }, SEARCH_FOR_ROOT_VIEW_INTERVAL)
  }

  private fun findRootView(view: View): ViewGroup? {
    if (view is ReactRootView) {
      return view
    }
    if (view != splashScreen && view is ViewGroup) {
      for (idx in 0 until view.childCount) {
        findRootView(view.getChildAt(idx))?.let { return@findRootView it }
      }
    }
    return null
  }

  private fun handleRootView(view: ViewGroup) {
    rootView = view
    if ((rootView?.childCount ?: 0) > 0) {
      hideSplashScreen()
    }

    view.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
      override fun onChildViewRemoved(parent: View, child: View) = Unit
      override fun onChildViewAdded(parent: View, child: View) {
        // react only to first child
        if (rootView?.childCount == 1) {
          hideSplashScreen()
        }
      }
    })
  }

  private fun hideSplashScreen() {
    splashScreen?.let {
      runOnUiThread {
        contentView.removeView(it)
        splashScreen = null
      }
    }
  }
}
