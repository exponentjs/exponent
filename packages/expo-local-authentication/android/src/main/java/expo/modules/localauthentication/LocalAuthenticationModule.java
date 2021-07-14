// Copyright 2015-present 650 Industries. All rights reserved.

package expo.modules.localauthentication;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;

import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ActivityEventListener;
import org.unimodules.core.interfaces.ActivityProvider;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.services.UIManager;

public class LocalAuthenticationModule extends ExportedModule implements ActivityEventListener {
  private final BiometricManager mBiometricManager;
  private final PackageManager mPackageManager;
  private BiometricPrompt mBiometricPrompt;
  private Promise mPromise;
  private boolean mIsAuthenticating = false;
  private ModuleRegistry mModuleRegistry;
  private UIManager mUIManager;

  private static final int AUTHENTICATION_TYPE_FINGERPRINT = 1;
  private static final int AUTHENTICATION_TYPE_FACIAL_RECOGNITION = 2;
  private static final int AUTHENTICATION_TYPE_IRIS = 3;

  private static final int SECURITY_LEVEL_NONE = 0;
  private static final int SECURITY_LEVEL_SECRET = 1;
  private static final int SECURITY_LEVEL_BIOMETRIC = 2;

  private final BiometricPrompt.AuthenticationCallback mAuthenticationCallback =
          new BiometricPrompt.AuthenticationCallback () {
            @Override
            public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
              mIsAuthenticating = false;
              mBiometricPrompt = null;
              Bundle successResult = new Bundle();
              successResult.putBoolean("success", true);
              safeResolve(successResult);
            }

