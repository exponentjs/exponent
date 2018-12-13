package versioned.host.exp.exponent.modules.api.components.gesturehandler.react;

import com.facebook.react.bridge.WritableMap;
import com.swmansion.gesturehandler.GestureHandler;

public interface RNGestureHandlerEventDataExtractor<T extends GestureHandler> {
  void extractEventData(T handler, WritableMap eventData);
}
