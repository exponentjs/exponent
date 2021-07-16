package org.unimodules.core.interfaces

import android.app.Application
import android.content.res.Configuration

interface ApplicationLifecycleListener {
  fun onCreate(application: Application) {}
  fun onConfigurationChanged(newConfig: Configuration) {}
}
