package expo.modules.haptics

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import expo.modules.haptics.arguments.HapticsImpactType
import expo.modules.haptics.arguments.HapticsInvalidArgumentException
import expo.modules.haptics.arguments.HapticsNotificationType
import expo.modules.haptics.arguments.HapticsSelectionType
import expo.modules.haptics.arguments.HapticsVibrationType
import org.unimodules.core.ExportedModule
import org.unimodules.core.Promise
import org.unimodules.core.interfaces.ExpoMethod

class HapticsModule internal constructor(context: Context) : ExportedModule(context) {
  private val mVibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
  override fun getName() = "ExpoHaptics"

  @ExpoMethod
  fun notificationAsync(type: String, promise: Promise) {
    try {
      vibrate(HapticsNotificationType.fromString(type))
      promise.resolve(null)
    } catch (e: HapticsInvalidArgumentException) {
      promise.reject(e)
    }
  }

  @ExpoMethod
  fun selectionAsync(promise: Promise) {
    vibrate(HapticsSelectionType)
    promise.resolve(null)
  }

  @ExpoMethod
  fun impactAsync(style: String, promise: Promise) {
    try {
      vibrate(HapticsImpactType.fromString(style))
      promise.resolve(null)
    } catch (e: HapticsInvalidArgumentException) {
      promise.reject(e)
    }
  }

  private fun vibrate(type: HapticsVibrationType) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      mVibrator.vibrate(VibrationEffect.createWaveform(type.timings, type.amplitudes, -1))
    } else {
      mVibrator.vibrate(type.oldSDKPattern, -1)
    }
  }
}
