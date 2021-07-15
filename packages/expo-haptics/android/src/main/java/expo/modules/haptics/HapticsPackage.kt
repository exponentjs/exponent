package expo.modules.haptics

import android.content.Context
import org.unimodules.core.BasePackage
import org.unimodules.core.ExportedModule

class HapticsPackage : BasePackage() {
  override fun createExportedModules(context: Context) =
    listOf(HapticsModule(context) as ExportedModule)
}

