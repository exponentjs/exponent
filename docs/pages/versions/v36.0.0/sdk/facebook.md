---
title: Facebook
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-36/packages/expo-facebook'
---

import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-facebook`** provides Facebook integration, such as logging in through Facebook, for React Native apps. Expo exposes a minimal native API since you can access Facebook's [Graph API](https://developers.facebook.com/docs/graph-api) directly through HTTP (using [fetch](https://reactnative.dev/docs/network.html#fetch), for example).

<PlatformsSection android emulator ios simulator web={{ pending: 'https://github.com/expo/expo/pull/6862' }} />

## Installation

For [managed](../../../introduction/managed-vs-bare.md#managed-workflow) apps, you'll need to run `expo install expo-facebook`. To use it in a [bare](../../../introduction/managed-vs-bare.md#bare-workflow) React Native app, follow its [installation instructions](https://github.com/expo/expo/tree/master/packages/expo-facebook).

For ejected (see: [ExpoKit](../../../expokit/overview.md)) apps, here are links to the [iOS Installation Walkthrough](https://developers.facebook.com/docs/ios/getting-started/) and the [Android Installation Walkthrough](https://developers.facebook.com/docs/android/getting-started).

## Configuration

### Registering your app with Facebook

Follow [Facebook's developer documentation](https://developers.facebook.com/docs/apps/register) to register an application with Facebook's API and get an application ID. Take note of this application ID because it will be used as the `appId` option in your [`Facebook.logInWithReadPermissionsAsync`](#facebookloginwithreadpermissionsasyncoptions 'Facebook.logInWithReadPermissionsAsync') call. Then follow these steps based on the platforms you're targetting. This will need to be done from the [Facebook developer site](https://developers.facebook.com/):

- **The Expo client app**

  - Add `host.exp.Exponent` as an iOS _Bundle ID_. Add `rRW++LUjmZZ+58EbN5DVhGAnkX4=` as an Android _key hash_. Your app's settings should end up including the following under "Settings > Basic":

![](/static/images/facebook-app-settings.png)

- **iOS standalone app**

  - Add your app's Bundle ID as a _Bundle ID_ in the app settings page pictured above. If you still have the `host.exp.Exponent` ID listed there, remove it.
  - In your [app.json](../../../workflow/configuration.md), add a field `facebookScheme` with your Facebook login redirect URL scheme found [here](https://developers.facebook.com/docs/facebook-login/ios) under _4. Configure Your info.plist_. It should look like `"fb123456"`.
  - Also in your [app.json](../../../workflow/configuration.md), add your [Facebook App ID and Facebook Display Name](https://developers.facebook.com/docs/facebook-login/ios) under the `facebookAppId` and `facebookDisplayName` keys.

- **Android standalone app**

  - [Build your standalone app](../../../distribution/building-standalone-apps.md) for Android.
  - Run `expo fetch:android:hashes`.
  - Copy `Facebook Key Hash` and paste it as an additional key hash in your Facebook developer page pictured above.

You may have to switch the app from 'development mode' to 'public mode' on the Facebook developer page before other users can log in.

## API

```js
import * as Facebook from 'expo-facebook';
```

### `Facebook.initializeAsync(appId: string | undefined, appName: string | undefined): Promise<void>`

Calling this method ensures that the SDK is initialized. You have to call this method before calling `logInWithReadPermissionsAsync` to ensure that Facebook support is initialized properly.

You may or may not provide an optional `appId: string` argument.

- If you don't provide it, Facebook SDK will try to use `appId` from native app resources (which in standalone apps you would define in `app.json`, in Expo client are unavailable and in bare you configure yourself according to Facebook setup documentation for [iOS](https://developers.facebook.com/docs/facebook-login/ios#4--configure-your-project) and [Android](https://developers.facebook.com/docs/facebook-login/android#manifest)). If it fails to find one, the promise will be rejected.
- If you provide an explicit `appId`, it will override any other source.

The same resolution mechanism works for `appName`.

### `Facebook.setAutoInitEnabledAsync(enabled: boolean): Promise<void>`

Sets whether Facebook SDK should autoinitialize itself. SDK initialization involves eg. fetching app settings from Facebook or a profile of the logged in user. In some cases, you may want to disable or delay the SDK initialization, such as to obtain user consent or fulfill legal obligations. This method corresponds to [this](https://developers.facebook.com/docs/app-events/getting-started-app-events-ios#disable-sdk-initialization) and [this](https://developers.facebook.com/docs/app-events/getting-started-app-events-android/#disable-sdk-initialization) native SDK methods. Even though calling this method with `enabled == true` initializes the Facebook SDK on iOS, it does not on Android and we recommend always calling `initializeAsync` before performing any actions with effects that should be visible to the user (like `loginWithPermissions`).

In Expo, by default, autoinitialization of the Facebook SDK is disabled. You may change this value in runtime by calling this method or customize this feature in buildtime by setting appropriate `app.json` fields. The setting value is persisted across runs (value set with this method overriddes value from buildtime).

### `Facebook.setAutoLogAppEventsEnabledAsync(enabled: boolean): Promise<void>`

Sets whether Facebook SDK should log app events. App events involve app eg. installs, app launches (more info [here](https://developers.facebook.com/docs/app-events/getting-started-app-events-android/#auto-events) and [here](https://developers.facebook.com/docs/app-events/getting-started-app-events-ios#auto-events)). In some cases, you may want to disable or delay the collection of automatically logged events, such as to obtain user consent or fulfill legal obligations. This method corresponds to [this](https://developers.facebook.com/docs/app-events/getting-started-app-events-ios#disable-auto-events) and [this](https://developers.facebook.com/docs/app-events/getting-started-app-events-android/#disable-auto-events) native SDK methods.

In Expo, by default, automatic logging app events is disabled. You may change this value in runtime by calling this method or customize this feature in buildtime by setting appropriate `app.json` fields. The setting value is persisted across runs (value set with this method overriddes value from buildtime).

### `Facebook.setAdvertiserIDCollectionEnabledAsync(enabled: boolean): Promise<void>`

Sets whether Facebook SDK should collect and attach `advertiser-id` to sent events. `advertiser-id` let you identify and target specific customers. To learn more visit [Facebook documentation](https://developers.facebook.com/docs/app-ads/targeting/mobile-advertiser-ids) describing that topic. In some cases, you may want to disable or delay the collection of `advertiser-id`, such as to obtain user consent or fulfill legal obligations. This method corresponds to [this](https://developers.facebook.com/docs/app-events/getting-started-app-events-ios#disable-advertiser-id) and [this](https://developers.facebook.com/docs/app-events/getting-started-app-events-android/#disable-advertiser-id) native SDK methods.

In Expo, by default, collecting those IDs is disabled. You may change this value in runtime by calling this method or customize this feature in buildtime by setting appropriate `app.json` fields. The setting value is persisted across runs (value set with this method overriddes value from buildtime).

### `Facebook.logInWithReadPermissionsAsync(options)`

Prompts the user to log into Facebook and grants your app permission
to access their Facebook data.

#### param object options

A map of options:

- **permissions (_array_)** -- An array specifying the permissions to ask for from Facebook for this login. The permissions are strings as specified in the [Facebook API documentation](https://developers.facebook.com/docs/facebook-login/permissions). The default permissions are `['public_profile', 'email']`.

#### Returns

If the user or Facebook cancelled the login, returns `{ type: 'cancel' }`.

Otherwise, returns `{ type: 'success', token, expires, permissions, declinedPermissions }`. `token` is a string giving the access token to use with Facebook HTTP API requests. `expires` is the time at which this token will expire, as seconds since epoch. You can save the access token using, say, `AsyncStorage`, and use it till the expiration time. `permissions` is a list of all the approved permissions, whereas `declinedPermissions` is a list of the permissions that the user has rejected.

#### Example

```javascript
async function logIn() {
  try {
    await Facebook.initializeAsync('<APP_ID>');
    const {
      type,
      token,
      expires,
      permissions,
      declinedPermissions,
    } = await Facebook.logInWithReadPermissionsAsync({
      permissions: ['public_profile'],
    });
    if (type === 'success') {
      // Get the user's name using Facebook's Graph API
      const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
      Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
    } else {
      // type === 'cancel'
    }
  } catch ({ message }) {
    alert(`Facebook Login Error: ${message}`);
  }
}
```

Given a valid Facebook application ID in place of `<APP_ID>`, the code above will prompt the user to log into Facebook then display the user's name. This uses React Native's [fetch](https://reactnative.dev/docs/network.html#fetch) to query Facebook's [Graph API](https://developers.facebook.com/docs/graph-api).
