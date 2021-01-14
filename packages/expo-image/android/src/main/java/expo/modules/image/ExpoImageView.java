package expo.modules.image;

import android.annotation.SuppressLint;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.PorterDuff;
import android.graphics.drawable.Drawable;

import com.bumptech.glide.RequestManager;
import com.bumptech.glide.load.model.GlideUrl;
import com.bumptech.glide.request.RequestOptions;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.i18nmanager.I18nUtil;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.facebook.yoga.YogaConstants;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatImageView;
import expo.modules.image.drawing.BorderDrawable;
import expo.modules.image.drawing.OutlineProvider;
import expo.modules.image.enums.ImageResizeMode;
import expo.modules.image.events.ImageLoadEventsManager;
import expo.modules.image.okhttp.OkHttpClientProgressInterceptor;

@SuppressLint("ViewConstructor")
public class ExpoImageView extends AppCompatImageView {
  private static final String SOURCE_URI_KEY = "uri";
  private static final String SOURCE_WIDTH_KEY = "width";
  private static final String SOURCE_HEIGHT_KEY = "height";
  private static final String SOURCE_SCALE_KEY = "scale";

  private OkHttpClientProgressInterceptor mProgressInterceptor;
  private RequestManager mRequestManager;
  private RCTEventEmitter mEventEmitter;
  private OutlineProvider mOutlineProvider;
  private BorderDrawable mBorderDrawable;

  private ReadableMap mSourceMap;
  private GlideUrl mLoadedSource;

  public ExpoImageView(ReactContext context, RequestManager requestManager, OkHttpClientProgressInterceptor progressInterceptor) {
    super(context);

    mEventEmitter = context.getJSModule(RCTEventEmitter.class);
    mRequestManager = requestManager;
    mProgressInterceptor = progressInterceptor;
    mOutlineProvider = new OutlineProvider(context);

    setOutlineProvider(mOutlineProvider);
    setClipToOutline(true);
    setScaleType(ImageResizeMode.COVER.getScaleType());
  }

  protected void setSource(@Nullable ReadableMap sourceMap) {
    mSourceMap = sourceMap;
  }

  protected void setResizeMode(ImageResizeMode resizeMode) {
    setScaleType(resizeMode.getScaleType());
    // TODO: repeat mode handling
  }

  protected void setBorderRadius(int position, float borderRadius) {
    boolean isInvalidated = mOutlineProvider.setBorderRadius(borderRadius, position);
    if (isInvalidated) {
      invalidateOutline();
      if (!mOutlineProvider.hasEqualCorners()) {
        invalidate();
      }
    }

    // Setting the border-radius doesn't necessarily mean that a border
    // should to be drawn. Only update the border-drawable when needed.
    if (mBorderDrawable != null) {
      borderRadius = !YogaConstants.isUndefined(borderRadius) ? PixelUtil.toPixelFromDIP(borderRadius) : borderRadius;
      if (position == 0) {
        mBorderDrawable.setRadius(borderRadius);
      } else {
        mBorderDrawable.setRadius(borderRadius, position - 1);
      }
    }
  }

  protected void setBorderWidth(int position, float width) {
    getOrCreateBorderDrawable().setBorderWidth(position, width);
  }

  protected void setBorderColor(int position, float rgb, float alpha) {
    getOrCreateBorderDrawable().setBorderColor(position, rgb, alpha);
  }

  protected void setBorderStyle(@Nullable String style) {
    getOrCreateBorderDrawable().setBorderStyle(style);
  }

  protected void setTintColor(@Nullable Integer color) {
    if (color == null) {
      clearColorFilter();
    } else {
      setColorFilter(color, PorterDuff.Mode.SRC_IN);
    }
  }

