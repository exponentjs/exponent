// Copyright 2015-present 650 Industries. All rights reserved.
package expo.modules.localauthentication

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricPrompt.PromptInfo
import androidx.fragment.app.FragmentActivity
import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.ModuleRegistryDelegate
import org.unimodules.core.Promise
import org.unimodules.core.interfaces.ActivityEventListener
import org.unimodules.core.interfaces.ActivityProvider
import org.unimodules.core.interfaces.ExpoMethod
import org.unimodules.core.interfaces.services.UIManager
import java.util.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors

class LocalAuthenticationModule(context: Context) : ExportedModule(context), ActivityEventListener {
  private val AUTHENTICATION_TYPE_FINGERPRINT = 1
  private val AUTHENTICATION_TYPE_FACIAL_RECOGNITION = 2
  private val AUTHENTICATION_TYPE_IRIS = 3
  private val SECURITY_LEVEL_NONE = 0
  private val SECURITY_LEVEL_SECRET = 1
  private val SECURITY_LEVEL_BIOMETRIC = 2
  private val biometricManager = BiometricManager.from(context)
  private val packageManager = context.packageManager
  private var biometricPrompt: BiometricPrompt? = null
  private var promise: Promise? = null
  private var isAuthenticating = false
  private val moduleRegistryDelegate: ModuleRegistryDelegate = ModuleRegistryDelegate()
  private val uIManager: UIManager by moduleRegistry()

  private inline fun <reified T> moduleRegistry() = moduleRegistryDelegate.getFromModuleRegistry<T>()

  private fun convertErrorCode(code: Int): String {
    return when (code) {
      BiometricPrompt.ERROR_CANCELED, BiometricPrompt.ERROR_NEGATIVE_BUTTON, BiometricPrompt.ERROR_USER_CANCELED -> "user_cancel"
      BiometricPrompt.ERROR_HW_NOT_PRESENT, BiometricPrompt.ERROR_HW_UNAVAILABLE, BiometricPrompt.ERROR_NO_BIOMETRICS, BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL -> "not_available"
      BiometricPrompt.ERROR_LOCKOUT, BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> "lockout"
      BiometricPrompt.ERROR_NO_SPACE -> "no_space"
      BiometricPrompt.ERROR_TIMEOUT -> "timeout"
      BiometricPrompt.ERROR_UNABLE_TO_PROCESS -> "unable_to_process"
      else -> "unknown"
    }
  }

  private val authenticationCallback: BiometricPrompt.AuthenticationCallback = object : BiometricPrompt.AuthenticationCallback() {
    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
      isAuthenticating = false
      biometricPrompt = null
      promise?.resolve(Bundle().apply {
        putBoolean("success", true)
      })
      promise = null
    }

