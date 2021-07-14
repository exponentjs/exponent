---
title: InAppPurchases
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-in-app-purchases'
---

import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-in-app-purchases`** provides an API to accept payments for in-app products. Internally this relies on the [Google Play Billing](https://developer.android.com/google/play/billing/billing_library_overview) library on Android and the [Storekit](https://developer.apple.com/documentation/storekit?language=objc) framework on iOS.

<PlatformsSection android ios />

## Installation

This module is currently only available in the [bare](../../../introduction/managed-vs-bare.md#bare-workflow) workflow.

You must ensure that you have [installed and configured the `react-native-unimodules` package](https://github.com/expo/expo/tree/master/packages/react-native-unimodules) before continuing.

### Add the package to your dependencies

```
npm install expo-in-app-purchases
```

### Configure for iOS

Run `npx pod-install` after installing the npm package.

### Configure for Android

Add this to your `android/app/src/main/AndroidManifest.xml` file:

```
<uses-permission android:name="com.android.vending.BILLING" />
```

## Setup

### iOS

In order to use the In-App Purchases API on iOS, you’ll need to sign the [Paid Applications Agreement](https://help.apple.com/app-store-connect/#/devb6df5ee51) and set up your banking and tax information. You also need to enable the [In-App Purchases capability](https://help.apple.com/xcode/mac/current/#/dev88ff319e7) for your app in Xcode.

Next, create an entry for your app in [App Store Connect](https://appstoreconnect.apple.com/) and configure your in-app purchases, including details (such as name, pricing, and description) that highlight the features and functionality of your in-app products. Make sure each product's status says `Ready to Submit`, otherwise it will not be queryable from within your app when you are testing. Be sure to add any necessary metadata to do so including uploading a screenshot (this can be anything when you're testing) and review notes. Your app's status must also say `Ready to Submit` but you do not need to actually submit your app or its products for review to test purchases in sandbox mode.

Now you can create a [sandbox account](https://help.apple.com/app-store-connect/#/dev8b997bee1) to test in-app purchases before you make your app available.

For more information, see Apple's workflow for configuring In-App Purchases [here](https://help.apple.com/app-store-connect/#/devb57be10e7).

### Android

On Android, you must first create an entry for your app and upload a release APK in the [Google Play Console](https://developer.android.com/distribute/console/). From there, you can configure your in-app purchases and their details under `Store Presence > In-app products`.

Then to test your purchases, you must publish your app to a closed or open testing track in Google Play. Note that it may take a few hours for the app to be available for testers. Ensure the testers you invite (including yourself) opt in to your app's test. On your test’s opt-in URL, your testers will get an explanation of what it means to be a tester and a link to opt-in. At this point, they're all set and can start making purchases once they download your app or build from source. For more information on testing, follow [these instructions](https://developer.android.com/google/play/billing/billing_testing).

> Note that in-app purchases require physical devices to work on both platforms and therefore **cannot be tested on simulators**.

## API

```js
import * as InAppPurchases from 'expo-in-app-purchases';
```

### `InAppPurchases.connectAsync()`

Connects to the app store and performs all of the necessary initialization to prepare the module to accept payments.

This method _must_ be called before anything else, otherwise an error will be thrown.

#### Returns

A `Promise` that resolves when finished connecting.

#### Example

```javascript
await connectAsync();
```

### `InAppPurchases.getProductsAsync(itemList: string[])`

Retrieves the product details (price, description, title, etc) for each item that you inputted in the Google Play Console and App Store Connect. These products are associated with your app's specific Application/Bundle ID and cannot be retrieved from other apps. This queries both in-app products and subscriptions so there's no need to pass those in separately.

You must retrieve an item's details _before_ you attempt to purchase it via `purchaseItemAsync`. This is a prerequisite to buying a product even if you have the item details bundled in your app or on your own servers.

If any of the product IDs passed in are invalid and don't exist, you will not receive an `IAPItemDetails` object corresponding to that ID. For example, if you pass in four product IDs in but one of them has a typo, you will only get three response objects back.

#### Arguments

- **itemList (_string[]_)** -- The list of product IDs whose details you want to query from the app store.

#### Returns

A `Promise` that resolves with an `IAPQueryResponse` containing `IAPItemDetails` objects in the results array.

#### Example

```javascript
/*
These product IDs must match the item entries you created in the App Store Connect and Google Play Console.
If you want to add more or edit their attributes you can do so there.
*/
const items = Platform.select({
  ios: [
    'dev.products.gas',
    'dev.products.premium',
    'dev.products.gold_monthly',
    'dev.products.gold_yearly',
  ],
  android: ['gas', 'premium', 'gold_monthly', 'gold_yearly'],
});

