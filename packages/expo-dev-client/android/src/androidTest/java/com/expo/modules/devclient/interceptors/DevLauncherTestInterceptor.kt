package com.expo.modules.devclient.interceptors

internal class DevLauncherTestInterceptor : expo.modules.devlauncher.tests.DevLauncherTestInterceptor {
  override fun allowReinitialization() = true
}
