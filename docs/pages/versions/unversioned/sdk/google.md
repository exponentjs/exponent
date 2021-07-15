---
title: Google
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-google-app-auth'
---

import PlatformsSection from '~/components/plugins/PlatformsSection';
import { InlineCode } from '~/components/base/code';

> ⚠️ This package is deprecated in favor of the Google [**AuthSession**](auth-session.md) provider. Check out the [Google authentication guides](../../../guides/authentication.md#google) to learn how to migrate your app today.

**`expo-google-app-auth`** provides Google authentication integration for Expo apps using a secure system web browser with native [**`expo-app-auth`**][expo-app-auth]. This is better than a WebView because you can reuse credentials saved on the device. This module uses [PKCE](https://tools.ietf.org/html/rfc7636) for secure native authentication. You won't need to define a provider config because this package utilizes Open ID Connect [auto discovery](https://openid.net/specs/openid-connect-discovery-1_0.html).

<PlatformsSection android emulator ios simulator />

### How it works

You'll get an access token after a successful login. Once you have the token, if you would like to make further calls to the Google API, you can use Google's [REST APIs][google-api-explorer] directly through HTTP (using [fetch][rn-fetch], for example).

## Installation

For [managed][managed-workflow] apps, you'll need to run `expo install expo-google-app-auth`. To use it in a [bare][bare-workflow] React Native app, you will need to run `npx pod-install` and do a new build after installing the package because this library pulls in [**`expo-app-auth`**][expo-app-auth] as a dependency.

## API

```js
import * as Google from 'expo-google-app-auth';
```

## Usage

```javascript
// First- obtain access token from Expo's Google API
const { type, accessToken, user } = await Google.logInAsync(config);

if (type === 'success') {
  // Then you can use the Google REST API
  let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
```

## Methods

### logInAsync

```js
logInAsync(config: LogInConfig): Promise<LogInResult>
```

Prompts the user to log into Google and grants your app permission to access some of their Google data, as specified by the scopes.
The difference between this method and native authentication are very sparce. Google has done a very good job at making the secure web authentication flow work consistently across devices.

**Parameters**

| Name   | Type          | Description                               |
| ------ | ------------- | ----------------------------------------- |
| config | `LogInConfig` | Used to log into your Google application. |

**LogInConfig**

| Name                                    | Type                                         | Description                                                                                                                                                         |
| --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [iosClientId][g-creds]                  | <InlineCode>string \| undefined</InlineCode> | The iOS client id registered with Google for use in the Expo Go app.                                                                                                |
| [androidClientId][g-creds]              | <InlineCode>string \| undefined</InlineCode> | The Android client id registered with Google for use in the Expo Go app.                                                                                            |
| [iosStandaloneAppClientId][g-creds]     | <InlineCode>string \| undefined</InlineCode> | The iOS client id registered with Google for use in a standalone app.                                                                                               |
| [androidStandaloneAppClientId][g-creds] | <InlineCode>string \| undefined</InlineCode> | The Android client id registered with Google for use in a standalone app.                                                                                           |
| [clientId][g-creds]                     | <InlineCode>string \| undefined</InlineCode> | If the platform-appropriate client ID is not provided, this will be used instead.                                                                                   |
| [language][g-language]                  | <InlineCode>string \| undefined</InlineCode> | ISO language code ex (`fr`, `en-US`), this will choose which language is used in the Google sign-in UI. Defaults to the best estimation based on the users browser. |
| [loginHint][g-loginhint]                | <InlineCode>string \| undefined</InlineCode> | If the user's email address is known ahead of time, it can be supplied to be the default option. This maps to the [OAuth login_hint][auth-loginhint] prop.          |
| scopes                                  | `string[] = ['profile', 'email']`            | The scopes to ask for from Google for this login ([more information here][g-using-apis])                                                                            |
| redirectUrl                             | <InlineCode>string \| undefined</InlineCode> | Defaults to `${AppAuth.OAuthRedirect}:/oauth2redirect/google`. Optionally you can define your own redirect URL, just make sure to see the note below.               |

**Note on `redirectUrl`**:
If you choose to provide your own `redirectUrl`, it should start with the value returned by [`AppAuth.OAuthRedirect`](../sdk/app-auth.md#appauthoauthredirect). This way, the method will function correctly and consistently whether you are testing in Expo Go or as a standalone app.

**Returns**

| Name        | Type                   | Description                                      |
| ----------- | ---------------------- | ------------------------------------------------ |
| logInResult | `Promise<LogInResult>` | Resolves into the results of your login attempt. |

**LogInResult**

| Name                      | Type                                           | Description                                                  |
| ------------------------- | -----------------------------------------------| ------------------------------------------------------------ |
| type                      | <InlineCode>'cancel' \| 'success'</InlineCode> | Denotes the summary of the user event.                       |
| accessToken               | <InlineCode>string \| undefined</InlineCode>   | Used for accessing data from Google, invalidate to "log out" |
| accessTokenExpirationDate | <InlineCode>string \| null</InlineCode>        | Approximate expiration date and time of the access token     |
| idToken                   | <InlineCode>string \| null</InlineCode>        | ID token                                                     |
| refreshToken              | <InlineCode>string \| null</InlineCode>        | Refresh the other tokens.                                    |
| user                      | `GoogleUser`                                   | An object with data regarding the authenticated user.        |

**GoogleUser**

| Name       | Type                                         | Description                |
| ---------- | -------------------------------------------- | -------------------------- |
| id         | <InlineCode>string \| undefined</InlineCode> | ID for the user            |
| name       | <InlineCode>string \| undefined</InlineCode> | name for the user          |
| givenName  | <InlineCode>string \| undefined</InlineCode> | first name for the user    |
| familyName | <InlineCode>string \| undefined</InlineCode> | last name for the user     |
| photoUrl   | <InlineCode>string \| undefined</InlineCode> | photo for the user         |
| email      | <InlineCode>string \| undefined</InlineCode> | email address for the user |

**Example**

```js
import * as Google from 'expo-google-app-auth';

const { type, accessToken, user } = await Google.logInAsync({
  iosClientId: `<YOUR_IOS_CLIENT_ID_FOR_EXPO>`,
  androidClientId: `<YOUR_ANDROID_CLIENT_ID_FOR_EXPO>`,
  iosStandaloneAppClientId: `<YOUR_IOS_CLIENT_ID>`,
  androidStandaloneAppClientId: `<YOUR_ANDROID_CLIENT_ID>`,
});

if (type === 'success') {
  /* `accessToken` is now valid and can be used to get data from the Google API with HTTP requests */
  console.log(user);
}
```

### logOutAsync

```js
logOutAsync({ accessToken, iosClientId, androidClientId, iosStandaloneAppClientId, androidStandaloneAppClientId }): Promise<any>
```

Invalidates the provided `accessToken`, given the client ID used to sign-in is provided.

**Parameters**

| Name    | Type                                    | Description                                |
| ------- | --------------------------------------- | ------------------------------------------ |
| options | `LogInConfig & { accessToken: string }` | Used to log out of the Google application. |

**options**

| Name                                    | Type                                         | Description                                                                              |
| --------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| accessToken                             | `string`                                     | Provided when the user authenticates with your Google application.                       |
| [iosClientId][g-creds]                  | <InlineCode>string \| undefined</InlineCode> | The iOS client id registered with Google for use in the Expo Go app.                     |
| [androidClientId][g-creds]              | <InlineCode>string \| undefined</InlineCode> | The Android client id registered with Google for use in the Expo Go app.                 |
| [iosStandaloneAppClientId][g-creds]     | <InlineCode>string \| undefined</InlineCode> | The iOS client id registered with Google for use in a standalone app.                    |
| [androidStandaloneAppClientId][g-creds] | <InlineCode>string \| undefined</InlineCode> | The Android client id registered with Google for use in a standalone app.                |
| scopes                                  | `string[] = ['profile', 'email']`            | The scopes to ask for from Google for this login ([more information here][g-using-apis]) |

**Example**

```js
import * as Google from 'expo-google-app-auth';

const config = {
  expoClientId: `<YOUR_WEB_CLIENT_ID>`,
  iosClientId: `<YOUR_IOS_CLIENT_ID>`,
  androidClientId: `<YOUR_ANDROID_CLIENT_ID>`,
  iosStandaloneAppClientId: `<YOUR_IOS_CLIENT_ID>`,
  androidStandaloneAppClientId: `<YOUR_ANDROID_CLIENT_ID>`,
};
const { type, accessToken } = await Google.logInAsync(config);

if (type === 'success') {
  /* Log-Out */
  await Google.logOutAsync({ accessToken, ...config });
  /* `accessToken` is now invalid and cannot be used to get data from the Google API with HTTP requests */
}
```

## Using it inside of the Expo app

In the Expo Go app, you can only use browser-based login (this works very well actually because it re-uses credentials saved in your system browser).

To use Google Sign In, you will need to create a project on the Google Developer Console and create an OAuth 2.0 client ID. This is, unfortunately, super annoying to do and we wish there was a way we could automate this for you, but at the moment the Google Developer Console does not expose an API. _You also need to register a separate set of Client IDs for a standalone app, the process for this is described later in this document_.

- **Get an app set up on the Google Developer Console**

  - Go to the [Credentials Page][g-creds]
  - Create an app for your project if you haven't already.
  - Once that's done, click "Create Credentials" and then "OAuth client ID." You will be prompted to set the product name on the consent screen, go ahead and do that.

- **Create an iOS OAuth Client ID**

  - Select "iOS Application" as the Application Type. Give it a name if you want (e.g. "iOS Development").
  - Use `host.exp.exponent` as the bundle identifier.
  - Click "Create"
  - You will now see a modal with the client ID.
  - The client ID is used in the `iosClientId` option for `Google.loginAsync` (see code example below).

- **Create an Android OAuth Client ID**

  - Select "Android Application" as the Application Type. Give it a name if you want (maybe "Android Development").
  - Run `openssl rand -base64 32 | openssl sha1 -c` in your terminal, it will output a string that looks like `A1:B2:C3` but longer. Copy the output to your clipboard.
  - Paste the output from the previous step into the "Signing-certificate fingerprint" text field.
  - Use `host.exp.exponent` as the "Package name".
  - Click "Create"
  - You will now see a modal with the Client ID.
  - The client ID is used in the `androidClientId` option for `Google.loginAsync` (see code example below).

- **Add the Client IDs to your app**

  ```javascript
  import * as Google from 'expo-google-app-auth';

  async function signInWithGoogleAsync() {
    try {
      const result = await Google.logInAsync({
        androidClientId: YOUR_CLIENT_ID_HERE,
        iosClientId: YOUR_CLIENT_ID_HERE,
        scopes: ['profile', 'email'],
      });

      if (result.type === 'success') {
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  }
  ```

## Deploying to a standalone app on Android

If you want to use Google Sign In for a standalone app, you can follow these steps. These steps assume that you already have it working on the Expo Go app. If you have already created an API key for Google Maps, you skip steps 3 through 8, inclusive.

- **Get a Google API Key for your app** : `skip this if you already have one, eg: for Google Maps`
  1.  Build a standalone app and download the apk, or find one that you have already built.
  2.  Go to the [Google Developer Credentials][g-creds]
  3.  Click **Create credentials**, then **API Key**, and finally click **RESTRICT KEY** in the modal that pops up.
  4.  Click the **Android apps** radio button under **Key restriction**, then click **+ Add package name and fingerprint**.
  5.  Add your `android.package` from `app.json` (eg: `ca.brentvatne.growlerprowler`) to the **Package name** field.
  6.  Run `expo fetch:android:hashes`.
  7.  Take `Google Certificate Fingerprint` from previous step and insert it in the **SHA-1 certificate fingerprint** field.
  8.  Press **Save**.
- **Get an OAuth client ID for your app**
  1.  Build a standalone app and download the apk, or find one that you have already built.
  2.  Go to the [Google Developer Credentials][g-creds].
  3.  Click **Create credentials**, then **OAuth client ID**, then select the **Android** radio button.
  4.  Run `expo fetch:android:hashes`.
  5.  Take `Google Certificate Fingerprint` from previous step and insert it in the **Signing-certificate fingerprint** field.
  6.  Add your `android.package` from `app.json` (eg: `ca.brentvatne.growlerprowler`) to the **Package name** field.
  7.  Press **Create**.
- **Add the configuration to your app**
  1.  Build a standalone app and download the apk, or find one that you have already built.
  2.  Go to the [Google Developer Credentials][g-creds] and find your API key.
  3.  Open `app.json` and add your **Google API Key** to `android.config.googleSignIn.apiKey`.
  4.  Run `expo fetch:android:hashes`.
  5.  Take `Google Certificate Hash` from the previous step to `app.json` under `android.config.googleSignIn.certificateHash`.
  6.  When you use `Google.logInAsync(..)`, pass in the **OAuth client ID** as the `androidStandaloneAppClientId` option.
  7.  Rebuild your standalone app.

Note that if you've enabled Google Play's app signing service, you will need to grab their app signing certificate in production rather than the upload certificate returned by `expo fetch:android:hashes`. You can do this by grabbing the signature from Play Console -> Your App -> Release management -> App signing, and then going to the [API Dashboard](https://console.developers.google.com/apis/) -> Credentials and adding the signature to your existing credential.

## Deploying to a standalone app on iOS

If you want to use native sign in for a standalone app, you can follow these steps. These steps assume that you already have it working on the Expo Go app.

1.  Add a `bundleIdentifier` to your `app.json` if you don't already have one.
2.  Open your browser to [Google Developer Credentials][g-creds]
3.  Click **Create credentials** and then **OAuth client ID**, then choose **iOS**.
4.  Provide your `bundleIdentifier` in the **Bundle ID** field, then press **Create**.
5.  Add the given **iOS URL scheme** to your `app.json` under `ios.config.googleSignIn.reservedClientId`.
6.  Wherever you use `Google.logInAsync`, provide the **OAuth client ID** as the `iosStandaloneAppClientId` option.
7.  Rebuild your standalone app.

## Server side APIs

If you need to access Google APIs using the user's authorization you need to pass an additional web client id. This will add accessToken, idToken, refreshToken and serverAuthCode to the response object that you can use on your server with the client id secret.

1.  Open your browser to [Google Developer Credentials][g-creds]
2.  Click **Create credentials** and then **OAuth client ID**, then choose **web** and press **Create**.

- **Inside of Expo apps**
  When your app is running as an Expo experience, the process is a little different. Due to Google's restrictions, the only way to make this work is via web authentication flow. Once you have your code, send it to your backend and exchange it, but make sure to set the `redirect_uri` query parameter to the same value you used on your client side call to Google.
  (Something similar to https://auth.expo.io/@username/your-app-slug). With Expo, you can easily authenticate your user with the [`expo-auth-session`][expo-app-session] module:

```javascript
let result = await AuthSession.startAsync({
  authUrl:
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `&client_id=${googleWebAppId}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
    `&response_type=code` +
    `&access_type=offline` +
    `&scope=profile`,
});
```

[rn-fetch]: https://reactnative.dev/docs/network.html#fetch
[google-api-explorer]: https://developers.google.com/apis-explorer/
[managed-workflow]: ../../../introduction/managed-vs-bare.md#managed-workflow
[bare-workflow]: ../../../introduction/managed-vs-bare.md#bare-workflow
[expo-app-auth]: app-auth.md
[expo-app-session]: auth-session.md
[auth-loginhint]: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
[g-using-apis]: https://gsuite-developers.googleblog.com/2012/01/tips-on-using-apis-discovery-service.html
[g-creds]: https://console.developers.google.com/apis/credentials
[g-loginhint]: https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignIn#loginHint
[g-language]: https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignIn#language
