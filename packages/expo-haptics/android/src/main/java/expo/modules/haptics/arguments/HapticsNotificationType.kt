package expo.modules.haptics.arguments

object HapticsNotificationType {
  private val types = mapOf(
    "success" to HapticsVibrationType(
      longArrayOf(0, 35, 65, 21),
      intArrayOf(0, 250, 0, 180),
      longArrayOf(0, 35, 65, 21)
    ),
    "warning" to HapticsVibrationType(
      longArrayOf(0, 30, 40, 30, 50, 60),
      intArrayOf(255, 255, 255, 255, 255, 255),
      longArrayOf(0, 30, 40, 30, 50, 60)
    ),
    "error" to HapticsVibrationType(
      longArrayOf(0, 27, 45, 50),
      intArrayOf(0, 120, 0, 250),
      longArrayOf(0, 27, 45, 50)
    )
  )

  @Throws(HapticsInvalidArgumentException::class)
  fun fromString(type: String): HapticsVibrationType =
    types.getOrElse(type) {
      throw HapticsInvalidArgumentException("'type' must be one of ['success', 'warning', 'error']. Obtained '$type'.")
    }
}
