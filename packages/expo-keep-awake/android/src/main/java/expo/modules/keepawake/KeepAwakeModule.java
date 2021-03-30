// Copyright 2015-present 650 Industries. All rights reserved.

package expo.modules.keepawake;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.errors.CurrentActivityNotFoundException;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.services.KeepAwakeManager;

public class KeepAwakeModule extends ExportedModule {
  private static final String NAME = "ExpoKeepAwake";
  private final static String NO_ACTIVITY_ERROR_CODE = "NO_CURRENT_ACTIVITY";

  private KeepAwakeManager mKeepAwakeManager;

  public KeepAwakeModule(Context context) {
    super(context);
  }

  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mKeepAwakeManager = moduleRegistry.getModule(KeepAwakeManager.class);
  }

  @ExpoMethod
  public void isAvailableAsync(final Promise promise) {
    promise.resolve(true);
  }

  @ExpoMethod
  public void activate(String tag, final Promise promise) {
    try {
      mKeepAwakeManager.activate(tag, () -> promise.resolve(true));
    } catch (CurrentActivityNotFoundException ex) {
      promise.reject(NO_ACTIVITY_ERROR_CODE, "Unable to activate keep awake");
    }
  }

  @ExpoMethod
  public void deactivate(String tag, Promise promise) {
    try {
      mKeepAwakeManager.deactivate(tag, () -> promise.resolve(true));
    } catch (CurrentActivityNotFoundException ex) {
      promise.reject(NO_ACTIVITY_ERROR_CODE, "Unable to deactivate keep awake. However, it probably is deactivated already.");
    }

  }

  public boolean isActivated() {
    return mKeepAwakeManager.isActivated();
  }
}