  protected void onAfterUpdateTransaction() {
    GlideUrl sourceToLoad = createUrlFromSourceMap(mSourceMap);

    if (sourceToLoad == null) {
      mRequestManager.clear(this);
      setImageDrawable(null);
      mLoadedSource = null;
    } else if (!sourceToLoad.equals(mLoadedSource)) {
      mLoadedSource = sourceToLoad;
      RequestOptions options = createOptionsFromSourceMap(mSourceMap);
      ImageLoadEventsManager eventsManager = new ImageLoadEventsManager(getId(), mEventEmitter);
      mProgressInterceptor.registerProgressListener(sourceToLoad.toStringUrl(), eventsManager);
      eventsManager.onLoadStarted();
      mRequestManager
        .load(sourceToLoad)
        .apply(options)
        .addListener(eventsManager)
        .into(this);
      mRequestManager
        .as(BitmapFactory.Options.class)
        // Remove any default listeners from this request
        // (an example would be an SVGSoftwareLayerSetter
        // added in ExpoImageViewManager).
        // This request won't load the image, only the size.
        .listener(null)
        .load(sourceToLoad)
        .into(eventsManager);
    }
  }

  protected void onDrop() {
    mRequestManager.clear(this);
  }

  @Nullable
  protected GlideUrl createUrlFromSourceMap(@Nullable ReadableMap sourceMap) {
    if (sourceMap == null || sourceMap.getString(SOURCE_URI_KEY) == null) {
      return null;
    }

    return new GlideUrl(sourceMap.getString(SOURCE_URI_KEY));
  }

  protected RequestOptions createOptionsFromSourceMap(@Nullable ReadableMap sourceMap) {
    RequestOptions options = new RequestOptions();
    if (sourceMap != null) {

      // Override the size for local assets. This ensures that
      // resizeMode "center" displays the image in the correct size.
      if (sourceMap.hasKey(SOURCE_WIDTH_KEY) && sourceMap.hasKey(SOURCE_HEIGHT_KEY) && sourceMap.hasKey(SOURCE_SCALE_KEY)) {
        double scale = sourceMap.getDouble(SOURCE_SCALE_KEY);
        int width = sourceMap.getInt(SOURCE_WIDTH_KEY);
        int height = sourceMap.getInt(SOURCE_HEIGHT_KEY);
        options.override((int) (width * scale), (int) (height * scale));
      }
    }
    options.fitCenter();
    return options;
  }

  private BorderDrawable getOrCreateBorderDrawable() {
    if (mBorderDrawable == null) {
      mBorderDrawable = new BorderDrawable(getContext());
      mBorderDrawable.setCallback(this);
      float[] borderRadii = mOutlineProvider.getBorderRadii();
      for (int i = 0; i < borderRadii.length; i++) {
        float borderRadius = borderRadii[i];
        borderRadius = !YogaConstants.isUndefined(borderRadius) ? PixelUtil.toPixelFromDIP(borderRadius) : borderRadius;
        if (i == 0) {
          mBorderDrawable.setRadius(borderRadius);
        } else {
          mBorderDrawable.setRadius(borderRadius, i - 1);
        }
      }
    }
    return mBorderDrawable;
  }

  // Drawing overrides

  @Override
  public void invalidateDrawable(@NonNull Drawable drawable) {
    super.invalidateDrawable(drawable);
    if (drawable == mBorderDrawable) {
      invalidate();
    }
  }

  @Override
  public void draw(Canvas canvas) {

    // When the border-radii are not all the same, a convex-path
    // is used for the Outline. Unfortunately clipping is not supported
    // for convex-paths and we fallback to Canvas clipping.
    mOutlineProvider.clipCanvasIfNeeded(canvas, this);
    super.draw(canvas);
  }

  @Override
  public void onDraw(Canvas canvas) {
    super.onDraw(canvas);

    // Draw borders on top of the background and image
    if (mBorderDrawable != null) {
      int layoutDirection = I18nUtil.getInstance().isRTL(getContext())
        ? LAYOUT_DIRECTION_RTL
        : LAYOUT_DIRECTION_LTR;
      mBorderDrawable.setResolvedLayoutDirection(layoutDirection);
      mBorderDrawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
      mBorderDrawable.draw(canvas);
    }
  }
}
