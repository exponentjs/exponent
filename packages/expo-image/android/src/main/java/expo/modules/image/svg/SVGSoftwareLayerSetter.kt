package expo.modules.image.svg

import android.widget.ImageView
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.ImageViewTarget
import com.bumptech.glide.request.target.Target

/**
 * Listener which updates the [ImageView] to be software rendered, because [ ]/[android.graphics.Picture] can't render on a
 * hardware backed [Canvas][android.graphics.Canvas].
 *
 * Copied from https://github.com/bumptech/glide/blob/10acc31a16b4c1b5684f69e8de3117371dfa77a8/samples/svg/src/main/java/com/bumptech/glide/samples/svg/SvgSoftwareLayerSetter.java
 * and rewritten to Kotlin.
 */
class SVGSoftwareLayerSetter @JvmOverloads constructor(private val mDefaultLayerType: Int = ImageView.LAYER_TYPE_NONE) : RequestListener<Any> {
  override fun onLoadFailed(e: GlideException?, model: Any, target: Target<Any>, isFirstResource: Boolean): Boolean {
    getViewOfTarget(target)?.setLayerType(mDefaultLayerType, null)
    return false
  }

  override fun onResourceReady(resource: Any, model: Any, target: Target<Any>, dataSource: DataSource, isFirstResource: Boolean): Boolean {
    getViewOfTarget(target)?.apply {
      if (resource is SVGDrawable) {
        setLayerType(ImageView.LAYER_TYPE_SOFTWARE, null)
      }
    }
    return false
  }

  private fun getViewOfTarget(target: Target<Any>): ImageView? {
    if (target is ImageViewTarget<*>) {
      val imageViewTarget: ImageViewTarget<*> = target as ImageViewTarget<Any>
      return imageViewTarget.view
    }
    return null
  }
}
