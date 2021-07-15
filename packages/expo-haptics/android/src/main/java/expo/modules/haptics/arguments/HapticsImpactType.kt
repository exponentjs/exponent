package expo.modules.haptics.arguments

object HapticsImpactType {
  private val types = mapOf(
    "light" to HapticsVibrationType(
      longArrayOf(0, 50),
      intArrayOf(0, 110),
      longArrayOf(0, 20)
    ),
    "medium" to HapticsVibrationType(
      longArrayOf(0, 43),
      intArrayOf(0, 180),
      longArrayOf(0, 43)
    ),
    "heavy" to HapticsVibrationType(
      longArrayOf(0, 60),
      intArrayOf(0, 255),
      longArrayOf(0, 61)
    )
  )


  @Throws(HapticsInvalidArgumentException::class)
  fun fromString(style: String): HapticsVibrationType = types.getOrElse(style) {
    throw HapticsInvalidArgumentException("'style' must be one of ['light', 'medium', 'heavy']. Obtained $style'.")
  }
}
