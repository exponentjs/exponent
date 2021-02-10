package expo.modules.updates.loader;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;

import java.io.File;

import androidx.annotation.Nullable;
import expo.modules.updates.UpdatesConfiguration;
import expo.modules.updates.UpdatesUtils;
import expo.modules.updates.db.DatabaseHolder;
import expo.modules.updates.db.Reaper;
import expo.modules.updates.db.UpdatesDatabase;
import expo.modules.updates.db.entity.UpdateEntity;
import expo.modules.updates.launcher.DatabaseLauncher;
import expo.modules.updates.launcher.Launcher;
import expo.modules.updates.launcher.SelectionPolicy;
import expo.modules.updates.manifest.Manifest;

public class LoaderTask {

  private static final String TAG = LoaderTask.class.getSimpleName();

  public enum BackgroundUpdateStatus {
    ERROR, NO_UPDATE_AVAILABLE, UPDATE_AVAILABLE
  }

  public interface LoaderTaskCallback {
    void onFailure(Exception e);
    /**
     * This method gives the calling class a backdoor option to ignore the cached update and force
     * a remote load if it decides the cached update is not runnable. Returning false from this
     * callback will force a remote load, overriding the timeout and configuration settings for
     * whether or not to check for a remote update. Returning true from this callback will make
     * LoaderTask proceed as usual.
     */
    boolean onCachedUpdateLoaded(UpdateEntity update);
    void onRemoteManifestLoaded(Manifest manifest);
    void onSuccess(Launcher launcher, boolean isUpToDate);
    void onBackgroundUpdateFinished(BackgroundUpdateStatus status, @Nullable UpdateEntity update, @Nullable Exception exception);
  }

  private interface Callback {
    void onFailure(Exception e);
    void onSuccess();
  }

  private UpdatesConfiguration mConfiguration;
  private DatabaseHolder mDatabaseHolder;
  private File mDirectory;
  private SelectionPolicy mSelectionPolicy;
  private LoaderTaskCallback mCallback;

  // success conditions
  private boolean mIsReadyToLaunch = false;
  private boolean mTimeoutFinished = false;
  private boolean mHasLaunched = false;
  private boolean mIsUpToDate = false;
  private HandlerThread mHandlerThread;
  private Launcher mCandidateLauncher;
  private Launcher mFinalizedLauncher;

  public LoaderTask(UpdatesConfiguration configuration,
                    DatabaseHolder databaseHolder,
                    File directory,
                    SelectionPolicy selectionPolicy,
                    LoaderTaskCallback callback) {
    mConfiguration = configuration;
    mDatabaseHolder = databaseHolder;
    mDirectory = directory;
    mSelectionPolicy = selectionPolicy;
    mCallback = callback;

    mHandlerThread = new HandlerThread("expo-updates-timer");
  }

