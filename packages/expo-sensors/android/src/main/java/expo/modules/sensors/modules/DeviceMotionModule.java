package expo.modules.sensors.modules;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener2;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.view.Choreographer;
import android.view.Surface;
import android.view.WindowManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.lang.Math;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.services.EventEmitter;
import org.unimodules.core.interfaces.services.UIManager;
import expo.modules.sensors.interfaces.SensorService;
import expo.modules.sensors.interfaces.SensorServiceSubscription;
import expo.modules.sensors.interfaces.services.AccelerometerService;
import expo.modules.sensors.interfaces.services.GravitySensorService;
import expo.modules.sensors.interfaces.services.GyroscopeService;
import expo.modules.sensors.interfaces.services.LinearAccelerationSensorService;
import expo.modules.sensors.interfaces.services.RotationVectorSensorService;

public class DeviceMotionModule extends ExportedModule implements SensorEventListener2 {
  private long mLastUpdate = 0;
  private float mUpdateInterval = 1.0f / 60.0f;
  private float[] mRotationMatrix = new float[9];
  private float[] mRotationResult = new float[3];

  private SensorEvent mAccelerationEvent;
  private SensorEvent mAccelerationIncludingGravityEvent;
  private SensorEvent mRotationEvent;
  private SensorEvent mRotationRateEvent;
  private SensorEvent mGravityEvent;

  private List<SensorServiceSubscription> mServiceSubscriptions = null;

  private UIManager mUiManager = null;
  private ModuleRegistry mModuleRegistry = null;

  public DeviceMotionModule(Context context) {
    super(context);
  }

  @Override
  public String getName() {
    return "ExponentDeviceMotion";
  }

  @Override
  public Map<String, Object> getConstants() {
    return Collections.unmodifiableMap(new HashMap<String, Object>() {
      {
        // Gravity on the planet this module supports (currently just Earth) represented as m/s^2.
        put("Gravity", 9.80665);
      }
    });
  }

  @ExpoMethod
  public void setUpdateInterval(int updateInterval, Promise promise) {
    mUpdateInterval = updateInterval;
    promise.resolve(null);
  }

  @ExpoMethod
  public void startObserving(Promise promise) {
    if (mServiceSubscriptions == null) {
      mServiceSubscriptions = new ArrayList<>();
      for (SensorService kernelService : getSensorKernelServices()) {
        SensorServiceSubscription subscription = kernelService.createSubscriptionForListener(this);
        // We want handle update interval on our own,
        // because we need to coordinate updates from multiple sensor services.
        subscription.setUpdateInterval(0);
        mServiceSubscriptions.add(subscription);
      }
    }

    for (SensorServiceSubscription subscription : mServiceSubscriptions) {
      subscription.start();
    }

    promise.resolve(null);
  }

  @ExpoMethod
  public void stopObserving(final Promise promise) {
    mUiManager.runOnUiQueueThread(new Runnable() {
      @Override
      public void run() {
        for (SensorServiceSubscription subscription : mServiceSubscriptions) {
          subscription.stop();
        }
        mCurrentFrameCallback.stop();
        promise.resolve(null);
      }
    });
  }

  @ExpoMethod
  public void isAvailableAsync(Promise promise) {
    SensorManager mSensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
    ArrayList<Integer> sensorTypes = new ArrayList<>(Arrays.asList(Sensor.TYPE_GYROSCOPE, Sensor.TYPE_ACCELEROMETER, Sensor.TYPE_LINEAR_ACCELERATION, Sensor.TYPE_ROTATION_VECTOR, Sensor.TYPE_GRAVITY));

    for (Integer type : sensorTypes) {
      if (mSensorManager.getDefaultSensor(type) == null) {
        promise.resolve(false);
        return;
      }
    }

    promise.resolve(true);
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mEventEmitter = moduleRegistry.getModule(EventEmitter.class);
    mUiManager = moduleRegistry.getModule(UIManager.class);
    mModuleRegistry = moduleRegistry;
  }

  private List<SensorService> getSensorKernelServices() {
    return Arrays.asList(
        mModuleRegistry.getModule(GyroscopeService.class),
        mModuleRegistry.getModule(LinearAccelerationSensorService.class),
        mModuleRegistry.getModule(AccelerometerService.class),
        mModuleRegistry.getModule(RotationVectorSensorService.class),
        mModuleRegistry.getModule(GravitySensorService.class)
    );
  }

  @Override
  public void onSensorChanged(SensorEvent sensorEvent) {
    Sensor sensor = sensorEvent.sensor;

    if (sensor.getType() == Sensor.TYPE_GYROSCOPE) {
      mRotationRateEvent = sensorEvent;
    } else if (sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
      mAccelerationIncludingGravityEvent = sensorEvent;
    } else if (sensor.getType() == Sensor.TYPE_LINEAR_ACCELERATION) {
      mAccelerationEvent = sensorEvent;
    } else if (sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
      mRotationEvent = sensorEvent;
    } else if (sensor.getType() == Sensor.TYPE_GRAVITY) {
      mGravityEvent = sensorEvent;
    }

    mCurrentFrameCallback.maybePostFromNonUI();
  }

