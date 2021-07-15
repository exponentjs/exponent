package expo.modules.devmenu.tests

import expo.interfaces.devmenu.DevMenuSettingsInterface

class DevMenuDisabledTestInterceptor: DevMenuTestInterceptor {
  override fun overrideSettings(): DevMenuSettingsInterface? = null
}
