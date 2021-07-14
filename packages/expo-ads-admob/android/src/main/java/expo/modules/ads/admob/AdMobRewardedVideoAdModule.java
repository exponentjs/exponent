package expo.modules.ads.admob;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.google.ads.mediation.admob.AdMobAdapter;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdCallback;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.rewarded.ServerSideVerificationOptions;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.Promise;
import org.unimodules.core.arguments.ReadableArguments;
import org.unimodules.core.interfaces.ActivityProvider;
import org.unimodules.core.interfaces.ExpoMethod;
import org.unimodules.core.interfaces.services.EventEmitter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class AdMobRewardedVideoAdModule extends ExportedModule {
  private RewardedAd mRewardedAd;
  private String mAdUnitID;
  private Promise mRequestAdPromise;
  private Promise mShowAdPromise;
  private EventEmitter mEventEmitter;
  private ActivityProvider mActivityProvider;

  public enum Event {
    DID_REWARD("rewardedVideoUserDidEarnReward"),
    DID_LOAD("rewardedVideoDidLoad"),
    DID_FAIL_TO_LOAD("rewardedVideoDidFailToLoad"),
    DID_PRESENT("rewardedVideoDidPresent"),
    DID_FAIL_TO_PRESENT("rewardedVideoDidFailToPresent"),
    DID_DISMISS("rewardedVideoDidDismiss");

    private final String mName;

    Event(final String name) {
      mName = name;
    }

    @Override
    public @NonNull String toString() {
      return mName;
    }
  }

  @Override
  public String getName() {
    return "ExpoAdsAdMobRewardedVideoAdManager";
  }

  public AdMobRewardedVideoAdModule(Context context) {
    super(context);
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mEventEmitter = moduleRegistry.getModule(EventEmitter.class);
    mActivityProvider = moduleRegistry.getModule(ActivityProvider.class);
  }

  private void sendEvent(Event event) {
    this.sendEvent(event, new Bundle());
  }

  private void sendEvent(Event event, Bundle params) {
    mEventEmitter.emit(event.toString(), params);
  }

  @ExpoMethod
  public void setAdUnitID(String adUnitID, final Promise promise) {
    mAdUnitID = adUnitID;
    promise.resolve(null);
  }

  @ExpoMethod
  public void requestAd(final ReadableArguments additionalRequestParams, final ReadableArguments ssvOptions, final Promise promise) {
    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        if (mRewardedAd != null) {
          promise.reject("E_AD_ALREADY_LOADED", "Ad is already loaded.", null);
          return;
        }

        mRequestAdPromise = promise;

        String testDeviceID = AdMobModule.getTestDeviceID();
        @Nullable List<String> testDevicesIds = testDeviceID == null ? null : new ArrayList<>(Collections.singletonList(testDeviceID));
        RequestConfiguration requestConfiguration = new RequestConfiguration.Builder().setTestDeviceIds(testDevicesIds).build();
        MobileAds.setRequestConfiguration(requestConfiguration);

        AdRequest adRequest = new AdRequest.Builder()
          .addNetworkExtrasBundle(AdMobAdapter.class, additionalRequestParams.toBundle())
          .build();

        mRewardedAd = new RewardedAd(mActivityProvider.getCurrentActivity(), mAdUnitID);

        if( ssvOptions != null && !ssvOptions.isEmpty() ) {
          // Check if ReadableArguments has a value (see doc on ReadableArguments here https://github.com/expo/expo/blob/59794c1cc56ac8ea110c208ba0711dbd1e044594/packages/%40unimodules/core/android/src/main/java/org/unimodules/core/arguments/ReadableArguments.java#L10)
          ServerSideVerificationOptions options = new ServerSideVerificationOptions.Builder();
          String userId = ssvOptions.getString("userId");
          String customData = ssvOptions.getString("customData");
          if(userId != null) {
            options.setUserId(userId);
          }
          if(customData != null) {
            options.setCustomData(customData);
          }
          options.build();
          mRewardedAd.setServerSideVerificationOptions(options);
        }

        mRewardedAd.loadAd(adRequest, new RewardedAdLoadCallback() {
          @Override
          public void onRewardedAdLoaded() {
            sendEvent(Event.DID_LOAD);
            mRequestAdPromise.resolve(null);
            mRequestAdPromise = null;
          }

          @Override
          public void onRewardedAdFailedToLoad(LoadAdError loadAdError) {
            sendEvent(Event.DID_FAIL_TO_LOAD, AdMobUtils.createEventForAdFailedToLoad(loadAdError));
            mRewardedAd = null;
            mRequestAdPromise.reject("E_AD_REQUEST_FAILED", loadAdError.getMessage());
            mRequestAdPromise = null;
          }
        });
      }
    });
  }

  @ExpoMethod
  public void showAd(final Promise promise) {
    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        if (mRewardedAd == null || !mRewardedAd.isLoaded()) {
          promise.reject("E_AD_NOT_READY", "Ad is not ready.", null);
          return;
        }

        mShowAdPromise = promise;
        mRewardedAd.show(mActivityProvider.getCurrentActivity(), new RewardedAdCallback() {
          @Override
          public void onUserEarnedReward(@NonNull RewardItem rewardItem) {
            Bundle reward = new Bundle();
            reward.putInt("amount", rewardItem.getAmount());
            reward.putString("type", rewardItem.getType());
            sendEvent(Event.DID_REWARD, reward);
          }

          @Override
          public void onRewardedAdOpened() {
            sendEvent(Event.DID_PRESENT);
            mShowAdPromise.resolve(null);
            mShowAdPromise = null;
          }

          @Override
          public void onRewardedAdClosed() {
            sendEvent(Event.DID_DISMISS);
            mRewardedAd = null;
          }

          @Override
          public void onRewardedAdFailedToShow(AdError adError) {
            sendEvent(Event.DID_FAIL_TO_LOAD, AdMobUtils.createEventForAdFailedToLoad(adError));
            mShowAdPromise.reject("E_AD_SHOW_FAILED", adError.getMessage());
            mRewardedAd = null;
            mShowAdPromise = null;
          }
        });
      }
    });
  }

  @ExpoMethod
  public void getIsReady(final Promise promise) {
    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        promise.resolve(mRewardedAd != null && mRewardedAd.isLoaded());
      }
    });
  }
}
