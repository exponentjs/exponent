package expo.modules.analytics.segment

import android.content.Context
import org.unimodules.core.BasePackage
import org.unimodules.core.ExportedModule

class SegmentPackage : BasePackage() {
  override fun createExportedModules(context: Context): List<ExportedModule> {
    return listOf(SegmentModule(context))
  }
}
