package expo.modules.devmenu

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import expo.interfaces.devmenu.DevMenuSettingsInterface

open class DevMenuDefaultSettings : DevMenuSettingsInterface {
  private fun methodUnavailable() {
    throw NoSuchMethodError("You cannot change the default settings. Export `DevMenuSettings` module if you want to change the settings.")
  }

  override var motionGestureEnabled: Boolean
    get() = true
    set(_) = methodUnavailable()

  override var touchGestureEnabled: Boolean
    get() = true
    set(_) = methodUnavailable()

  override var keyCommandsEnabled: Boolean
    get() = true
    set(_) = methodUnavailable()

  override var showsAtLaunch: Boolean
    get() = false
    set(_) = methodUnavailable()

  override var isOnboardingFinished: Boolean
    get() = true
    set(_) = methodUnavailable()

  override fun serialize(): WritableMap =
    Arguments
      .createMap()
      .apply {
        putBoolean("motionGestureEnabled", motionGestureEnabled)
        putBoolean("touchGestureEnabled", touchGestureEnabled)
        putBoolean("keyCommandsEnabled", keyCommandsEnabled)
        putBoolean("showsAtLaunch", showsAtLaunch)
        putBoolean("isOnboardingFinished", isOnboardingFinished)
      }

}
