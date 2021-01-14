package expo.modules.font

import android.content.Context
import org.unimodules.core.BasePackage
import org.unimodules.core.ExportedModule

class FontLoaderPackage : BasePackage() {
  override fun createExportedModules(context: Context): List<ExportedModule> {
    return listOf<ExportedModule>(FontLoaderModule(context))
  }
}
