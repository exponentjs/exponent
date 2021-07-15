package expo.modules.sms

import android.content.Context
import org.unimodules.core.BasePackage
import org.unimodules.core.ExportedModule

class SMSPackage : BasePackage() {
  override fun createExportedModules(reactContext: Context): List<ExportedModule> {
    return listOf(SMSModule(reactContext))
  }
}
