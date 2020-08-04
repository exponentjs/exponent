package abi37_0_0.host.exp.exponent.modules.api.components.gesturehandler.react;

import abi37_0_0.com.facebook.react.ReactPackage;
import abi37_0_0.com.facebook.react.bridge.NativeModule;
import abi37_0_0.com.facebook.react.bridge.ReactApplicationContext;
import abi37_0_0.com.facebook.react.common.MapBuilder;
import abi37_0_0.com.facebook.react.uimanager.ThemedReactContext;
import abi37_0_0.com.facebook.react.uimanager.ViewGroupManager;
import abi37_0_0.com.facebook.react.uimanager.ViewManager;
import abi37_0_0.com.facebook.react.views.view.ReactViewManager;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import androidx.annotation.Nullable;

public class RNGestureHandlerPackage implements ReactPackage {

  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    return Arrays.<NativeModule>asList(new RNGestureHandlerModule(reactContext));
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Arrays.<ViewManager>asList(
            new RNGestureHandlerRootViewManager(),
            new RNGestureHandlerButtonViewManager());
  }
}
