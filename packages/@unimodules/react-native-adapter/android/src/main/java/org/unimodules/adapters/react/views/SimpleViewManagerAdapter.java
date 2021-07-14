package org.unimodules.adapters.react.views;

import android.view.View;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.ReactStylesDiffMap;

import java.util.Map;

import javax.annotation.Nullable;
import androidx.annotation.NonNull;

import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.ViewManager;
import org.unimodules.core.interfaces.RegistryLifecycleListener;

public class SimpleViewManagerAdapter<M extends ViewManager<V>, V extends View> extends SimpleViewManager<V> implements RegistryLifecycleListener {
  private M mViewManager;

  public SimpleViewManagerAdapter(M viewManager) {
    mViewManager = viewManager;
  }

  @Override
  protected V createViewInstance(ThemedReactContext reactContext) {
    return mViewManager.createViewInstance(reactContext);
  }

  @Override
  public void onDropViewInstance(V view) {
    mViewManager.onDropViewInstance(view);
    super.onDropViewInstance(view);
  }

  @Nullable
  @Override
  public Map<String, Object> getConstants() {
    return ViewManagerAdapterUtils.getConstants(mViewManager);
  }

  @Override
  public String getName() {
    return ViewManagerAdapterUtils.getViewManagerAdapterName(mViewManager);
  }

  @ReactProp(name = "proxiedProperties")
  public void setProxiedProperties(V view, ReadableMap proxiedProperties) {
    ViewManagerAdapterUtils.setProxiedProperties(getName(), mViewManager, view, proxiedProperties);
  }

  @Nullable
  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    return ViewManagerAdapterUtils.getExportedCustomDirectEventTypeConstants(mViewManager);
  }

  @Override
  public Map<String, String> getNativeProps() {
    return ViewManagerAdapterUtils.getNativeProps(super.getNativeProps(), mViewManager);
  }

  @Override
  public void updateProperties(@NonNull V view, ReactStylesDiffMap props) {
    super.updateProperties(view, props);
    ViewManagerAdapterUtils.setAnimatedProperties(getName(), mViewManager, view, props);
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mViewManager.onCreate(moduleRegistry);
  }
}