            @Override
            public void onAuthenticationError(int errMsgId, CharSequence errString) {
              mIsAuthenticating = false;
              mBiometricPrompt = null;
              Bundle errorResult = new Bundle();
              errorResult.putBoolean("success", false);
              errorResult.putString("error", convertErrorCode(errMsgId));
              errorResult.putString("message", errString.toString());
              safeResolve(errorResult);
            }
          };

  public LocalAuthenticationModule(Context context) {
    super(context);

    mBiometricManager = BiometricManager.from(context);
    mPackageManager = context.getPackageManager();
  }

  @Override
  public String getName() {
    return "ExpoLocalAuthentication";
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
    mUIManager = moduleRegistry.getModule(UIManager.class);
    mUIManager.registerActivityEventListener(this);
  }

  @ExpoMethod
  public void supportedAuthenticationTypesAsync(final Promise promise) {
    int result = mBiometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK);
    List<Integer> results = new ArrayList<>();
    if (result == BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE) {
      promise.resolve(results);
      return;
    }

    // note(cedric): replace hardcoded system feature strings with constants from
    // PackageManager when dropping support for Android SDK 28

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (mPackageManager.hasSystemFeature("android.hardware.fingerprint")) {
        results.add(AUTHENTICATION_TYPE_FINGERPRINT);
      }
    }

    if (Build.VERSION.SDK_INT >= 29) {
      if (mPackageManager.hasSystemFeature("android.hardware.biometrics.face")) {
        results.add(AUTHENTICATION_TYPE_FACIAL_RECOGNITION);
      }

      if (mPackageManager.hasSystemFeature("android.hardware.biometrics.iris")) {
        results.add(AUTHENTICATION_TYPE_IRIS);
      }
    }

    // check for face recognition support on some samsung devices
    if (mPackageManager.hasSystemFeature("com.samsung.android.bio.face") && !results.contains(AUTHENTICATION_TYPE_FACIAL_RECOGNITION)) {
      results.add(AUTHENTICATION_TYPE_FACIAL_RECOGNITION);
    }

    promise.resolve(results);
  }

  @ExpoMethod
  public void hasHardwareAsync(final Promise promise) {
    int result = mBiometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK);
    promise.resolve(result != BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE);
  }

  @ExpoMethod
  public void isEnrolledAsync(final Promise promise) {
    int result = mBiometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK);
    promise.resolve(result == BiometricManager.BIOMETRIC_SUCCESS);
  }

  @ExpoMethod
  public void getEnrolledLevelAsync(final Promise promise) {
    int level = SECURITY_LEVEL_NONE;

    if (isDeviceSecure()) {
      level = SECURITY_LEVEL_SECRET;
    }

    int result = mBiometricManager.canAuthenticate();
    if (result == BiometricManager.BIOMETRIC_SUCCESS) {
      level = SECURITY_LEVEL_BIOMETRIC;
    }
    promise.resolve(level);
  }

  @ExpoMethod
  public void authenticateAsync(final Map<String, Object> options, final Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      promise.reject("E_NOT_SUPPORTED", "Cannot display biometric prompt on android versions below 6.0");
      return;
    }

    if (getCurrentActivity() == null) {
      promise.reject("E_NOT_FOREGROUND", "Cannot display biometric prompt when the app is not in the foreground");
      return;
    }

    if (getKeyguardManager().isDeviceSecure() == false) {
      Bundle errorResult = new Bundle();
      errorResult.putBoolean("success", false);
      errorResult.putString("error", "not_enrolled");
      errorResult.putString("message", "KeyguardManager#isDeviceSecure() returned false");
      promise.resolve(errorResult);
      return;
    }

    final FragmentActivity fragmentActivity = (FragmentActivity) getCurrentActivity();
    if (fragmentActivity == null) {
      Bundle errorResult = new Bundle();
      errorResult.putBoolean("success", false);
      errorResult.putString("error", "not_available");
      errorResult.putString("message", "getCurrentActivity() returned null");
      promise.resolve(errorResult);
      return;
    }

    // BiometricPrompt callbacks are invoked on the main thread so also run this there to avoid
    // having to do locking.
    mUIManager.runOnUiQueueThread(new Runnable() {
      @Override
      public void run() {
        if (mIsAuthenticating) {
          Bundle cancelResult = new Bundle();
          cancelResult.putBoolean("success", false);
          cancelResult.putString("error", "app_cancel");
          safeResolve(cancelResult);
          mPromise = promise;
          return;
        }

        String promptMessage = "";
        String cancelLabel = "";
        boolean disableDeviceFallback = false;

        if (options.containsKey("promptMessage")) {
          promptMessage = (String) options.get("promptMessage");
        }

        if (options.containsKey("cancelLabel")) {
          cancelLabel = (String) options.get("cancelLabel");
        }

        if (options.containsKey("disableDeviceFallback")) {
          disableDeviceFallback = (Boolean) options.get("disableDeviceFallback");
        }

        mIsAuthenticating = true;
        mPromise = promise;

        Executor executor = Executors.newSingleThreadExecutor();
        mBiometricPrompt = new BiometricPrompt(fragmentActivity, executor, mAuthenticationCallback);

        BiometricPrompt.PromptInfo.Builder promptInfoBuilder = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(promptMessage);
        if (disableDeviceFallback) {
          promptInfoBuilder.setNegativeButtonText(cancelLabel);
        } else {
          promptInfoBuilder.setAllowedAuthenticators(
                  BiometricManager.Authenticators.BIOMETRIC_WEAK
                | BiometricManager.Authenticators.DEVICE_CREDENTIAL
          );
        }
        BiometricPrompt.PromptInfo promptInfo = promptInfoBuilder.build();
        try {
          mBiometricPrompt.authenticate(promptInfo);
        } catch (NullPointerException ex) {
          promise.reject("E_INTERNAL_ERRROR", "Canceled authentication due to an internal error");
        }
      }
    });
  }

  @ExpoMethod
  public void cancelAuthenticate(final Promise promise) {
    mUIManager.runOnUiQueueThread(new Runnable() {
      @Override
      public void run() {
        safeCancel();
        promise.resolve(null);
      }
    });
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // If the user uses PIN as an authentication method, the result will be passed to the `onActivityResult`.
    // Unfortunately, react-native doesn't pass this value to the underlying fragment - we won't resolve the promise.
    // So we need to do it manually.
    if (activity instanceof FragmentActivity) {
      FragmentActivity fragmentActivity = (FragmentActivity) activity;
      Fragment fragment = fragmentActivity.getSupportFragmentManager().findFragmentByTag("androidx.biometric.BiometricFragment");
      if (fragment != null) {
        fragment.onActivityResult(requestCode & 0xffff, resultCode, data);
      }
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    // noop
  }

  private boolean isDeviceSecure() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      return getKeyguardManager().isDeviceSecure();
    } else {
      // NOTE: `KeyguardManager#isKeyguardSecure()` considers SIM locked state,
      // but it will be ignored on falling-back to device credential on biometric authentication.
      // That means, setting level to `SECURITY_LEVEL_SECRET` might be misleading for some users.
      // But there is no equivalent APIs prior to M.
      // `andriodx.biometric.BiometricManager#canAuthenticate(int)` looks like an alternative,
      // but specifying `BiometricManager.Authenticators.DEVICE_CREDENTIAL` alone is not
      // supported prior to API 30.
      // https://developer.android.com/reference/androidx/biometric/BiometricManager#canAuthenticate(int)
      return getKeyguardManager().isKeyguardSecure();
    }
  }

  private void safeCancel() {
    if (mBiometricPrompt != null && mIsAuthenticating) {
      mBiometricPrompt.cancelAuthentication();
      mIsAuthenticating = false;
    }
  }

  private void safeResolve(Object result) {
    if (mPromise != null) {
      mPromise.resolve(result);
      mPromise = null;
    }
  }

  private static String convertErrorCode(int code) {
    switch (code) {
      case BiometricPrompt.ERROR_CANCELED:
      case BiometricPrompt.ERROR_NEGATIVE_BUTTON:
      case BiometricPrompt.ERROR_USER_CANCELED:
        return "user_cancel";
      case BiometricPrompt.ERROR_HW_NOT_PRESENT:
      case BiometricPrompt.ERROR_HW_UNAVAILABLE:
      case BiometricPrompt.ERROR_NO_BIOMETRICS:
      case BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL:
        return "not_available";
      case BiometricPrompt.ERROR_LOCKOUT:
      case BiometricPrompt.ERROR_LOCKOUT_PERMANENT:
        return "lockout";
      case BiometricPrompt.ERROR_NO_SPACE:
        return "no_space";
      case BiometricPrompt.ERROR_TIMEOUT:
        return "timeout";
      case BiometricPrompt.ERROR_UNABLE_TO_PROCESS:
        return "unable_to_process";
      default:
        return "unknown";
    }
  }

  private KeyguardManager getKeyguardManager() {
    return (KeyguardManager) getContext().getSystemService(Context.KEYGUARD_SERVICE);
  }

  private Activity getCurrentActivity() {
    ActivityProvider activityProvider = mModuleRegistry.getModule(ActivityProvider.class);
    return activityProvider != null ? activityProvider.getCurrentActivity() : null;
  }
}