  public void start(Context context) {
    if (!mConfiguration.isEnabled()) {
      mCallback.onFailure(new Exception("LoaderTask was passed a configuration object with updates disabled. You should load updates from an embedded source rather than calling LoaderTask, or enable updates in the configuration."));
      return;
    }

    if (mConfiguration.getUpdateUrl() == null) {
      mCallback.onFailure(new Exception("LoaderTask was passed a configuration object with a null URL. You must pass a nonnull URL in order to use LoaderTask to load updates."));
      return;
    }

    if (mDirectory == null) {
      throw new AssertionError("LoaderTask directory must be nonnull.");
    }

    boolean shouldCheckForUpdate = UpdatesUtils.shouldCheckForUpdateOnLaunch(mConfiguration, context);
    int delay = mConfiguration.getLaunchWaitMs();
    if (delay > 0 && shouldCheckForUpdate) {
      mHandlerThread.start();
      new Handler(mHandlerThread.getLooper()).postDelayed(this::timeout, delay);
    } else {
      mTimeoutFinished = true;
    }

    launchFallbackUpdateFromDisk(context, new Callback() {
      private void launchRemoteUpdate() {
        launchRemoteUpdateInBackground(context, new Callback() {
          @Override
          public void onFailure(Exception e) {
            finish(e);
            runReaper();
          }

          @Override
          public void onSuccess() {
            synchronized (LoaderTask.this) {
              mIsReadyToLaunch = true;
            }
            finish(null);
            runReaper();
          }
        });
      }

      @Override
      public void onFailure(Exception e) {
        // An unexpected failure has occurred here, or we are running in an environment with no
        // embedded update and we have no update downloaded (e.g. Expo client).
        // What to do in this case depends on whether or not we're trying to load a remote update.
        // If we are, then we should wait for the task to finish. If not, we need to fail here.
        if (!shouldCheckForUpdate) {
          finish(e);
        } else {
          launchRemoteUpdate();
        }
        Log.e(TAG, "Failed to launch embedded or launchable update", e);
      }

      @Override
      public void onSuccess() {
        if (mCandidateLauncher.getLaunchedUpdate() != null &&
          !mCallback.onCachedUpdateLoaded(mCandidateLauncher.getLaunchedUpdate())) {
          // ignore timer and other settings and force launch a remote update
          stopTimer();
          mCandidateLauncher = null;
          launchRemoteUpdate();
        } else {
          synchronized (LoaderTask.this) {
            mIsReadyToLaunch = true;
            maybeFinish();
          }

          if (shouldCheckForUpdate) {
            launchRemoteUpdate();
          } else {
            runReaper();
          }
        }
      }
    });
  }

  /**
   * This method should be called at the end of the LoaderTask. Whether or not the task has
   * successfully loaded an update to launch, the timer will stop and the appropriate callback
   * function will be fired.
   */
  private synchronized void finish(@Nullable Exception e) {
    if (mHasLaunched) {
      // we've already fired once, don't do it again
      return;
    }
    mHasLaunched = true;
    mFinalizedLauncher = mCandidateLauncher;

    if (!mIsReadyToLaunch || mFinalizedLauncher == null || mFinalizedLauncher.getLaunchedUpdate() == null) {
      mCallback.onFailure(e != null ? e : new Exception("LoaderTask encountered an unexpected error and could not launch an update."));
    } else {
      mCallback.onSuccess(mFinalizedLauncher, mIsUpToDate);
    }

    if (!mTimeoutFinished) {
      stopTimer();
    }

    if (e != null) {
      Log.e(TAG, "Unexpected error encountered while loading this app", e);
    }
  }

  /**
   * This method should be called to conditionally fire the callback. If the task has successfully
   * loaded an update to launch and the timer isn't still running, the appropriate callback function
   * will be fired. If not, no callback will be fired.
   */
  private synchronized void maybeFinish() {
    if (!mIsReadyToLaunch || !mTimeoutFinished) {
      // too early, bail out
      return;
    }
    finish(null);
  }

  private synchronized void stopTimer() {
    mTimeoutFinished = true;
    mHandlerThread.quitSafely();
  }

  private synchronized void timeout() {
    if (!mTimeoutFinished) {
      mTimeoutFinished = true;
      maybeFinish();
    }
    stopTimer();
  }

  private void launchFallbackUpdateFromDisk(Context context, Callback diskUpdateCallback) {
    UpdatesDatabase database = mDatabaseHolder.getDatabase();
    DatabaseLauncher launcher = new DatabaseLauncher(mConfiguration, mDirectory, mSelectionPolicy);
    mCandidateLauncher = launcher;

    if (mConfiguration.hasEmbeddedUpdate()) {
      // if the embedded update should be launched (e.g. if it's newer than any other update we have
      // in the database, which can happen if the app binary is updated), load it into the database
      // so we can launch it
      UpdateEntity embeddedUpdate = EmbeddedLoader.readEmbeddedManifest(context, mConfiguration).getUpdateEntity();
      UpdateEntity launchableUpdate = launcher.getLaunchableUpdate(database, context);
      if (mSelectionPolicy.shouldLoadNewUpdate(embeddedUpdate, launchableUpdate)) {
        new EmbeddedLoader(context, mConfiguration, database, mDirectory).loadEmbeddedUpdate();
      }
    }

    launcher.launch(database, context, new Launcher.LauncherCallback() {
      @Override
      public void onFailure(Exception e) {
        mDatabaseHolder.releaseDatabase();
        diskUpdateCallback.onFailure(e);
      }

      @Override
      public void onSuccess() {
        mDatabaseHolder.releaseDatabase();
        diskUpdateCallback.onSuccess();
      }
    });
  }

