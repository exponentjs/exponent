package expo.modules.barcodescanner;

import android.graphics.Point;
import android.os.Bundle;
import android.support.v4.util.Pools;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import expo.core.interfaces.services.EventEmitter;
import expo.interfaces.barcodescanner.BarCodeScannerResult;

public class BarCodeScannedEvent extends EventEmitter.BaseEvent {
  private static final Pools.SynchronizedPool<BarCodeScannedEvent> EVENTS_POOL =
      new Pools.SynchronizedPool<>(3);

  private BarCodeScannerResult mBarCode;
  private int mViewTag;
  private List<Integer> mCornerPoints;
  private int mHeight;
  private int mWidth;

  private BarCodeScannedEvent() {}

  public static BarCodeScannedEvent obtain(int viewTag, BarCodeScannerResult barCode, int height, int width) {
    BarCodeScannedEvent event = EVENTS_POOL.acquire();
    if (event == null) {
      event = new BarCodeScannedEvent();
    }
    event.init(viewTag, barCode, height, width);
    return event;
  }

  private void init(int viewTag, BarCodeScannerResult barCode, int height, int width) {
    mViewTag = viewTag;
    mBarCode = barCode;
    mHeight = height;
    mWidth = width;
    mCornerPoints = barCode.getCornerPoints();
  }

  /**
   * We want every distinct barcode to be reported to the JS listener.
   * If we return some static value as a coalescing key there may be two barcode events
   * containing two different barcodes waiting to be transmitted to JS
   * that would get coalesced (because both of them would have the same coalescing key).
   * So let's differentiate them with a hash of the contents (mod short's max value).
   */
  @Override
  public short getCoalescingKey() {
    int hashCode = mBarCode.getValue().hashCode() % Short.MAX_VALUE;
    return (short) hashCode;
  }

  @Override
  public String getEventName() {
    return BarCodeScannerViewManager.Events.EVENT_ON_BAR_CODE_SCANNED.toString();
  }

  @Override
  public Bundle getEventBody() {
    Bundle event = new Bundle();
    event.putInt("target", mViewTag);
    event.putString("data", mBarCode.getValue());
    event.putInt("type", mBarCode.getType());
    if (!mCornerPoints.isEmpty()) {
      event.putIntegerArrayList("bounds", (ArrayList<Integer>) mCornerPoints);
      event.putInt("width", mWidth);
      event.putInt("height", mHeight);
    }
    return event;
  }
}
