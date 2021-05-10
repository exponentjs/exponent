package abi41_0_0.expo.modules.intentlauncher;

import android.content.Context;

import java.util.Collections;
import java.util.List;

import abi41_0_0.org.unimodules.core.BasePackage;
import abi41_0_0.org.unimodules.core.ExportedModule;

public class IntentLauncherPackage extends BasePackage {
  @Override
  public List<ExportedModule> createExportedModules(Context context) {
    return Collections.singletonList((ExportedModule) new IntentLauncherModule(context));
  }
}