    override fun onAuthenticationError(errMsgId: Int, errString: CharSequence) {
      isAuthenticating = false
      biometricPrompt = null
      promise?.resolve(Bundle().apply {
        putBoolean("success", false)
        putString("error", convertErrorCode(errMsgId))
        putString("message", errString.toString())
      })
      promise = null
    }
  }

  override fun getName(): String {
    return "ExpoLocalAuthentication"
  }

  override fun onCreate(moduleRegistry: ModuleRegistry) {
    moduleRegistryDelegate.onCreate(moduleRegistry)
    uIManager.registerActivityEventListener(this)
  }

  @ExpoMethod
  fun supportedAuthenticationTypesAsync(promise: Promise) {
    val result = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
    val results: MutableList<Int> = ArrayList()
    if (result == BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE) {
      promise.resolve(results)
      return
    }

    // note(cedric): replace hardcoded system feature strings with constants from
    // PackageManager when dropping support for Android SDK 28
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (packageManager.hasSystemFeature("android.hardware.fingerprint")) {
        results.add(AUTHENTICATION_TYPE_FINGERPRINT)
      }
    }
    if (Build.VERSION.SDK_INT >= 29) {
      if (packageManager.hasSystemFeature("android.hardware.biometrics.face")) {
        results.add(AUTHENTICATION_TYPE_FACIAL_RECOGNITION)
      }
      if (packageManager.hasSystemFeature("android.hardware.biometrics.iris")) {
        results.add(AUTHENTICATION_TYPE_IRIS)
      }
    }
    promise.resolve(results)
  }

  @ExpoMethod
  fun hasHardwareAsync(promise: Promise) {
    val result = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
    promise.resolve(result != BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE)
  }

  @ExpoMethod
  fun isEnrolledAsync(promise: Promise) {
    val result = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
    promise.resolve(result == BiometricManager.BIOMETRIC_SUCCESS)
  }

  @ExpoMethod
  fun getEnrolledLevelAsync(promise: Promise) {
    var level = SECURITY_LEVEL_NONE
    if (isDeviceSecure) {
      level = SECURITY_LEVEL_SECRET
    }
    val result = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
    if (result == BiometricManager.BIOMETRIC_SUCCESS) {
      level = SECURITY_LEVEL_BIOMETRIC
    }
    promise.resolve(level)
  }

  @ExpoMethod
  fun authenticateAsync(options: Map<String?, Any?>, promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      promise.reject("E_NOT_SUPPORTED", "Cannot display biometric prompt on android versions below 6.0")
      return
    }
    if (currentActivity == null) {
      promise.reject("E_NOT_FOREGROUND", "Cannot display biometric prompt when the app is not in the foreground")
      return
    }
    if (!keyguardManager.isDeviceSecure) {
      promise.resolve(Bundle().apply {
        putBoolean("success", false)
        putString("error", "not_enrolled")
        putString("message", "KeyguardManager#isDeviceSecure() returned false")
      })
      return
    }
    val fragmentActivity = currentActivity as FragmentActivity?
    if (fragmentActivity == null) {
      promise.resolve(Bundle().apply {
        putBoolean("success", false)
        putString("error", "not_available")
        putString("message", "getCurrentActivity() returned null")
      })
      return
    }

    // BiometricPrompt callbacks are invoked on the main thread so also run this there to avoid
    // having to do locking.
    uIManager.runOnUiQueueThread(Runnable {
      if (isAuthenticating) {
        this.promise?.resolve(Bundle().apply {
          putBoolean("success", false)
          putString("error", "app_cancel")
          putString("message", "isAuthenitcating returned false")
        })
        this.promise = promise
        return@Runnable
      }
      val promptMessage = if (options.containsKey("promptMessage")) {
        options["promptMessage"] as String?
      } else {
        ""
      }
      val cancelLabel = if (options.containsKey("cancelLabel")) {
        options["cancelLabel"] as String?
      } else {
        ""
      }
      val disableDeviceFallback = if (options.containsKey("disableDeviceFallback")) {
        options["disableDeviceFallback"] as Boolean?
      } else {
        false
      }
      isAuthenticating = true
      this.promise = promise
      val executor: Executor = Executors.newSingleThreadExecutor()
      biometricPrompt = BiometricPrompt(fragmentActivity, executor, authenticationCallback)
      val promptInfoBuilder = PromptInfo.Builder()
      promptMessage?.let {
        promptInfoBuilder.setTitle(it)
      }
      if (disableDeviceFallback == true) {
        cancelLabel?.let {
          promptInfoBuilder.setNegativeButtonText(it)
        }
      } else {
        promptInfoBuilder.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK
          or BiometricManager.Authenticators.DEVICE_CREDENTIAL)
      }
      val promptInfo = promptInfoBuilder.build()
      try {
        biometricPrompt!!.authenticate(promptInfo)
      } catch (ex: NullPointerException) {
        promise.reject("E_INTERNAL_ERRROR", "Canceled authentication due to an internal error")
      }
    })
  }

  @ExpoMethod
  fun cancelAuthenticate(promise: Promise) {
    uIManager.runOnUiQueueThread {
      biometricPrompt?.cancelAuthentication()
      isAuthenticating = false
      promise.resolve(null)
    }
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent) {
    // If the user uses PIN as an authentication method, the result will be passed to the `onActivityResult`.
    // Unfortunately, react-native doesn't pass this value to the underlying fragment - we won't resolve the promise.
    // So we need to do it manually.
    if (activity is FragmentActivity) {
      val fragment = activity.supportFragmentManager.findFragmentByTag("androidx.biometric.BiometricFragment")
      fragment?.onActivityResult(requestCode and 0xffff, resultCode, data)
    }
  }

  override fun onNewIntent(intent: Intent) = Unit

  // NOTE: `KeyguardManager#isKeyguardSecure()` considers SIM locked state,
  // but it will be ignored on falling-back to device credential on biometric authentication.
  // That means, setting level to `SECURITY_LEVEL_SECRET` might be misleading for some users.
  // But there is no equivalent APIs prior to M.
  // `andriodx.biometric.BiometricManager#canAuthenticate(int)` looks like an alternative,
  // but specifying `BiometricManager.Authenticators.DEVICE_CREDENTIAL` alone is not
  // supported prior to API 30.
  // https://developer.android.com/reference/androidx/biometric/BiometricManager#canAuthenticate(int)
  private val isDeviceSecure: Boolean
    get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      keyguardManager.isDeviceSecure
    } else {
      // NOTE: `KeyguardManager#isKeyguardSecure()` considers SIM locked state,
      // but it will be ignored on falling-back to device credential on biometric authentication.
      // That means, setting level to `SECURITY_LEVEL_SECRET` might be misleading for some users.
      // But there is no equivalent APIs prior to M.
      // `andriodx.biometric.BiometricManager#canAuthenticate(int)` looks like an alternative,
      // but specifying `BiometricManager.Authenticators.DEVICE_CREDENTIAL` alone is not
      // supported prior to API 30.
      // https://developer.android.com/reference/androidx/biometric/BiometricManager#canAuthenticate(int)
      keyguardManager.isKeyguardSecure
    }

  private val keyguardManager: KeyguardManager
    get() = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
  private val currentActivity: Activity?
    get() {
      val activityProvider: ActivityProvider by moduleRegistry()
      return activityProvider.currentActivity
    }
}
