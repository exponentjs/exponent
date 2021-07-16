package expo.modules.sms;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Telephony;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ActivityProvider;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.LifecycleEventListener;
import org.unimodules.core.interfaces.services.UIManager;
import androidx.annotation.Nullable;

public class SMSModule extends ExportedModule implements LifecycleEventListener {
  private static final String TAG = "ExpoSMS";
  private static final String ERROR_TAG = "E_SMS";

  private static final String OPTIONS_ATTACHMENTS_KEY = "attachments";

  private ModuleRegistry mModuleRegistry;
  private Promise mPendingPromise;
  private boolean mSMSComposerOpened = false;
  private String mDefaultSmsPackage = null;

  SMSModule(Context context) {
    super(context);
  }

  SMSModule(Context context, String defaultSmsPackage) {
    super(context);
    mDefaultSmsPackage = defaultSmsPackage;
  }

  @Override
  public String getName() {
    return TAG;
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
    if (mModuleRegistry.getModule(UIManager.class) != null) {
      mModuleRegistry.getModule(UIManager.class).registerLifecycleEventListener(this);
    }
  }

  @Override
  public void onDestroy() {
    // Unregister from old UIManager
    if (mModuleRegistry != null && mModuleRegistry.getModule(UIManager.class) != null) {
      mModuleRegistry.getModule(UIManager.class).unregisterLifecycleEventListener(this);
    }

    mModuleRegistry = null;
  }

  @ExpoMethod
  public void sendSMSAsync(
      final ArrayList<String> addresses,
      final String message,
      final @Nullable Map<String, Object> options,
      final Promise promise) {
    if (mPendingPromise != null) {
      promise.reject(ERROR_TAG + "_SENDING_IN_PROGRESS", "Different SMS sending in progress. Await the old request and then try again.");
      return;
    }

    Intent smsIntent;

    List<Map<String, String>> attachments = null;
    if (options != null && options.containsKey(OPTIONS_ATTACHMENTS_KEY)) {
      attachments = (List<Map<String, String>>) options.get(OPTIONS_ATTACHMENTS_KEY);
    }

    // ACTION_SEND causes a weird flicker on Android 10 devices if the messaging app is not already
    // open in the background, but it seems to be the only intent type that works for including
    // attachments, so we use it if there are attachments and fall back to ACTION_SENDTO otherwise.
    if (attachments != null && !attachments.isEmpty()) {
      smsIntent = new Intent(Intent.ACTION_SEND);
      smsIntent.setType("text/plain");
      smsIntent.putExtra("address", constructRecipients(addresses));

      Map<String, String> attachment = attachments.get(0);
      smsIntent.putExtra(Intent.EXTRA_STREAM, Uri.parse(attachment.get("uri")));
      smsIntent.setType(attachment.get("mimeType"));
      smsIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
    } else {
      smsIntent = new Intent(Intent.ACTION_SENDTO);
      smsIntent.setData(Uri.parse("smsto:" + constructRecipients(addresses)));
    }

    String defaultSMSPackage;
    if (mDefaultSmsPackage == null) {
      defaultSMSPackage = Telephony.Sms.getDefaultSmsPackage(getContext());
    } else {
      defaultSMSPackage = mDefaultSmsPackage;
    }

    if (defaultSMSPackage != null){
      smsIntent.setPackage(defaultSMSPackage);
    } else {
      promise.reject(ERROR_TAG + "_NO_SMS_APP", "No messaging application available");
      return;
    }

    smsIntent.putExtra("exit_on_sent", true);
    smsIntent.putExtra("compose_mode", true);
    smsIntent.putExtra(Intent.EXTRA_TEXT, message);
    smsIntent.putExtra("sms_body", message);

    mPendingPromise = promise;

    ActivityProvider activityProvider = mModuleRegistry.getModule(ActivityProvider.class);

    activityProvider.getCurrentActivity().startActivity(smsIntent);

    mSMSComposerOpened = true;
  }

  @ExpoMethod
  public void isAvailableAsync(final Promise promise) {
    if (getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_TELEPHONY)) {
      promise.resolve(true);
    } else {
      promise.resolve(false);
    }
  }

  @Override
  public void onHostResume() {
    if (mSMSComposerOpened && mPendingPromise != null) {
      // the only way to check the status of the message is to query the device's SMS database
      // but this requires READ_SMS permission, which Google is heavily restricting beginning Jan 2019
      // so we just resolve with an unknown value
      Bundle result = new Bundle();
      result.putString("result", "unknown");
      mPendingPromise.resolve(result);
      mPendingPromise = null;
    }
    mSMSComposerOpened = false;
  }

  @Override
  public void onHostPause() {
    // do nothing
  }

  @Override
  public void onHostDestroy() {
    // do nothing
  }

  private String constructRecipients(List<String> addresses) {
    if (addresses.size() > 0) {
      final StringBuilder addressesBuilder = new StringBuilder(addresses.get(0));
      for (String address : addresses) {
        addressesBuilder.append(';').append(address);
      }
      return addressesBuilder.toString();
    }
    return "";
  }

}