  private void launchRemoteUpdateInBackground(Context context, Callback remoteUpdateCallback) {
    AsyncTask.execute(() -> {
      UpdatesDatabase database = mDatabaseHolder.getDatabase();
      UpdateEntity launchedUpdate = mCandidateLauncher != null ? mCandidateLauncher.getLaunchedUpdate() : null;
      new RemoteLoader(context, mConfiguration, database, mDirectory)
        .start(launchedUpdate, new RemoteLoader.LoaderCallback() {
          @Override
          public void onFailure(Exception e) {
            mDatabaseHolder.releaseDatabase();
            remoteUpdateCallback.onFailure(e);
            mCallback.onBackgroundUpdateFinished(BackgroundUpdateStatus.ERROR, null, e);
            Log.e(TAG, "Failed to download remote update", e);
          }

          @Override
          public boolean onManifestLoaded(Manifest manifest) {
            if (mSelectionPolicy.shouldLoadNewUpdate(
                  manifest.getUpdateEntity(),
                  mCandidateLauncher == null ? null : mCandidateLauncher.getLaunchedUpdate())) {
              mIsUpToDate = false;
              mCallback.onRemoteManifestLoaded(manifest);
              return true;
            } else {
              mIsUpToDate = true;
              return false;
            }
          }

          @Override
          public void onSuccess(@Nullable UpdateEntity update) {
            // a new update has loaded successfully; we need to launch it with a new Launcher and
            // replace the old Launcher so that the callback fires with the new one
            final DatabaseLauncher newLauncher = new DatabaseLauncher(mConfiguration, mDirectory, mSelectionPolicy);
            newLauncher.launch(database, context, new Launcher.LauncherCallback() {
              @Override
              public void onFailure(Exception e) {
                mDatabaseHolder.releaseDatabase();
                remoteUpdateCallback.onFailure(e);
                Log.e(TAG, "Loaded new update but it failed to launch", e);
              }

              @Override
              public void onSuccess() {
                mDatabaseHolder.releaseDatabase();

                boolean hasLaunched;
                synchronized (LoaderTask.this) {
                  hasLaunched = mHasLaunched;
                  if (!hasLaunched) {
                    mCandidateLauncher = newLauncher;
                    mIsUpToDate = true;
                  }
                }

                remoteUpdateCallback.onSuccess();

                if (hasLaunched) {
                  if (update == null) {
                    mCallback.onBackgroundUpdateFinished(BackgroundUpdateStatus.NO_UPDATE_AVAILABLE, null, null);
                  } else {
                    mCallback.onBackgroundUpdateFinished(BackgroundUpdateStatus.UPDATE_AVAILABLE, update, null);
                  }
                }
              }
            });
          }
        });
    });
  }

  private void runReaper() {
    AsyncTask.execute(() -> {
      synchronized (LoaderTask.this) {
        if (mFinalizedLauncher != null && mFinalizedLauncher.getLaunchedUpdate() != null) {
          UpdatesDatabase database = mDatabaseHolder.getDatabase();
          Reaper.reapUnusedUpdates(mConfiguration, database, mDirectory, mFinalizedLauncher.getLaunchedUpdate(), mSelectionPolicy);
          mDatabaseHolder.releaseDatabase();
        }
      }
    });
  }
}
