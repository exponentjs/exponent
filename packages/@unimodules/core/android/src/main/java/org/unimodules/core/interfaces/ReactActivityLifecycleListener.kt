package org.unimodules.core.interfaces

import android.app.Activity
import android.os.Bundle

interface ReactActivityLifecycleListener {
  fun onCreate(activity: Activity, savedInstanceState: Bundle?) {}
  fun onResume(activity: Activity) {}
  fun onPause(activity: Activity) {}
  fun onDestroy(activity: Activity) {}
}
