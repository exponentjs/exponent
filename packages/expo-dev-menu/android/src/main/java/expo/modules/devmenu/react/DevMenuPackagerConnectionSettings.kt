package expo.modules.devmenu.react

import android.content.Context
import com.facebook.react.packagerconnection.PackagerConnectionSettings

class DevMenuPackagerConnectionSettings(private val serverIp: String, applicationContext: Context)
  : PackagerConnectionSettings(applicationContext) {
  override fun getDebugServerHost(): String = serverIp

  override fun setDebugServerHost(host: String) = Unit
}
