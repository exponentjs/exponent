package expo.modules.sensors.interfaces;

import android.hardware.SensorEventListener2;

public interface SensorService {
  SensorServiceSubscription createSubscriptionForListener(SensorEventListener2 sensorEventListener);
}
