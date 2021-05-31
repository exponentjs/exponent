package expo.modules.inapppurchases;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Parcelable;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.AcknowledgePurchaseResponseListener;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.BillingClient.BillingResponseCode;
import com.android.billingclient.api.BillingClient.FeatureType;
import com.android.billingclient.api.BillingClient.SkuType;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.Purchase.PurchasesResult;
import com.android.billingclient.api.PurchaseHistoryResponseListener;
import com.android.billingclient.api.PurchaseHistoryRecord;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.android.billingclient.api.SkuDetailsResponseListener;

import org.unimodules.core.interfaces.services.EventEmitter;
import org.unimodules.core.Promise;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;

/**
 * Handles all the interactions with Play Store (via Billing library), maintains connection to
 * it through BillingClient and caches temporary states/data if needed
 */
public class BillingManager implements PurchasesUpdatedListener {
  private static final String TAG = "BillingManager";

  public static final int OK = 0;
  public static final int USER_CANCELED = 1;
  public static final int ERROR = 2;

  public static final int BILLING_MANAGER_NOT_INITIALIZED = -1;
  public static final String PURCHASES_UPDATED_EVENT = "Expo.purchasesUpdated";
  public static final String ACKNOWLEDGING_PURCHASE = "Acknowledging Item";
  public static final String INAPP_SUB_PERIOD = "P0D";
  private int mBillingClientResponseCode = BILLING_MANAGER_NOT_INITIALIZED;

  protected static final HashMap<String, Promise> promises = new HashMap<>();
  private final List<Purchase> mPurchases = new ArrayList<>();
  private final HashMap<String, SkuDetails> mSkuDetailsMap = new HashMap<>();
  private BillingClient mBillingClient;
  private EventEmitter mEventEmitter;
  private boolean mIsServiceConnected;
  private final Activity mActivity;
  private BillingUpdatesListener mBillingUpdatesListener;

  private Set<String> mTokensToBeConsumed;

  /**
   * Listener to the updates that happen when purchases list was updated or consumption of the
   * item was finished
   */
  public interface BillingUpdatesListener {
    void onBillingClientSetupFinished();

    void onConsumeFinished(String token, BillingResult result);

    void onPurchasesUpdated(List<Purchase> purchases);
  }

  /**
   * Listener for the Billing client state to become connected
   */
  public interface ServiceConnectedListener {
    void onServiceConnected(BillingResult resultCode);
  }

  public BillingManager(Activity activity, EventEmitter eventEmitter) {
    mActivity = activity;
    mEventEmitter = eventEmitter;
    mBillingUpdatesListener = new UpdateListener(eventEmitter);
    mBillingClient =
      BillingClient
        .newBuilder(activity)
        .enablePendingPurchases()
        .setListener(this)
        .build();
  }

  public void startConnection(final Promise promise) {
    // Start setup. This is asynchronous and the specified listener will be called
    // once setup completes.
    // It also starts to report all the new purchases through onPurchasesUpdated() callback.
    startServiceConnection(new Runnable() {
      @Override
      public void run() {
        // Notifying the listener that billing client is ready
        mBillingUpdatesListener.onBillingClientSetupFinished();
        promise.resolve(null);
      }
    });
  }

  public void startServiceConnection(final Runnable executeOnSuccess) {
    mBillingClient.startConnection(new BillingClientStateListener() {
      @Override
      public void onBillingSetupFinished(BillingResult billingResult) {
        final int responseCode = billingResult.getResponseCode();
        if (responseCode == BillingResponseCode.OK) {
          mIsServiceConnected = true;
          if (executeOnSuccess != null) {
            executeOnSuccess.run();
          }
        }
        mBillingClientResponseCode = responseCode;
      }

      @Override
      public void onBillingServiceDisconnected() {
        mIsServiceConnected = false;
      }
    });
  }

  /**
   * Start a purchase or subscription replace flow
   */
  public void purchaseItemAsync(final String skuId, final String purchaseToken, final Promise promise) {

    // purchaseToken is for subscription replacements and may be null.
    Runnable purchaseFlowRequest = new Runnable() {
      @Override
      public void run() {
        SkuDetails skuDetails = mSkuDetailsMap.get(skuId);
        if (skuDetails == null) {
          promise.reject("E_ITEM_NOT_QUERIED", "Must query item from store before calling purchase");
          return;
        }

        BillingFlowParams.Builder purchaseParams = BillingFlowParams.newBuilder()
          .setSkuDetails(skuDetails);

        if (purchaseToken != null) {
          BillingFlowParams.SubscriptionUpdateParams subscriptionUpdateParams = BillingFlowParams.SubscriptionUpdateParams.newBuilder()
            .setOldSkuPurchaseToken(purchaseToken)
            .build();
          purchaseParams.setSubscriptionUpdateParams(subscriptionUpdateParams);
        }

        mBillingClient.launchBillingFlow(mActivity, purchaseParams.build());
      }
    };

    executeServiceRequest(purchaseFlowRequest);
  }

