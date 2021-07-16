package expo.modules.splashscreen

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.os.Handler
import com.facebook.react.ReactRootView
import expo.modules.splashscreen.singletons.SplashScreen
import org.unimodules.core.interfaces.ReactActivityLifecycleListener

class SplashScreenReactActivityLifecycleListener(activityContext: Context) : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    // To support backward compatible or SplashScreenImageResizeMode customization
    // that calling `SplashScreen.show()` in MainActivity,
    // we postpone the in-module call to the end of main loop.
    // If MainActivity.onCreate has `SplashScreen.show()`, it will override the call here.
    Handler(activity.mainLooper).post {
      SplashScreen.show(activity, SplashScreenImageResizeMode.CONTAIN, ReactRootView::class.java, false)
    }
  }
}
