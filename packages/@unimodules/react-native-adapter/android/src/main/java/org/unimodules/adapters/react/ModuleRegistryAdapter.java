package org.unimodules.adapters.react;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import org.unimodules.adapters.react.views.SimpleViewManagerAdapter;
import org.unimodules.adapters.react.views.ViewGroupManagerAdapter;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.interfaces.InternalModule;

import java.util.ArrayList;
import java.util.List;

/**
 * An adapter over {@link ModuleRegistry}, compatible with React (implementing {@link ReactPackage}).
 * Provides React Native with native modules and view managers,
 * which in turn are created by packages provided by {@link ReactModuleRegistryProvider}.
 */
public class ModuleRegistryAdapter implements ReactPackage {
  protected ReactModuleRegistryProvider mModuleRegistryProvider;
  protected ReactAdapterPackage mReactAdapterPackage = new ReactAdapterPackage();

  public ModuleRegistryAdapter() {
    mModuleRegistryProvider = new ReactModuleRegistryProvider(ExpoModulesPackageList.getPackageList(), null);
  }

  public ModuleRegistryAdapter(ReactModuleRegistryProvider moduleRegistryProvider) {
    mModuleRegistryProvider = moduleRegistryProvider;
  }

  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    ModuleRegistry moduleRegistry = mModuleRegistryProvider.get(reactContext);

    for (InternalModule internalModule : mReactAdapterPackage.createInternalModules(reactContext)) {
      moduleRegistry.registerInternalModule(internalModule);
    }

    return getNativeModulesFromModuleRegistry(reactContext, moduleRegistry);
  }

  protected List<NativeModule> getNativeModulesFromModuleRegistry(ReactApplicationContext reactContext, ModuleRegistry moduleRegistry) {
    List<NativeModule> nativeModulesList = new ArrayList<>(2);

    nativeModulesList.add(new NativeModulesProxy(reactContext, moduleRegistry));

    // Add listener that will notify org.unimodules.core.ModuleRegistry when all modules are ready
    nativeModulesList.add(new ModuleRegistryReadyNotifier(moduleRegistry));

    ReactPackagesProvider reactPackagesProvider = moduleRegistry.getModule(ReactPackagesProvider.class);
    for (ReactPackage reactPackage : reactPackagesProvider.getReactPackages()) {
      nativeModulesList.addAll(reactPackage.createNativeModules(reactContext));
    }

    return nativeModulesList;
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    List<ViewManager> viewManagerList = new ArrayList<>(mModuleRegistryProvider.getReactViewManagers(reactContext));

    for (org.unimodules.core.ViewManager viewManager : mModuleRegistryProvider.getViewManagers(reactContext)) {
      switch (viewManager.getViewManagerType()) {
        case GROUP:
          viewManagerList.add(new ViewGroupManagerAdapter(viewManager));
          break;
        case SIMPLE:
          viewManagerList.add(new SimpleViewManagerAdapter(viewManager));
          break;
      }
    }
    return viewManagerList;
  }
}
