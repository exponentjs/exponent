package expo.modules.filesystem;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.StatFs;
import android.provider.DocumentsContract;
import android.util.Base64;
import android.util.Log;

import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ActivityEventListener;
import org.unimodules.core.interfaces.ActivityProvider;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.services.EventEmitter;
import org.unimodules.core.interfaces.services.UIManager;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.math.BigInteger;
import java.net.CookieHandler;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import androidx.annotation.Nullable;
import androidx.documentfile.provider.DocumentFile;
import expo.modules.interfaces.filesystem.FilePermissionModuleInterface;
import expo.modules.interfaces.filesystem.Permission;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Headers;
import okhttp3.Interceptor;
import okhttp3.JavaNetCookieJar;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okio.Buffer;
import okio.BufferedSink;
import okio.BufferedSource;
import okio.ForwardingSource;
import okio.Okio;
import okio.Source;

public class FileSystemModule extends ExportedModule implements ActivityEventListener {
  private static final String NAME = "ExponentFileSystem";
  private static final String TAG = FileSystemModule.class.getSimpleName();
  private static final String EXDownloadProgressEventName = "expo-file-system.downloadProgress";
  private static final String EXUploadProgressEventName = "expo-file-system.uploadProgress";
  private static final long MIN_EVENT_DT_MS = 100;
  private static final String HEADER_KEY = "headers";
  private static final int DIR_PERMISSIONS_REQUEST_CODE = 5394;

  private ModuleRegistry mModuleRegistry;
  private OkHttpClient mClient;
  private Promise mDirPermissionsRequest;

  private final Map<String, TaskHandler> mTaskHandlers = new HashMap<>();

  private enum UploadType {
    INVALID(-1),
    BINARY_CONTENT(0),
    MULTIPART(1);

    private int value;

    UploadType(int value) {
      this.value = value;
    }

    public static UploadType fromInt(int value) {

      for (UploadType method : values()) {
        if (value == method.value) {
          return method;
        }
      }
      return INVALID;
    }
  }

  public FileSystemModule(Context context) {
    super(context);
    try {
      ensureDirExists(getContext().getFilesDir());
      ensureDirExists(getContext().getCacheDir());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
  }

  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    constants.put("documentDirectory", Uri.fromFile(getContext().getFilesDir()).toString() + "/");
    constants.put("cacheDirectory", Uri.fromFile(getContext().getCacheDir()).toString() + "/");
    constants.put("bundleDirectory", "asset:///");

    return constants;
  }

  private File uriToFile(Uri uri) {
    return new File(uri.getPath());
  }

  private void checkIfFileExists(Uri uri) throws IOException {
    File file = uriToFile(uri);
    if (!file.exists()) {
      throw new IOException("Directory for " + file.getPath() + " doesn't exist.");
    }
  }

  private void checkIfFileDirExists(Uri uri) throws IOException {
    File file = uriToFile(uri);
    File dir = file.getParentFile();
    if (!dir.exists()) {
      throw new IOException("Directory for " + file.getPath() + " doesn't exist. Please make sure directory '" + file.getParent() + "' exists before calling downloadAsync.");
    }
  }

  private EnumSet<Permission> permissionsForPath(String path) {
    return mModuleRegistry.getModule(FilePermissionModuleInterface.class).getPathPermissions(getContext(), path);
  }

  private EnumSet<Permission> permissionsForUri(Uri uri) {
    if (isSAFUri(uri)) {
      return permissionsForSAFUri(uri);
    }
    if ("content".equals(uri.getScheme())) {
      return EnumSet.of(Permission.READ);
    }
    if ("asset".equals(uri.getScheme())) {
      return EnumSet.of(Permission.READ);
    }
    if ("file".equals(uri.getScheme())) {
      return permissionsForPath(uri.getPath());
    }
    if (uri.getScheme() == null) {
      // this is probably an asset embedded by the packager in resources
      return EnumSet.of(Permission.READ);
    }
    return EnumSet.noneOf(Permission.class);
  }

  private EnumSet<Permission> permissionsForSAFUri(Uri uri) {
    DocumentFile documentFile = getNearestSAFFile(uri);
    EnumSet<Permission> permissions = EnumSet.noneOf(Permission.class);
    if (documentFile.canRead()) {
      permissions.add(Permission.READ);
    }

    if (documentFile.canWrite()) {
      permissions.add(Permission.WRITE);
    }

    return permissions;
  }

  // For now we only need to ensure one permission at a time, this allows easier error message strings,
  // we can generalize this when needed later

  private void ensurePermission(Uri uri, Permission permission, String errorMsg) throws IOException {
    if (!permissionsForUri(uri).contains(permission)) {
      throw new IOException(errorMsg);
    }
  }

  private void ensurePermission(Uri uri, Permission permission) throws IOException {
    if (permission.equals(Permission.READ)) {
      ensurePermission(uri, permission, "Location '" + uri + "' isn't readable.");
    }
    if (permission.equals(Permission.WRITE)) {
      ensurePermission(uri, permission, "Location '" + uri + "' isn't writable.");
    }
    ensurePermission(uri, permission, "Location '" + uri + "' doesn't have permission '" + permission.name() + "'.");
  }

  private InputStream openAssetInputStream(Uri uri) throws IOException {
    // AssetManager expects no leading slash.
    String asset = uri.getPath().substring(1);
    return getContext().getAssets().open(asset);
  }

  private InputStream openResourceInputStream(String resourceName) throws IOException {
    int resourceId = getContext().getResources().getIdentifier(resourceName, "raw", getContext().getPackageName());
    if (resourceId == 0) {
      // this resource doesn't exist in the raw folder, so try drawable
      resourceId = getContext().getResources().getIdentifier(resourceName, "drawable", getContext().getPackageName());
      if (resourceId == 0) {
        throw new FileNotFoundException("No resource found with the name " + resourceName);
      }
    }
    return getContext().getResources().openRawResource(resourceId);
  }

