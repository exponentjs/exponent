---
title: Facebook
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-37/packages/expo-facebook'
---

import PlatformsSection from '~/components/plugins/PlatformsSection';
import InstallSection from '~/components/plugins/InstallSection';

**`expo-facebook`** provides Facebook integration, such as logging in through Facebook, for React Native apps. Expo exposes a minimal native API since you can access Facebook's [Graph API](https://developers.facebook.com/docs/graph-api) directly through HTTP (using [fetch](https://reactnative.dev/docs/network.html#fetch), for example).

<PlatformsSection android emulator ios simulator web={{ pending: 'https://github.com/expo/expo/pull/6862' }} />

## Installation

<InstallSection packageName="expo-facebook" />

For ejected (see: [bare](../../../introduction/managed-vs-bare.md)) apps, here are links to the [iOS Installation Walkthrough](https://developers.facebook.com/docs/ios/getting-started/) and the [Android Installation Walkthrough](https://developers.facebook.com/docs/android/getting-started).

## Configuration

### Registering your app with Facebook

> 💡 When following these steps you will find on the Facebook Developer site that there are many fields and steps that you don't actually care about. Just look for the information that we ask you for and you will be OK!

Follow [Facebook's developer documentation](https://developers.facebook.com/docs/apps/register) to register an application with Facebook's API and get an application ID. Take note of this application ID because it will be used as the `appId` option in your [`Facebook.logInWithReadPermissionsAsync`](#facebookloginwithreadpermissionsasyncoptions 'Facebook.logInWithReadPermissionsAsync') call.

Then follow these steps based on the platforms you're targetting. This will need to be done from the [Facebook developer site](https://developers.facebook.com/). You don't need to set up the iOS and Android standalone apps right away, you can do that at any time in the future if you just want to get the Expo client version running first.

**No configuration is needed to use the Facebook SDK in the App Store Expo client**, because all of your Facebook API calls will be made with Expo's Facebook App ID. The slight downside to this is that you can't customize which permissions your app requests from Facebook (like `user_photos` or `user_friends`), or integrate Facebook login with other services like Firebase auth. If you need that functionality, you have two options:

- Build a [standalone app](../../../distribution/building-standalone-apps.md)
- Build a [custom Expo client app](../../../guides/adhoc-builds.md)

#### Configure `app.json`

- Add the field `facebookScheme` with your Facebook login redirect URL scheme found [here](https://developers.facebook.com/docs/facebook-login/ios) under "_4. Configure Your info.plist_." It should look like `"fb123456"`. If you do not do this, Facebook will not be able to redirect to your app after logging in.

- Add the fields `facebookAppId` and `facebookDisplayName`, using your [Facebook App ID and Facebook Display Name](https://developers.facebook.com/docs/facebook-login/ios), respectively.

- Optional fields
  - `facebookAutoInitEnabled`, defaults to `false`
  - `facebookAutoLogAppEventsEnabled`, defaults to Facebook's default policy (Only applies to standalone apps)
  - `facebookAdvertiserIDCollectionEnabled`, defaults to Facebook's default policy (Only applies to standalone apps)

#### iOS Custom Expo client

- Add your custom client's Bundle ID (shown in the output after running `expo client:ios`) in the app settings page pictured below. It should look something like: `dev.expo.client.xxxxx`

#### iOS standalone app

- Add your app's Bundle ID as a _Bundle ID_ in the app settings page pictured below.

#### Android standalone app

- [Build your standalone app](../../../distribution/building-standalone-apps.md) for Android.
- Run `expo fetch:android:hashes`.
- Copy `Facebook Key Hash` and paste it as a key hash in your Facebook developer page pictured below.

![](/static/images/facebook-app-settings.png)

You may have to switch the app from 'development mode' to 'public mode' on the Facebook developer page before other users can log in. This requires adding a privacy policy URL, which can be as simple as a GitHub Gist.

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
