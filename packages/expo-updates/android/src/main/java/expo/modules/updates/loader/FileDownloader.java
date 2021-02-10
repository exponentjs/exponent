package expo.modules.updates.loader;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.Nullable;
import expo.modules.updates.UpdatesConfiguration;
import expo.modules.updates.UpdatesUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;

import expo.modules.updates.db.entity.AssetEntity;
import expo.modules.updates.db.entity.UpdateEntity;
import expo.modules.updates.launcher.NoDatabaseLauncher;
import expo.modules.updates.manifest.Manifest;
import expo.modules.updates.manifest.ManifestFactory;
import okhttp3.CacheControl;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class FileDownloader {

  private static final String TAG = FileDownloader.class.getSimpleName();

  private static OkHttpClient sClient = new OkHttpClient.Builder().build();

  public interface FileDownloadCallback {
    void onFailure(Exception e);
    void onSuccess(File file, @Nullable byte[] hash);
  }

  public interface ManifestDownloadCallback {
    void onFailure(String message, Exception e);
    void onSuccess(Manifest manifest);
  }

  public interface AssetDownloadCallback {
    void onFailure(Exception e, AssetEntity assetEntity);
    void onSuccess(AssetEntity assetEntity, boolean isNew);
  }

  public static void downloadFileToPath(Request request, final File destination, final FileDownloadCallback callback) {
    downloadData(request, new Callback() {
      @Override
      public void onFailure(Call call, IOException e) {
        callback.onFailure(e);
      }

      @Override
      public void onResponse(Call call, Response response) throws IOException {
        if (!response.isSuccessful()) {
          callback.onFailure(new Exception("Network request failed: " + response.body().string()));
          return;
        }

        try (
            InputStream inputStream = response.body().byteStream();
        ) {
          byte[] hash = UpdatesUtils.sha256AndWriteToFile(inputStream, destination);
          callback.onSuccess(destination, hash);
        } catch (Exception e) {
          Log.e(TAG, "Failed to download file to destination " + destination.toString(), e);
          callback.onFailure(e);
        }
      }
    });
  }

  public static void downloadManifest(final UpdatesConfiguration configuration, UpdateEntity launchedUpdate, final Context context, final ManifestDownloadCallback callback) {
    try {
      downloadData(setHeadersForManifestUrl(configuration, launchedUpdate, context), new Callback() {
        @Override
        public void onFailure(Call call, IOException e) {
          callback.onFailure("Failed to download manifest from URL: " + configuration.getUpdateUrl(), e);
        }

        @Override
        public void onResponse(Call call, Response response) throws IOException {
          if (!response.isSuccessful()) {
            callback.onFailure("Failed to download manifest from URL: " + configuration.getUpdateUrl(), new Exception(response.body().string()));
            return;
          }

          try {
            String manifestString = response.body().string();
            JSONObject manifestJson = extractManifest(manifestString, configuration);

            boolean isSigned = manifestJson.has("manifestString") && manifestJson.has("signature");
            // XDL serves unsigned manifests with the `signature` key set to "UNSIGNED".
            // We should treat these manifests as unsigned rather than signed with an invalid signature.
            if (isSigned && "UNSIGNED".equals(manifestJson.getString("signature"))) {
              isSigned = false;
              manifestJson = new JSONObject(manifestJson.getString("manifestString"));
              manifestJson.put("isVerified", false);
            }

            if (isSigned) {
              final String innerManifestString = manifestJson.getString("manifestString");
              Crypto.verifyPublicRSASignature(
                  innerManifestString,
                  manifestJson.getString("signature"),
                  new Crypto.RSASignatureListener() {
                    @Override
                    public void onError(Exception e, boolean isNetworkError) {
                      callback.onFailure("Could not validate signed manifest", e);
                    }

                    @Override
                    public void onCompleted(boolean isValid) {
                      if (isValid) {
                        try {
                          JSONObject manifestJson = new JSONObject(innerManifestString);
                          manifestJson.put("isVerified", true);
                          Manifest manifest = ManifestFactory.getManifest(manifestJson, configuration);
                          callback.onSuccess(manifest);
                        } catch (JSONException e) {
                          callback.onFailure("Failed to parse manifest data", e);
                        }
                      } else {
                        callback.onFailure("Manifest signature is invalid; aborting", new Exception("Manifest signature is invalid"));
                      }
                    }
                  }
              );
            } else {
              Manifest manifest = ManifestFactory.getManifest(manifestJson, configuration);
              callback.onSuccess(manifest);
            }
          } catch (Exception e) {
            callback.onFailure("Failed to parse manifest data", e);
          }
        }
      });
    } catch (Exception e) {
      callback.onFailure("Failed to download manifest from URL " + configuration.getUpdateUrl().toString(), e);
    }
  }

  public static void downloadAsset(final AssetEntity asset, File destinationDirectory, UpdatesConfiguration configuration, final AssetDownloadCallback callback) {
    if (asset.url == null) {
      callback.onFailure(new Exception("Could not download asset " + asset.key + " with no URL"), asset);
      return;
    }

    final String filename = UpdatesUtils.createFilenameForAsset(asset);
    File path = new File(destinationDirectory, filename);

    if (path.exists()) {
      asset.relativePath = filename;
      callback.onSuccess(asset, false);
    } else {
      try {
        downloadFileToPath(setHeadersForUrl(asset.url, configuration), path, new FileDownloadCallback() {
          @Override
          public void onFailure(Exception e) {
            callback.onFailure(e, asset);
          }

          @Override
          public void onSuccess(File file, @Nullable byte[] hash) {
            asset.downloadTime = new Date();
            asset.relativePath = filename;
            asset.hash = hash;
            callback.onSuccess(asset, true);
          }
        });
      } catch (Exception e) {
        callback.onFailure(e, asset);
      }
    }
  }

  public static void downloadData(Request request, Callback callback) {
    downloadData(request, callback, false);
  }

  private static void downloadData(final Request request, final Callback callback, final boolean isRetry) {
    sClient.newCall(request).enqueue(new Callback() {
      @Override
      public void onFailure(Call call, IOException e) {
        if (isRetry) {
          callback.onFailure(call, e);
        } else {
          downloadData(request, callback, true);
        }
      }

      @Override
      public void onResponse(Call call, Response response) throws IOException {
        callback.onResponse(call, response);
      }
    });
  }

  private static JSONObject extractManifest(String manifestString, UpdatesConfiguration configuration) throws IOException {
    try {
      return new JSONObject(manifestString);
    } catch (JSONException e) {
      // Ignore this error, try to parse manifest as array
    }

    // TODO: either add support for runtimeVersion or deprecate multi-manifests
    try {
      // the manifestString could be an array of manifest objects
      // in this case, we choose the first compatible manifest in the array
      JSONArray manifestArray = new JSONArray(manifestString);
      for (int i = 0; i < manifestArray.length(); i++) {
        JSONObject manifestCandidate = manifestArray.getJSONObject(i);
        String sdkVersion = manifestCandidate.getString("sdkVersion");
        if (configuration.getSdkVersion() != null && Arrays.asList(configuration.getSdkVersion().split(",")).contains(sdkVersion)){
          return manifestCandidate;
        }
      }
    } catch (JSONException e) {
      throw new IOException("Manifest string is not a valid JSONObject or JSONArray: " + manifestString, e);
    }
    throw new IOException("No compatible manifest found. SDK Versions supported: " + configuration.getSdkVersion() + " Provided manifestString: " + manifestString);
  }

  private static Request setHeadersForUrl(Uri url, UpdatesConfiguration configuration) {
    Request.Builder requestBuilder = new Request.Builder()
            .url(url.toString())
            .header("Expo-Platform", "android")
            .header("Expo-Api-Version", "1")
            .header("Expo-Updates-Environment", "BARE");

    for (Map.Entry<String, String> entry : configuration.getRequestHeaders().entrySet()) {
      requestBuilder.header(entry.getKey(), entry.getValue());
    }

    return requestBuilder.build();
  }

  /* package */ static Request setHeadersForManifestUrl(UpdatesConfiguration configuration, UpdateEntity launchedUpdate, Context context) {
    Request.Builder requestBuilder = new Request.Builder()
            .url(configuration.getUpdateUrl().toString())
            .header("Accept", "application/expo+json,application/json")
            .header("Expo-Platform", "android")
            .header("Expo-Api-Version", "1")
            .header("Expo-Updates-Environment", "BARE")
            .header("Expo-JSON-Error", "true")
            // as of 2020-11-25, the EAS Update alpha returns an error if Expo-Accept-Signature: true is included in the request
            .header("Expo-Accept-Signature", String.valueOf(configuration.usesLegacyManifest()))
            .cacheControl(CacheControl.FORCE_NETWORK);

    String runtimeVersion = configuration.getRuntimeVersion();
    String sdkVersion = configuration.getSdkVersion();
    if (runtimeVersion != null && runtimeVersion.length() > 0) {
      requestBuilder = requestBuilder.header("Expo-Runtime-Version", runtimeVersion);
    } else {
      requestBuilder = requestBuilder.header("Expo-SDK-Version", sdkVersion);
    }

    if (launchedUpdate != null) {
      requestBuilder = requestBuilder.header("Expo-Current-Update-ID", launchedUpdate.id.toString());
    }

    String releaseChannel = configuration.getReleaseChannel();
    requestBuilder = requestBuilder.header("Expo-Release-Channel", releaseChannel);

    String previousFatalError = NoDatabaseLauncher.consumeErrorLog(context);
    if (previousFatalError != null) {
      // some servers can have max length restrictions for headers,
      // so we restrict the length of the string to 1024 characters --
      // this should satisfy the requirements of most servers
      requestBuilder = requestBuilder.header(
        "Expo-Fatal-Error",
        previousFatalError.substring(0, Math.min(1024, previousFatalError.length()))
      );
    }

    for (Map.Entry<String, String> entry : configuration.getRequestHeaders().entrySet()) {
      requestBuilder.header(entry.getKey(), entry.getValue());
    }

    return requestBuilder.build();
  }
}
