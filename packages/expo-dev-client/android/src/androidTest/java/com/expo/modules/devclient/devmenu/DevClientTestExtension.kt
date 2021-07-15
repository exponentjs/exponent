package com.expo.modules.devclient.devmenu

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import expo.interfaces.devmenu.DevMenuExtensionInterface
import expo.interfaces.devmenu.DevMenuExtensionSettingsInterface
import expo.interfaces.devmenu.items.DevMenuItemsContainer

internal class DevClientTestExtension(reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext), DevMenuExtensionInterface {
  override fun getName(): String = "DevClientTestExtension"

  override fun devMenuItems(settings: DevMenuExtensionSettingsInterface) = DevMenuItemsContainer.export {
    action("test_action", action = {}) {
      label = { "TEST_ACTION" }
    }
  }
}
