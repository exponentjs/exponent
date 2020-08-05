package expo.modules.camera.tasks;

import org.unimodules.core.interfaces.CodedThrowable;
import org.unimodules.interfaces.barcodescanner.BarCodeScannerResult;

public interface BarCodeScannerAsyncTaskDelegate {
  void onBarCodeScanned(BarCodeScannerResult barCode);
  void onBarCodeScanError(CodedThrowable throwable);
  void onBarCodeScanningTaskCompleted();
}
