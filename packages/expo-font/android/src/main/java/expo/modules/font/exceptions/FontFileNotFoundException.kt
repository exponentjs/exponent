package expo.modules.font.exceptions

import org.unimodules.core.errors.CodedRuntimeException

class FontFileNotFoundException(fontFamilyName: String?, path: String?) : CodedRuntimeException("File '$path' for font '$fontFamilyName' doesn't exist.") {
  override fun getCode(): String {
    return "ERR_FONT_FILE_NOT_FOUND"
  }
}
