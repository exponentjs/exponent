package expo.modules.image.svg;

import android.graphics.Picture;
import android.graphics.drawable.Drawable;

import com.bumptech.glide.load.Options;
import com.bumptech.glide.load.engine.Resource;
import com.bumptech.glide.load.resource.SimpleResource;
import com.bumptech.glide.load.resource.transcode.ResourceTranscoder;
import com.caverock.androidsvg.SVG;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

/**
 * Convert the {@link SVG}'s internal representation to an Android-compatible one ({@link Picture}).
 * <p>
 * Copied from https://github.com/bumptech/glide/blob/master/samples/svg/src/main/java/com/bumptech/glide/samples/svg/SvgDrawableTranscoder.java
 */
public class SVGDrawableTranscoder implements ResourceTranscoder<SVG, Drawable> {
  @Nullable
  @Override
  public Resource<Drawable> transcode(@NonNull Resource<SVG> toTranscode, @NonNull Options options) {
    SVG svg = toTranscode.get();
    Picture picture = svg.renderToPicture();
    Drawable drawable = new SVGDrawable(picture);
    return new SimpleResource<>(drawable);
  }
}
