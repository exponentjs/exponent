package expo.modules.camera.tasks;

import org.unimodules.core.errors.CodedRuntimeException;

class BarCodeScanError extends CodedRuntimeException {
  private static final String CODE = "ERR_BAR_CODE_SCAN_ERROR";

  public BarCodeScanError(String message) {
    super(message);
  }

  public BarCodeScanError(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public String getCode() {
    return CODE;
  }
}
