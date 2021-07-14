package org.unimodules.adapters.react.views;

import android.util.Log;
import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ReactStylesDiffMap;

import java.util.HashMap;
import java.util.Map;

import org.unimodules.adapters.react.ArgumentsHelper;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.ViewManager;

public class ViewManagerAdapterUtils {
  /* package */ static String getViewManagerAdapterName(ViewManager viewManager) {
    return "ViewManagerAdapter_" + viewManager.getName();
  }

  /* package */ static Map<String, Object> getConstants(ViewManager viewManager) {
    Map<String, Object> constants = new HashMap<>();
    constants.put("eventNames", viewManager.getExportedEventNames());
    return constants;
  }

  /* package */ static Map<String, Object> getExportedCustomDirectEventTypeConstants(ViewManager viewManager) {
    MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
    // Somehow Java compiler thinks getExportedEventNames() returns list of Objects.
    // ¯\_(ツ)_/¯
    for (Object eventName : viewManager.getExportedEventNames()) {
      if (eventName instanceof String) {
        builder.put((String) eventName, MapBuilder.of("registrationName", eventName));
      }
    }
    return builder.build();
  }

  /* package */ static Map<String, String> getNativeProps(Map<String, String> props, ViewManager viewManager) {
    // Somehow Java compiler thinks getPropSetterInfos() returns list of Objects.
    // ¯\_(ツ)_/¯
    for (Object obj: viewManager.getPropSetterInfos().entrySet()) {
      Map.Entry<String, ViewManager.PropSetterInfo> entry = (Map.Entry<String, ViewManager.PropSetterInfo>) obj;
      ViewManager.PropSetterInfo propSetterInfo = entry.getValue();
      if (propSetterInfo.isAnimated()) {
        props.put(entry.getKey(), propSetterInfo.getExpectedValueClass().getName());
      }
    }
    return props;
  }

  /* package */ static <V extends View> void setProxiedProperties(String viewManagerAdapterName, ViewManager<V> viewManager, V view, ReadableMap proxiedProperties) {
    ReadableMapKeySetIterator keyIterator = proxiedProperties.keySetIterator();
    while (keyIterator.hasNextKey()) {
      String key = keyIterator.nextKey();
      try {
        ViewManager.PropSetterInfo propSetterInfo = viewManager.getPropSetterInfos().get(key);
        if (propSetterInfo == null) {
          throw new IllegalArgumentException("No setter found for prop " + key + " in " + viewManagerAdapterName);
        }
        Dynamic dynamicPropertyValue = proxiedProperties.getDynamic(key);
        Object castPropertyValue = ArgumentsHelper.getNativeArgumentForExpectedClass(dynamicPropertyValue, propSetterInfo.getExpectedValueClass());
        viewManager.updateProp(view, key, castPropertyValue);
      } catch (Exception e) {
        Log.e(viewManagerAdapterName, "Error when setting prop " + key + ". " + e.getMessage());
      }
    }
  }

  /* package */ static <V extends View> void setAnimatedProperties(String viewManagerAdapterName, ViewManager<V> viewManager, V view, ReactStylesDiffMap props) {
    Map<String, Object> propsMap = null;
    Map<String, Object> animatedProps = null;

    // Somehow Java compiler thinks getPropSetterInfos() returns list of Objects.
    // ¯\_(ツ)_/¯
    for (Object obj: viewManager.getPropSetterInfos().entrySet()) {
      Map.Entry<String, ViewManager.PropSetterInfo> entry = (Map.Entry<String, ViewManager.PropSetterInfo>) obj;
      ViewManager.PropSetterInfo propSetterInfo = entry.getValue();
      if (propSetterInfo.isAnimated()) {
        propsMap = propsMap == null ? props.toMap() : propsMap;
        if (propsMap.containsKey(entry.getKey())) {
          animatedProps = animatedProps == null ? new HashMap<String, Object>() : animatedProps;
          animatedProps.put(entry.getKey(), propsMap.get(entry.getKey()));
        }
      }
    }

    if (animatedProps != null) {
      setProxiedProperties(viewManagerAdapterName, viewManager, view, Arguments.makeNativeMap(animatedProps));
    }
  }
}
