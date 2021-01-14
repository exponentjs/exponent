package expo.modules.image.svg;

import android.graphics.Picture;
import android.graphics.drawable.PictureDrawable;

/**
 * A no-change {@link PictureDrawable} that lets us differentiate between
 * SVG drawables and other drawables (used in {@link SVGSoftwareLayerSetter}.
 */
public class SVGDrawable extends PictureDrawable {
  /**
   * Construct a new drawable referencing the specified picture. The picture
   * may be null.
   *
   * @param picture The picture to associate with the drawable. May be null.
   */
  public SVGDrawable(Picture picture) {
    super(picture);
  }
}
