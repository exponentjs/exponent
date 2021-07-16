package expo.modules.image

import com.bumptech.glide.Glide
import com.bumptech.glide.RequestManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.Spacing
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewProps
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.facebook.yoga.YogaConstants
import expo.modules.image.enums.ImageResizeMode
import expo.modules.image.events.ImageErrorEvent
import expo.modules.image.events.ImageLoadEvent
import expo.modules.image.events.ImageLoadStartEvent
import expo.modules.image.events.ImageProgressEvent
import expo.modules.image.okhttp.OkHttpClientProgressInterceptor
import expo.modules.image.svg.SVGSoftwareLayerSetter

private val BORDER_LOCATIONS = intArrayOf(
  Spacing.ALL,
  Spacing.LEFT,
  Spacing.RIGHT,
  Spacing.TOP,
  Spacing.BOTTOM,
  Spacing.START,
  Spacing.END
)

class ExpoImageViewManager(applicationContext: ReactApplicationContext) : SimpleViewManager<ExpoImageView>() {
  private val mRequestManager: RequestManager = Glide.with(applicationContext).addDefaultRequestListener(SVGSoftwareLayerSetter())
  private val mProgressInterceptor: OkHttpClientProgressInterceptor = OkHttpClientProgressInterceptor
  override fun getName() = "ExpoImage"

  override fun getExportedCustomDirectEventTypeConstants() =
    mutableMapOf(
      ImageLoadStartEvent.EVENT_NAME to mutableMapOf("registrationName" to ImageLoadStartEvent.EVENT_NAME),
      ImageProgressEvent.EVENT_NAME to mutableMapOf("registrationName" to ImageProgressEvent.EVENT_NAME),
      ImageErrorEvent.EVENT_NAME to mutableMapOf("registrationName" to ImageErrorEvent.EVENT_NAME),
      ImageLoadEvent.EVENT_NAME to mutableMapOf("registrationName" to ImageLoadEvent.EVENT_NAME)
    )

  // Props setters
  @ReactProp(name = "source")
  fun setSource(view: ExpoImageView, sourceMap: ReadableMap?) {
    view.sourceMap = sourceMap
  }

  @ReactProp(name = "resizeMode")
  fun setResizeMode(view: ExpoImageView, stringValue: String) {
    val resizeMode = ImageResizeMode.fromStringValue(stringValue)
    view.setResizeMode(resizeMode)
  }

  @ReactPropGroup(names = [
    ViewProps.BORDER_RADIUS,
    ViewProps.BORDER_TOP_LEFT_RADIUS,
    ViewProps.BORDER_TOP_RIGHT_RADIUS,
    ViewProps.BORDER_BOTTOM_RIGHT_RADIUS,
    ViewProps.BORDER_BOTTOM_LEFT_RADIUS,
    ViewProps.BORDER_TOP_START_RADIUS,
    ViewProps.BORDER_TOP_END_RADIUS,
    ViewProps.BORDER_BOTTOM_START_RADIUS,
    ViewProps.BORDER_BOTTOM_END_RADIUS
  ], defaultFloat = YogaConstants.UNDEFINED)
  fun setBorderRadius(view: ExpoImageView, index: Int, borderRadius: Float) {
    val radius = makeYogaUndefinedIfNegative(borderRadius)
    view.setBorderRadius(index, radius)
  }

  @ReactPropGroup(names = [
    ViewProps.BORDER_WIDTH,
    ViewProps.BORDER_LEFT_WIDTH,
    ViewProps.BORDER_RIGHT_WIDTH,
    ViewProps.BORDER_TOP_WIDTH,
    ViewProps.BORDER_BOTTOM_WIDTH,
    ViewProps.BORDER_START_WIDTH,
    ViewProps.BORDER_END_WIDTH
  ], defaultFloat = YogaConstants.UNDEFINED)
  fun setBorderWidth(view: ExpoImageView, index: Int, width: Float) {
    val pixelWidth = makeYogaUndefinedIfNegative(width).ifYogaDefinedUse(PixelUtil::toPixelFromDIP)
    view.setBorderWidth(BORDER_LOCATIONS[index], pixelWidth)
  }

  @ReactPropGroup(names = [
    ViewProps.BORDER_COLOR,
    ViewProps.BORDER_LEFT_COLOR,
    ViewProps.BORDER_RIGHT_COLOR,
    ViewProps.BORDER_TOP_COLOR,
    ViewProps.BORDER_BOTTOM_COLOR,
    ViewProps.BORDER_START_COLOR,
    ViewProps.BORDER_END_COLOR
  ], customType = "Color")
  fun setBorderColor(view: ExpoImageView, index: Int, color: Int?) {
    val rgbComponent = if (color == null) YogaConstants.UNDEFINED else (color and 0x00FFFFFF).toFloat()
    val alphaComponent = if (color == null) YogaConstants.UNDEFINED else (color ushr 24).toFloat()
    view.setBorderColor(BORDER_LOCATIONS[index], rgbComponent, alphaComponent)
  }

  @ReactProp(name = "borderStyle")
  fun setBorderStyle(view: ExpoImageView, borderStyle: String?) {
    view.setBorderStyle(borderStyle)
  }

  @ReactProp(name = "tintColor", customType = "Color")
  fun setTintColor(view: ExpoImageView, color: Int?) {
    view.setTintColor(color)
  }

  // View lifecycle
  public override fun createViewInstance(context: ThemedReactContext): ExpoImageView {
    return ExpoImageView(context, mRequestManager, mProgressInterceptor)
  }

  override fun onAfterUpdateTransaction(view: ExpoImageView) {
    view.onAfterUpdateTransaction()
    super.onAfterUpdateTransaction(view)
  }

  override fun onDropViewInstance(view: ExpoImageView) {
    view.onDrop()
    super.onDropViewInstance(view)
  }
}
