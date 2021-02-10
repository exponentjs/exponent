package abi38_0_0.host.exp.exponent.modules.api;

import android.os.AsyncTask;

import abi38_0_0.com.facebook.react.bridge.Arguments;
import abi38_0_0.com.facebook.react.bridge.Promise;
import abi38_0_0.com.facebook.react.bridge.ReactApplicationContext;
import abi38_0_0.com.facebook.react.bridge.ReactContextBaseJavaModule;
import abi38_0_0.com.facebook.react.bridge.ReactMethod;
import abi38_0_0.com.facebook.react.bridge.WritableMap;
import abi38_0_0.com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;

import javax.inject.Inject;

import androidx.annotation.Nullable;
import expo.modules.updates.db.DatabaseHolder;
import expo.modules.updates.db.entity.UpdateEntity;
import expo.modules.updates.loader.FileDownloader;
import expo.modules.updates.loader.RemoteLoader;
import expo.modules.updates.manifest.Manifest;
import host.exp.exponent.AppLoader;
import host.exp.exponent.Constants;
import host.exp.exponent.ExpoUpdatesAppLoader;
import host.exp.exponent.ExponentManifest;
import host.exp.exponent.di.NativeModuleDepsProvider;
import host.exp.exponent.kernel.KernelConstants;
import host.exp.exponent.kernel.KernelProvider;
import host.exp.exponent.storage.ExponentSharedPreferences;
import host.exp.expoview.Exponent;

public class UpdatesModule extends ReactContextBaseJavaModule {

  private static final String TAG = UpdatesModule.class.getSimpleName();
  private Map<String, Object> mExperienceProperties;
  private JSONObject mManifest;

  @Inject
  DatabaseHolder mDatabaseHolder;

  @Inject
  ExponentSharedPreferences mExponentSharedPreferences;

  public UpdatesModule(ReactApplicationContext reactContext, Map<String, Object> experienceProperties, JSONObject manifest) {
    super(reactContext);
    NativeModuleDepsProvider.getInstance().inject(UpdatesModule.class, this);
    mExperienceProperties = experienceProperties;
    mManifest = manifest;
  }

  @Override
  public String getName() {
    return "ExponentUpdates";
  }

  @ReactMethod
  public void reload() {
    KernelProvider.getInstance().reloadVisibleExperience((String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY));
  }

  @ReactMethod
  public void reloadFromCache() {
    KernelProvider.getInstance().reloadVisibleExperience((String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY), true);
  }

  @ReactMethod
  public void checkForUpdateAsync(final Promise promise) {
    if (!Constants.ARE_REMOTE_UPDATES_ENABLED) {
      promise.reject("E_CHECK_UPDATE_FAILED", "Remote updates are disabled in app.json");
      return;
    }
    if (ExponentManifest.isDebugModeEnabled(mManifest)) {
      promise.reject("E_CHECK_UPDATE_FAILED", "Cannot check for updates in dev mode");
      return;
    }
    try {
      String manifestUrl = (String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY);
      ExpoUpdatesAppLoader appLoader = KernelProvider.getInstance().getAppLoaderForManifestUrl(manifestUrl);
      FileDownloader.downloadManifest(appLoader.getUpdatesConfiguration(), null, getReactApplicationContext(), new FileDownloader.ManifestDownloadCallback() {
        @Override
        public void onFailure(String message, Exception e) {
          promise.reject("E_FETCH_MANIFEST_FAILED", e);
        }

        @Override
        public void onSuccess(Manifest manifest) {
          UpdateEntity launchedUpdate = appLoader.getLauncher().getLaunchedUpdate();
          if (launchedUpdate == null) {
            // this shouldn't ever happen, but if we don't have anything to compare
            // the new manifest to, let the user know an update is available
            promise.resolve(manifest.getRawManifestJson().toString());
            return;
          }

          if (appLoader.getSelectionPolicy().shouldLoadNewUpdate(manifest.getUpdateEntity(), launchedUpdate)) {
            promise.resolve(manifest.getRawManifestJson().toString());
          } else {
            promise.resolve(false);
          }
        }
      });
    } catch (Exception e) {
      promise.reject("E_CHECK_UPDATE_FAILED", e);
    }
  }

