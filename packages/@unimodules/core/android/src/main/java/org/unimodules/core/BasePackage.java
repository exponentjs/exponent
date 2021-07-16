package org.unimodules.core;

import android.content.Context;

import org.unimodules.core.interfaces.ApplicationLifecycleListener;
import org.unimodules.core.interfaces.InternalModule;
import org.unimodules.core.interfaces.Package;
import org.unimodules.core.interfaces.ReactActivityLifecycleListener;
import org.unimodules.core.interfaces.ReactNativeHostHandler;
import org.unimodules.core.interfaces.SingletonModule;

import java.util.Collections;
import java.util.List;

// This class should not be used. Implement org.unimodules.core.interfaces.Package instead of extending this class
// Remove once no one extends it.
public class BasePackage implements Package {
  @Override
  public List<InternalModule> createInternalModules(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<ExportedModule> createExportedModules(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<ViewManager> createViewManagers(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<SingletonModule> createSingletonModules(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<ApplicationLifecycleListener> createApplicationLifecycleListeners(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<? extends ReactNativeHostHandler> createReactNativeHostHandlers(Context context) {
    return Collections.emptyList();
  }

  @Override
  public List<ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
    return Collections.emptyList();
  }
}
