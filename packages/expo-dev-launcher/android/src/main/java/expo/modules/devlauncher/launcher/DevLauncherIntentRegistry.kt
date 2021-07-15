package expo.modules.devlauncher.launcher

import android.content.Intent
import kotlin.properties.Delegates

typealias DevLauncherPendingIntentListener = (Intent) -> Unit

interface DevLauncherIntentRegistryInterface {
  var intent: Intent?

  fun subscribe(listener: DevLauncherPendingIntentListener)

  fun unsubscribe(listener: DevLauncherPendingIntentListener)

  fun consumePendingIntent(): Intent?
}

class DevLauncherIntentRegistry : DevLauncherIntentRegistryInterface {
  private val pendingIntentListeners = mutableListOf<DevLauncherPendingIntentListener>()
  override var intent by Delegates.observable<Intent?>(null) { _, _, newValue ->
    newValue?.let { intent ->
      pendingIntentListeners.forEach {
        it.invoke(intent)
      }
    }
  }

  override fun subscribe(listener: DevLauncherPendingIntentListener) {
    pendingIntentListeners.add(listener)
  }

  override fun unsubscribe(listener: DevLauncherPendingIntentListener) {
    pendingIntentListeners.remove(listener)
  }

  override fun consumePendingIntent(): Intent? {
    val pendingIntent = intent
    intent = null
    return pendingIntent
  }
}
