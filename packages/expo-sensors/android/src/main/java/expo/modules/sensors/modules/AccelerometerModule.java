// Copyright 2015-present 650 Industries. All rights reserved.

package expo.modules.sensors.modules;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorManager;
import android.os.Bundle;

import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;
import expo.modules.sensors.interfaces.SensorService;
import expo.modules.sensors.interfaces.services.AccelerometerService;

public class AccelerometerModule extends BaseSensorModule {
  public AccelerometerModule(Context reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ExponentAccelerometer";
  }

  @Override
  public String getEventName() {
    return "accelerometerDidUpdate";
  }

  @Override
  protected SensorService getSensorService() {
    return getModuleRegistry().getModule(AccelerometerService.class);
  }

  protected Bundle eventToMap(SensorEvent sensorEvent) {
    Bundle map = new Bundle();
    map.putDouble("x", sensorEvent.values[0] / SensorManager.GRAVITY_EARTH);
    map.putDouble("y", sensorEvent.values[1] / SensorManager.GRAVITY_EARTH);
    map.putDouble("z", sensorEvent.values[2] / SensorManager.GRAVITY_EARTH);
    return map;
  }

  @ExpoMethod
  public void startObserving(Promise promise) {
    super.startObserving();
    promise.resolve(null);
  }

  @ExpoMethod
  public void stopObserving(Promise promise) {
    super.stopObserving();
    promise.resolve(null);
  }

  @ExpoMethod
  public void setUpdateInterval(int updateInterval, Promise promise) {
    super.setUpdateInterval(updateInterval);
    promise.resolve(null);
  }

  @ExpoMethod
  public void isAvailableAsync(Promise promise) {
    SensorManager mSensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
    boolean isAvailable = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null;
    promise.resolve(isAvailable);
  }
}
