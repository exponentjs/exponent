package expo.modules.image.svg

import android.graphics.Picture
import android.graphics.drawable.PictureDrawable
/**
 * A no-change [PictureDrawable] that lets us differentiate between
 * SVG drawables and other drawables (used in [SVGSoftwareLayerSetter].
 *
 * Construct a new drawable referencing the specified picture.
 */
class SVGDrawable(picture: Picture?) : PictureDrawable(picture)
