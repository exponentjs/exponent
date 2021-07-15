---
title: Stripe
sourceCodeUrl: 'https://github.com/stripe/stripe-react-native'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';

Expo includes support for [`@stripe/stripe-react-native`](https://github.com/stripe/stripe-react-native), which allows you to build delightful payment experiences in your native Android and iOS apps using React Native & Expo. This library provides powerful and customizable UI screens and elements that can be used out-of-the-box to collect your users' payment details.

If you're looking for a quick example, check out [this Snack](https://snack.expo.io/@charliecruzan/stripe-react-native-example?platform=mydevice)!

> Migrating from Expo's `expo-payments-stripe` module? [Here's a guide to help make the transition as easy as possible](https://github.com/expo/fyi/blob/master/payments-migration-guide.md#how-to-migrate-from-expo-payments-stripe-to-the-new-stripestripe-react-native-library).

<PlatformsSection android emulator ios simulator />

## Installation

<InstallSection packageName="@stripe/stripe-react-native" href="https://github.com/stripe/stripe-react-native" />

### Config plugin setup (optional)

If you're using EAS Build or the bare workflow, you can do most of your Stripe setup using the `@stripe/stripe-react-native` config plugin ([what's a config plugin?](/guides/config-plugins.md)). To setup, just add the config plugin to the `plugins` array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    ...
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": string | string [],
          "enableGooglePay": boolean
        }
      ]
    ],
  }
}
```

- **merchantIdentifier**: iOS only. This is the Apple merchant ID obtained [here](https://stripe.com/docs/apple-pay?platform=react-native). Otherwise, Apple Pay will not work as expected. If you have multiple merchantIdentifiers, you can set them in an array.
- **enableGooglePay**: Android only. Boolean indicating whether or not Google Pay is enabled. Defaults to `false`.

Then rebuild the app. If you're using the bare workflow, make sure to run `expo prebuild` first (this will apply the config plugin using [prebuilding](https://expo.fyi/prebuilding)).

## Example

Trying out Stripe takes just a few seconds. First, connect to [this Snack](https://snack.expo.io/@charliecruzan/stripe-react-native-example?platform=mydevice) on your device.

Under the hood, that example connects to [this Glitch server code](https://glitch.com/edit/#!/expo-stripe-server-example), so you'll need to open that page to spin up the server. Feel free to run your own Glitch server and copy that code!

## Usage

For usage information and detailed documentation, please refer to:

- [Stripe's React Native SDK reference](https://stripe.dev/stripe-react-native/api-reference/index.html)
- [Stripe's React Native GitHub repo](https://github.com/stripe/stripe-react-native)
- [Stripe's example React Native app](https://github.com/stripe/stripe-react-native/tree/master/example)

### Common issues

#### Browser pop-ups are not redirecting back to my app

If you're relying on redirects, you'll need to pass in a `urlScheme` to `initStripe`. To make sure you always use the proper `urlScheme`, pass in:

```js
import * as Linking from 'expo-linking';
import Constants, { ExecutionEnvironment } from 'expo-constants';

...

urlScheme:
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL(''),
```

[Linking.createURL](/versions/latest/sdk/linking.md#linkingcreateurlpath-options) will ensure you're using the proper scheme, whether you're running in Expo Go or your production app. `'/--/'` is necessary in Expo Go because it indicates that the substring after it corresponds to the deep link path, and is not part of the path to the app itself.

## Limitations

### Standalone apps

`@stripe/stripe-react-native` is supported in Expo Go on Android and iOS out of the box, **however**, for iOS, it is only available for standalone apps built with [EAS Build](/build/introduction.md), and not for apps built on the classic build system- `expo build:ios`. Android apps built with `expo build:android` _will_ have access to the `@stripe/stripe-react-native` library.

### Apple Pay

Apple Pay **is not** supported in Expo Go. To use Apple Pay, you must use either [EAS Build](/build/introduction.md), or run `expo run:ios` in your project directory.

### Google Pay

Google Pay **is not** supported in Expo Go. To use Google Pay, you must use either a standalone app built with `expo build:android` or [EAS Build](/build/introduction.md), or run `expo run:android` in your project directory.
