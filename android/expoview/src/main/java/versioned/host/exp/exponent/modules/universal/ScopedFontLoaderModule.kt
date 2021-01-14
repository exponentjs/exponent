package versioned.host.exp.exponent.modules.universal

import android.content.Context
import android.net.Uri
import expo.modules.font.FontLoaderModule
import org.unimodules.core.Promise
import org.unimodules.core.errors.CodedRuntimeException
import org.unimodules.core.errors.InvalidArgumentException
import org.unimodules.interfaces.constants.ConstantsInterface
import org.unimodules.interfaces.filesystem.FilePermissionModuleInterface
import org.unimodules.interfaces.filesystem.Permission

class ScopedFontLoaderModule(context: Context?) : FontLoaderModule(context) {
  override fun loadAsync(fontFamilyName: String?, localUri: String?, promise: Promise) {
    var resolvedFontFamilyName = fontFamilyName
    if (isScoped) {
      // Validate font family name before we prefix it
      if (resolvedFontFamilyName == null) {
        promise.reject(InvalidArgumentException("Font family name cannot be empty (null received)"))
        return
      }

      // Scope font family name
      resolvedFontFamilyName = "$SCOPED_FONT_PREFIX$resolvedFontFamilyName"

      // Ensure filesystem access permissions
      val filePermissionModule = mModuleRegistry?.getModule(FilePermissionModuleInterface::class.java)
      if (filePermissionModule != null) {
        val localFontPath = Uri.parse(localUri).path
        if (localFontPath == null) {
          promise.reject(InvalidArgumentException("Could not parse provided local font URI as a URI with a path component."))
          return
        }
        if (!filePermissionModule.getPathPermissions(context, localFontPath).contains(Permission.READ)) {
          promise.reject(LocationAccessUnauthorizedError(localFontPath))
          return
        }
      }
    }
    super.loadAsync(resolvedFontFamilyName, localUri, promise)
  }

  private val isScoped: Boolean
    get() {
      val appOwnership = mModuleRegistry?.getModule(ConstantsInterface::class.java)?.appOwnership
      // If there's no constants module, or app ownership isn't "expo", we're not in Expo Client.
      return appOwnership != null && "expo" == appOwnership
    }

  class LocationAccessUnauthorizedError(uri: String) : CodedRuntimeException("You aren't authorized to load font file from: $uri") {
    override fun getCode(): String {
      return "ERR_LOCATION_ACCESS_UNAUTHORIZED"
    }
  }

  companion object {
    private const val SCOPED_FONT_PREFIX = "ExpoFont-"
  }
}
