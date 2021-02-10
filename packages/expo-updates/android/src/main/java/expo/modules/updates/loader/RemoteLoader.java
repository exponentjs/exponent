package expo.modules.updates.loader;

import android.content.Context;
import android.util.Log;

import androidx.annotation.Nullable;
import expo.modules.updates.UpdatesConfiguration;
import expo.modules.updates.db.enums.UpdateStatus;
import expo.modules.updates.UpdatesUtils;
import expo.modules.updates.db.UpdatesDatabase;
import expo.modules.updates.db.entity.AssetEntity;
import expo.modules.updates.db.entity.UpdateEntity;
import expo.modules.updates.manifest.Manifest;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;

public class RemoteLoader {

  private static String TAG = RemoteLoader.class.getSimpleName();

  private Context mContext;
  private UpdatesConfiguration mConfiguration;
  private UpdatesDatabase mDatabase;
  private File mUpdatesDirectory;

  private UpdateEntity mUpdateEntity;
  private LoaderCallback mCallback;
  private int mAssetTotal = 0;
  private ArrayList<AssetEntity> mErroredAssetList = new ArrayList<>();
  private ArrayList<AssetEntity> mExistingAssetList = new ArrayList<>();
  private ArrayList<AssetEntity> mFinishedAssetList = new ArrayList<>();

  public interface LoaderCallback {
    void onFailure(Exception e);
    void onSuccess(@Nullable UpdateEntity update);

    /**
     * Called when a manifest has been downloaded. The calling class should determine whether or not
     * the RemoteLoader should continue to download the update described by this manifest, based on
     * (for example) whether or not it already has the update downloaded locally.
     *
     * @param manifest Manifest downloaded by RemoteLoader
     * @return true if RemoteLoader should download the update described in the manifest,
     *         false if not.
     */
    boolean onManifestLoaded(Manifest manifest);
  }

  public RemoteLoader(Context context, UpdatesConfiguration configuration, UpdatesDatabase database, File updatesDirectory) {
    mContext = context;
    mConfiguration = configuration;
    mDatabase = database;
    mUpdatesDirectory = updatesDirectory;
  }

  // lifecycle methods for class

  public void start(UpdateEntity launchedUpdate, LoaderCallback callback) {
    if (mCallback != null) {
      callback.onFailure(new Exception("RemoteLoader has already started. Create a new instance in order to load multiple URLs in parallel."));
      return;
    }

    mCallback = callback;

    FileDownloader.downloadManifest(mConfiguration, launchedUpdate, mContext, new FileDownloader.ManifestDownloadCallback() {
      @Override
      public void onFailure(String message, Exception e) {
        finishWithError(message, e);
      }

      @Override
      public void onSuccess(Manifest manifest) {
        if (mCallback.onManifestLoaded(manifest)) {
          processManifest(manifest);
        } else {
          mCallback.onSuccess(null);
        }
      }
    });
  }

  private void reset() {
    mUpdateEntity = null;
    mCallback = null;
    mAssetTotal = 0;
    mErroredAssetList = new ArrayList<>();
    mExistingAssetList = new ArrayList<>();
    mFinishedAssetList = new ArrayList<>();
  }

  private void finishWithSuccess() {
    if (mCallback == null) {
      Log.e(TAG, "RemoteLoader tried to finish but it already finished or was never initialized.");
      return;
    }

    mCallback.onSuccess(mUpdateEntity);
    reset();
  }

  private void finishWithError(String message, Exception e) {
    Log.e(TAG, message, e);

    if (mCallback == null) {
      Log.e(TAG, "RemoteLoader tried to finish but it already finished or was never initialized.");
      return;
    }

    mCallback.onFailure(e);
    reset();
  }

  // private helper methods

