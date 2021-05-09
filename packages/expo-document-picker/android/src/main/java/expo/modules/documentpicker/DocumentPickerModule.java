package expo.modules.documentpicker;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import androidx.annotation.Nullable;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ActivityEventListener;
import org.unimodules.core.interfaces.ActivityProvider;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.services.UIManager;
import org.unimodules.core.utilities.FileUtilities;

public class DocumentPickerModule extends ExportedModule implements ActivityEventListener {

  private static final String TAG = "ExpoDocumentPicker";

  private static int OPEN_DOCUMENT_CODE = 4137;
  private ModuleRegistry mModuleRegistry;
  private ActivityProvider mActivityProvider;
  private UIManager mUIManager;

  @Nullable
  private Promise mPromise;
  private boolean mCopyToCacheDirectory = true;

  public DocumentPickerModule(Context context) {
    super(context);
  }

  @Override
  public String getName() {
    return TAG;
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;

    if (mModuleRegistry != null) {
      mActivityProvider = mModuleRegistry.getModule(ActivityProvider.class);
      mUIManager = mModuleRegistry.getModule(UIManager.class);

      if (mUIManager != null) {
        mUIManager.registerActivityEventListener(this);
      }
    }
  }

  @ExpoMethod
  public void getDocumentAsync(Map<String, Object> options, final Promise promise) {
    if (mPromise != null) {
      promise.reject("E_DOCUMENT_PICKER", "Different document picking in progress. Await other document picking first.");
      return;
    }

    // mUIManger nullability suggests there's no listener registered for Activity result
    if (mActivityProvider == null || mUIManager == null) {
      promise.reject("E_MISSING_MODULES", "Missing core modules. Are you sure all the installed Expo modules are properly linked?");
      return;
    }

    mPromise = promise;

    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    String type = (String)options.get("type");
    if (type != null) {
      List<String> types = Arrays.asList(type.split(","));
      if (types.size() == 1) {
        intent.setType((String) options.get("type"));
      } else {
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_MIME_TYPES, types.toArray());
      }
    } else {
      intent.setType("*/*");
    }

    mCopyToCacheDirectory = options.get("copyToCacheDirectory") == null || (Boolean) options.get("copyToCacheDirectory");
    mActivityProvider.getCurrentActivity().startActivityForResult(intent, OPEN_DOCUMENT_CODE);
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    if (requestCode == OPEN_DOCUMENT_CODE) {
      if (mPromise == null) {
        return;
      }

      Bundle result = new Bundle();
      if (resultCode == Activity.RESULT_OK) {
        result.putString("type", "success");
        Uri uri = data.getData();
        final ContentResolver contentResolver = getContext().getContentResolver();
        try (Cursor cursor = contentResolver.query(uri, null, null, null, null)) {
          if (cursor != null && cursor.moveToFirst()) {
            String displayName = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME));
            result.putString("name", displayName);
            if (mCopyToCacheDirectory) {
              result.putString("uri", Uri.fromFile(new File(writeDocument(uri, contentResolver, displayName))).toString());
            } else {
              result.putString("uri", uri.toString());
            }

            int sizeColumnIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
            if (!cursor.isNull(sizeColumnIndex)) {
              int size = cursor.getInt(sizeColumnIndex);
              result.putInt("size", size);
            } else {
              result.putParcelable("size", null);
            }
          }
        }
      } else {
        result.putString("type", "cancel");
      }
      mPromise.resolve(result);
      mPromise = null;
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    // do nothing
  }

  private String writeDocument(Uri uri, ContentResolver contentResolver, String name) {
    InputStream in;
    OutputStream out = null;
    String path = null;
    try {
      in = contentResolver.openInputStream(uri);
      path = FileUtilities.generateOutputPath(
          getContext().getCacheDir(),
          "DocumentPicker",
          FilenameUtils.getExtension(name)
      );
      File file = new File(path);
      out = new FileOutputStream(file);
      IOUtils.copy(in, out);
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (out != null) {
        try {
          out.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
    return path;
  }
}
