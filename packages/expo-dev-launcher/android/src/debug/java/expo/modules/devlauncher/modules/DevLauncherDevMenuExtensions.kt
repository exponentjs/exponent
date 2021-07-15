package expo.modules.devlauncher.modules

import android.view.KeyEvent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import expo.interfaces.devmenu.DevMenuExtensionInterface
import expo.interfaces.devmenu.DevMenuExtensionSettingsInterface
import expo.interfaces.devmenu.items.DevMenuItemImportance
import expo.interfaces.devmenu.items.DevMenuItemsContainer
import expo.interfaces.devmenu.items.DevMenuItemsContainerInterface
import expo.interfaces.devmenu.items.KeyCommand
import expo.modules.devlauncher.DevLauncherController
import expo.modules.devlauncher.koin.devLauncherKoin
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface

class DevLauncherDevMenuExtensions(
  reactContext: ReactApplicationContext?
) : ReactContextBaseJavaModule(reactContext),
  DevMenuExtensionInterface {

  override fun getName(): String {
    return "ExpoDevLauncherDevMenuExtensions"
  }

  override fun devMenuItems(settings: DevMenuExtensionSettingsInterface): DevMenuItemsContainerInterface =
    DevMenuItemsContainer.export {
      val controller = devLauncherKoin().getOrNull<DevLauncherControllerInterface>()

      if (controller?.mode == DevLauncherController.Mode.LAUNCHER) {
        return@export
      }

      action("dev-launcher-back-to-launcher", {
        controller?.navigateToLauncher()
      }) {
        isEnabled = { true }
        label = { "Back to Launcher" }
        glyphName = { "exit-to-app" }
        importance = DevMenuItemImportance.MEDIUM.value
        keyCommand = KeyCommand(KeyEvent.KEYCODE_L, false)
      }
    }
}
