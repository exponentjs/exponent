package expo.modules.analytics.amplitude

import android.content.Context
import com.amplitude.api.Amplitude
import com.amplitude.api.AmplitudeClient
import com.amplitude.api.TrackingOptions

import org.json.JSONArray
import org.json.JSONObject

import org.unimodules.core.ExportedModule
import org.unimodules.core.Promise
import org.unimodules.core.arguments.ReadableArguments
import org.unimodules.core.interfaces.ExpoMethod

open class AmplitudeModule(context: Context?) : ExportedModule(context) {
  private var mClient: AmplitudeClient? = null
  private var mPendingTrackingOptions: TrackingOptions? = null

  override fun getName(): String {
    return "ExpoAmplitude"
  }

  protected fun getClient(apiKey: String?): AmplitudeClient {
    return Amplitude.getInstance(apiKey)
  }

  @ExpoMethod
  fun initializeAsync(apiKey: String, promise: Promise) {
    mClient = getClient(apiKey)
    val client = mClient
    if (mPendingTrackingOptions != null) {
      client?.setTrackingOptions(mPendingTrackingOptions)
    }
    client?.initialize(context, apiKey)
    promise.resolve(null)
  }

  private inline fun rejectUnlessClientInitialized(promise: Promise, block: (AmplitudeClient) -> Unit) {
    val client = mClient
    if (client == null) {
      promise.reject("E_NO_INIT", "Amplitude client has not been initialized, are you sure you have configured it with #init(apiKey)?")
      return
    }
    block(client)
  }

  @ExpoMethod
  fun setUserIdAsync(userId: String, promise: Promise) =
    rejectUnlessClientInitialized(promise) { client ->
      client.userId = userId
      promise.resolve(null)
    }

  @ExpoMethod
  fun setUserPropertiesAsync(properties: Map<String, Any?>, promise: Promise) =
    rejectUnlessClientInitialized(promise) { client ->
      client.setUserProperties(JSONObject(properties))
      promise.resolve(null)
    }

  @ExpoMethod
  fun clearUserPropertiesAsync(promise: Promise) =
    rejectUnlessClientInitialized(promise) { client ->
      client.clearUserProperties()
      promise.resolve(null)
  }

  @ExpoMethod
  fun logEventAsync(eventName: String, promise: Promise) =
    rejectUnlessClientInitialized(promise) { client ->
      client.logEvent(eventName)
      promise.resolve(null)
  }

  @ExpoMethod
  fun logEventWithPropertiesAsync(eventName: String, properties: Map<String, Any?>, promise: Promise) =
    rejectUnlessClientInitialized(promise) { client ->
      client.logEvent(eventName, JSONObject(properties))
      promise.resolve(null)
  }

  @ExpoMethod
  fun setGroupAsync(groupType: String, groupNames: List<Any?>, promise: Promise) =
    rejectUnlessClientInitialized(promise) { client ->
      client.setGroup(groupType, JSONArray(groupNames))
      promise.resolve(null)
  }

  @ExpoMethod
  fun setTrackingOptionsAsync(options: ReadableArguments, promise: Promise) {
    val trackingOptions = TrackingOptions()
    if (options.getBoolean("disableAdid")) {
      trackingOptions.disableAdid()
    }
    if (options.getBoolean("disableCarrier")) {
      trackingOptions.disableCarrier()
    }
    if (options.getBoolean("disableCity")) {
      trackingOptions.disableCity()
    }
    if (options.getBoolean("disableCountry")) {
      trackingOptions.disableCountry()
    }
    if (options.getBoolean("disableDeviceBrand")) {
      trackingOptions.disableDeviceBrand()
    }
    if (options.getBoolean("disableDeviceModel")) {
      trackingOptions.disableDeviceModel()
    }
    if (options.getBoolean("disableDMA")) {
      trackingOptions.disableDma()
    }
    if (options.getBoolean("disableIPAddress")) {
      trackingOptions.disableIpAddress()
    }
    if (options.getBoolean("disableLanguage")) {
      trackingOptions.disableLanguage()
    }
    if (options.getBoolean("disableLatLng")) {
      trackingOptions.disableLatLng()
    }
    if (options.getBoolean("disableOSName")) {
      trackingOptions.disableOsName()
    }
    if (options.getBoolean("disableOSVersion")) {
      trackingOptions.disableOsVersion()
    }
    if (options.getBoolean("disablePlatform")) {
      trackingOptions.disablePlatform()
    }
    if (options.getBoolean("disableRegion")) {
      trackingOptions.disableRegion()
    }
    if (options.getBoolean("disableVersionName")) {
      trackingOptions.disableVersionName()
    }
    if (mClient != null) {
      mClient!!.setTrackingOptions(trackingOptions)
    } else {
      mPendingTrackingOptions = trackingOptions
    }
    promise.resolve(null)
  }
}
