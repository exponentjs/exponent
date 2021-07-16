package org.unimodules.adapters.react

import android.app.Application
import android.content.res.Configuration

class ApplicationLifecycleDispatcher private constructor() {
  companion object {

    @JvmStatic
    fun onApplicationCreate(application: Application) {
      ExpoModulesPackageList.getPackageList()
        .flatMap { it.createApplicationLifecycleListeners(application) }
        .forEach { it.onCreate(application) }
    }

    @JvmStatic
    fun onConfigurationChanged(application: Application, newConfig: Configuration) {
      ExpoModulesPackageList.getPackageList()
        .flatMap { it.createApplicationLifecycleListeners(application) }
        .forEach { it.onConfigurationChanged(newConfig) }
    }

  }
}
