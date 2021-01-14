package org.unimodules.adapters.react;

import android.content.Context;

import com.facebook.react.bridge.ReactContext;

import java.util.Arrays;
import java.util.List;

import org.unimodules.adapters.react.services.CookieManagerModule;
import org.unimodules.adapters.react.services.EventEmitterModule;
import org.unimodules.adapters.react.services.RuntimeEnvironmentModule;
import org.unimodules.adapters.react.services.UIManagerModuleWrapper;
import org.unimodules.core.BasePackage;
import org.unimodules.core.interfaces.InternalModule;
import org.unimodules.core.interfaces.Package;

/**
 * A {@link Package} creating modules provided with the @unimodules/react-native-adapter package.
 */
public class ReactAdapterPackage extends BasePackage {

  @Override
  public List<InternalModule> createInternalModules(Context context) {
    // We can force-cast here, because this package will only be used in React Native context.
    ReactContext reactContext = (ReactContext) context;
    return Arrays.asList(
        new CookieManagerModule(reactContext),
        new UIManagerModuleWrapper(reactContext),
        new EventEmitterModule(reactContext),
        new RuntimeEnvironmentModule()
    );
  }
}
