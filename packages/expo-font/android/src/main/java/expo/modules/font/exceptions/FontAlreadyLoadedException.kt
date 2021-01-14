package expo.modules.font.exceptions

import org.unimodules.core.errors.CodedRuntimeException

class FontAlreadyLoadedException(fontFamilyName: String?) : CodedRuntimeException("Font with family name '$fontFamilyName' has already been loaded.") {
  override fun getCode(): String {
    return "ERR_FONT_ALREADY_LOADED"
  }
}