  @Override
  public void onAccuracyChanged(Sensor sensor, int accuracy) {
    // do nothing
  }

  @Override
  public void onFlushCompleted(Sensor sensor) {
    // do nothing
  }

  private ScheduleDispatchFrameCallback mCurrentFrameCallback = new ScheduleDispatchFrameCallback();
  private DispatchEventRunnable mDispatchEventRunnable = new DispatchEventRunnable();
  private EventEmitter mEventEmitter;

  private class ScheduleDispatchFrameCallback implements Choreographer.FrameCallback {
    private volatile boolean mIsPosted = false;
    private boolean mShouldStop = false;

    public void doFrame(long frameTimeNanos) {
      if (mShouldStop) {
        mIsPosted = false;
      } else {
        post();
      }

      long curTime = System.currentTimeMillis();
      if ((curTime - mLastUpdate) > mUpdateInterval) {
        mUiManager.runOnClientCodeQueueThread(mDispatchEventRunnable);
        mLastUpdate = curTime;
      }
    }

    public void stop() {
      mShouldStop = true;
    }

    public void maybePost() {
      if (!mIsPosted) {
        mIsPosted = true;
        post();
      }
    }

    private void post() {
      Choreographer.getInstance().postFrameCallback(mCurrentFrameCallback);
    }

    public void maybePostFromNonUI() {
      if (mIsPosted) {
        return;
      }

      mUiManager.runOnUiQueueThread(new Runnable() {
        @Override
        public void run() {
          maybePost();
        }
      });
    }
  }

  private class DispatchEventRunnable implements Runnable {
    @Override
    public void run() {
      mEventEmitter.emit("deviceMotionDidUpdate", eventsToMap());
    }
  }

  private Bundle eventsToMap() {
    Bundle map = new Bundle();
    Bundle acceleration = new Bundle();
    Bundle accelerationIncludingGravity = new Bundle();
    Bundle rotation = new Bundle();
    Bundle rotationRate = new Bundle();
    double interval = 0;
    if (mAccelerationEvent != null) {
      acceleration.putDouble("x", mAccelerationEvent.values[0]);
      acceleration.putDouble("y", mAccelerationEvent.values[1]);
      acceleration.putDouble("z", mAccelerationEvent.values[2]);
      map.putBundle("acceleration", acceleration);
      interval = mAccelerationEvent.timestamp;
    }

    if (mAccelerationIncludingGravityEvent != null && mGravityEvent != null) {
      accelerationIncludingGravity.putDouble("x", mAccelerationIncludingGravityEvent.values[0] - 2 * mGravityEvent.values[0]);
      accelerationIncludingGravity.putDouble("y", mAccelerationIncludingGravityEvent.values[1] - 2 * mGravityEvent.values[1]);
      accelerationIncludingGravity.putDouble("z", mAccelerationIncludingGravityEvent.values[2] - 2 * mGravityEvent.values[2]);
      map.putBundle("accelerationIncludingGravity", accelerationIncludingGravity);
      interval = mAccelerationIncludingGravityEvent.timestamp;
    }

    if (mRotationRateEvent != null) {
      rotationRate.putDouble("alpha", Math.toDegrees(mRotationRateEvent.values[0]));
      rotationRate.putDouble("beta", Math.toDegrees(mRotationRateEvent.values[1]));
      rotationRate.putDouble("gamma", Math.toDegrees(mRotationRateEvent.values[2]));
      map.putBundle("rotationRate", rotationRate);
      interval = mRotationRateEvent.timestamp;
    }

    if (mRotationEvent != null) {
      SensorManager.getRotationMatrixFromVector(mRotationMatrix, mRotationEvent.values);
      SensorManager.getOrientation(mRotationMatrix, mRotationResult);
      rotation.putDouble("alpha", -mRotationResult[0]);
      rotation.putDouble("beta", -mRotationResult[1]);
      rotation.putDouble("gamma", mRotationResult[2]);
      map.putBundle("rotation", rotation);
      interval = mRotationEvent.timestamp;
    }

    map.putDouble("interval", interval);
    map.putInt("orientation", getOrientation());

    return map;
  }

  private int getOrientation() {
    WindowManager windowManager = (WindowManager) getContext().getSystemService(Context.WINDOW_SERVICE);

    if (windowManager != null) {
      switch (windowManager.getDefaultDisplay().getRotation()) {
        case Surface.ROTATION_0:
          return 0;
        case Surface.ROTATION_90:
          return 90;
        case Surface.ROTATION_180:
          return 180;
        case Surface.ROTATION_270:
          return -90;
        default:
          // pass to global return
      }
    }

    return 0;
  }
}
