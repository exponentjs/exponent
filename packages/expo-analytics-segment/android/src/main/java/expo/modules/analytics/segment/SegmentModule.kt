// Copyright 2015-present 650 Industries. All rights reserved.
package expo.modules.analytics.segment

import android.content.Context
import android.content.SharedPreferences
import com.segment.analytics.Analytics
import com.segment.analytics.Options
import com.segment.analytics.Properties
import com.segment.analytics.Traits
import com.segment.analytics.android.integrations.firebase.FirebaseIntegration
import expo.modules.interfaces.constants.ConstantsInterface
import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.Promise
import org.unimodules.core.interfaces.ExpoMethod
import java.util.*

private const val NAME = "ExponentSegment"
private const val ENABLED_PREFERENCE_KEY = "enabled"
private val TAG = SegmentModule::class.java.simpleName
private var currentTag = 0

class SegmentModule(private val moduleContext: Context) : ExportedModule(moduleContext) {
  private var client: Analytics? = null
  private var constants: ConstantsInterface? = null

  // We have to keep track of `enabled` on our own.
  // Since we have to change tag every time (see commit 083f051), Segment may or may not properly apply
  // remembered preference to the instance. The module in a standalone app would start disabled
  // (settings = { 0 => disabled }, tag = 0) but after OTA update it would reload with
  // (settings = { 0 => disabled }, tag = 1) and segment would become enabled if the app does not
  // disable it on start.
  private val sharedPreferences: SharedPreferences = moduleContext.getSharedPreferences(NAME, Context.MODE_PRIVATE)

  override fun getName(): String {
    return NAME
  }

  override fun onCreate(moduleRegistry: ModuleRegistry) {
    constants = moduleRegistry.getModule(ConstantsInterface::class.java)
  }

  private val enabledPreferenceValue: Boolean
    get() = sharedPreferences.getBoolean(ENABLED_PREFERENCE_KEY, true)

  @ExpoMethod
  fun initialize(writeKey: String, promise: Promise) {
    val builder = Analytics.Builder(moduleContext, writeKey)
      .experimentalUseNewLifecycleMethods(false)
      .tag((currentTag++).toString())
      .use(FirebaseIntegration.FACTORY)
    client = builder.build().also {
      it.optOut(!enabledPreferenceValue)
    }
    promise.resolve(null)
  }

  @ExpoMethod
  fun identify(userId: String, promise: Promise) {
    client?.identify(userId)
    promise.resolve(null)
  }

  @ExpoMethod
  fun identifyWithTraits(userId: String, properties: Map<String, Any>, options: Map<String, Any?>?, promise: Promise) {
    client?.identify(userId, readableMapToTraits(properties), readableMapToOptions(options))
    promise.resolve(null)
  }

  @ExpoMethod
  fun track(eventName: String, promise: Promise) {
    client?.track(eventName)
    promise.resolve(null)
  }

  @ExpoMethod
  fun trackWithProperties(eventName: String, properties: Map<String, Any>, options: Map<String, Any?>?, promise: Promise) {
    client?.track(eventName, readableMapToProperties(properties), readableMapToOptions(options))
    promise.resolve(null)
  }

  @ExpoMethod
  fun alias(newId: String, options: Map<String, Any?>?, promise: Promise) {
    val client = client
    if (client != null) {
      client.alias(newId, readableMapToOptions(options))
      promise.resolve(null)
    } else {
      promise.reject("E_NO_SEG", "Segment instance has not been initialized yet, have you tried calling Segment.initialize prior to calling Segment.alias?")
    }
  }

  @ExpoMethod
  fun group(groupId: String, promise: Promise) {
    client?.group(groupId)
    promise.resolve(null)
  }

  @ExpoMethod
  fun groupWithTraits(groupId: String, properties: Map<String, Any>, options: Map<String, Any?>?, promise: Promise) {
    client?.group(groupId, readableMapToTraits(properties), readableMapToOptions(options))
    promise.resolve(null)
  }