  @ExpoMethod
  public void getInfoAsync(String uriStr, Map<String, Object> options, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      Uri absoluteUri = uri;
      if ("file".equals(uri.getScheme())) {
        uriStr = uriStr.substring(uriStr.indexOf(':') + 3);
        absoluteUri = Uri.parse(uriStr);
      }
      ensurePermission(absoluteUri, Permission.READ);
      if ("file".equals(uri.getScheme())) {
        File file = uriToFile(absoluteUri);
        Bundle result = new Bundle();
        if (file.exists()) {
          result.putBoolean("exists", true);
          result.putBoolean("isDirectory", file.isDirectory());
          result.putString("uri", Uri.fromFile(file).toString());
          if (options.containsKey("md5") && (Boolean) options.get("md5")) {
            result.putString("md5", md5(file));
          }
          result.putDouble("size", getFileSize(file));
          result.putDouble("modificationTime", 0.001 * file.lastModified());
          promise.resolve(result);
        } else {
          result.putBoolean("exists", false);
          result.putBoolean("isDirectory", false);
          promise.resolve(result);
        }
      } else if ("content".equals(uri.getScheme()) || "asset".equals(uri.getScheme()) || uri.getScheme() == null) {
        Bundle result = new Bundle();
        try {
          InputStream is;
          if ("content".equals(uri.getScheme())) {
            is = getContext().getContentResolver().openInputStream(uri);
          } else if ("asset".equals(uri.getScheme())) {
            is = openAssetInputStream(uri);
          } else {
            is = openResourceInputStream(uriStr);
          }
          if (is == null) {
            throw new FileNotFoundException();
          }
          result.putBoolean("exists", true);
          result.putBoolean("isDirectory", false);
          result.putString("uri", uri.toString());
          // NOTE: `.available()` is supposedly not a reliable source of size info, but it's been
          //       more reliable than querying `OpenableColumns.SIZE` in practice in tests ¯\_(ツ)_/¯
          result.putDouble("size", is.available());
          if (options.containsKey("md5") && (Boolean) options.get("md5")) {
            byte[] md5bytes = DigestUtils.md5(is);
            result.putString("md5", String.valueOf(Hex.encodeHex(md5bytes)));
          }
          promise.resolve(result);
        } catch (FileNotFoundException e) {
          result.putBoolean("exists", false);
          result.putBoolean("isDirectory", false);
          promise.resolve(result);
        }
      } else {
        throw new IOException("Unsupported scheme for location '" + uri + "'.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void readAsStringAsync(String uriStr, Map<String, Object> options, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.READ);

      // TODO:Bacon: Add more encoding types to match iOS
      String encoding = "utf8";
      if (options.containsKey("encoding") && options.get("encoding") instanceof String) {
        encoding = ((String) options.get("encoding")).toLowerCase();
      }
      String contents;
      if (encoding.equalsIgnoreCase("base64")) {
        try (InputStream inputStream = getInputStream(uri)) {
          if (options.containsKey("length") && options.containsKey("position")) {
            int length = ((Number) options.get("length")).intValue();
            int position = ((Number) options.get("position")).intValue();
            byte[] buffer = new byte[length];
            inputStream.skip(position);
            int bytesRead = inputStream.read(buffer, 0, length);
            contents = Base64.encodeToString(buffer, 0, bytesRead, Base64.NO_WRAP);
          } else {
            byte[] inputData = getInputStreamBytes(inputStream);
            contents = Base64.encodeToString(inputData, Base64.NO_WRAP);
          }
        }
      } else {
        if ("file".equals(uri.getScheme())) {
          contents = IOUtils.toString(new FileInputStream(uriToFile(uri)));
        } else if ("asset".equals(uri.getScheme())) {
          contents = IOUtils.toString(openAssetInputStream(uri));
        } else if (uri.getScheme() == null) {
          // this is probably an asset embedded by the packager in resources
          contents = IOUtils.toString(openResourceInputStream(uriStr));
        } else if (isSAFUri(uri)) {
          contents = IOUtils.toString(getContext().getContentResolver().openInputStream(uri));
        } else {
          throw new IOException("Unsupported scheme for location '" + uri + "'.");
        }
      }
      promise.resolve(contents);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void writeAsStringAsync(String uriStr, String string, Map<String, Object> options, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.WRITE);

      String encoding = "utf8";
      if (options.containsKey("encoding") && options.get("encoding") instanceof String) {
        encoding = ((String) options.get("encoding")).toLowerCase();
      }

      try (OutputStream out = getOutputStream(uri)) {
        if (encoding.equals("base64")) {
          byte[] bytes = Base64.decode(string, Base64.DEFAULT);
          out.write(bytes);
        } else {
          try (OutputStreamWriter writer = new OutputStreamWriter(out)) {
            writer.write(string);
          }
        }
      }
      promise.resolve(null);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void deleteAsync(String uriStr, Map<String, Object> options, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      Uri appendedUri = Uri.withAppendedPath(uri, "..");
      ensurePermission(appendedUri, Permission.WRITE, "Location '" + uri + "' isn't deletable.");
      if ("file".equals(uri.getScheme())) {
        File file = uriToFile(uri);
        if (file.exists()) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            FileUtils.forceDelete(file);
          } else {
            // to be removed once Android SDK 25 support is dropped
            forceDelete(file);
          }
          promise.resolve(null);
        } else {
          if (options.containsKey("idempotent") && (Boolean) options.get("idempotent")) {
            promise.resolve(null);
          } else {
            promise.reject("ERR_FILESYSTEM_CANNOT_FIND_FILE",
              "File '" + uri + "' could not be deleted because it could not be found");
          }
        }
      } else if (isSAFUri(uri)) {
        DocumentFile file = getNearestSAFFile(uri);
        if (file.exists()) {
          file.delete();
          promise.resolve(null);
        } else {
          if (options.containsKey("idempotent") && (Boolean) options.get("idempotent")) {
            promise.resolve(null);
          } else {
            promise.reject("ERR_FILESYSTEM_CANNOT_FIND_FILE",
              "File '" + uri + "' could not be deleted because it could not be found");
          }
        }
      } else {
        throw new IOException("Unsupported scheme for location '" + uri + "'.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void moveAsync(Map<String, Object> options, Promise promise) {
    try {
      if (!options.containsKey("from")) {
        promise.reject("ERR_FILESYSTEM_MISSING_PARAMETER", "`FileSystem.moveAsync` needs a `from` path.");
        return;
      }
      Uri fromUri = Uri.parse((String) options.get("from"));
      ensurePermission(Uri.withAppendedPath(fromUri, ".."), Permission.WRITE, "Location '" + fromUri + "' isn't movable.");
      if (!options.containsKey("to")) {
        promise.reject("ERR_FILESYSTEM_MISSING_PARAMETER", "`FileSystem.moveAsync` needs a `to` path.");
        return;
      }
      Uri toUri = Uri.parse((String) options.get("to"));
      ensurePermission(toUri, Permission.WRITE);

      if ("file".equals(fromUri.getScheme())) {
        File from = uriToFile(fromUri);
        File to = uriToFile(toUri);
        if (from.renameTo(to)) {
          promise.resolve(null);
        } else {
          promise.reject("ERR_FILESYSTEM_CANNOT_MOVE_FILE",
            "File '" + fromUri + "' could not be moved to '" + toUri + "'");
        }
      } else if (isSAFUri(fromUri)) {
        DocumentFile documentFile = getNearestSAFFile(fromUri);
        if (!documentFile.exists()) {
          promise.reject("ERR_FILESYSTEM_CANNOT_MOVE_FILE", "File '" + fromUri + "' could not be moved to '" + toUri + "'");
          return;
        }
        File output = new File(toUri.getPath());
        transformFilesFromSAF(documentFile, output, false);
        promise.resolve(null);
      } else {
        throw new IOException("Unsupported scheme for location '" + fromUri + "'.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void copyAsync(Map<String, Object> options, Promise promise) {
    try {
      if (!options.containsKey("from")) {
        promise.reject("ERR_FILESYSTEM_MISSING_PARAMETER", "`FileSystem.moveAsync` needs a `from` path.");
        return;
      }
      Uri fromUri = Uri.parse((String) options.get("from"));
      ensurePermission(fromUri, Permission.READ);
      if (!options.containsKey("to")) {
        promise.reject("ERR_FILESYSTEM_MISSING_PARAMETER", "`FileSystem.moveAsync` needs a `to` path.");
        return;
      }
      Uri toUri = Uri.parse((String) options.get("to"));
      ensurePermission(toUri, Permission.WRITE);

      if ("file".equals(fromUri.getScheme())) {
        File from = uriToFile(fromUri);
        File to = uriToFile(toUri);
        if (from.isDirectory()) {
          FileUtils.copyDirectory(from, to);
        } else {
          FileUtils.copyFile(from, to);
        }
        promise.resolve(null);
      } else if (isSAFUri(fromUri)) {
        DocumentFile documentFile = getNearestSAFFile(fromUri);
        if (!documentFile.exists()) {
          promise.reject("ERR_FILESYSTEM_CANNOT_FIND_FILE", "File '" + fromUri + "' could not be copied because it could not be found");
          return;
        }
        File output = new File(toUri.getPath());
        transformFilesFromSAF(documentFile, output, true);
        promise.resolve(null);
      } else if ("content".equals(fromUri.getScheme())) {
        InputStream in = getContext().getContentResolver().openInputStream(fromUri);
        OutputStream out = new FileOutputStream(uriToFile(toUri));
        IOUtils.copy(in, out);
        promise.resolve(null);
      } else if ("asset".equals(fromUri.getScheme())) {
        InputStream in = openAssetInputStream(fromUri);
        OutputStream out = new FileOutputStream(uriToFile(toUri));
        IOUtils.copy(in, out);
        promise.resolve(null);
      } else if (fromUri.getScheme() == null) {
        // this is probably an asset embedded by the packager in resources
        InputStream in = openResourceInputStream((String) options.get("from"));
        OutputStream out = new FileOutputStream(uriToFile(toUri));
        IOUtils.copy(in, out);
        promise.resolve(null);
      } else {
        throw new IOException("Unsupported scheme for location '" + fromUri + "'.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  private void transformFilesFromSAF(DocumentFile documentFile, File outputDir, boolean copy) throws IOException {
    if (!documentFile.exists()) {
      return;
    }

    if (!outputDir.exists() && !outputDir.mkdirs()) {
      throw new IOException("Couldn't create folder in output dir.");
    }

    if (documentFile.isDirectory()) {
      for (DocumentFile file : documentFile.listFiles()) {
        if (documentFile.getName() == null) {
          continue;
        }
        transformFilesFromSAF(file, new File(outputDir, documentFile.getName()), copy);
      }

      if (!copy) {
        documentFile.delete();
      }

      return;
    }

    if (documentFile.getName() == null) {
      return;
    }

    File newFile = new File(outputDir.getPath(), documentFile.getName());
    try (InputStream in = getContext().getContentResolver().openInputStream(documentFile.getUri());
         OutputStream out = new FileOutputStream(newFile)) {
      IOUtils.copy(in, out);
    }

    if (!copy) {
      documentFile.delete();
    }
  }

  @ExpoMethod
  public void makeDirectoryAsync(String uriStr, Map<String, Object> options, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.WRITE);
      if ("file".equals(uri.getScheme())) {
        File file = uriToFile(uri);
        boolean previouslyCreated = file.isDirectory();
        boolean setIntermediates = options.containsKey("intermediates") && (Boolean) options.get("intermediates");
        boolean success = setIntermediates ? file.mkdirs() : file.mkdir();
        if (success || (setIntermediates && previouslyCreated)) {
          promise.resolve(null);
        } else {
          promise.reject("ERR_FILESYSTEM_CANNOT_CREATE_DIRECTORY",
            "Directory '" + uri + "' could not be created or already exists.");
        }
      } else {
        throw new IOException("Unsupported scheme for location '" + uri + "'.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void readDirectoryAsync(String uriStr, Map<String, Object> options, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.READ);
      if ("file".equals(uri.getScheme())) {
        File file = uriToFile(uri);
        File[] children = file.listFiles();
        if (children != null) {
          List<String> result = new ArrayList<>();
          for (File child : children) {
            result.add(child.getName());
          }
          promise.resolve(result);
        } else {
          promise.reject("ERR_FILESYSTEM_CANNOT_READ_DIRECTORY",
            "Directory '" + uri + "' could not be read.");
        }
      } else if (isSAFUri(uri)) {
        promise.reject("ERR_FILESYSTEM_UNSUPPORTED_SCHEME",
          "Can't read Storage Access Framework directory, use StorageAccessFramework.readDirectoryAsync() instead.");
      } else {
        throw new IOException("Unsupported scheme for location '" + uri + "'.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void getTotalDiskCapacityAsync(Promise promise) {
    try {
      StatFs root = new StatFs(Environment.getDataDirectory().getAbsolutePath());
      long blockCount = root.getBlockCountLong();
      long blockSize = root.getBlockSizeLong();
      BigInteger capacity = BigInteger.valueOf(blockCount).multiply(BigInteger.valueOf(blockSize));
      //cast down to avoid overflow
      Double capacityDouble = Math.min(capacity.doubleValue(), Math.pow(2, 53) - 1);
      promise.resolve(capacityDouble);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject("ERR_FILESYSTEM_CANNOT_DETERMINE_DISK_CAPACITY", "Unable to access total disk capacity", e);
    }
  }

  @ExpoMethod
  public void getFreeDiskStorageAsync(Promise promise) {
    try {
      StatFs external = new StatFs(Environment.getDataDirectory().getAbsolutePath());
      long availableBlocks = external.getAvailableBlocksLong();
      long blockSize = external.getBlockSizeLong();

      BigInteger storage = BigInteger.valueOf(availableBlocks).multiply(BigInteger.valueOf(blockSize));
      //cast down to avoid overflow
      Double storageDouble = Math.min(storage.doubleValue(), Math.pow(2, 53) - 1);
      promise.resolve(storageDouble);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject("ERR_FILESYSTEM_CANNOT_DETERMINE_DISK_CAPACITY", "Unable to determine free disk storage capacity", e);
    }
  }

  @ExpoMethod
  public void getContentUriAsync(String uri, Promise promise) {
    try {
      final Uri fileUri = Uri.parse(uri);
      ensurePermission(fileUri, Permission.WRITE);
      ensurePermission(fileUri, Permission.READ);
      checkIfFileDirExists(fileUri);
      if ("file".equals(fileUri.getScheme())) {
        File file = uriToFile(fileUri);
        promise.resolve(contentUriFromFile(file).toString());
      } else {
        promise.reject("ERR_FILESYSTEM_CANNOT_READ_DIRECTORY", "No readable files with the uri: " + uri + ". Please use other uri.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  private Uri contentUriFromFile(File file) {
    try {
      Application application = mModuleRegistry.getModule(ActivityProvider.class).getCurrentActivity().getApplication();
      return FileSystemFileProvider.getUriForFile(application, application.getPackageName() + ".FileSystemFileProvider", file);
    } catch (Exception e) {
      throw e;
    }
  }

  @ExpoMethod
  public void readSAFDirectoryAsync(String uriStr, Map<String, Object> options, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.READ);
      if (isSAFUri(uri)) {
        DocumentFile file = DocumentFile.fromTreeUri(getContext(), uri);
        if (file == null || !file.exists() || !file.isDirectory()) {
          promise.reject("ERR_FILESYSTEM_CANNOT_READ_DIRECTORY",
            "Uri '" + uri + "' doesn't exist or isn't a directory.");
          return;
        }
        DocumentFile[] children = file.listFiles();
        List<String> result = new ArrayList<>();
        for (DocumentFile child : children) {
          result.add(child.getUri().toString());
        }
        promise.resolve(result);
      } else {
        throw new IOException("The URI '" + uri + "' is not a Storage Access Framework URI. Try using FileSystem.readDirectoryAsync instead.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void makeSAFDirectoryAsync(String uriStr, String dirName, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.WRITE);
      if (isSAFUri(uri)) {
        DocumentFile dir = getNearestSAFFile(uri);
        if (!dir.isDirectory()) {
          promise.reject("ERR_FILESYSTEM_CANNOT_CREATE_DIRECTORY", "Provided uri '" + uri + "' is not pointing to a directory.");
          return;
        }

        DocumentFile newDir = dir.createDirectory(dirName);
        if (newDir == null) {
          promise.reject("ERR_FILESYSTEM_CANNOT_CREATE_DIRECTORY", "Unknown error.");
          return;
        }

        promise.resolve(newDir.getUri().toString());
      } else {
        throw new IOException("The URI '" + uri + "' is not a Storage Access Framework URI. Try using FileSystem.makeDirectoryAsync instead.");
      }
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void createSAFFileAsync(String uriStr, String fileName, String mimeType, Promise promise) {
    try {
      Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.WRITE);
      if (isSAFUri(uri)) {
        DocumentFile dir = getNearestSAFFile(uri);
        if (!dir.isDirectory()) {
          promise.reject("ERR_FILESYSTEM_CANNOT_CREATE_FILE", "Provided uri '" + uri + "' is not pointing to a directory.");
          return;
        }

        DocumentFile newFile = dir.createFile(mimeType, fileName);
        if (newFile == null) {
          promise.reject("ERR_FILESYSTEM_CANNOT_CREATE_FILE", "Unknown error.");
          return;
        }

        promise.resolve(newFile.getUri().toString());
      } else {
        throw new IOException("The URI '" + uri + "' is not a Storage Access Framework URI.");
      }
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void requestDirectoryPermissionsAsync(final String initialFileUrl, Promise promise) {
    if (mDirPermissionsRequest != null) {
      promise.reject("ERR_FILESYSTEM_CANNOT_ASK_FOR_PERMISSIONS", "You have an unfinished permission request.");
      return;
    }

    try {
      Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Uri fileUri = initialFileUrl == null ? null : Uri.parse(initialFileUrl);
        if (fileUri != null) {
          intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, fileUri);
        }
      }

      Activity activity = mModuleRegistry.getModule(ActivityProvider.class).getCurrentActivity();
      if (activity == null) {
        promise.reject("ERR_FILESYSTEM_CANNOT_ASK_FOR_PERMISSIONS", "Can't find activity.");
        return;
      }

      mModuleRegistry.getModule(UIManager.class).registerActivityEventListener(this);

      mDirPermissionsRequest = promise;
      activity.startActivityForResult(intent, DIR_PERMISSIONS_REQUEST_CODE);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject("ERR_FILESYSTEM_CANNOT_ASK_FOR_PERMISSIONS", "Can't ask for permissions.", e);
    }
  }

  @Nullable
  private Request createUploadRequest(final String url, final String fileUriString, final Map<String, Object> options, final Promise promise, final RequestBodyDecorator decorator) {
    try {
      final Uri fileUri = Uri.parse(fileUriString);
      ensurePermission(fileUri, Permission.READ);
      checkIfFileExists(fileUri);

      if (!options.containsKey("httpMethod")) {
        promise.reject("ERR_FILESYSTEM_MISSING_HTTP_METHOD", "Missing HTTP method.", null);
        return null;
      }
      String method = (String) options.get("httpMethod");

      if (!options.containsKey("uploadType")) {
        promise.reject("ERR_FILESYSTEM_MISSING_UPLOAD_TYPE", "Missing upload type.", null);
        return null;
      }
      UploadType uploadType = UploadType.fromInt(((Double) options.get("uploadType")).intValue());

      Request.Builder requestBuilder = new Request.Builder().url(url);
      if (options.containsKey(HEADER_KEY)) {
        final Map<String, Object> headers = (Map<String, Object>) options.get(HEADER_KEY);
        for (String key : headers.keySet()) {
          requestBuilder.addHeader(key, headers.get(key).toString());
        }
      }

      File file = uriToFile(fileUri);
      if (uploadType == UploadType.BINARY_CONTENT) {
        RequestBody body = decorator.decorate(RequestBody.create(null, file));
        requestBuilder.method(method, body);
      } else if (uploadType == UploadType.MULTIPART) {
        MultipartBody.Builder bodyBuilder = new MultipartBody.Builder().setType(MultipartBody.FORM);

        if (options.containsKey("parameters")) {
          Map<String, Object> parametersMap = (Map<String, Object>) options.get("parameters");
          for (String key : parametersMap.keySet()) {
            bodyBuilder.addFormDataPart(key, String.valueOf(parametersMap.get(key)));
          }
        }

        String mimeType;
        if (options.containsKey("mimeType")) {
          mimeType = (String) options.get("mimeType");
        } else {
          mimeType = URLConnection.guessContentTypeFromName(file.getName());
        }

        String fieldName = file.getName();
        if (options.containsKey("fieldName")) {
          fieldName = (String) options.get("fieldName");
        }

        bodyBuilder.addFormDataPart(fieldName, file.getName(), decorator.decorate(RequestBody.create(mimeType != null ? MediaType.parse(mimeType) : null, file)));
        requestBuilder.method(method, bodyBuilder.build());
        return requestBuilder.build();
      } else {
        promise.reject("ERR_FILESYSTEM_INVALID_UPLOAD_TYPE", String.format("Invalid upload type: %s.", options.get("uploadType")), null);
        return null;
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }

    return null;
  }

  @ExpoMethod
  public void uploadAsync(final String url, final String fileUriString, final Map<String, Object> options, final Promise promise) {
    Request request = createUploadRequest(url, fileUriString, options, promise, requestBody -> requestBody);
    if (request == null) {
      return;
    }

    getOkHttpClient().newCall(request).enqueue(new Callback() {
      @Override
      public void onFailure(Call call, IOException e) {
        Log.e(TAG, String.valueOf(e.getMessage()));
        promise.reject(e);
      }

      @Override
      public void onResponse(Call call, Response response) {
        Bundle result = new Bundle();
        try {
          if (response.body() != null) {
            result.putString("body", response.body().string());
          } else {
            result.putString("body", null);
          }
        } catch (IOException exception) {
          promise.reject(exception);
          return;
        }
        result.putInt("status", response.code());
        result.putBundle("headers", translateHeaders(response.headers()));
        response.close();
        promise.resolve(result);
      }
    });
  }

  @ExpoMethod
  public void uploadTaskStartAsync(final String url, final String fileUriString, final String uuid, final Map<String, Object> options, final Promise promise) {
    CountingRequestListener progressListener = new CountingRequestListener() {
      private long mLastUpdate = -1;

      @Override
      public void onProgress(long bytesWritten, long contentLength) {
        EventEmitter eventEmitter = mModuleRegistry.getModule(EventEmitter.class);
        if (eventEmitter != null) {
          Bundle uploadProgress = new Bundle();
          Bundle uploadProgressData = new Bundle();
          long currentTime = System.currentTimeMillis();

          // Throttle events. Sending too many events will block the JS event loop.
          // Make sure to send the last event when we're at 100%.
          if (currentTime > mLastUpdate + MIN_EVENT_DT_MS || bytesWritten == contentLength) {
            mLastUpdate = currentTime;
            uploadProgressData.putDouble("totalByteSent", bytesWritten);
            uploadProgressData.putDouble("totalBytesExpectedToSend", contentLength);
            uploadProgress.putString("uuid", uuid);
            uploadProgress.putBundle("data", uploadProgressData);

            eventEmitter.emit(EXUploadProgressEventName, uploadProgress);
          }
        }
      }
    };

    Request request = createUploadRequest(
      url,
      fileUriString,
      options,
      promise,
      requestBody -> new CountingRequestBody(requestBody, progressListener)
    );
    if (request == null) {
      return;
    }

    Call call = getOkHttpClient().newCall(request);
    mTaskHandlers.put(uuid, new TaskHandler(call));
    call.enqueue(new Callback() {
      @Override
      public void onFailure(Call call, IOException e) {
        if (call.isCanceled()) {
          promise.resolve(null);
          return;
        }
        Log.e(TAG, String.valueOf(e.getMessage()));
        promise.reject(e);
      }

      @Override
      public void onResponse(Call call, Response response) {
        Bundle result = new Bundle();
        try {
          if (response.body() != null) {
            result.putString("body", response.body().string());
          } else {
            result.putString("body", null);
          }
        } catch (IOException exception) {
          promise.reject(exception);
          return;
        }
        result.putInt("status", response.code());
        result.putBundle("headers", translateHeaders(response.headers()));
        response.close();
        promise.resolve(result);
      }
    });
  }

  @ExpoMethod
  public void downloadAsync(String url, final String uriStr, final Map<String, Object> options, final Promise promise) {
    try {
      final Uri uri = Uri.parse(uriStr);
      ensurePermission(uri, Permission.WRITE);
      checkIfFileDirExists(uri);

      if (!url.contains(":")) {
        Context context = getContext();
        Resources resources = context.getResources();
        String packageName = context.getPackageName();
        int resourceId = resources.getIdentifier(url, "raw", packageName);

        BufferedSource bufferedSource = Okio.buffer(Okio.source(context.getResources().openRawResource(resourceId)));
        File file = uriToFile(uri);
        file.delete();
        BufferedSink sink = Okio.buffer(Okio.sink(file));
        sink.writeAll(bufferedSource);
        sink.close();

        Bundle result = new Bundle();
        result.putString("uri", Uri.fromFile(file).toString());
        if (options != null && options.containsKey("md5") && (Boolean) options.get("md5")) {
          result.putString("md5", md5(file));
        }
        promise.resolve(result);
      } else if ("file".equals(uri.getScheme())) {
        Request.Builder requestBuilder = new Request.Builder().url(url);
        if (options != null && options.containsKey(HEADER_KEY)) {
          try {
            final Map<String, Object> headers = (Map<String, Object>) options.get(HEADER_KEY);
            for (String key : headers.keySet()) {
              requestBuilder.addHeader(key, (String) headers.get(key));
            }
          } catch (ClassCastException exception) {
            promise.reject("ERR_FILESYSTEM_INVALID_HEADERS", "Invalid headers dictionary. Keys and values should be strings.", exception);
            return;
          }
        }
        getOkHttpClient().newCall(requestBuilder.build()).enqueue(new Callback() {
          @Override
          public void onFailure(Call call, IOException e) {
            Log.e(TAG, String.valueOf(e.getMessage()));
            promise.reject(e);
          }

          @Override
          public void onResponse(Call call, Response response) throws IOException {
            File file = uriToFile(uri);
            file.delete();
            BufferedSink sink = Okio.buffer(Okio.sink(file));
            sink.writeAll(response.body().source());
            sink.close();

            Bundle result = new Bundle();
            result.putString("uri", Uri.fromFile(file).toString());
            if (options != null && options.containsKey("md5") && (Boolean) options.get("md5")) {
              result.putString("md5", md5(file));
            }
            result.putInt("status", response.code());
            result.putBundle("headers", translateHeaders(response.headers()));
            response.close();
            promise.resolve(result);
          }
        });
      } else {
        throw new IOException("Unsupported scheme for location '" + uri + "'.");
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void networkTaskCancelAsync(final String uuid, final Promise promise) {
    TaskHandler taskHandler = this.mTaskHandlers.get(uuid);
    if (taskHandler != null) {
      taskHandler.call.cancel();
    }

    promise.resolve(null);
  }

  @ExpoMethod
  public void downloadResumableStartAsync(String url, final String fileUriStr, final String uuid, final Map<String, Object> options, final String resumeData, final Promise promise) {
    try {
      final Uri fileUri = Uri.parse(fileUriStr);
      checkIfFileDirExists(fileUri);
      if (!("file".equals(fileUri.getScheme()))) {
        throw new IOException("Unsupported scheme for location '" + fileUri + "'.");
      }

      final boolean isResume = resumeData != null;

      final ProgressListener progressListener = new ProgressListener() {
        long mLastUpdate = -1;

        @Override
        public void update(long bytesRead, long contentLength, boolean done) {
          EventEmitter eventEmitter = mModuleRegistry.getModule(EventEmitter.class);
          if (eventEmitter != null) {
            Bundle downloadProgress = new Bundle();
            Bundle downloadProgressData = new Bundle();
            long totalBytesWritten = isResume ? bytesRead + Long.parseLong(resumeData) : bytesRead;
            long totalBytesExpectedToWrite = isResume ? contentLength + Long.parseLong(resumeData) : contentLength;
            long currentTime = System.currentTimeMillis();

            // Throttle events. Sending too many events will block the JS event loop.
            // Make sure to send the last event when we're at 100%.
            if (currentTime > mLastUpdate + MIN_EVENT_DT_MS || totalBytesWritten == totalBytesExpectedToWrite) {
              mLastUpdate = currentTime;
              downloadProgressData.putDouble("totalBytesWritten", totalBytesWritten);
              downloadProgressData.putDouble("totalBytesExpectedToWrite", totalBytesExpectedToWrite);
              downloadProgress.putString("uuid", uuid);
              downloadProgress.putBundle("data", downloadProgressData);

              eventEmitter.emit(EXDownloadProgressEventName, downloadProgress);
            }
          }
        }
      };

      OkHttpClient client =
        getOkHttpClient().newBuilder()
          .addNetworkInterceptor(new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
              Response originalResponse = chain.proceed(chain.request());
              return originalResponse.newBuilder()
                .body(new ProgressResponseBody(originalResponse.body(), progressListener))
                .build();
            }
          })
          .build();

      Request.Builder requestBuilder = new Request.Builder();
      if (isResume) {
        requestBuilder.addHeader("Range", "bytes=" + resumeData + "-");
      }

      if (options != null && options.containsKey(HEADER_KEY)) {
        final Map<String, Object> headers = (Map<String, Object>) options.get(HEADER_KEY);
        for (String key : headers.keySet()) {
          requestBuilder.addHeader(key, headers.get(key).toString());
        }
      }

      Request request = requestBuilder.url(url).build();
      Call call = client.newCall(request);
      TaskHandler taskHandler = new DownloadTaskHandler(fileUri, call);
      this.mTaskHandlers.put(uuid, taskHandler);

      File file = uriToFile(fileUri);
      DownloadResumableTaskParams params = new DownloadResumableTaskParams(options, call, file, isResume, promise);
      DownloadResumableTask task = new DownloadResumableTask();
      task.execute(params);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }

  @ExpoMethod
  public void downloadResumablePauseAsync(final String uuid, final Promise promise) {
    TaskHandler taskHandler = this.mTaskHandlers.get(uuid);
    if (taskHandler == null) {
      Exception e = new IOException("No download object available");
      Log.e(TAG, e.getMessage());
      promise.reject(e);
      return;
    }

    if (!(taskHandler instanceof DownloadTaskHandler)) {
      promise.reject("ERR_FILESYSTEM_CANNOT_FIND_TASK", "Cannot find task.");
      return;
    }

    taskHandler.call.cancel();
    this.mTaskHandlers.remove(uuid);
    try {
      File file = uriToFile(((DownloadTaskHandler) taskHandler).fileUri);
      Bundle result = new Bundle();
      result.putString("resumeData", String.valueOf(file.length()));
      promise.resolve(result);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
      promise.reject(e);
    }
  }


  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    if (requestCode == DIR_PERMISSIONS_REQUEST_CODE && mDirPermissionsRequest != null) {
      Bundle result = new Bundle();

      if (resultCode == Activity.RESULT_OK) {
        Uri treeUri = data.getData();

        final int takeFlags = data.getFlags()
          & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        activity.getContentResolver().takePersistableUriPermission(treeUri, takeFlags);

        result.putBoolean("granted", true);
        result.putString("directoryUri", treeUri.toString());
      } else {
        result.putBoolean("granted", false);
      }

      mDirPermissionsRequest.resolve(result);
      mModuleRegistry.getModule(UIManager.class).unregisterActivityEventListener(this);
      mDirPermissionsRequest = null;
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
  }

  /**
   * Checks if the provided URI is compatible with the Storage Access Framework.
   * For more information check out https://developer.android.com/guide/topics/providers/document-provider.
   *
   * @param uri
   * @return whatever the provided URI is SAF URI
   */
  private static boolean isSAFUri(Uri uri) {
    return ("content".equals(uri.getScheme()) && uri.getHost().startsWith("com.android.externalstorage"));
  }

  private static byte[] getInputStreamBytes(InputStream inputStream) throws IOException {
    byte[] bytesResult;
    ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
    int bufferSize = 1024;
    byte[] buffer = new byte[bufferSize];
    try {
      int len;
      while ((len = inputStream.read(buffer)) != -1) {
        byteBuffer.write(buffer, 0, len);
      }
      bytesResult = byteBuffer.toByteArray();
    } finally {
      try {
        byteBuffer.close();
      } catch (IOException ignored) {
      }
    }
    return bytesResult;
  }

  private static class DownloadResumableTaskParams {
    Map<String, Object> options;
    Call call;
    File file;
    boolean isResume;
    Promise promise;

    DownloadResumableTaskParams(Map<String, Object> options, Call call, File file, boolean isResume, Promise promise) {
      this.options = options;
      this.call = call;
      this.file = file;
      this.isResume = isResume;
      this.promise = promise;
    }
  }

  private class DownloadResumableTask extends AsyncTask<DownloadResumableTaskParams, Void, Void> {
    @Override
    protected Void doInBackground(DownloadResumableTaskParams... params) {
      Call call = params[0].call;
      Promise promise = params[0].promise;
      File file = params[0].file;
      boolean isResume = params[0].isResume;
      Map<String, Object> options = params[0].options;

      try {
        Response response = call.execute();
        ResponseBody responseBody = response.body();
        BufferedInputStream input = new BufferedInputStream(responseBody.byteStream());
        OutputStream output;

        if (isResume) {
          output = new FileOutputStream(file, true);
        } else {
          output = new FileOutputStream(file, false);
        }

        byte[] data = new byte[1024];
        int count = 0;
        while ((count = input.read(data)) != -1) {
          output.write(data, 0, count);
        }

        Bundle result = new Bundle();
        result.putString("uri", Uri.fromFile(file).toString());
        if (options != null && options.containsKey("md5") && (Boolean) options.get("md5")) {
          result.putString("md5", md5(file));
        }
        result.putInt("status", response.code());
        result.putBundle("headers", translateHeaders(response.headers()));

        response.close();
        promise.resolve(result);
        return null;
      } catch (Exception e) {
        if (call.isCanceled()) {
          promise.resolve(null);
          return null;
        }

        Log.e(TAG, e.getMessage());
        promise.reject(e);
        return null;
      }
    }
  }

  // Copied out of React Native's `NetworkingModule.java`
  private static Bundle translateHeaders(Headers headers) {
    Bundle responseHeaders = new Bundle();
    for (int i = 0; i < headers.size(); i++) {
      String headerName = headers.name(i);
      // multiple values for the same header
      if (responseHeaders.get(headerName) != null) {
        responseHeaders.putString(
          headerName,
          responseHeaders.getString(headerName) + ", " + headers.value(i));
      } else {
        responseHeaders.putString(headerName, headers.value(i));
      }
    }
    return responseHeaders;
  }

  private static class TaskHandler {
    public final Call call;

    public TaskHandler(Call call) {
      this.call = call;
    }
  }

  private static class DownloadTaskHandler extends TaskHandler {
    public final Uri fileUri;


    public DownloadTaskHandler(Uri fileUri, Call call) {
      super(call);
      this.fileUri = fileUri;
    }
  }

  // https://github.com/square/okhttp/blob/master/samples/guide/src/main/java/okhttp3/recipes/Progress.java
  private static class ProgressResponseBody extends ResponseBody {

    private final ResponseBody responseBody;
    private final ProgressListener progressListener;
    private BufferedSource bufferedSource;

    ProgressResponseBody(ResponseBody responseBody, ProgressListener progressListener) {
      this.responseBody = responseBody;
      this.progressListener = progressListener;
    }

    @Override
    public MediaType contentType() {
      return responseBody.contentType();
    }

    @Override
    public long contentLength() {
      return responseBody.contentLength();
    }

    @Override
    public BufferedSource source() {
      if (bufferedSource == null) {
        bufferedSource = Okio.buffer(source(responseBody.source()));
      }
      return bufferedSource;
    }

    private Source source(Source source) {
      return new ForwardingSource(source) {
        long totalBytesRead = 0L;

        @Override
        public long read(Buffer sink, long byteCount) throws IOException {
          long bytesRead = super.read(sink, byteCount);
          // read() returns the number of bytes read, or -1 if this source is exhausted.
          totalBytesRead += bytesRead != -1 ? bytesRead : 0;
          progressListener.update(totalBytesRead, responseBody.contentLength(), bytesRead == -1);
          return bytesRead;
        }
      };
    }
  }

  interface ProgressListener {
    void update(long bytesRead, long contentLength, boolean done);
  }

  private synchronized OkHttpClient getOkHttpClient() {
    if (mClient == null) {
      OkHttpClient.Builder builder =
        new OkHttpClient.Builder()
          .connectTimeout(60, TimeUnit.SECONDS)
          .readTimeout(60, TimeUnit.SECONDS)
          .writeTimeout(60, TimeUnit.SECONDS);

      CookieHandler cookieHandler = mModuleRegistry.getModule(CookieHandler.class);
      if (cookieHandler != null) {
        builder.cookieJar(new JavaNetCookieJar(cookieHandler));
      }
      mClient = builder.build();
    }
    return mClient;
  }

  private String md5(File file) throws IOException {
    InputStream is = new FileInputStream(file);
    try {
      byte[] md5bytes = DigestUtils.md5(is);
      return String.valueOf(Hex.encodeHex(md5bytes));
    } finally {
      is.close();
    }
  }

  private void ensureDirExists(File dir) throws IOException {
    if (!(dir.isDirectory() || dir.mkdirs())) {
      throw new IOException("Couldn't create directory '" + dir + "'");
    }
  }

  /**
   * Concatenated copy of org.apache.commons.io@1.4.0#FileUtils#forceDelete
   * Newer version of commons-io uses File#toPath() under the hood that unsupported below Android SDK 26
   * See docs for reference https://commons.apache.org/proper/commons-io/javadocs/api-1.4/index.html
   */
  private void forceDelete(File file) throws IOException {
    if (file.isDirectory()) {
      File[] files = file.listFiles();
      if (files == null) {
        throw new IOException("Failed to list contents of " + file);
      }

      IOException exception = null;
      for (File f : files) {
        try {
          forceDelete(f);
        } catch (IOException ioe) {
          exception = ioe;
        }
      }

      if (null != exception) {
        throw exception;
      }

      if (!file.delete()) {
        throw new IOException("Unable to delete directory " + file + ".");
      }
    } else if (!file.delete()) {
      throw new IOException("Unable to delete file: " + file);
    }
  }

  private long getFileSize(File file) {
    if (!file.isDirectory()) {
      return file.length();
    }

    File[] content = file.listFiles();
    if (content == null) {
      return 0;
    }

    long size = 0;
    for (File item : content) {
      size += getFileSize(item);
    }

    return size;
  }

  private InputStream getInputStream(Uri uri) throws IOException {
    if ("file".equals(uri.getScheme())) {
      return new FileInputStream(uriToFile(uri));
    } else if ("asset".equals(uri.getScheme())) {
      return openAssetInputStream(uri);
    } else if (isSAFUri(uri)) {
      return getContext().getContentResolver().openInputStream(uri);
    }

    throw new IOException("Unsupported scheme for location '" + uri + "'.");
  }

  private OutputStream getOutputStream(Uri uri) throws IOException {
    if ("file".equals(uri.getScheme())) {
      return new FileOutputStream(uriToFile(uri));
    }

    if (isSAFUri(uri)) {
      return getContext().getContentResolver().openOutputStream(uri);
    }

    throw new IOException("Unsupported scheme for location '" + uri + "'.");
  }

  private DocumentFile getNearestSAFFile(Uri uri) {
    DocumentFile file = DocumentFile.fromSingleUri(getContext(), uri);
    if (file != null && file.isFile()) {
      return file;
    }

    return DocumentFile.fromTreeUri(getContext(), uri);
  }
}
