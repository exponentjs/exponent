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
import expo.modules.sensors.interfaces.services.BarometerService;

public class BarometerModule extends BaseSensorModule {
  public BarometerModule(Context reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ExpoBarometer";
  }

  @Override
  public String getEventName() {
    return "barometerDidUpdate";
  }

  @Override
  protected SensorService getSensorService() {
    return getModuleRegistry().getModule(BarometerService.class);
  }

  protected Bundle eventToMap(SensorEvent sensorEvent) {
    Bundle map = new Bundle();
    // TODO: Bacon: Can we get relative altitude?
    map.putDouble("pressure", sensorEvent.values[0]);
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
    Boolean isAvailable = mSensorManager.getDefaultSensor(Sensor.TYPE_PRESSURE) != null;
    promise.resolve(isAvailable);
  }
}