  private void processManifest(Manifest manifest) {
    if (manifest.isDevelopmentMode()) {
      // insert into database but don't try to load any assets;
      // the RN runtime will take care of that and we don't want to cache anything
      UpdateEntity updateEntity = manifest.getUpdateEntity();
      mDatabase.updateDao().insertUpdate(updateEntity);
      mDatabase.updateDao().markUpdateFinished(updateEntity);
      finishWithSuccess();
      return;
    }

    UpdateEntity newUpdateEntity = manifest.getUpdateEntity();
    UpdateEntity existingUpdateEntity = mDatabase.updateDao().loadUpdateWithId(newUpdateEntity.id);

    // if something has gone wrong on the server and we have two updates with the same id
    // but different scope keys, we should try to launch something rather than show a cryptic
    // error to the user.
    if (existingUpdateEntity != null && !existingUpdateEntity.scopeKey.equals(newUpdateEntity.scopeKey)) {
      mDatabase.updateDao().setUpdateScopeKey(existingUpdateEntity, newUpdateEntity.scopeKey);
      Log.e(TAG, "Loaded an update with the same ID but a different scopeKey than one we already have on disk. This is a server error. Overwriting the scopeKey and loading the existing update.");
    }

    if (existingUpdateEntity != null && existingUpdateEntity.status == UpdateStatus.READY) {
      // hooray, we already have this update downloaded and ready to go!
      mUpdateEntity = existingUpdateEntity;
      finishWithSuccess();
    } else {
      if (existingUpdateEntity == null) {
        // no update already exists with this ID, so we need to insert it and download everything.
        mUpdateEntity = newUpdateEntity;
        mDatabase.updateDao().insertUpdate(mUpdateEntity);
      } else {
        // we've already partially downloaded the update, so we should use the existing entity.
        // however, it's not ready, so we should try to download all the assets again.
        mUpdateEntity = existingUpdateEntity;
      }
      downloadAllAssets(manifest.getAssetEntityList());
    }
  }

  private void downloadAllAssets(ArrayList<AssetEntity> assetList) {
    mAssetTotal = assetList.size();
    for (AssetEntity assetEntity : assetList) {
      AssetEntity matchingDbEntry = mDatabase.assetDao().loadAssetWithKey(assetEntity.key);
      if (matchingDbEntry != null) {
        mDatabase.assetDao().mergeAndUpdateAsset(matchingDbEntry, assetEntity);
        assetEntity = matchingDbEntry;
      }

      // if we already have a local copy of this asset, don't try to download it again!
      if (assetEntity.relativePath != null && new File(mUpdatesDirectory, assetEntity.relativePath).exists()) {
        handleAssetDownloadCompleted(assetEntity, true, false);
        continue;
      }

      if (assetEntity.url == null) {
        Log.e(TAG, "Failed to download asset with no URL provided");
        handleAssetDownloadCompleted(assetEntity, false, false);
        continue;
      }

      FileDownloader.downloadAsset(assetEntity, mUpdatesDirectory, mConfiguration, new FileDownloader.AssetDownloadCallback() {
        @Override
        public void onFailure(Exception e, AssetEntity assetEntity) {
          Log.e(TAG, "Failed to download asset from " + assetEntity.url, e);
          handleAssetDownloadCompleted(assetEntity, false, false);
        }

        @Override
        public void onSuccess(AssetEntity assetEntity, boolean isNew) {
          handleAssetDownloadCompleted(assetEntity, true, isNew);
        }
      });
    }
  }

  private synchronized void handleAssetDownloadCompleted(AssetEntity assetEntity, boolean success, boolean isNew) {
    if (success) {
      if (isNew) {
        mFinishedAssetList.add(assetEntity);
      } else {
        mExistingAssetList.add(assetEntity);
      }
    } else {
      mErroredAssetList.add(assetEntity);
    }

    if (mFinishedAssetList.size() + mErroredAssetList.size() + mExistingAssetList.size() == mAssetTotal) {
      try {
        for (AssetEntity asset : mExistingAssetList) {
          boolean existingAssetFound = mDatabase.assetDao().addExistingAssetToUpdate(mUpdateEntity, asset, asset.isLaunchAsset);
          if (!existingAssetFound) {
            // the database and filesystem have gotten out of sync
            // do our best to create a new entry for this file even though it already existed on disk
            byte[] hash = null;
            try {
              hash = UpdatesUtils.sha256(new File(mUpdatesDirectory, asset.relativePath));
            } catch (Exception e) {
            }
            asset.downloadTime = new Date();
            asset.hash = hash;
            mFinishedAssetList.add(asset);
          }
        }
        mDatabase.assetDao().insertAssets(mFinishedAssetList, mUpdateEntity);
        if (mErroredAssetList.size() == 0) {
          mDatabase.updateDao().markUpdateFinished(mUpdateEntity);
        }
      } catch (Exception e) {
        finishWithError("Error while adding new update to database", e);
        return;
      }

      if (mErroredAssetList.size() > 0) {
        finishWithError("Failed to load all assets", new Exception("Failed to load all assets"));
      } else {
        finishWithSuccess();
      }
    }
  }
}