  @ReactMethod
  public void fetchUpdateAsync(final Promise promise) {
    if (!Constants.ARE_REMOTE_UPDATES_ENABLED) {
      sendErrorAndReject("E_FETCH_UPDATE_FAILED", "Remote updates are disabled in app.json", promise);
      return;
    }
    if (ExponentManifest.isDebugModeEnabled(mManifest)) {
      sendErrorAndReject("E_FETCH_UPDATE_FAILED", "Cannot fetch updates in dev mode", promise);
      return;
    }
    String manifestUrl = (String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY);
    ExpoUpdatesAppLoader appLoader = KernelProvider.getInstance().getAppLoaderForManifestUrl(manifestUrl);
    AsyncTask.execute(() -> {
      new RemoteLoader(getReactApplicationContext(), appLoader.getUpdatesConfiguration(), mDatabaseHolder.getDatabase(), appLoader.getUpdatesDirectory())
        .start(
          null, new RemoteLoader.LoaderCallback() {
            @Override
            public void onFailure(Exception e) {
              mDatabaseHolder.releaseDatabase();
              sendErrorAndReject("E_FETCH_BUNDLE_FAILED", "Failed to fetch new update", e, promise);
            }

            @Override
            public boolean onManifestLoaded(Manifest manifest) {
              boolean isNew = appLoader.getSelectionPolicy().shouldLoadNewUpdate(
                manifest.getUpdateEntity(),
                appLoader.getLauncher().getLaunchedUpdate()
              );
              if (isNew) {
                sendEventToJS(AppLoader.UPDATE_DOWNLOAD_START_EVENT, null);
              }
              return isNew;
            }

            @Override
            public void onSuccess(@Nullable UpdateEntity update) {
              mDatabaseHolder.releaseDatabase();
              if (update == null) {
                sendEventAndResolve(AppLoader.UPDATE_NO_UPDATE_AVAILABLE_EVENT, promise);
              } else {
                String manifestString = update.metadata.toString();
                WritableMap params = Arguments.createMap();
                params.putString("manifestString", manifestString);

                sendEventToJS(AppLoader.UPDATE_DOWNLOAD_FINISHED_EVENT, params);
                promise.resolve(manifestString);

                mExponentSharedPreferences.updateSafeManifest((String) mExperienceProperties.get(KernelConstants.MANIFEST_URL_KEY), update.metadata);
              }
            }
          }
        );
    });
  }

  @ReactMethod
  public void clearUpdateCacheAsync(final String abiVersion, final Promise promise) {
    try {
      promise.resolve(Exponent.getInstance().clearAllJSBundleCache(abiVersion));
    } catch (IOException e) {
      promise.reject(e);
    }
  }

  private void sendErrorAndReject(String code, String message, Promise promise) {
    WritableMap params = Arguments.createMap();
    params.putString("message", message);
    sendEventToJS(AppLoader.UPDATE_ERROR_EVENT, params);
    promise.reject(code, message);
  }

  private void sendErrorAndReject(String code, String message, Throwable e, Promise promise) {
    WritableMap params = Arguments.createMap();
    params.putString("message", message);
    sendEventToJS(AppLoader.UPDATE_ERROR_EVENT, params);
    promise.reject(code, message, e);
  }

  private void sendEventAndResolve(String eventName, Promise promise) {
    sendEventToJS(eventName, null);
    promise.resolve(null);
  }

  private void sendEventToJS(String eventName, WritableMap params) {
    WritableMap paramsToSend = params;
    if (params == null) {
      paramsToSend = Arguments.createMap();
    }
    paramsToSend.putString("type", eventName);
    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(AppLoader.UPDATES_EVENT_NAME, paramsToSend);
  }
}
