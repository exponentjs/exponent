package com.expo.modules.devclient.interceptors

import expo.interfaces.devmenu.DevMenuSettingsInterface

internal class DevMenuTestInterceptor(
  private val settingsInterface: DevMenuSettingsInterface
) : expo.modules.devmenu.tests.DevMenuTestInterceptor {
  override fun overrideSettings(): DevMenuSettingsInterface = settingsInterface
}
