package expo.modules.sms

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Telephony
import android.content.pm.PackageManager
import android.os.Bundle

import java.util.ArrayList

import org.unimodules.core.ExportedModule
import org.unimodules.core.interfaces.LifecycleEventListener
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.Promise
import org.unimodules.core.interfaces.services.UIManager
import org.unimodules.core.interfaces.ExpoMethod
import org.unimodules.core.interfaces.ActivityProvider

private const val TAG = "ExpoSMS"
private const val ERROR_TAG = "E_SMS"
private const val OPTIONS_ATTACHMENTS_KEY = "attachments"

class SMSModule(context: Context) : ExportedModule(context), LifecycleEventListener {
  private lateinit var mModuleRegistry: ModuleRegistry
  private var mPendingPromise: Promise? = null
  private var mSMSComposerOpened = false

  override fun getName(): String {
    return TAG
  }

  override fun onCreate(moduleRegistry: ModuleRegistry) {
    mModuleRegistry = moduleRegistry
    mModuleRegistry.getModule(UIManager::class.java)?.registerLifecycleEventListener(this)
  }

  override fun onDestroy() {
    // Unregister from old UIManager
    mModuleRegistry.getModule(UIManager::class.java)?.unregisterLifecycleEventListener(this)
  }

  private fun getAttachment(attachment: Map<String?, String?>?, key: String): String? {
    return attachment?.get(key)
  }

  @ExpoMethod
  fun sendSMSAsync(
    addresses: ArrayList<String>,
    message: String,
    options: Map<String?, Any?>?,
    promise: Promise
  ) {
    if (mPendingPromise != null) {
      promise.reject(
        ERROR_TAG + "_SENDING_IN_PROGRESS",
        "Different SMS sending in progress. Await the old request and then try again."
      )
      return
    }

    val attachments = options?.get(OPTIONS_ATTACHMENTS_KEY) as? List<*>

    // ACTION_SEND causes a weird flicker on Android 10 devices if the messaging app is not already
    // open in the background, but it seems to be the only intent type that works for including
    // attachments, so we use it if there are attachments and fall back to ACTION_SENDTO otherwise.
    val smsIntent = if (attachments?.isNotEmpty() == true) {
      Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra("address", addresses.joinToString(separator = ";"))
        val attachment = attachments[0] as? Map<String?, String?>
        putExtra(Intent.EXTRA_STREAM, Uri.parse(getAttachment(attachment, "uri")))
        type = getAttachment(attachment, "mimeType")
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
    } else {
      Intent(Intent.ACTION_SENDTO).apply {
        data = Uri.parse("smsto:" + addresses.joinToString(separator = ";"))
      }
    }

    val defaultSMSPackage = Telephony.Sms.getDefaultSmsPackage(context)
    if (defaultSMSPackage != null) {
      smsIntent.setPackage(defaultSMSPackage)
    } else {
      promise.reject(ERROR_TAG + "_NO_SMS_APP", "No messaging application available")
      return
    }
    smsIntent.putExtra("exit_on_sent", true)
    smsIntent.putExtra("compose_mode", true)
    smsIntent.putExtra(Intent.EXTRA_TEXT, message)
    smsIntent.putExtra("sms_body", message)
    mPendingPromise = promise
    val activityProvider = mModuleRegistry.getModule(
      ActivityProvider::class.java
    )
    activityProvider.currentActivity.startActivity(smsIntent)
    mSMSComposerOpened = true
  }

  @ExpoMethod
  fun isAvailableAsync(promise: Promise) {
    promise.resolve(context.packageManager.hasSystemFeature(PackageManager.FEATURE_TELEPHONY))
  }

  override fun onHostResume() {
    val promise = mPendingPromise
    if (mSMSComposerOpened && promise != null) {
      // the only way to check the status of the message is to query the device's SMS database
      // but this requires READ_SMS permission, which Google is heavily restricting beginning Jan 2019
      // so we just resolve with an unknown value
      promise.resolve(Bundle().apply {
        putString("result", "unknown")
      })
      mPendingPromise = null
    }
    mSMSComposerOpened = false
  }

  override fun onHostPause() = Unit

  override fun onHostDestroy() = Unit
}
