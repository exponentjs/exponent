package expo.modules.haptics.arguments

import org.unimodules.core.errors.CodedException

class HapticsInvalidArgumentException internal constructor(message: String?) : CodedException(message) {
  override fun getCode(): String {
    return "E_HAPTICS_INVALID_ARGUMENT"
  }
}
