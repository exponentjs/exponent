// Copyright 2015-present 650 Industries. All rights reserved.

package expo.modules.sensors.services;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener2;

import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;

import expo.modules.sensors.interfaces.SensorService;

public abstract class SubscribableSensorService extends BaseSensorService implements SensorService {
  protected static int DEFAULT_UPDATE_INTERVAL = 100;

  private int mListenersCount = 0;
  private Map<SensorServiceSubscription, Long> mSensorEventListenerLastUpdateMap = new WeakHashMap<>();

  SubscribableSensorService(Context reactContext) {
    super(reactContext);
  }

  // BaseService

  public void onExperienceForegrounded() {
    updateObserving();
  }

  public void onExperienceBackgrounded() {
    updateObserving();
  }

  // Modules API

  public expo.modules.sensors.interfaces.SensorServiceSubscription createSubscriptionForListener(SensorEventListener2 listener) {
    SensorServiceSubscription sensorServiceSubscription = new SensorServiceSubscription(this, listener);
    mSensorEventListenerLastUpdateMap.put(sensorServiceSubscription, 0L);
    return sensorServiceSubscription;
  }

  // SensorServiceSubscription API

  void onSubscriptionEnabledChanged(SensorServiceSubscription sensorServiceSubscription) {
    if (sensorServiceSubscription.isEnabled()) {
      mListenersCount += 1;
    } else {
      mListenersCount -= 1;
    }

    updateObserving();
  }

  void removeSubscription(SensorServiceSubscription sensorServiceSubscription) {
    mSensorEventListenerLastUpdateMap.remove(sensorServiceSubscription);
  }

  // android.hardware.SensorEventListener2

  @Override
  public void onSensorChanged(SensorEvent sensorEvent) {
    if (sensorEvent.sensor.getType() == getSensorType()) {
      long currentTime = System.currentTimeMillis();
      Set<SensorServiceSubscription> listeners = mSensorEventListenerLastUpdateMap.keySet();

      for(SensorServiceSubscription sensorServiceSubscription : listeners) {
        if (sensorServiceSubscription != null && sensorServiceSubscription.isEnabled()) {
          long lastUpdate = 0;
          if (mSensorEventListenerLastUpdateMap.containsKey(sensorServiceSubscription)) {
            lastUpdate = mSensorEventListenerLastUpdateMap.get(sensorServiceSubscription);
          }

          long updateInterval = DEFAULT_UPDATE_INTERVAL;
          if (sensorServiceSubscription.getUpdateInterval() != null) {
            updateInterval = sensorServiceSubscription.getUpdateInterval();
          }


          if ((currentTime - lastUpdate) > updateInterval) {
            sensorServiceSubscription.getSensorEventListener().onSensorChanged(sensorEvent);
            mSensorEventListenerLastUpdateMap.put(sensorServiceSubscription, currentTime);
          }
        }
      }
    }
  }

  @Override
  public void onAccuracyChanged(Sensor sensor, int accuracy) {
    if (sensor.getType() == getSensorType()) {
      for (SensorServiceSubscription subscription : mSensorEventListenerLastUpdateMap.keySet()) {
        if (subscription.isEnabled()) {
          subscription.getSensorEventListener().onAccuracyChanged(sensor, accuracy);
        }
      }
    }
  }

  @Override
  public void onFlushCompleted(Sensor sensor) {
    if (sensor.getType() == getSensorType()) {
      for (SensorServiceSubscription subscription : mSensorEventListenerLastUpdateMap.keySet()) {
        if (subscription.isEnabled()) {
          subscription.getSensorEventListener().onFlushCompleted(sensor);
        }
      }
    }
  }

  // Private helpers

  private void updateObserving() {
    // Start/stop observing according to the experience state
    if (mListenersCount > 0 && getExperienceIsForegrounded()) {
      super.startObserving();
    } else {
      super.stopObserving();
    }
  }
}
