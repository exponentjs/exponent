package expo.modules.image.svg

import android.content.Context
import android.graphics.drawable.Drawable
import com.bumptech.glide.Glide
import com.bumptech.glide.Registry
import com.bumptech.glide.annotation.GlideModule
import com.bumptech.glide.module.LibraryGlideModule
import com.caverock.androidsvg.SVG
import java.io.InputStream

/**
 * [LibraryGlideModule] registering support for SVG to Glide.
 *
 * Copied from https://github.com/bumptech/glide/blob/10acc31a16b4c1b5684f69e8de3117371dfa77a8/samples/svg/src/main/java/com/bumptech/glide/samples/svg/SvgModule.java
 * and rewritten to Kotlin.
 */
@GlideModule
class SVGModule : LibraryGlideModule() {
  override fun registerComponents(context: Context, glide: Glide, registry: Registry) {
    super.registerComponents(context, glide, registry)
    registry
      .append(InputStream::class.java, SVG::class.java, SVGDecoder())
      .register(SVG::class.java, Drawable::class.java, SVGDrawableTranscoder())
  }
}
