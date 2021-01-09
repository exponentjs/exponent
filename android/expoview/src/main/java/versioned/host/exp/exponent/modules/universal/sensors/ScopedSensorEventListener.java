package versioned.host.exp.exponent.modules.universal.sensors;

import android.hardware.SensorEvent;
import android.hardware.SensorEventListener2;

import host.exp.exponent.kernel.services.sensors.SensorEventListener;

public class ScopedSensorEventListener implements SensorEventListener {
  private SensorEventListener2 mEventListener;

  ScopedSensorEventListener(SensorEventListener2 eventListener) {
    mEventListener = eventListener;
  }

  @Override
  public void onSensorDataChanged(SensorEvent sensorEvent) {
    mEventListener.onSensorChanged(sensorEvent);
  }
}
