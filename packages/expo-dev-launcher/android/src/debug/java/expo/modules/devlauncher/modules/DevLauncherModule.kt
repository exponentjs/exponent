package expo.modules.devlauncher.modules

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import expo.modules.devlauncher.DevLauncherController
import expo.modules.devlauncher.koin.DevLauncherKoinComponent
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import org.koin.core.component.inject

class DevLauncherModule(reactContext: ReactApplicationContext?) : ReactContextBaseJavaModule(reactContext), DevLauncherKoinComponent {
  private val controller: DevLauncherControllerInterface by inject()

  override fun getName() = "EXDevLauncher"

  override fun hasConstants() = true

  override fun getConstants(): Map<String, Any?> {
    val manifestString = try {
      controller.manifest?.rawData
    } catch (_: IllegalStateException) {
      null
    }

    return mapOf<String, Any?>(
      "manifestString" to manifestString
    )
  }
}
