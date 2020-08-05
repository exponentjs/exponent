package expo.modules.camera.events;

import android.os.Bundle;

import org.unimodules.core.interfaces.CodedThrowable;
import org.unimodules.core.interfaces.services.EventEmitter;

import androidx.core.util.Pools;
import expo.modules.camera.CameraViewManager;

public class BarCodeScanErrorEvent extends EventEmitter.BaseEvent {
  private static final Pools.SynchronizedPool<BarCodeScanErrorEvent> EVENTS_POOL =
    new Pools.SynchronizedPool<>(3);

  private CodedThrowable mError;
  private int mViewTag;

  private BarCodeScanErrorEvent() {
  }

  public static BarCodeScanErrorEvent obtain(int viewTag, CodedThrowable error) {
    BarCodeScanErrorEvent event = EVENTS_POOL.acquire();
    if (event == null) {
      event = new BarCodeScanErrorEvent();
    }
    event.init(viewTag, error);
    return event;
  }

  private void init(int viewTag, CodedThrowable error) {
    mViewTag = viewTag;
    mError = error;
  }

  @Override
  public short getCoalescingKey() {
    return 0;
  }

  @Override
  public String getEventName() {
    return CameraViewManager.Events.EVENT_ON_BAR_CODE_SCAN_ERROR.toString();
  }

  @Override
  public Bundle getEventBody() {
    Bundle event = new Bundle();
    event.putInt("target", mViewTag);

    if (mError != null) {
      Bundle error = new Bundle();
      error.putString("code", mError.getCode());
      error.putString("message", mError.getMessage());
      event.putBundle("error", error);
    }

    return event;
  }
}
