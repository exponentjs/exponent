package expo.modules.image.svg;

import android.widget.ImageView;

import com.bumptech.glide.load.DataSource;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.target.ImageViewTarget;
import com.bumptech.glide.request.target.Target;

import androidx.annotation.Nullable;

/**
 * Listener which updates the {@link ImageView} to be software rendered, because {@link
 * com.caverock.androidsvg.SVG}/{@link android.graphics.Picture} can't render on a
 * hardware backed {@link android.graphics.Canvas Canvas}.
 * <p>
 * Copied from https://github.com/bumptech/glide/blob/master/samples/svg/src/main/java/com/bumptech/glide/samples/svg/SvgSoftwareLayerSetter.java
 */
public class SVGSoftwareLayerSetter implements RequestListener<Object> {
  private int mDefaultLayerType;

  public SVGSoftwareLayerSetter() {
    // TODO: Verify if that's the default on all platform version.
    this(ImageView.LAYER_TYPE_NONE);
  }

  public SVGSoftwareLayerSetter(int defaultLayerType) {
    mDefaultLayerType = defaultLayerType;
  }

  @Override
  public boolean onLoadFailed(GlideException e, Object model, Target<Object> target, boolean isFirstResource) {
    ImageView imageView = getViewOfTarget(target);
    if (imageView != null) {
      imageView.setLayerType(mDefaultLayerType, null);
    }
    return false;
  }

  @Override
  public boolean onResourceReady(Object resource, Object model, Target<Object> target, DataSource dataSource, boolean isFirstResource) {
    ImageView imageView = getViewOfTarget(target);
    if (imageView != null && resource instanceof SVGDrawable) {
      imageView.setLayerType(ImageView.LAYER_TYPE_SOFTWARE, null);
    }
    return false;
  }

  @Nullable
  private ImageView getViewOfTarget(Target<Object> target) {
    if (target instanceof ImageViewTarget<?>) {
      ImageViewTarget<?> imageViewTarget = (ImageViewTarget<Object>) target;
      return imageViewTarget.getView();
    }
    return null;
  }
}
