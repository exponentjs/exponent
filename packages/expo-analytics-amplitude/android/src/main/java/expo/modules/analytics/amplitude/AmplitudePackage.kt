package expo.modules.analytics.amplitude

import android.content.Context
import org.unimodules.core.BasePackage
import org.unimodules.core.ExportedModule

class AmplitudePackage : BasePackage() {
  override fun createExportedModules(context: Context): List<ExportedModule> {
    return listOf(AmplitudeModule(context))
  }
}
