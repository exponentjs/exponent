package abi39_0_0.expo.modules.updates;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import java.util.HashMap;
import java.util.Map;

import abi39_0_0.org.unimodules.core.ExportedModule;
import abi39_0_0.org.unimodules.core.ModuleRegistry;
import abi39_0_0.org.unimodules.core.Promise;
import abi39_0_0.org.unimodules.core.interfaces.ExpoMethod;

import androidx.annotation.Nullable;
import expo.modules.updates.db.DatabaseHolder;
import expo.modules.updates.db.entity.AssetEntity;
import expo.modules.updates.db.entity.UpdateEntity;
import expo.modules.updates.launcher.Launcher;
import expo.modules.updates.loader.FileDownloader;
import expo.modules.updates.manifest.Manifest;
import expo.modules.updates.loader.RemoteLoader;

public class UpdatesModule extends ExportedModule {
  private static final String NAME = "ExpoUpdates";
  private static final String TAG = UpdatesModule.class.getSimpleName();

  private ModuleRegistry mModuleRegistry;

  public UpdatesModule(Context context) {
    super(context);
  }

  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
  }

  private UpdatesInterface getUpdatesService() {
    return mModuleRegistry.getModule(UpdatesInterface.class);
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();

    try {
      UpdatesInterface updatesService = getUpdatesService();
      if (updatesService != null) {
        constants.put("isEmergencyLaunch", updatesService.isEmergencyLaunch());

        UpdateEntity launchedUpdate = updatesService.getLaunchedUpdate();
        if (launchedUpdate != null) {
          constants.put("updateId", launchedUpdate.id.toString());
          constants.put("manifestString", launchedUpdate.metadata != null ? launchedUpdate.metadata.toString() : "{}");
        }

        Map<AssetEntity, String> localAssetFiles = updatesService.getLocalAssetFiles();
        if (localAssetFiles != null) {
          Map<String, String> localAssets = new HashMap<>();
          for (AssetEntity asset : localAssetFiles.keySet()) {
            localAssets.put(asset.key, localAssetFiles.get(asset));
          }
          constants.put("localAssets", localAssets);
        }

        constants.put("isEnabled", updatesService.getConfiguration().isEnabled());
        constants.put("releaseChannel", updatesService.getConfiguration().getReleaseChannel());
        constants.put("isUsingEmbeddedAssets", updatesService.isUsingEmbeddedAssets());
      }
    } catch (Exception e) {
      // do nothing; this is expected in a development client
      constants.put("isEnabled", false);
    }

    return constants;
  }

  @ExpoMethod
  public void reload(final Promise promise) {
    try {
      UpdatesInterface updatesService = getUpdatesService();
      if (!updatesService.canRelaunch()) {
        promise.reject("ERR_UPDATES_DISABLED", "You cannot reload when expo-updates is not enabled.");
        return;
      }

      updatesService.relaunchReactApplication(new Launcher.LauncherCallback() {
        @Override
        public void onFailure(Exception e) {
          Log.e(TAG, "Failed to relaunch application", e);
          promise.reject("ERR_UPDATES_RELOAD", e.getMessage(), e);
        }

        @Override
        public void onSuccess() {
          promise.resolve(null);
        }
      });
    } catch (IllegalStateException e) {
      promise.reject(
        "ERR_UPDATES_RELOAD",
        "The updates module controller has not been properly initialized. If you're using a development client, you cannot use `Updates.reloadAsync`. Otherwise, make sure you have called the native method UpdatesController.initialize()."
      );
    }
  }

  @ExpoMethod
  public void checkForUpdateAsync(final Promise promise) {
    try {
      final UpdatesInterface updatesService = getUpdatesService();
      if (!updatesService.getConfiguration().isEnabled()) {
        promise.reject("ERR_UPDATES_DISABLED", "You cannot check for updates when expo-updates is not enabled.");
        return;
      }

      FileDownloader.downloadManifest(updatesService.getConfiguration(), null, getContext(), new FileDownloader.ManifestDownloadCallback() {
        @Override
        public void onFailure(String message, Exception e) {
          promise.reject("ERR_UPDATES_CHECK", message, e);
          Log.e(TAG, message, e);
        }

        @Override
        public void onSuccess(Manifest manifest) {
          UpdateEntity launchedUpdate = updatesService.getLaunchedUpdate();
          Bundle updateInfo = new Bundle();
          if (launchedUpdate == null) {
            // this shouldn't ever happen, but if we don't have anything to compare
            // the new manifest to, let the user know an update is available
            updateInfo.putBoolean("isAvailable", true);
            updateInfo.putString("manifestString", manifest.getRawManifestJson().toString());
            promise.resolve(updateInfo);
            return;
          }

          if (updatesService.getSelectionPolicy().shouldLoadNewUpdate(manifest.getUpdateEntity(), launchedUpdate)) {
            updateInfo.putBoolean("isAvailable", true);
            updateInfo.putString("manifestString", manifest.getRawManifestJson().toString());
            promise.resolve(updateInfo);
          } else {
            updateInfo.putBoolean("isAvailable", false);
            promise.resolve(updateInfo);
          }
        }
      });
    } catch (IllegalStateException e) {
      promise.reject(
        "ERR_UPDATES_CHECK",
        "The updates module controller has not been properly initialized. If you're using a development client, you cannot check for updates. Otherwise, make sure you have called the native method UpdatesController.initialize()."
      );
    }
  }

  @ExpoMethod
  public void fetchUpdateAsync(final Promise promise) {
    try {
      final UpdatesInterface updatesService = getUpdatesService();
      if (!updatesService.getConfiguration().isEnabled()) {
        promise.reject("ERR_UPDATES_DISABLED", "You cannot fetch updates when expo-updates is not enabled.");
        return;
      }

      AsyncTask.execute(() -> {
        final DatabaseHolder databaseHolder = updatesService.getDatabaseHolder();
        new RemoteLoader(getContext(), updatesService.getConfiguration(), databaseHolder.getDatabase(), updatesService.getDirectory())
          .start(
            null, new RemoteLoader.LoaderCallback() {
              @Override
              public void onFailure(Exception e) {
                databaseHolder.releaseDatabase();
                promise.reject("ERR_UPDATES_FETCH", "Failed to download new update", e);
              }

              @Override
              public boolean onManifestLoaded(Manifest manifest) {
                return updatesService.getSelectionPolicy().shouldLoadNewUpdate(
                  manifest.getUpdateEntity(),
                  updatesService.getLaunchedUpdate()
                );
              }

              @Override
              public void onSuccess(@Nullable UpdateEntity update) {
                databaseHolder.releaseDatabase();
                Bundle updateInfo = new Bundle();
                if (update == null) {
                  updateInfo.putBoolean("isNew", false);
                } else {
                  updateInfo.putBoolean("isNew", true);
                  updateInfo.putString("manifestString", update.metadata.toString());
                }
                promise.resolve(updateInfo);
              }
            }
          );
      });
    } catch (IllegalStateException e) {
      promise.reject(
        "ERR_UPDATES_FETCH",
        "The updates module controller has not been properly initialized. If you're using a development client, you cannot fetch updates. Otherwise, make sure you have called the native method UpdatesController.initialize()."
      );
    }
  }
}
