package expo.modules.image.svg;

import android.content.Context;
import android.graphics.drawable.Drawable;

import com.bumptech.glide.Glide;
import com.bumptech.glide.Registry;
import com.bumptech.glide.annotation.GlideModule;
import com.bumptech.glide.module.LibraryGlideModule;
import com.caverock.androidsvg.SVG;

import java.io.InputStream;

import androidx.annotation.NonNull;

/**
 * {@link LibraryGlideModule} registering support for SVG to Glide.
 * <p>
 * Copied from https://github.com/bumptech/glide/blob/master/samples/svg/src/main/java/com/bumptech/glide/samples/svg/SvgModule.java
 */
@GlideModule
public class SVGModule extends LibraryGlideModule {
  @Override
  public void registerComponents(@NonNull Context context, @NonNull Glide glide, @NonNull Registry registry) {
    super.registerComponents(context, glide, registry);
    registry
      .append(InputStream.class, SVG.class, new SVGDecoder())
      .register(SVG.class, Drawable.class, new SVGDrawableTranscoder());
  }
}
