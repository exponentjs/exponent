// Copyright 2015-present 650 Industries. All rights reserved.

package expo.modules.sensors.services;

import android.hardware.SensorEventListener2;

public class SensorServiceSubscription implements expo.modules.sensors.interfaces.SensorServiceSubscription {
  private boolean mIsEnabled = false;
  private Long mUpdateInterval = null;
  private boolean mHasBeenReleased = false;
  private final SubscribableSensorService mSubscribableSensorService;
  private final SensorEventListener2 mSensorEventListener;

  SensorServiceSubscription(SubscribableSensorService kernelService, SensorEventListener2 listener) {
    mSensorEventListener = listener;
    mSubscribableSensorService = kernelService;
  }

  public void start() {
    assertSubscriptionIsAlive();
    if (!mIsEnabled) {
      mIsEnabled = true;
      mSubscribableSensorService.onSubscriptionEnabledChanged(this);
    }
  }

  public boolean isEnabled() {
    return mIsEnabled;
  }

  public Long getUpdateInterval() {
    return mUpdateInterval;
  }

  SensorEventListener2 getSensorEventListener() {
    return mSensorEventListener;
  }

  public void setUpdateInterval(long updateInterval) {
    assertSubscriptionIsAlive();
    mUpdateInterval = updateInterval;
  }

  public void stop() {
    if (mIsEnabled) {
      mIsEnabled = false;
      mSubscribableSensorService.onSubscriptionEnabledChanged(this);
    }
  }

  public void release() {
    if (!mHasBeenReleased) {
      mSubscribableSensorService.removeSubscription(this);
      mHasBeenReleased = true;
    }
  }

  private void assertSubscriptionIsAlive() {
    if (mHasBeenReleased) {
      throw new IllegalStateException("Subscription has been released, cannot call methods on a released subscription.");
    }
  }
}
