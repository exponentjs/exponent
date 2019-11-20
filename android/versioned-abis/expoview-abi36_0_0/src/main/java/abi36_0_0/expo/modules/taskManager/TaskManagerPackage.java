package abi36_0_0.expo.modules.taskManager;

import android.content.Context;

import java.util.Collections;
import java.util.List;

import abi36_0_0.org.unimodules.core.ExportedModule;
import abi36_0_0.org.unimodules.core.BasePackage;
import abi36_0_0.org.unimodules.core.interfaces.InternalModule;
import org.unimodules.core.interfaces.SingletonModule;

public class TaskManagerPackage extends BasePackage {
  @Override
  public List<ExportedModule> createExportedModules(Context context) {
    return Collections.singletonList((ExportedModule) new TaskManagerModule(context));
  }

  @Override
  public List<InternalModule> createInternalModules(Context context) {
    return Collections.singletonList((InternalModule) new TaskManagerInternalModule(context));
  }

  @Override
  public List<SingletonModule> createSingletonModules(Context context) {
    return Collections.singletonList((SingletonModule) new TaskService(context));
  }
}