  public Context getContext() {
    return mActivity;
  }

  /**
   * Handle a callback that purchases were updated from the Billing library
   */
  @Override
  public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
    if (result.getResponseCode() == BillingResponseCode.OK && purchases != null) {
      for (Purchase purchase : purchases) {
        handlePurchase(purchase);
      }
      mBillingUpdatesListener.onPurchasesUpdated(mPurchases);
    } else {
      Bundle response = formatResponse(result, null);
      mEventEmitter.emit(PURCHASES_UPDATED_EVENT, response);
    }
  }

  public void acknowledgePurchaseAsync(String purchaseToken, final Promise promise) {
    AcknowledgePurchaseResponseListener acknowledgePurchaseResponseListener = new AcknowledgePurchaseResponseListener() {
      @Override
      public void onAcknowledgePurchaseResponse(BillingResult billingResult) {
        Bundle response = formatResponse(billingResult, null);

        promise.resolve(response);
      }
    };

    AcknowledgePurchaseParams acknowledgePurchaseParams =
      AcknowledgePurchaseParams.newBuilder()
        .setPurchaseToken(purchaseToken)
        .build();
    mBillingClient.acknowledgePurchase(acknowledgePurchaseParams, acknowledgePurchaseResponseListener);
  }

  public void consumeAsync(final String purchaseToken, final Promise promise) {
    // If we've already scheduled to consume this token - no action is needed (this could happen
    // if you received the token when querying purchases inside onReceive() and later from
    // onActivityResult()
    if (mTokensToBeConsumed == null) {
      mTokensToBeConsumed = new HashSet<>();
    } else if (mTokensToBeConsumed.contains(purchaseToken)) {
      Bundle response = new Bundle();
      response.putInt("responseCode", BillingClient.BillingResponseCode.OK);
      promise.resolve(response);
      return;
    }

    if (promises.get(ACKNOWLEDGING_PURCHASE) != null) {
      promise.reject("E_UNFINISHED_PROMISE", "Must wait for promise to resolve before recalling function.");
      return;
    }
    promises.put(ACKNOWLEDGING_PURCHASE, promise);
    mTokensToBeConsumed.add(purchaseToken);

    // Generating Consume Response listener
    final ConsumeResponseListener onConsumeListener = new ConsumeResponseListener() {
      @Override
      public void onConsumeResponse(BillingResult billingResult, String purchaseToken) {
        // If billing service was disconnected, we try to reconnect 1 time
        mBillingUpdatesListener.onConsumeFinished(purchaseToken, billingResult);
      }
    };

    // Creating a runnable from the request to use it inside our connection retry policy below
    Runnable consumeRequest = new Runnable() {
      @Override
      public void run() {
        ConsumeParams consumeParams =
          ConsumeParams.newBuilder()
            .setPurchaseToken(purchaseToken)
            .build();
        // Consume the purchase async
        mBillingClient.consumeAsync(consumeParams, onConsumeListener);
      }
    };

    executeServiceRequest(consumeRequest);
  }

  /**
   * Handles the purchase
   *
   * @param purchase Purchase to be handled
   */
  private void handlePurchase(Purchase purchase) {
    mPurchases.add(purchase);
  }

  /**
   * Returns the value Billing client response code or BILLING_MANAGER_NOT_INITIALIZED if the
   * client connection response was not received yet.
   */
  public int getBillingClientResponseCode() {
    return mBillingClientResponseCode;
  }

  /**
   * Query purchases across various use cases and deliver the result in a formalized way through
   * a listener
   */
  public void queryPurchases(final Promise promise) {
    Runnable queryToExecute = new Runnable() {
      @Override
      public void run() {
        PurchasesResult purchasesResult = mBillingClient.queryPurchases(SkuType.INAPP);

        // If there are subscriptions supported, we add subscription rows as well
        if (purchasesResult != null && areSubscriptionsSupported()) {
          PurchasesResult subscriptionResult
            = mBillingClient.queryPurchases(SkuType.SUBS);

          if (subscriptionResult != null && subscriptionResult.getResponseCode() == BillingResponseCode.OK) {
            purchasesResult.getPurchasesList().addAll(
              subscriptionResult.getPurchasesList());
          }
        }

        onQueryPurchasesFinished(purchasesResult, promise);
      }
    };

    executeServiceRequest(queryToExecute);
  }

  /**
   * Does the same thing as queryPurchases except makes a network request (instead of using Google Play cache)
   * and returns all records for every SKU of a given type, even if they're expired/consumed
   */
  public void queryPurchaseHistoryAsync(final Promise promise) {
    Runnable queryToExecute = new Runnable() {
      @Override
      public void run() {
        final ArrayList<Bundle> bundles = new ArrayList<>();

        // Query in app product history
        mBillingClient.queryPurchaseHistoryAsync(SkuType.INAPP,
          new PurchaseHistoryResponseListener() {
            @Override
            public void onPurchaseHistoryResponse(final BillingResult inAppBillingResult,
                                                  final List<PurchaseHistoryRecord> inAppList) {

              if (inAppBillingResult.getResponseCode() == BillingResponseCode.OK && inAppList != null) {
                for (PurchaseHistoryRecord purchaseHistory : inAppList) {
                  bundles.add(purchaseHistoryToBundle(purchaseHistory));
                }
              }

              // Query subscription history
              mBillingClient.queryPurchaseHistoryAsync(SkuType.SUBS, new PurchaseHistoryResponseListener() {
                @Override
                public void onPurchaseHistoryResponse(BillingResult subsBillingResult, List<PurchaseHistoryRecord> subsList) {

                  if (subsBillingResult.getResponseCode() == BillingResponseCode.OK && subsList != null) {
                    for (PurchaseHistoryRecord purchaseHistory : subsList) {
                      bundles.add(purchaseHistoryToBundle(purchaseHistory));
                    }
                  }

                  Bundle response = formatResponse(inAppBillingResult, bundles);
                  promise.resolve(response);
                }
              });
            }
          });
      }
    };

    executeServiceRequest(queryToExecute);
  }

  /**
   * Format the result of a Purchase or Sku Details query depending on the result code
   */
  public static Bundle formatResponse(BillingResult billingResult, ArrayList<? extends Parcelable> results) {
    Bundle response = new Bundle();
    int responseCode = billingResult.getResponseCode();
    if (responseCode == BillingResponseCode.OK) {
      response.putInt("responseCode", OK);
      response.putParcelableArrayList("results", results != null ? results : new ArrayList<Parcelable>());
    } else if (responseCode == BillingResponseCode.USER_CANCELED) {
      response.putInt("responseCode", USER_CANCELED);
    } else {
      response.putInt("responseCode", ERROR);
      response.putInt("errorCode", errorCodeNativeToJS(responseCode));
    }
    return response;
  }

  /**
   * Convert native error code to match corresponding TS enum
   */
  private static int errorCodeNativeToJS(int responseCode) {
    switch (responseCode) {
      case BillingResponseCode.ERROR:
        return 0;
      case BillingResponseCode.FEATURE_NOT_SUPPORTED:
        return 1;
      case BillingResponseCode.SERVICE_DISCONNECTED:
        return 2;
      case BillingResponseCode.SERVICE_UNAVAILABLE:
        return 3;
      case BillingResponseCode.SERVICE_TIMEOUT:
        return 4;
      case BillingResponseCode.BILLING_UNAVAILABLE:
        return 5;
      case BillingResponseCode.ITEM_UNAVAILABLE:
        return 6;
      case BillingResponseCode.DEVELOPER_ERROR:
        return 7;
      case BillingResponseCode.ITEM_ALREADY_OWNED:
        return 8;
      case BillingResponseCode.ITEM_NOT_OWNED:
        return 9;
    }
    return 0;
  }

  /**
   * Convert native purchase state to match corresponding TS enum
   */
  private static int purchaseStateNativeToJS(int purchaseState) {
    switch (purchaseState) {
      case Purchase.PurchaseState.PENDING:
        return 0;
      case Purchase.PurchaseState.PURCHASED:
        return 1;
      case Purchase.PurchaseState.UNSPECIFIED_STATE:
        return 2;
    }
    return 0;

  }

  private static Bundle skuToBundle(SkuDetails skuDetails) {
    Bundle bundle = new Bundle();

    String subscriptionPeriod =
      skuDetails.getType().equals(SkuType.SUBS) ?
        skuDetails.getSubscriptionPeriod() :
        INAPP_SUB_PERIOD;

    int type = skuDetails.getType().equals(SkuType.INAPP) ? 0 : 1;

    bundle.putString("description", skuDetails.getDescription());
    bundle.putString("price", skuDetails.getPrice());
    bundle.putLong("priceAmountMicros", skuDetails.getPriceAmountMicros());
    bundle.putString("priceCurrencyCode", skuDetails.getPriceCurrencyCode());
    bundle.putString("productId", skuDetails.getSku());
    bundle.putString("title", skuDetails.getTitle());
    bundle.putInt("type", type);
    bundle.putString("subscriptionPeriod", subscriptionPeriod);

    return bundle;
  }

  public static Bundle purchaseToBundle(Purchase purchase) {
    Bundle bundle = new Bundle();

    bundle.putBoolean("acknowledged", purchase.isAcknowledged());
    bundle.putString("orderId", purchase.getOrderId());
    bundle.putStringArrayList("productIds", purchase.getSkus());
    bundle.putInt("purchaseState", purchaseStateNativeToJS(purchase.getPurchaseState()));
    bundle.putLong("purchaseTime", purchase.getPurchaseTime());
    bundle.putString("packageName", purchase.getPackageName());
    bundle.putString("purchaseToken", purchase.getPurchaseToken());

    return bundle;
  }

  private static Bundle purchaseHistoryToBundle(PurchaseHistoryRecord purchaseRecord) {
    Bundle bundle = new Bundle();

    // PurchaseHistoryRecord is a subset of Purchase
    bundle.putStringArrayList("productIds", purchaseRecord.getSkus());
    bundle.putLong("purchaseTime", purchaseRecord.getPurchaseTime());
    bundle.putString("purchaseToken", purchaseRecord.getPurchaseToken());

    return bundle;
  }

  /**
   * Handle a result from querying of purchases and report an updated list to the listener
   */
  private void onQueryPurchasesFinished(PurchasesResult result, final Promise promise) {
    // Have we been disposed of in the meantime? If so, or bad result code, then quit
    if (mBillingClient == null || result == null || result.getResponseCode() != BillingResponseCode.OK) {
      promise.reject("E_QUERY_FAILED", "Billing client was null or query was unsuccessful");
      return;
    }

    BillingResult billingResult = result.getBillingResult();
    List<Purchase> purchasesList = result.getPurchasesList();
    ArrayList<Bundle> results = new ArrayList<>();
    for (Purchase purchase : purchasesList) {
      results.add(purchaseToBundle(purchase));
    }

    // Update purchases inventory with new list of purchases
    mPurchases.clear();
    onPurchasesUpdated(billingResult, purchasesList);

    final Bundle response = formatResponse(billingResult, results);
    promise.resolve(response);
  }

  public void querySkuDetailsAsync(final List<String> skuList,
                                   final SkuDetailsResponseListener listener) {
    // Creating a runnable from the request to use it inside our connection retry policy below
    Runnable queryRequest = new Runnable() {
      @Override
      public void run() {
        // Query in app product details
        SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
        params.setSkusList(skuList).setType(SkuType.INAPP);
        mBillingClient.querySkuDetailsAsync(params.build(),
          new SkuDetailsResponseListener() {
            @Override
            public void onSkuDetailsResponse(BillingResult inAppResult,
                                             final List<SkuDetails> skuDetails) {
              // Query subscription details
              SkuDetailsParams.Builder subs = SkuDetailsParams.newBuilder();
              subs.setSkusList(skuList).setType(SkuType.SUBS);
              mBillingClient.querySkuDetailsAsync(subs.build(), new SkuDetailsResponseListener() {
                @Override
                public void onSkuDetailsResponse(BillingResult billingResult, List<SkuDetails> subscriptionDetails) {
                  if (skuDetails != null && subscriptionDetails != null) {
                    skuDetails.addAll(subscriptionDetails);
                  }
                  listener.onSkuDetailsResponse(billingResult, skuDetails);
                }
              });
            }
          });
      }
    };

    executeServiceRequest(queryRequest);
  }

  public void queryPurchasableItems(List<String> itemList, final Promise promise) {
    querySkuDetailsAsync(itemList,
      new SkuDetailsResponseListener() {
        @Override
        public void onSkuDetailsResponse(BillingResult billingResult, List<SkuDetails> skuDetailsList) {
          ArrayList<Bundle> results = new ArrayList<>();
          if (skuDetailsList != null) {
            for (SkuDetails skuDetails : skuDetailsList) {
              mSkuDetailsMap.put(skuDetails.getSku(), skuDetails);
              results.add(skuToBundle(skuDetails));
            }
          }
          Bundle response = formatResponse(billingResult, results);
          promise.resolve(response);
        }
      }
    );
  }

  private void executeServiceRequest(Runnable runnable) {
    if (mIsServiceConnected) {
      runnable.run();
    } else {
      // If billing service was disconnected, we try to reconnect 1 time.
      startServiceConnection(runnable);
    }
  }

  /**
   * Checks if subscriptions are supported for current client
   */
  public boolean areSubscriptionsSupported() {
    BillingResult billingResult = mBillingClient.isFeatureSupported(FeatureType.SUBSCRIPTIONS);
    return billingResult.getResponseCode() == BillingResponseCode.OK;
  }

  /**
   * Clear the resources
   */
  public void destroy() {
    if (mBillingClient != null && mBillingClient.isReady()) {
      mBillingClient.endConnection();
      mBillingClient = null;
    }
  }

}
