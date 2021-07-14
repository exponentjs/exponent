---
title: Payments
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-payments-stripe'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

> **This library is deprecated in favor of [`@stripe/stripe-react-native`](./stripe.md), and will be removed in SDK 43.** [Here's a guide to help make the transition as easy as possible](https://github.com/expo/fyi/blob/master/payments-migration-guide.md#how-to-migrate-from-expo-payments-stripe-to-the-new-stripestripe-react-native-library).

> 🚨 On iOS, the Payments module is currently only supported the [bare workflow](https://docs.expo.io/workflow/customizing/).

Payments uses [Stripe](https://stripe.com/) and [Apple Pay](https://www.apple.com/apple-pay/) on iOS, but the module is only available in bare workflow apps.

Stripe is supported in the managed workflow for Android, and Android Pay is supported in the bare workflow.

Need more help than what's on the page? The Payments module is largely based off [tipsi-stripe](https://github.com/tipsi/tipsi-stripe). The documentation and questions there may prove helpful.

<PlatformsSection android ios simulator web={{ pending: 'https://github.com/expo/expo/issues/4046' }} />

## Installation

<InstallSection packageName="expo-payments-stripe" />

## Setup

If you haven't done payments with Stripe before, create an account with [Stripe](https://dashboard.stripe.com/register). After getting the account set up, navigate to the [Stripe API dashboard](https://dashboard.stripe.com/account/apikeys). Here, you'll need to make a note of the Publishable key and Secret key listed.

### Register hook in order to let Stripe process source authorization

> You don't need to make this step if you're not going to use [sources](https://stripe.com/docs/mobile/ios/sources).

For iOS, follow [Stripe instructions](https://stripe.com/docs/mobile/ios/sources#redirecting-your-customer).

For Android, add the following code to your `AndroidManifest.xml`, replacing `your_scheme` with the URI scheme you're going to use when specifying return URL for payment process.

> 💡 If you are using Expo Go then the setup has already been done for you.

```xml
      ...
      <activity
          android:exported="true"
          android:launchMode="singleTask"
          android:name="expo.modules.payments.stripe.RedirectUriReceiver"
          android:theme="@android:style/Theme.Translucent.NoTitleBar.Fullscreen">
          <intent-filter>
              <action android:name="android.intent.action.VIEW" />
              <category android:name="android.intent.category.DEFAULT" />
              <category android:name="android.intent.category.BROWSABLE" />

              <data android:scheme="your_scheme" />
          </intent-filter>
      </activity>
      ...
```

Remember to use the same scheme as the one which was set in `Info.plist` file (only if you are also developing app for iOS).

## Importing Payments

```javascript
import { PaymentsStripe as Stripe } from 'expo-payments-stripe';

...
Stripe.setOptionsAsync({
    ...
});
...
```

## Using the Payments SDK

First, initialize the Payments module with your credentials:

This `setOptionsAsync` method must put under the componentDidMount in android's production mode, unlike iOS that it works outside any component.

```javascript
Stripe.setOptionsAsync({
  publishableKey: 'PUBLISHABLE_KEY', // Your key
  androidPayMode: 'test', // [optional] used to set wallet environment (AndroidPay)
  merchantId: 'your_merchant_id', // [optional] used for payments with ApplePay
});
```

### Creating token [Android, iOS]

Creates token based on passed card params.

**params** — An object with the following keys:

| Key                   | Type   | Description                                                                                                                                                                                                                                                                                      |
| :-------------------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| number (Required)     | String | The card’s number                                                                                                                                                                                                                                                                                |
| expMonth (Required)   | Number | The card’s expiration month                                                                                                                                                                                                                                                                      |
| expYear (Required)    | Number | The card’s expiration year                                                                                                                                                                                                                                                                       |
| cvc                   | String | The card’s security code, found on the back                                                                                                                                                                                                                                                      |
| name                  | String | The cardholder’s name                                                                                                                                                                                                                                                                            |
| addressLine1          | String | The first line of the billing address                                                                                                                                                                                                                                                            |
| addressLine2          | String | The second line of the billing address                                                                                                                                                                                                                                                           |
| addressCity           | String | City of the billing address                                                                                                                                                                                                                                                                      |
| addressState          | String | State of the billing address                                                                                                                                                                                                                                                                     |
| addressZip            | String | Zip code of the billing address                                                                                                                                                                                                                                                                  |
| addressCountry        | String | Country for the billing address                                                                                                                                                                                                                                                                  |
| brand (Android)       | String | Brand of this card. Can be one of: **JCB ‖ American Express ‖ Visa ‖ Discover ‖ Diners Club ‖ MasterCard ‖ Unknown**                                                                                                                                                                             |
| last4 (Android)       | String | last 4 digits of the card                                                                                                                                                                                                                                                                        |
| fingerprint (Android) | String | The card fingerprint                                                                                                                                                                                                                                                                             |
| funding (Android)     | String | The funding type of the card. Can be one of: **debit ‖ credit ‖ prepaid ‖ unknown**                                                                                                                                                                                                              |
| country (Android)     | String | ISO country code of the card itself                                                                                                                                                                                                                                                              |
| currency              | String | Three-letter ISO currency code representing the currency paid out to the bank account. This is only applicable when tokenizing debit cards to issue payouts to managed accounts. You should not set it otherwise. The card can then be used as a transfer destination for funds in this currency |

```js
const params = {
  // mandatory
  number: '4242424242424242',
  expMonth: 11,
  expYear: 2025,
  cvc: '223',
  // optional
  name: 'Test User',
  currency: 'usd',
  addressLine1: '123 Test Street',
  addressLine2: 'Apt. 5',
  addressCity: 'Test City',
  addressState: 'Test State',
  addressCountry: 'Test Country',
  addressZip: '55555',
};

const token = await Stripe.createTokenWithCardAsync(params);

// Client specific code
// api.sendTokenToBackend(token)
```

> Remember to initialize the Payments module before creating token.

## Payment request with card form [Android, iOS]

Launch `Add Card` view to accept payment.

**options (iOS only)** — An object with the following keys:

| Key                          | Type   | Description                                                                                                                                             |
| :--------------------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| requiredBillingAddressFields | String | The billing address fields the user must fill out when prompted for their payment details. Can be one of: **full** or **zip** or not specify to disable |
| prefilledInformation         | Object | You can set this property to pre-fill any information you’ve already collected from your user                                                           |
| managedAccountCurrency       | String | Required to be able to add the card to an account (in all other cases, this parameter is not used). More info                                           |
| theme                        | Object | Can be used to visually style Stripe-provided UI                                                                                                        |

**options.prefilledInformation** — An object with the following keys:

|       Key       |  Type  | Description                                                                                                                                                                             |
| :-------------: | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| shippingAddress | Object | The user’s shipping address. When set, the shipping address form will be filled with this address. The user will also have the option to fill their billing address using this address. |
| billingAddress  | Object | The user’s billing address. When set, the "add card" form will be filled with this address. The user will also have the option to fill their shipping address using this address.       |

**options.prefilledInformation.billingAddress** — An object with the following keys:

| Key        | Type   | Description                                                                         |
| :--------- | :----- | :---------------------------------------------------------------------------------- |
| name       | String | The user’s full name (e.g. "Jane Doe")                                              |
| line1      | String | The first line of the user’s street address (e.g. "123 Fake St")                    |
| line2      | String | The apartment, floor number, etc of the user’s street address (e.g. "Apartment 1A") |
| city       | String | The city in which the user resides (e.g. "San Francisco")                           |
| state      | String | The state in which the user resides (e.g. "CA")                                     |
| postalCode | String | The postal code in which the user resides (e.g. "90210")                            |
| country    | String | The ISO country code of the address (e.g. "US")                                     |
| phone      | String | The phone number of the address (e.g. "8885551212")                                 |
| email      | String | The email of the address (e.g. "jane@doe.com")                                      |

**options.theme** — An object with the following keys:

| Key                      | Type   | Description                                                                                                                                                                                                               |
| :----------------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| primaryBackgroundColor   | String | The primary background color of the theme                                                                                                                                                                                 |
| secondaryBackgroundColor | String | The secondary background color of this theme                                                                                                                                                                              |
| primaryForegroundColor   | String | The primary foreground color of this theme. This will be used as the text color for any important labels in a view with this theme (such as the text color for a text field that the user needs to fill out)              |
| secondaryForegroundColor | String | The secondary foreground color of this theme. This will be used as the text color for any supplementary labels in a view with this theme (such as the placeholder color for a text field that the user needs to fill out) |
| accentColor              | String | The accent color of this theme - it will be used for any buttons and other elements on a view that are important to highlight                                                                                             |
| errorColor               | String | The error color of this theme - it will be used for rendering any error messages or view                                                                                                                                  |

### Example

```js
const options = {
  requiredBillingAddressFields: 'full',
  prefilledInformation: {
    billingAddress: {
      name: 'Gunilla Haugeh',
      line1: 'Canary Place',
      line2: '3',
      city: 'Macon',
      state: 'Georgia',
      country: 'US',
      postalCode: '31217',
    },
  },
};

const token = await stripe.paymentRequestWithCardFormAsync(options);

// Client specific code
// api.sendTokenToBackend(token)
```

## Creating source [Android, iOS]

Creates source object based on params. Sources are used to create payments for a variety of [payment methods](https://stripe.com/docs/sources)

_NOTE_: For sources that require redirecting your customer to authorize the payment, you need to specify a return URL when you create the source. This allows your customer to be redirected back to your app after they authorize the payment. The prefix before ':' in your return URL should be the same as the scheme in your `info.plist` and `AndroidManifest.xml`. If you are not sure about this step look at above sections "Register hook in order to Stripe could process source authorization".

_NOTE_: If you are using Expo Go or an ejected Expo application, do not specify `returnURL`.

`params` — An object with the following keys:

**Depending on the type you need to provide different params. Check the STPSourceParams docs for reference**

| Key                 | Type   | Description                                                                                                                                     |
| :------------------ | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| type (Required)     | String | The type of the source to create. Can be one of: **bancontact ‖ bitcoin ‖ card ‖ griopay ‖ ideal ‖ sepaDebit ‖ sofort ‖ threeDSecure ‖ alipay** |
| amount              | Number | A positive number in the smallest currency unit representing the amount to charge the customer (e.g., 1099 for a €10.99 payment)                |
| name                | String | The full name of the account holder                                                                                                             |
| returnURL           | String | The URL the customer should be redirected to after they have successfully verified the payment                                                  |
| statementDescriptor | String | A custom statement descriptor for the payment                                                                                                   |
| currency            | String | The currency associated with the source. This is the currency for which the source will be chargeable once ready                                |
| email               | String | The customer’s email address                                                                                                                    |
| bank                | String | The customer’s bank                                                                                                                             |
| iban                | String | The IBAN number for the bank account you wish to debit                                                                                          |
| addressLine1        | String | The bank account holder’s first address line (optional)                                                                                         |
| city                | String | The bank account holder’s city                                                                                                                  |
| postalCode          | String | The bank account holder’s postal code                                                                                                           |
| country             | String | The bank account holder’s two-letter country code (sepaDebit) or the country code of the customer’s bank (sofort)                               |
| card                | String | The ID of the card source                                                                                                                       |

### Example

```js
const params = {
  type: 'alipay',
  amount: 5,
  currency: 'EUR',
  returnURL: 'expaymentsstripe://stripe-redirect',
};

const source = await stripe.createSourceWithParamsAsync(params);

// Client specific code
// api.sendSourceToBackend(source)
```

## ApplePay [iOS]

Remember: to use Apple Pay on a real device, you need to [set up apple pay first](#enabling-apple-pay-in-bare).

### `openApplePaySetupAsync()`

Opens the user interface to set up credit cards for Apple Pay.

### `canMakeApplePayPaymentsAsync([options]) -> Promise`

Returns whether the user can make Apple Pay payments with specified options.
If there are no configured payment cards, this method always returns `false`.
Return `true` if the user can make Apple Pay payments through any of the specified networks; otherwise, `false`.

**NOTE**: iOS Simulator always returns `true`

##### `options`

| Key      | Type          | Description                                                                                                                                                                                                                               |
| :------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| networks | Array[String] | Indicates whether the user can make Apple Pay payments through the specified network. Available networks: **american_express ‖ discover ‖ master_card ‖ visa**. If option does not specify we pass all available networks under the hood. |

#### Example

```js
import { PaymentsStripe as Stripe } from 'expo-payments-stripe';

await Stripe.canMakeApplePayPaymentsAsync();
```

```js
import { PaymentsStripe as Stripe } from 'expo-payments-stripe';

await Stripe.canMakeApplePayPaymentsAsync(['american_express', 'discover']);
```

### `deviceSupportsApplePayAsync() -> Promise`

Returns whether the user can make Apple Pay payments.
User may not be able to make payments for a variety of reasons. For example, this functionality may not be supported by their hardware, or it may be restricted by parental controls.
Returns `true` if the device supports making payments; otherwise, `false`.

_NOTE_: iOS Simulator always returns `true`

### `paymentRequestWithApplePayAsync(items, [options]) -> Promise`

Launch the  Pay view to accept payment.

##### `items` — An array of object with the following keys:

| Key    | Type     | Description                                                                 |
| :----- | :------- | :-------------------------------------------------------------------------- |
| label  | _String_ | A short, localized description of the item.                                 |
| amount | _String_ | The summary item’s amount.                                                  |
| type   | _String_ | The summary item’s type. Must be "pending" or "final". Defaults to "final". |

**NOTE**: The final item should represent your company; it'll be prepended with the word "Pay" (i.e. "Pay Tipsi, Inc \$50")

##### `options` — An object with the following keys:

| Key                           | Type          | Description                                                                                                                                                                                      |
| :---------------------------- | :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| requiredBillingAddressFields  | Array[String] | A bit field of billing address fields that you need in order to process the transaction. Array should contain one of: **all ‖ name ‖ email ‖ phone ‖ postal_address** or not specify to disable  |
| requiredShippingAddressFields | Array[String] | A bit field of shipping address fields that you need in order to process the transaction. Array should contain one of: **all ‖ name ‖ email ‖ phone ‖ postal_address** or not specify to disable |
| shippingMethods               | Array         | An array of `shippingMethod` objects that describe the supported shipping methods.                                                                                                               |
| currencyCode                  | String        | The three-letter ISO 4217 currency code. Default is **USD**                                                                                                                                      |
| countryCode                   | String        | The two-letter code for the country where the payment will be processed. Default is **US**                                                                                                       |
| shippingType                  | String        | An optional value that indicates how purchased items are to be shipped. Default is **shipping**. Available options are: **shipping ‖ delivery ‖ store_pickup ‖ service_pickup**                  |

##### `shippingMethod` — An object with the following keys:

| Key    | Type   | Description                                                  |
| :----- | :----- | :----------------------------------------------------------- |
| id     | String | A unique identifier for the shipping method, used by the app |
| id     | String | A short, localized description of the shipping method        |
| label  | String | A unique identifier for the shipping method, used by the app |
| detail | String | A user-readable description of the shipping method           |
| amount | String | The shipping method’s amount                                 |

#### Example

```js
const items = [
  {
    label: 'Whisky',
    amount: '50.00',
  },
  {
    label: 'Tipsi, Inc',
    amount: '50.00',
  },
];

const shippingMethods = [
  {
    id: 'fedex',
    label: 'FedEX',
    detail: 'Test @ 10',
    amount: '10.00',
  },
];

const options = {
  requiredBillingAddressFields: ['all'],
  requiredShippingAddressFields: ['phone', 'postal_address'],
  shippingMethods,
};

const token = await stripe.paymentRequestWithApplePayAsync(items, options);
```

#### Token structure – `paymentRequestWithApplePayAsync` response

`extra` — An object with the following keys

| Key             | Type   | Description                        |
| :-------------- | :----- | :--------------------------------- |
| shippingMethod  | Object | Selected shippingMethod object     |
| billingContact  | Object | The user's billing contact object  |
| shippingContact | Object | The user's shipping contact object |

`contact` — An object with the following keys

| Key                      | Type   | Description                                              |
| :----------------------- | :----- | :------------------------------------------------------- |
| name                     | String | The contact’s name                                       |
| phoneNumber              | String | The contact’s phone number                               |
| emailAddress             | String | The contact’s email address                              |
| street                   | String | The street name in a postal address                      |
| city                     | String | The city name in a postal address                        |
| state                    | String | The state name in a postal address                       |
| country                  | String | The country name in a postal address                     |
| ISOCountryCode           | String | The ISO country code for the country in a postal address |
| postalCode               | String | The postal code in a postal address                      |
| supplementarySubLocality | String | The contact’s sublocality                                |

### `completeApplePayRequestAsync()/cancelApplePayRequestAsync() -> Promise`

After `paymentRequestWithApplePayAsync` you should complete the operation by calling `completeApplePayRequestAsync` or cancel if an error occurred. This closes Apple Pay. (resolves to undefined, you do not need to store the Promise)

```js
const items = [
  {
    label: 'Whisky',
    amount: '50.00',
  },
  {
    label: 'Tipsi, Inc',
    amount: '50.00',
  },
];

const shippingMethods = [
  {
    id: 'fedex',
    label: 'FedEX',
    detail: 'Test @ 10',
    amount: '10.00',
  },
];

const options = {
  requiredBillingAddressFields: 'all',
  requiredShippingAddressFields: 'all',
  shippingMethods,
};

try {
  const token = await stripe.paymentRequestWithApplePayAsync(items, options);

  // Client specific code
  // api.sendTokenToBackend(token)

  // You should complete the operation by calling
  stripe.completeApplePayRequestAsync();
} catch (error) {
  // Or cancel if an error occurred
  // stripe.cancelApplePayRequestAsync()
}
```

## AndroidPay

Android Pay (also known as Google Pay) is currently only supported in the bare workflow. To add it to your app, add the following lines to your `AndroidManifest.xml` file, inside of the `<application>....</applicaton>` tags:

```xml
<meta-data
  android:name="com.google.android.gms.wallet.api.enabled"
  android:value="true" />
```

### `deviceSupportsAndroidPayAsync() -> Promise`

Indicates whether or not the device supports AndroidPay. Returns a `Boolean` value.

```js
import { PaymentsStripe as Stripe } from 'expo-payments-stripe';

await Stripe.deviceSupportsAndroidPayAsync();
```

### `canMakeAndroidPayPaymentsAsync() -> Promise`

Indicates whether or not the device supports AndroidPay and user has existing payment method. Returns a `Boolean` value.

```js
import { PaymentsStripe as Stripe } from 'expo-payments-stripe';

await Stripe.canMakeAndroidPayPaymentsAsync();
```

### `paymentRequestWithAndroidPayAsync(options) -> Promise`

**options** — An object with the following keys:

| Key                                       | Type   | Description                                                                           |
| :---------------------------------------- | :----- | :------------------------------------------------------------------------------------ |
| total_price                               | String | Total price for items                                                                 |
| currency_code                             | String | Three-letter ISO currency code representing the currency paid out to the bank account |
| shipping_address_required&nbsp;(Optional) | Bool   | Is shipping address menu required? Default is **false**                               |
| billing_address_required&nbsp;(Optional)  | Bool   | Is billing address menu required? Default is **false**                                |
| line_items                                | Array  | Array of purchased items. Each item contains **line_item**                            |

**line_item** — An object with the following keys:

| Key           | Type   | Description                               |
| :------------ | :----- | :---------------------------------------- |
| currency_code | String | Currency code string                      |
| description   | String | Short description that will shown to user |
| total_price   | String | Total order price                         |
| unit_price    | String | Price per unit                            |
| quantity      | String | Number of items                           |

#### Example

```js
const options = {
  total_price: '80.00',
  currency_code: 'USD',
  shipping_address_required: false,
  billing_address_required: true,
  shipping_countries: ['US', 'CA'],
  line_items: [
    {
      currency_code: 'USD',
      description: 'Whisky',
      total_price: '50.00',
      unit_price: '50.00',
      quantity: '1',
    },
    {
      currency_code: 'USD',
      description: 'Vine',
      total_price: '30.00',
      unit_price: '30.00',
      quantity: '1',
    },
  ],
};

const token = await stripe.paymentRequestWithAndroidPayAsync(options);

// Client specific code
// api.sendTokenToBackend(token)
```

Example of token:

```
{ card:
  { currency: null,
    fingerprint: null,
    funding: "credit",
    brand: "MasterCard",
    number: null,
    addressState: null,
    country: "US",
    cvc: null,
    expMonth: 12,
    addressLine1: null,
    expYear: 2022,
    addressCountry: null,
    name: null,
    last4: "4448",
    addressLine2: null,
    addressCity: null,
    addressZip: null
  },
  created: 1512322244000,
  used: false,
  extra: {
    email: "randomemail@mail.com",
    billingContact: {
      postalCode: "220019",
      name: "John Doe",
      locality: "NY",
      countryCode: "US",
      administrativeArea: "US",
      address1: "Time square 1/11"
    },
    shippingContact: {}
  },
  livemode: false,
  tokenId: "tok_1BV1IeDZwqOES60ZphBXBoDr"
}
```

## Structures of the objects

### The Token object

A `token object` returned from submitting payment details to the Stripe API via:

- `paymentRequestWithApplePayAsync`
- `paymentRequestWithCardFormAsync`
- `createTokenWithCardAsync`

##### `token` — an object with the following keys

| Key         | Type   | Description                                                                                                                                     |
| :---------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| tokenId     | String | The value of the token. You can store this value on your server and use it to make charges and customers                                        |
| created     | Number | When the token was created                                                                                                                      |
| livemode    | Number | Whether or not this token was created in livemode. Will be 1 if you used your Live Publishable Key, and 0 if you used your Test Publishable Key |
| card        | Object | The credit card details object that were used to create the token                                                                               |
| bankAccount | Object | The external (bank) account details object that were used to create the token                                                                   |
| extra       | Object | An additional information that method can provide                                                                                               |

##### `card` — an object with the following keys

| Key                       | Type   | Description                                                                                                                                                              |
| :------------------------ | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cardId                    | String | The Stripe ID for the card                                                                                                                                               |
| brand                     | String | The card’s brand. Can be one of: **JCB **‖ **American Express **‖ **Visa **‖ **Discover **‖ **Diners Club **‖ **MasterCard **‖ **Unknown**                               |
| funding (iOS)             | String | The card’s funding. Can be one of: **debit **‖ **credit **‖ **prepaid **‖ **unknown**                                                                                    |
| last4                     | String | The last 4 digits of the card                                                                                                                                            |
| dynamicLast4&nbsp;(iOS)   | String | For cards made with Apple Pay, this refers to the last 4 digits of the Device Account Number for the tokenized card                                                      |
| isApplePayCard&nbsp;(iOS) | Bool   | Whether or not the card originated from Apple Pay                                                                                                                        |
| expMonth                  | Number | The card’s expiration month. 1-indexed (i.e. 1 == January)                                                                                                               |
| expYear                   | Number | The card’s expiration year                                                                                                                                               |
| country                   | String | Two-letter ISO code representing the issuing country of the card                                                                                                         |
| currency                  | String | This is only applicable when tokenizing debit cards to issue payouts to managed accounts. The card can then be used as a transfer destination for funds in this currency |
| name                      | String | The cardholder’s name                                                                                                                                                    |
| addressLine1              | String | The cardholder’s first address line                                                                                                                                      |
| addressLine2              | String | The cardholder’s second address line                                                                                                                                     |
| addressCity               | String | The cardholder’s city                                                                                                                                                    |
| addressState              | String | The cardholder’s state                                                                                                                                                   |
| addressCountry            | String | The cardholder’s country                                                                                                                                                 |
| addressZip                | String | The cardholder’s zip code                                                                                                                                                |

##### `bankAccount`

| Key               | Type   | Description                                                        |
| :---------------- | :----- | :----------------------------------------------------------------- |
| routingNumber     | String | The routing number of this account                                 |
| accountNumber     | String | The account number for this BankAccount.                           |
| countryCode       | String | The two-letter country code that this account was created in       |
| currency          | String | The currency of this account                                       |
| accountHolderName | String | The account holder's name                                          |
| accountHolderType | String | the bank account type. Can be one of: **company **‖ **individual** |
| fingerprint       | String | The account fingerprint                                            |
| bankName          | String | The name of bank                                                   |
| last4             | String | The last four digits of the account number                         |

#### Example

```js
{
  tokenId: 'tok_19GCAQI5NuVQgnjeKNE32K0p',
  created: 1479236426,
  livemode: 0,
  card: {
    cardId: 'card_19GCAQI5NuVQgnjeRZizG4U3',
    brand: 'Visa',
    funding: 'credit',
    last4: '4242',
    expMonth: 4,
    expYear: 2024,
    country: 'US',
    name: 'Eugene Grissom',
    addressLine1: 'Green Street',
    addressLine2: '3380',
    addressCity: 'Nashville',
    addressState: 'Tennessee',
    addressCountry: 'US',
    addressZip: '37211',
  },
  bankAccount: {
    bankName: 'STRIPE TEST BANK',
    accountHolderType: 'company',
    last4: '6789',
    accountHolderName: 'Test holder name',
    currency: 'usd',
    fingerprint: 'afghsajhaartkjasd',
    countryCode: 'US',
    accountNumber: '424542424',
    routingNumber: '110000000',
  },
}
```

### The Source object

A source object returned from creating a source (via `createSourceWithParamsAsync`) with the Stripe API.

##### `source` — an object with the following keys:

| Key              | Type              | Description                                                                                                                                                   |
| :--------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| amount           | Number            | The amount associated with the source                                                                                                                         |
| clientSecret     | String            | The client secret of the source. Used for client-side polling using a publishable key                                                                         |
| created          | Number            | When the source was created                                                                                                                                   |
| currency         | String            | The currency associated with the source                                                                                                                       |
| flow             | String            | The authentication flow of the source. Can be one of: **none ‖ redirect ‖ verification ‖ receiver ‖ unknown**                                                 |
| livemode         | Bool              | Whether or not this source was created in _livemode_. Will be _true_ if you used your Live Publishable Key, and _false_ if you used your Test Publishable Key |
| metadata         | Object            | A set of key/value pairs associated with the source object                                                                                                    |
| owner            | Object            | Information about the owner of the payment instrument                                                                                                         |
| receiver         | Object (Optional) | Information related to the receiver flow. Present if the source is a receiver                                                                                 |
| redirect         | Object (Optional) | Information related to the redirect flow. Present if the source is authenticated by a redirect                                                                |
| status           | String            | The status of the source. Can be one of: **pending ‖ chargable ‖ consumed ‖ cancelled ‖ failed**                                                              |
| type             | String            | The type of the source. Can be one of: **bancontact ‖ card ‖ griopay ‖ ideal ‖ sepaDebit ‖ sofort ‖ threeDSecure ‖ alipay ‖ unknown**                         |
| usage            | String            | Whether this source should be reusable or not. Can be one of: **reusable ‖ single ‖ unknown**                                                                 |
| verification     | Object (Optional) | Information related to the verification flow. Present if the source is authenticated by a verification                                                        |
| details          | Object            | Information about the source specific to its type                                                                                                             |
| cardDetails      | Object (Optional) | If this is a card source, this property contains information about the card                                                                                   |
| sepaDebitDetails | Object (Optional) | If this is a SEPA Debit source, this property contains information about the sepaDebit                                                                        |

##### `owner`

| Key             | Type              | Description                    |
| :-------------- | :---------------- | :----------------------------- |
| address         | Object (Optional) | Owner’s address                |
| email           | String (Optional) | Owner’s email address          |
| name            | String (Optional) | Owner’s full name              |
| phone           | String (Optional) | Owner’s phone number           |
| verifiedAddress | Object (Optional) | Verified owner’s address       |
| verifiedEmail   | String (Optional) | Verified owner’s email address |
| verifiedName    | String (Optional) | Verified owner’s full name     |
| verifiedPhone   | String (Optional) | Verified owner’s phone number  |

##### `receiver`

| Key            | Type   | Description                                                                                                              |
| :------------- | :----- | :----------------------------------------------------------------------------------------------------------------------- |
| address        | Object | The address of the receiver source. This is the value that should be communicated to the customer to send their funds to |
| amountCharged  | Number | The total amount charged by you                                                                                          |
| amountReceived | Number | The total amount received by the receiver source                                                                         |
| amountReturned | Number | The total amount that was returned to the customer                                                                       |

##### `redirect`

| Key       | Type   | Description                                                                                 |
| :-------- | :----- | :------------------------------------------------------------------------------------------ |
| returnURL | String | The URL you provide to redirect the customer to after they authenticated their payment      |
| status    | String | The status of the redirect. Can be one of: **pending ‖ succeeded ‖ failed ‖ unknown**       |
| url       | String | The URL provided to you to redirect a customer to as part of a redirect authentication flow |

##### `verification`

| Key               | Type   | Description                                                                                 |
| :---------------- | :----- | :------------------------------------------------------------------------------------------ |
| attemptsRemaining | Number | The number of attempts remaining to authenticate the source object with a verification code |
| status            | String | The status of the verification. Can be one of: **pending ‖ succeeded ‖ failed ‖ unknown**   |

##### `cardDetails`

| Key             | Type   | Description                                                                                                              |
| :-------------- | :----- | :----------------------------------------------------------------------------------------------------------------------- |
| last4           | String | The last 4 digits of the card                                                                                            |
| expMonth        | Number | The card’s expiration month. 1-indexed \(i.e. 1 == January\)                                                             |
| expYear         | Number | The card’s expiration year                                                                                               |
| brand           | String | The issuer of the card. Can be one of: **JCB ‖ American Express ‖ Visa ‖ Discover ‖ Diners Club ‖ MasterCard ‖ Unknown** |
| funding \(iOS\) | String | The funding source for the card. Can be one of: **debit ‖ credit ‖ prepaid ‖ unknown**                                   |
| country         | String | Two-letter ISO code representing the issuing country of the card                                                         |
| threeDSecure    | String | Whether 3D Secure is supported or required by the card. Can be one of: **required ‖ optional ‖ notSupported ‖ unknown**  |

##### `sepaDebitDetails`

| Key              | Type   | Description                                                      |
| :--------------- | :----- | :--------------------------------------------------------------- |
| last4            | String | The last 4 digits of the account number                          |
| bankCode         | String | The account’s bank code                                          |
| country          | String | Two-letter ISO code representing the country of the bank account |
| fingerprint      | String | The account’s fingerprint                                        |
| mandateReference | String | The reference of the mandate accepted by your customer           |
| mandateURL       | String | The details of the mandate accepted by your customer             |

# Example

```js
{
  livemode: false,
  amount: 50,
  owner: {},
  metadata: {},
  clientSecret: 'src_client_secret_BLnXIZxZprDmdhw3zv12123L',
  details: {
    native_url: null,
    statement_descriptor: null
  },
  type: 'alipay',
  redirect: {
    url: 'https://hooks.stripe.com/redirect/authenticate/src_1Az5vzE5aJKqY779Kes5s61m?client_secret=src_client_secret_BLnXIZxZprDmdhw3zv12123L',
    returnURL: 'example://stripe-redirect?redirect_merchant_name=example',
    status: 'succeeded'
  },
  usage: 'single',
  created: 1504713563,
  flow: 'redirect',
  currency: 'euro',
  status: 'chargable',
}
```

## Enabling Apple Pay in bare

If you want to use Apple Pay for payments, you'll need to set up your merchant ID in XCode first. Note that you do not need to go through this process to use the Payments module - you can still process payments with Stripe without going through the steps in this section.

If you haven't already, set up an Apple Merchant ID via the [Apple Developer Portal](https://developer.apple.com/). Then, open the application in XCode and navigate to the capabilities tab. Enable Apple Pay and insert your merchant ID into the corresponding space.

Note: Apple Pay can be used only for real world items (ex. appeal, car sharing, food) and not virtual goods. For more information about proper usage of Apple Pay, visit Apple's [Apple Pay guidelines](https://developer.apple.com/app-store/review/guidelines/#apple-pay) and [Acceptable Use](https://developer.apple.com/apple-pay/acceptable-use-guidelines-for-websites/).