  @ExpoMethod
  fun screen(screenName: String, promise: Promise) {
    client?.screen(screenName)
    promise.resolve(null)
  }

  @ExpoMethod
  fun screenWithProperties(screenName: String, properties: Map<String, Any>, options: Map<String, Any?>?, promise: Promise) {
    client?.screen(null, screenName, readableMapToProperties(properties), readableMapToOptions(options))
    promise.resolve(null)
  }

  @ExpoMethod
  fun flush(promise: Promise) {
    client?.flush()
    promise.resolve(null)
  }

  @ExpoMethod
  fun reset(promise: Promise) {
    client?.reset()
    promise.resolve(null)
  }

  @ExpoMethod
  fun getEnabledAsync(promise: Promise) {
    promise.resolve(enabledPreferenceValue)
  }

  @ExpoMethod
  fun setEnabledAsync(enabled: Boolean, promise: Promise) {
    if (constants!!.appOwnership == "expo") {
      promise.reject("E_UNSUPPORTED", "Setting Segment's `enabled` is not supported in Expo Go.")
      return
    }
    sharedPreferences.edit().putBoolean(ENABLED_PREFERENCE_KEY, enabled).apply()
    client?.optOut(!enabled)
    promise.resolve(null)
  }

  companion object {
    private fun readableMapToTraits(properties: Map<String, Any>): Traits {
      val traits = Traits()
      for (key in properties.keys) {
        val value = properties[key]
        if (value is Map<*, *>) {
          traits[key] = coalesceAnonymousMapToJsonObject(value)
        } else {
          traits[key] = value
        }
      }
      return traits
    }

    private fun coalesceAnonymousMapToJsonObject(map: Map<*, *>): Map<String, Any?> {
      val validObject: MutableMap<String, Any?> = HashMap()
      for (key in map.keys) {
        if (key is String) {
          val value = map[key]
          if (value is Map<*, *>) {
            validObject[key] = coalesceAnonymousMapToJsonObject(value)
          } else {
            validObject[key] = value
          }
        }
      }
      return validObject
    }

    private fun readableMapToOptions(properties: Map<String, Any?>?): Options {
      var options = Options()
      if (properties != null) {
        for ((keyName, value) in properties) {
          if (keyName == "context" && value != null) {
            val contexts: Map<String, Any>? = value as Map<String, Any>?
            for ((key, value1) in contexts!!) {
              options.putContext(key, value1)
            }
          } else if (keyName == "integrations" && value != null) {
            options = addIntegrationsToOptions(options, value as Map<String, Any>?)
          }
        }
      }
      return options
    }

    private fun addIntegrationsToOptions(options: Options, integrations: Map<String, Any>?): Options {
      for ((integrationKey, integrationOptions) in integrations!!) {
        if (integrationOptions is Map<*, *>) {
          if (integrationOptions["enabled"] is Boolean) {
            val enabled = integrationOptions["enabled"] as Boolean
            options.setIntegration(integrationKey, enabled)
          } else if (integrationOptions["enabled"] is String) {
            val enabled = integrationOptions["enabled"] as String?
            options.setIntegration(integrationKey, java.lang.Boolean.valueOf(enabled))
          }
          if (integrationOptions["options"] is Map<*, *>) {
            val jsonOptions = coalesceAnonymousMapToJsonObject(integrationOptions["options"] as Map<*, *>)
            options.setIntegrationOptions(integrationKey, jsonOptions)
          }
        }
      }
      return options
    }

    private fun readableMapToProperties(properties: Map<String, Any>): Properties {
      val result = Properties()
      for (key in properties.keys) {
        val value = properties[key]
        if (value is Map<*, *>) {
          result[key] = coalesceAnonymousMapToJsonObject(value)
        } else {
          result[key] = value
        }
      }
      return result
    }
  }
}
