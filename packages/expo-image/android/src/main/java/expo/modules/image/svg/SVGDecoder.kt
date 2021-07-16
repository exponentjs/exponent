package expo.modules.image.svg

import com.bumptech.glide.load.Options
import com.bumptech.glide.load.ResourceDecoder
import com.bumptech.glide.load.engine.Resource
import com.bumptech.glide.load.resource.SimpleResource
import com.bumptech.glide.request.target.Target.SIZE_ORIGINAL
import com.caverock.androidsvg.SVG
import com.caverock.androidsvg.SVGParseException
import java.io.IOException
import java.io.InputStream

/**
 * Decodes an SVG internal representation from an [InputStream].
 *
 * Copied from https://github.com/bumptech/glide/blob/10acc31a16b4c1b5684f69e8de3117371dfa77a8/samples/svg/src/main/java/com/bumptech/glide/samples/svg/SvgDecoder.java
 * and rewritten to Kotlin.
 */
class SVGDecoder : ResourceDecoder<InputStream, SVG> {
  // TODO: Can we tell?
  override fun handles(source: InputStream, options: Options) = true

  @Throws(IOException::class)
  override fun decode(source: InputStream, width: Int, height: Int, options: Options): Resource<SVG>? {
    return try {
      val svg: SVG = SVG.getFromInputStream(source)
      if (width != SIZE_ORIGINAL) {
        svg.documentWidth = width.toFloat();
      }
      if (height != SIZE_ORIGINAL) {
        svg.documentHeight = height.toFloat();
      }
      SimpleResource(svg)
    } catch (ex: SVGParseException) {
      throw IOException("Cannot load SVG from stream", ex)
    }
  }
}
