package dev.expo.payments;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import expo.modules.random.RandomPackage;

import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;

import java.util.List;

import dev.expo.payments.generated.BasePackageList;
import expo.modules.devmenu.managers.DevMenuManager;
import expo.modules.devmenu.react.ReactNativeHostWithDevMenu;

public class MainApplication extends Application implements ReactApplication {
  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(
    new BasePackageList().getPackageList()
  );

  private final ReactNativeHostWithDevMenu mReactNativeHost = new ReactNativeHostWithDevMenu(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      List<ReactPackage> packages = new PackageList(this).getPackages();
      packages.add(new RandomPackage());
      packages.add(new ModuleRegistryAdapter(mModuleRegistryProvider));
      return packages;
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);

    DevMenuManager.INSTANCE.initDevMenuHost(this);
    DevMenuManager.INSTANCE.setDelegate(mReactNativeHost);
  }
}
