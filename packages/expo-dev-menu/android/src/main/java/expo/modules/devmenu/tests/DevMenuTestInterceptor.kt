package expo.modules.devmenu.tests

import expo.interfaces.devmenu.DevMenuSettingsInterface

interface DevMenuTestInterceptor {
  fun overrideSettings(): DevMenuSettingsInterface?
}
