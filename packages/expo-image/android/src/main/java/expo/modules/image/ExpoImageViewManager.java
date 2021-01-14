package expo.modules.image;

import com.bumptech.glide.Glide;
import com.bumptech.glide.RequestManager;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.Spacing;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewProps;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.annotations.ReactPropGroup;
import com.facebook.yoga.YogaConstants;

import java.util.Map;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import expo.modules.image.enums.ImageResizeMode;
import expo.modules.image.events.ImageErrorEvent;
import expo.modules.image.events.ImageLoadEvent;
import expo.modules.image.events.ImageLoadStartEvent;
import expo.modules.image.events.ImageProgressEvent;
import expo.modules.image.okhttp.OkHttpClientProgressInterceptor;
import expo.modules.image.svg.SVGSoftwareLayerSetter;

public class ExpoImageViewManager extends SimpleViewManager<ExpoImageView> {
  private static final String REACT_CLASS = "ExpoImage";
  private static final int[] BORDER_LOCATIONS = {
    Spacing.ALL,
    Spacing.LEFT,
    Spacing.RIGHT,
    Spacing.TOP,
    Spacing.BOTTOM,
    Spacing.START,
    Spacing.END,
  };

  private RequestManager mRequestManager;
  private OkHttpClientProgressInterceptor mProgressInterceptor;

  public ExpoImageViewManager(ReactApplicationContext applicationContext) {
    mRequestManager = Glide.with(applicationContext).addDefaultRequestListener(new SVGSoftwareLayerSetter());
    mProgressInterceptor = OkHttpClientProgressInterceptor.getInstance();
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  @Nullable
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    return MapBuilder.<String, Object>builder()
      .put(ImageLoadStartEvent.EVENT_NAME, MapBuilder.of("registrationName", ImageLoadStartEvent.EVENT_NAME))
      .put(ImageProgressEvent.EVENT_NAME, MapBuilder.of("registrationName", ImageProgressEvent.EVENT_NAME))
      .put(ImageErrorEvent.EVENT_NAME, MapBuilder.of("registrationName", ImageErrorEvent.EVENT_NAME))
      .put(ImageLoadEvent.EVENT_NAME, MapBuilder.of("registrationName", ImageLoadEvent.EVENT_NAME))
      .build();
  }

  // Props setters

  @ReactProp(name = "source")
  public void setSource(ExpoImageView view, @Nullable ReadableMap sourceMap) {
    view.setSource(sourceMap);
  }

  @ReactProp(name = "resizeMode")
  public void setResizeMode(ExpoImageView view, String stringValue) {
    ImageResizeMode resizeMode = ImageResizeMode.fromStringValue(stringValue);
    if (resizeMode == ImageResizeMode.UNKNOWN) {
      throw new JSApplicationIllegalArgumentException("Invalid resizeMode: " + stringValue);
    }
    view.setResizeMode(resizeMode);
  }

  @ReactPropGroup(
    names = {
      ViewProps.BORDER_RADIUS,
      ViewProps.BORDER_TOP_LEFT_RADIUS,
      ViewProps.BORDER_TOP_RIGHT_RADIUS,
      ViewProps.BORDER_BOTTOM_RIGHT_RADIUS,
      ViewProps.BORDER_BOTTOM_LEFT_RADIUS,
      ViewProps.BORDER_TOP_START_RADIUS,
      ViewProps.BORDER_TOP_END_RADIUS,
      ViewProps.BORDER_BOTTOM_START_RADIUS,
      ViewProps.BORDER_BOTTOM_END_RADIUS,
    },
    defaultFloat = YogaConstants.UNDEFINED)
  public void setBorderRadius(ExpoImageView view, int index, float borderRadius) {
    if (!YogaConstants.isUndefined(borderRadius) && borderRadius < 0) {
      borderRadius = YogaConstants.UNDEFINED;
    }
    view.setBorderRadius(index, borderRadius);
  }

  @ReactPropGroup(
    names = {
      ViewProps.BORDER_WIDTH,
      ViewProps.BORDER_LEFT_WIDTH,
      ViewProps.BORDER_RIGHT_WIDTH,
      ViewProps.BORDER_TOP_WIDTH,
      ViewProps.BORDER_BOTTOM_WIDTH,
      ViewProps.BORDER_START_WIDTH,
      ViewProps.BORDER_END_WIDTH,
    },
    defaultFloat = YogaConstants.UNDEFINED)
  public void setBorderWidth(ExpoImageView view, int index, float width) {
    if (!YogaConstants.isUndefined(width) && width < 0) {
      width = YogaConstants.UNDEFINED;
    }

    if (!YogaConstants.isUndefined(width)) {
      width = PixelUtil.toPixelFromDIP(width);
    }

    view.setBorderWidth(BORDER_LOCATIONS[index], width);
  }

  @ReactPropGroup(
    names = {
      ViewProps.BORDER_COLOR,
      ViewProps.BORDER_LEFT_COLOR,
      ViewProps.BORDER_RIGHT_COLOR,
      ViewProps.BORDER_TOP_COLOR,
      ViewProps.BORDER_BOTTOM_COLOR,
      ViewProps.BORDER_START_COLOR,
      ViewProps.BORDER_END_COLOR
    },
    customType = "Color")
  public void setBorderColor(ExpoImageView view, int index, Integer color) {
    float rgbComponent =
      color == null ? YogaConstants.UNDEFINED : (float) ((int) color & 0x00FFFFFF);
    float alphaComponent = color == null ? YogaConstants.UNDEFINED : (float) ((int) color >>> 24);
    view.setBorderColor(BORDER_LOCATIONS[index], rgbComponent, alphaComponent);
  }

  @ReactProp(name = "borderStyle")
  public void setBorderStyle(ExpoImageView view, @Nullable String borderStyle) {
    view.setBorderStyle(borderStyle);
  }

  @ReactProp(name = "tintColor", customType = "Color")
  public void setTintColor(ExpoImageView view, @Nullable Integer color) {
    view.setTintColor(color);
  }

  // View lifecycle

  @NonNull
  @Override
  public ExpoImageView createViewInstance(@NonNull ThemedReactContext context) {
    return new ExpoImageView(context, mRequestManager, mProgressInterceptor);
  }

  @Override
  protected void onAfterUpdateTransaction(@NonNull ExpoImageView view) {
    view.onAfterUpdateTransaction();
    super.onAfterUpdateTransaction(view);
  }

  @Override
  public void onDropViewInstance(@NonNull ExpoImageView view) {
    view.onDrop();
    super.onDropViewInstance(view);
  }
}