// Retrieve product details
const { responseCode, results } = await getProductsAsync(items);
if (responseCode === IAPResponseCode.OK) {
  this.setState({ items: results });
}
```

### `InAppPurchases.setPurchaseListener(callback: (result: IAPQueryResponse) => void)`

Sets a callback that handles incoming purchases. This must be done before any calls to `purchaseItemAsync` are made, otherwise those transactions will be lost. You should **set the purchase listener globally**, and not inside a specific screen, to ensure that you receive incomplete transactions, subscriptions, and deferred transactions.

Purchases can either be instantiated by the user (via `purchaseItemAsync`) or they can come from subscription renewals or unfinished transactions on iOS (e.g. if your app exits before `finishTransactionAsync` was called).

> Note that on iOS, the results array will only contain one item: the one that was just purchased. On Android, it will return both finished and unfinished purchases, hence the array return type. This is because the Google Play Billing API detects purchase updates but doesn't differentiate which item was just purchased, therefore there's no good way to tell but in general it will be whichever purchase has `acknowledged` set to `false`, so those are the ones that you have to handle in the response. Consumed items will not be returned however, so if you consume an item that record will be gone and no longer appear in the results array when a new purchase is made.

#### Arguments

- **callback (_(result: IAPQueryResponse) => void_)** -- The callback function you want to run when there is an update to the purchases.

#### Example

```javascript
// Set purchase listener
setPurchaseListener(({ responseCode, results, errorCode }) => {
  // Purchase was successful
  if (responseCode === IAPResponseCode.OK) {
    results.forEach(purchase => {
      if (!purchase.acknowledged) {
        console.log(`Successfully purchased ${purchase.productId}`);
        // Process transaction here and unlock content...

        // Then when you're done
        finishTransactionAsync(purchase, true);
      }
    });
  } else if (responseCode === IAPResponseCode.USER_CANCELED) {
    console.log('User canceled the transaction');
  } else if (responseCode === IAPResponseCode.DEFERRED) {
    console.log('User does not have permissions to buy but requested parental approval (iOS only)');
  } else {
    console.warn(`Something went wrong with the purchase. Received errorCode ${errorCode}`);
  }
});
```

### `InAppPurchases.purchaseItemAsync(productId: string, oldItem?: string)`

Initiates the purchase flow to buy the item associated with this `productId`. This will display a prompt to the user that will allow them to either buy the item or cancel the purchase. When the purchase completes, the result must be handled in the callback that you passed in to `setPurchaseListener`.

Remember, you have to query an item's details via `getProductsAsync` and set the purchase listener before you attempt to buy an item.

> [Apple](https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/StoreKitGuide/Chapters/Subscriptions.html) and [Google](https://developer.android.com/google/play/billing/billing_subscriptions) both have their own workflows for dealing with subscriptions. In general, you can deal with them in the same way you do one-time purchases but there are caveats including if a user decides to cancel before the expiration date. To check the status of a subscription, you can use the [Google Play Developer](https://developers.google.com/android-publisher/api-ref/purchases/subscriptions/get) API on Android and the [Status Update Notifications](https://developer.apple.com/documentation/storekit/in-app_purchase/enabling_status_update_notifications) service on iOS.

#### Arguments

- **productId (_string_)** -- The product ID of the item you want to buy.

- **oldItem (_string_)** -- The product ID of the item that the user is upgrading or downgrading from. This is mandatory for replacing an old subscription such as when a user upgrades from a monthly subscription to a yearly one that provides the same content (Android only).

#### Returns

A `Promise` that resolves when the purchase is done processing. To get the actual result of the purchase, you must handle purchase events inside the `setPurchaseListener` callback.

#### Example

```javascript
renderItem(item) {
    // Render product details with a "Buy" button
    return (
        <View key={item.productId}>
            ...
            <View style={styles.buttonContainer}>
                <Button title="Buy" onPress={() => purchaseItemAsync(item.productId)} />
            </View>
            ...
        </View>
    );
}

