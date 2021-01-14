package expo.modules.font.exceptions

import org.unimodules.core.errors.CodedRuntimeException

class FontFileInvalidException(path: String?) : CodedRuntimeException("File '$path' isn't a valid font file.") {
  override fun getCode(): String {
    return "ERR_FONT_FILE_INVALID"
  }
}
