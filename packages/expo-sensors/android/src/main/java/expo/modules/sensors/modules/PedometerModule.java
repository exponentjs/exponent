// Copyright 2015-present 650 Industries. All rights reserved.

package expo.modules.sensors.modules;

import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.SensorEvent;
import android.os.Bundle;

import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;
import expo.modules.sensors.interfaces.SensorService;
import expo.modules.sensors.interfaces.services.PedometerService;

public class PedometerModule extends BaseSensorModule {
  private Integer stepsAtTheBeginning = null;

  public PedometerModule(Context reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ExponentPedometer";
  }

  @Override
  public String getEventName() {
    return "Exponent.pedometerUpdate";
  }

  @Override
  protected SensorService getSensorService() {
    return getModuleRegistry().getModule(PedometerService.class);
  }

  protected Bundle eventToMap(SensorEvent sensorEvent) {
    if (stepsAtTheBeginning == null) {
      stepsAtTheBeginning = (int) sensorEvent.values[0] - 1;
    }
    Bundle map = new Bundle();
    map.putDouble("steps", sensorEvent.values[0] - stepsAtTheBeginning);
    return map;
  }

  @ExpoMethod
  public void startObserving(Promise promise) {
    super.startObserving();
    stepsAtTheBeginning = null;
    promise.resolve(null);
  }

  @ExpoMethod
  public void stopObserving(Promise promise) {
    super.stopObserving();
    stepsAtTheBeginning = null;
    promise.resolve(null);
  }

  @ExpoMethod
  public void setUpdateInterval(int updateInterval, Promise promise) {
    super.setUpdateInterval(updateInterval);
    promise.resolve(null);
  }

  @ExpoMethod
  public void isAvailableAsync(Promise promise) {
    promise.resolve(getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_SENSOR_STEP_COUNTER));
  }

  @ExpoMethod
  public void getStepCountAsync(Integer startDate, Integer endDate, Promise promise) {
    promise.reject("E_NOT_AVAILABLE", "Getting step count for date range is not supported on Android yet.");
  }
}
