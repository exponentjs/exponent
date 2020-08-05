package expo.modules.camera.tasks;

import android.util.Pair;

import org.unimodules.core.errors.CodedRuntimeException;
import org.unimodules.core.interfaces.CodedThrowable;
import org.unimodules.interfaces.barcodescanner.BarCodeScanner;
import org.unimodules.interfaces.barcodescanner.BarCodeScannerResult;

public class BarCodeScannerAsyncTask extends android.os.AsyncTask<Void, Void, Pair<BarCodeScannerResult, CodedThrowable>> {
  private final BarCodeScanner mBarCodeScanner;
  private byte[] mImageData;
  private int mWidth;
  private int mHeight;
  private int mRotation;
  private BarCodeScannerAsyncTaskDelegate mDelegate;

  public BarCodeScannerAsyncTask(
    BarCodeScannerAsyncTaskDelegate delegate,
    BarCodeScanner barCodeScanner,
    byte[] imageData,
    int width,
    int height,
    int rotation
  ) {
    mImageData = imageData;
    mWidth = width;
    mHeight = height;
    mDelegate = delegate;
    mBarCodeScanner = barCodeScanner;
    mRotation = rotation;
  }

  @Override
  protected Pair<BarCodeScannerResult, CodedThrowable> doInBackground(Void... ignored) {
    if (isCancelled() || mDelegate == null) {
      return null;
    }

    if (mBarCodeScanner == null) {
      // If there's no bar code scanner available, we return a readable error early.
      return new Pair<>(null, new BarCodeScanError("No bar code scanner available."));
    }

    try {
      BarCodeScannerResult result = mBarCodeScanner.scan(mImageData, mWidth, mHeight, mRotation);
      return new Pair<>(result, null);
    } catch (CodedRuntimeException exception) {
      // If a coded exception is thrown, it should be readable so we return it.
      return new Pair<>(null, exception);
    } catch (Exception e) {
      // If an exception is thrown, we wrap it with a coded class.
      return new Pair<>(null, new BarCodeScanError("Unexpected error occurred while scanning for bar codes.", e));
    }
  }

  @Override
  protected void onPostExecute(Pair<BarCodeScannerResult, CodedThrowable> result) {
    super.onPostExecute(result);
    if (result != null) {
      if (result.first != null) {
        mDelegate.onBarCodeScanned(result.first);
      }
      if (result.second != null) {
        mDelegate.onBarCodeScanError(result.second);
      }
    }
    mDelegate.onBarCodeScanningTaskCompleted();
  }
}