// To replace an existing subscription on Android
await purchaseItemAsync('gold_yearly', 'gold_monthly');
```

### `InAppPurchases.finishTransactionAsync(purchase: InAppPurchase, consumeItem: boolean)`

Marks a transaction as completed. This _must_ be called on successful purchases only after you have verified the transaction and unlocked the functionality purchased by the user.

On Android, this will either "acknowledge" or "consume" the purchase depending on the value of `consumeItem`. Acknowledging indicates that this is a one time purchase (e.g. premium upgrade), whereas consuming a purchase allows it to be bought more than once. You cannot buy an item again until it's consumed. Both consuming and acknowledging let Google know that you are done processing the transaction. If you do not acknowledge or consume a purchase within three days, the user automatically receives a refund, and Google Play revokes the purchase.

On iOS, this will mark the transaction as finished and prevent it from reappearing in the purchase listener callback. It will also let the user know their purchase was successful.

`consumeItem` is ignored on iOS because you must specify whether an item is a consumable or non-consumable in its product entry in App Store Connect, whereas on Android you indicate an item is consumable at runtime.

> Make sure that you verify each purchase to prevent faulty transactions and protect against fraud _before_ you call `finishTransactionAsync`. On iOS, you can validate the purchase's `transactionReceipt` with the App Store as described [here](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html). On Android, you can verify your purchase using the Google Play Developer API as described [here](https://developer.android.com/google/play/billing/billing_best_practices#validating-purchase).

#### Arguments

- **purchase (_InAppPurchase_)** -- The purchase you want to mark as completed.

- **consumeItem (_boolean_)** -- A boolean indicating whether or not the item is a consumable (Android only)

#### Example

```javascript
if (!purchase.acknowledged) {
  await finishTransactionAsync(purchase, false); // or true for consumables
}
```

### `InAppPurchases.getPurchaseHistoryAsync(refresh?: boolean)`

Retrieves the user's previous purchase history.

On Android, if refresh is set to `true` it will make a network request and return up to one entry per item even if that purchase is expired, canceled, or consumed. Use this if you want to sync purchases across devices or see purchases that are expired or consumed. If refresh is `false` it relies on the Play Store cache. An important caveat is that the return type when refresh is `true` is actually a subset of when it's `false`. This is because Android returns a `PurchaseHistoryRecord` which only contains the purchase time, purchase token, and product ID, rather than all of the attributes found in the `InAppPurchase` type.

On iOS, the refresh boolean is ignored. An important thing to note is that on iOS, Storekit actually creates a new transaction object every time you restore completed transactions, therefore the `purchaseTime` and `orderId` may be inaccurate if it's a restored purchase. If you need the original transaction's information you can use `originalPurchaseTime` and `originalOrderId`, but those will be 0 and an empty string respectively if it is the original transaction.

#### Arguments

- **refresh (_boolean_)** -- A boolean that indicates whether or not you want to make a network request to sync expired/consumed purchases and those on other devices (Android only)

#### Returns

A `Promise` that resolves with an `IAPQueryResponse` that contains an array of `InAppPurchase` objects.

#### Example

```javascript
const { responseCode, results } = await getPurchaseHistoryAsync();
if (responseCode === IAPResponseCode.OK) {
  results.forEach(result => {
    // Handle purchase history
  });
}
```

### `InAppPurchases.getBillingResponseCodeAsync()`

Returns the last response code. This is more descriptive on Android since there is native support for retrieving the billing response code.

On Android, this will return `IAPResponseCode.ERROR` if you are not connected or one of the billing response codes found [here](https://developer.android.com/reference/com/android/billingclient/api/BillingClient.BillingResponseCode) if you are.

On iOS, this will return `IAPResponseCode.OK` if you are connected or `IAPResponseCode.ERROR` if you are not. Therefore, it's a good way to test whether or not you are connected and it's safe to use the other methods.

#### Returns

A `Promise` that resolves with an integer representing the `IAPResponseCode`.

#### Example

```javascript
const responseCode = await getBillingResponseCodeAsync();
if (responseCode !== IAPResponseCode.OK) {
  // Either we're not connected or the last response returned an error (Android)
}
```

### `InAppPurchases.disconnectAsync()`

Disconnects from the app store and cleans up memory internally. Call this when you are done using the In-App Purchases API in your app.

No other methods can be used until the next time you call `connectAsync`.

#### Returns

A `Promise` that resolves when finished disconnecting.

#### Example

```javascript
await disconnectAsync();
```

## Object Types

### IAPQueryResponse

The response type for queries and purchases.

| Field name   | Type                                  | Platforms | Description                                                                                                             | Possible values                                                                                                       |
| ------------ | ------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| responseCode | _IAPResponseCode_                     | both      | The response code from a query or purchase.                                                                             | `IAPResponseCode.OK`, `IAPResponseCode.USER_CANCELED`, `IAPResponseCode.ERROR`, `IAPResponseCode.DEFERRED` (iOS only) |
| results      | _InAppPurchase[] or IAPItemDetails[]_ | both      | The array containing the `InAppPurchase` or `IAPItemDetails` objects requested depending on the method.                 |                                                                                                                       |
| errorCode    | _IAPErrorCode_                        | both      | `IAPErrorCode` that provides more detail on why an error occurred. Null unless responseCode is `IAPResponseCode.ERROR`. | `IAPErrorCode.PAYMENT_INVALID`, `IAPErrorCode.ITEM_ALREADY_OWNED`, `IAPErrorCode.UNKNOWN`                             |

### InAppPurchase

A record of a purchase made by the user.

| Field name           | Type                 | Platforms | Description                                                                                | Possible values                                               |
| -------------------- | -------------------- | --------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| productId            | _string_             | both      | The product ID representing an item inputted in Google Play Console and App Store Connect. | `gold`                                                        |
| acknowledged         | _boolean_            | both      | Boolean indicating whether this item has been "acknowledged" via `finishTransactionAsync`. |                                                               |
| purchaseState        | _InAppPurchaseState_ | both      | The state of the purchase.                                                                 | `InAppPurchaseState.PURCHASED`, `InAppPurchaseState.RESTORED` |
| purchaseTime         | _number_             | both      | The time the product was purchased, in milliseconds since the epoch (Jan 1, 1970).         |                                                               |
| orderId              | _string_             | both      | A string that uniquely identifies a successful payment transaction.                        |                                                               |
| packageName          | _string_             | Android   | The application package from which the purchase originated.                                | `com.example.myapp`                                           |
| purchaseToken        | _string_             | Android   | A token that uniquely identifies a purchase for a given item and user pair.                |                                                               |
| originalOrderId      | _string_             | iOS       | Represents the original order ID for restored purchases.                                   |                                                               |
| originalPurchaseTime | _string_             | iOS       | Represents the original purchase time for restored purchases.                              |                                                               |
| transactionReceipt   | _string_             | iOS       | The App Store receipt found in the main bundle encoded as a Base 64 String.                |

### IAPItemDetails

Details about the purchasable item that you inputted in App Store Connect and Google Play Console.

| Field name         | Type          | Platforms | Description                                                                                                                                                                                      | Possible values                                    |
| ------------------ | ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| productId          | _string_      | both      | The product ID representing an item inputted in App Store Connect and Google Play Console.                                                                                                       | `gold`                                             |
| title              | _string_      | both      | The title of the purchasable item. This should be displayed to the user and may be different from the productId.                                                                                 | `Gold Coin`                                        |
| description        | _string_      | both      | User facing description about the item.                                                                                                                                                          | `Currency used to trade for items in the game`     |
| price              | _string_      | both      | The price formatted with the local currency symbol. Use this to display the price, not to make calculations.                                                                                     | `$1.99`                                            |
| priceAmountMicros  | _number_      | both      | The price in micro-units, where 1,000,000 micro-units equal one unit of the currency. Use this for calculations.                                                                                 | `1990000`                                          |
| priceCurrencyCode  | _string_      | both      | The local currency code from the ISO 4217 code list.                                                                                                                                             | `USD`, `CAN`, `RUB`                                |
| type               | _IAPItemType_ | both      | The type of the purchase. Note that this is not very accurate on iOS as this data is only available on iOS 11.2 and higher and non-renewable subscriptions always return `IAPItemType.PURCHASE`. | `IAPItemType.PURCHASE`, `IAPItemType.SUBSCRIPTION` |
| subscriptionPeriod | _string_      | both      | The length of a subscription period specified in ISO 8601 format. In-app purchases return `P0D`. On iOS, non-renewable subscriptions also return `P0D`.                                          | `P0D`, `P6W`, `P3M`, `P6M`, `P1Y`                  |

## Enum Types

### `InAppPurchases.IAPResponseCode`

- **`IAPResponseCode.OK`** - Response returned successfully.
- **`IAPResponseCode.USER_CANCELED`** - User canceled the purchase.
- **`IAPResponseCode.ERROR`** - An error occurred. Check the `errorCode` for additional details.
- **`IAPResponseCode.DEFERRED`** - Purchase was deferred (iOS only).

### `InAppPurchases.InAppPurchaseState`

- **`InAppPurchaseState.PURCHASING`** - The transaction is being processed.
- **`InAppPurchaseState.PURCHASED`** - The App Store successfully processed payment.
- **`InAppPurchaseState.FAILED`** - The transaction failed.
- **`InAppPurchaseState.RESTORED`** - This transaction restores content previously purchased by the user. Read the originalTransaction properties to obtain information about the original purchase (iOS only).
- **`InAppPurchaseState.DEFERRED`** - The transaction has been received, but its final status is pending external action such as the Ask to Buy feature where a child initiates a new purchase and has to wait for the family organizer's approval. Update your UI to show the deferred state, and wait for another callback that indicates the final status (iOS only).

### `InAppPurchases.IAPItemType`

- **`IAPItemType.PURCHASE`** - One time purchase or consumable.
- **`IAPItemType.SUBSCRIPTION`** - Subscription.

### `InAppPurchases.IAPErrorCode`

Abstracts over the Android [Billing Response Codes](https://developer.android.com/reference/com/android/billingclient/api/BillingClient.BillingResponseCode) and iOS [SKErrorCodes](https://developer.apple.com/documentation/storekit/skerrorcode?language=objc).

- **`IAPErrorCode.UNKNOWN`** - An unknown or unexpected error occurred. See`SKErrorUnknown` on iOS, `ERROR` on Android.
- **`IAPErrorCode.PAYMENT_INVALID`** - The feature is not allowed on the current device, or the user is not authorized to make payments. See `SKErrorClientInvalid`, `SKErrorPaymentInvalid`, and `SKErrorPaymentNotAllowed` on iOS, `FEATURE_NOT_SUPPORTED` on Android.
- **`IAPErrorCode.SERVICE_DISCONNECTED`** - Play Store service is not connected now. See `SERVICE_DISCONNECTED` on Android.
- **`IAPErrorCode.SERVICE_UNAVAILABLE`** - Network connection is down. See `SERVICE_UNAVAILABLE` on Android.
- **`IAPErrorCode.SERVICE_TIMEOUT`** - The request has reached the maximum timeout before Google Play responds. See `SERVICE_TIMEOUT` on Android.
- **`IAPErrorCode.BILLING_UNAVAILABLE`** - Billing API version is not supported for the type requested. See `BILLING_UNAVAILABLE` on Android.
- **`IAPErrorCode.ITEM_UNAVAILABLE`** - Requested product is not available for purchase. See `SKErrorStoreProductNotAvailable` on iOS, `ITEM_UNAVAILABLE` on Android.
- **`IAPErrorCode.DEVELOPER_ERROR`** - Invalid arguments provided to the API. This error can also indicate that the application was not correctly signed or properly set up for In-app Billing in Google Play. See `DEVELOPER_ERROR` on Android.
- **`IAPErrorCode.ITEM_ALREADY_OWNED`** - Failure to purchase since item is already owned. See `ITEM_ALREADY_OWNED` on Android.
- **`IAPErrorCode.ITEM_NOT_OWNED`** - Failure to consume since item is not owned. See `ITEM_NOT_OWNED` on Android.
- **`IAPErrorCode.CLOUD_SERVICE`** - Apple Cloud Service connection failed or invalid permissions. See `SKErrorCloudServicePermissionDenied`, `SKErrorCloudServiceNetworkConnectionFailed`, and `SKErrorCloudServiceRevoked` on iOS.
- **`IAPErrorCode.PRIVACY_UNACKNOWLEDGED`** - The user has not yet acknowledged Apple’s privacy policy for Apple Music. See `SKErrorPrivacyAcknowledgementRequired` on iOS.
- **`IAPErrorCode.UNAUTHORIZED_REQUEST`** - The app is attempting to use a property for which it does not have the required entitlement. See `SKErrorUnauthorizedRequestData` on iOS.
- **`IAPErrorCode.INVALID_IDENTIFIER`** - The offer identifier or price specified in App Store Connect is no longer valid. See `SKErrorInvalidSignature`, `SKErrorInvalidOfferPrice`, `SKErrorInvalidOfferIdentifier` on iOS.
- **`IAPErrorCode.MISSING_PARAMS`** - Parameters are missing in a payment discount. See `SKErrorMissingOfferParams` on iOS.
