---
title: Authentication
---

import PlatformsSection from '~/components/plugins/PlatformsSection';
import InstallSection from '~/components/plugins/InstallSection';

import { SocialGrid, SocialGridItem, CreateAppButton } from '~/components/plugins/AuthSessionElements';
import { Tab, Tabs } from '~/components/plugins/Tabs';
import TerminalBlock from '~/components/plugins/TerminalBlock';
import SnackInline from '~/components/plugins/SnackInline';

Expo can be used to login to many popular providers on iOS, Android, and web! Most of these guides utilize the pure JS [`AuthSession` API](/versions/latest/sdk/auth-session), refer to those docs for more information on the API.

Here are some **important rules** that apply to all authentication providers:

- Use `WebBrowser.maybeCompleteAuthSession()` to dismiss the web popup. If you forget to add this then the popup window will not close.
- Create redirects with `AuthSession.makeRedirectUri()` this does a lot of the heavy lifting involved with universal platform support. Behind the scenes it uses `expo-linking`.
- Build requests using `AuthSession.useAuthRequest()`, the hook allows for async setup which means mobile browsers won't block the authentication.
- Be sure to disable the prompt until `request` is defined.
- You can only invoke `promptAsync` in a user-interaction on web.

## Guides

**AuthSession** can be used for any OAuth or OpenID Connect provider, we've assembled guides for using the most requested services!
If you'd like to see more, you can [open a PR](https://github.com/expo/expo/edit/master/docs/pages/guides/authentication.md) or [vote on canny](https://expo.canny.io/feature-requests).

<SocialGrid>
  <SocialGridItem title="IdentityServer 4" protocol={['OAuth 2', 'OpenID']} href="#identityserver-4" image="/static/images/sdk/auth-session/identity4.png" />
  <SocialGridItem title="Azure" protocol={['OAuth 2', 'OpenID']} href="#azure" image="/static/images/sdk/auth-session/azure.png" />
  <SocialGridItem title="Apple" protocol={['iOS Only']} href="/versions/latest/sdk/apple-authentication" image="/static/images/sdk/auth-session/apple.png" />
  <SocialGridItem title="Coinbase" protocol={['OAuth 2']} href="#coinbase" image="/static/images/sdk/auth-session/coinbase.png" />
  <SocialGridItem title="Dropbox" protocol={['OAuth 2']} href="#dropbox" image="/static/images/sdk/auth-session/dropbox.png" />
  <SocialGridItem title="Facebook" protocol={['OAuth 2']} href="#facebook" image="/static/images/sdk/auth-session/facebook.png" />
  <SocialGridItem title="Fitbit" protocol={['OAuth 2']} href="#fitbit" image="/static/images/sdk/auth-session/fitbit.png" />
  <SocialGridItem title="Firebase Phone" protocol={['Recaptcha']} href="/versions/latest/sdk/firebase-recaptcha" image="/static/images/sdk/auth-session/firebase-phone.png" />
  <SocialGridItem title="Github" protocol={['OAuth 2']} href="#github" image="/static/images/sdk/auth-session/github.png" />
  <SocialGridItem title="Google" protocol={['OAuth 2', 'OpenID']} href="#google" image="/static/images/sdk/auth-session/google.png" />
  <SocialGridItem title="Imgur" protocol={['OAuth 2']} href="#imgur" image="/static/images/sdk/auth-session/imgur.png" />
  <SocialGridItem title="Okta" protocol={['OAuth 2', 'OpenID']} href="#okta" image="/static/images/sdk/auth-session/okta.png" />
  <SocialGridItem title="Reddit" protocol={['OAuth 2']} href="#reddit" image="/static/images/sdk/auth-session/reddit.png" />
  <SocialGridItem title="Slack" protocol={['OAuth 2']} href="#slack" image="/static/images/sdk/auth-session/slack.png" />
  <SocialGridItem title="Spotify" protocol={['OAuth 2']} href="#spotify" image="/static/images/sdk/auth-session/spotify.png" />
  <SocialGridItem title="Strava" protocol={['OAuth 2']} href="#strava" image="/static/images/sdk/auth-session/strava.png" />
  <SocialGridItem title="Twitch" protocol={['OAuth 2']} href="#twitch" image="/static/images/sdk/auth-session/twitch.png" />
  <SocialGridItem title="Uber" protocol={['OAuth 2']} href="#uber" image="/static/images/sdk/auth-session/uber.png" />
</SocialGrid>

<br />

### IdentityServer 4

| Website                  | Provider | PKCE     | Auto Discovery |
| ------------------------ | -------- | -------- | -------------- |
| [More Info][c-identity4] | OpenID   | Required | Available      |

[c-identity4]: https://demo.identityserver.io/

- If `offline_access` isn't included then no refresh token will be returned.

<SnackInline label='IdentityServer 4 Auth' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import { Button, Text, View } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

/* @info Using the Expo proxy will redirect the user through auth.expo.io enabling you to use web links when configuring your project with an OAuth provider. This is not available on web. */
const useProxy = true;
/* @end */

const redirectUri = AuthSession.makeRedirectUri({
  useProxy,
});

export default function App() {
  /* @info If the provider supports auto discovery then you can pass an issuer to the `useAutoDiscovery` hook to fetch the discovery document. */
  const discovery = AuthSession.useAutoDiscovery('https://demo.identityserver.io');
  /* @end */

  // Create and load an auth request
  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: 'native.code',
      /* @info After a user finishes authenticating, the server will redirect them to this URI. Learn more about <a href="../../guides/linking/">linking here</a>. */
      redirectUri,
      /* @end */
      scopes: ['openid', 'profile', 'email', 'offline_access'],
    },
    discovery
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Login!" disabled={!request} onPress={() => promptAsync({ useProxy })} />
      {result && <Text>{JSON.stringify(result, null, 2)}</Text>}
    </View>
  );
}
```

</SnackInline>

<!-- End IdentityServer 4 -->

### Azure

<CreateAppButton name="Azure" href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-overview" />

| Website                     | Provider | PKCE      | Auto Discovery |
| --------------------------- | -------- | --------- | -------------- |
| [Get Your Config][c-azure2] | OpenID   | Supported | Available      |

[c-azure2]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-overview

<SnackInline label='Azure Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

export default function App() {
  // Endpoint
  const discovery = useAutoDiscovery('https://login.microsoftonline.com/<TENANT_ID>/v2.0');
  // Request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

<!-- End Azure -->

### Coinbase

<CreateAppButton name="Coinbase" href="https://www.coinbase.com/oauth/applications/new" />

| Website                       | Provider  | PKCE      | Auto Discovery |
| ----------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-coinbase] | OAuth 2.0 | Supported | Not Available  |

[c-coinbase]: https://www.coinbase.com/oauth/applications/new

- The `redirectUri` requires 2 slashes (`://`).
- Scopes must be joined with ':' so just create one long string.
- Setup redirect URIs: Your Project > Permitted Redirect URIs: (be sure to save after making changes).
  - _Expo Go_: `exp://localhost:19000/--/`
  - _Web dev_: `https://localhost:19006`
    - Run `expo start:web --https` to run with **https**, auth won't work otherwise.
    - Adding a slash to the end of the URL doesn't matter.
  - _Standalone and Bare_: `your-scheme://`
    - Scheme should be specified in app.json `expo.scheme: 'your-scheme'`, then added to the app code with `makeRedirectUri({ native: 'your-scheme://' })`)
  - _Proxy_: **Not Supported**
    - You cannot use the Expo proxy (`useProxy`) because they don't allow `@` in their redirect URIs.
  - _Web production_: `https://yourwebsite.com`
    - Set this to whatever your deployed website URL is.

<Tabs tabs={["Auth Code", "Implicit Flow"]}>

<Tab>

<SnackInline label='Coinbase Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import {
  exchangeCodeAsync,
  makeRedirectUri,
  TokenResponse,
  useAuthRequest,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { Button } from "react-native";

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: "https://www.coinbase.com/oauth/authorize",
  tokenEndpoint: "https://api.coinbase.com/oauth/token",
  revocationEndpoint: "https://api.coinbase.com/oauth/revoke",
};

const redirectUri = makeRedirectUri({
  /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
  scheme: 'your.app'  
/* @end */});

const CLIENT_ID = "CLIENT_ID";

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["wallet:accounts:read"],
      redirectUri,
    },
    discovery
  );
  const {
    // The token will be auto exchanged after auth completes.
    token,
    /* @info If the auto exchange fails, you can display the error. */
    exchangeError,
    /* @end */
  } = useAutoExchange(
    /* @info The auth code will be exchanged for an access token as soon as it's available. */
    response?.type === "success" ? response.params.code : null
    /* @end */
  );

  React.useEffect(() => {
    if (token) {
      /* @info The access token is now ready to be used to make authenticated requests. */
      console.log("My Token:", token.accessToken);
      /* @end */
    }
  }, [token]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}

type State = {
  token: TokenResponse | null;
  exchangeError: Error | null;
};

// A hook to automatically exchange the auth token for an access token.
// this should be performed in a server and not here in the application.
// For educational purposes only:
function useAutoExchange(code?: string): State {
  const [state, setState] = React.useReducer(
    (state: State, action: Partial<State>) => ({ ...state, ...action }),
    { token: null, exchangeError: null }
  );
  const isMounted = useMounted();

  React.useEffect(() => {
    if (!code) {
      setState({ token: null, exchangeError: null });
      return;
    }

    /* @info Swap this method out for a fetch request to a server that exchanges your auth code securely. */
    exchangeCodeAsync(
      /* @end */
      {
        clientId: CLIENT_ID,
        /* @info <b>Never</b> store your client secret in the application code! */
        clientSecret: "CLIENT_SECRET",
        /* @end */
        code,
        redirectUri,
      },
      discovery
    )
      .then((token) => {
        if (isMounted.current) {
          setState({ token, exchangeError: null });
        }
      })
      .catch((exchangeError) => {
        if (isMounted.current) {
          setState({ exchangeError, token: null });
        }
      });
  }, [code]);

  return state;
}

function useMounted() {
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}
```

</SnackInline>

</Tab>

<Tab>

- Coinbase does not support implicit grant.

</Tab>
</Tabs>

<!-- End Coinbase -->

### Dropbox

<CreateAppButton name="Dropbox" href="https://www.dropbox.com/developers/apps/create" />

| Website                      | Provider  | PKCE          | Auto Discovery |
| ---------------------------- | --------- | ------------- | -------------- |
| [Get Your Config][c-dropbox] | OAuth 2.0 | Not Supported | Not Available  |

[c-dropbox]: https://www.dropbox.com/developers/apps/create

- Scopes must be an empty array.
- PKCE must be disabled (`usePKCE: false`) otherwise you'll get an error about `code_challenge` being included in the query string.
- Implicit auth is supported.
- When `responseType: ResponseType.Code` is used (default behavior) the `redirectUri` must be `https`. This means that code exchange auth cannot be done on native without `useProxy` enabled.

<Tabs tabs={["Auth Code", "Implicit Flow"]}>

<Tab>

Auth code responses (`ResponseType.Code`) will only work in native with `useProxy: true`.

<SnackInline label='Dropbox Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button, Platform } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
};

/* @info Implicit auth is universal, <code>.Code</code> will only work in native with <code>useProxy: true</code>. */
const useProxy = Platform.select({ web: false, default: true });
/* @end */

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      // There are no scopes so just pass an empty array
      scopes: [],
      // Dropbox doesn't support PKCE
      usePKCE: false,
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
        useProxy,
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync({ useProxy });
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

<SnackInline label='Dropbox Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      // There are no scopes so just pass an empty array
      scopes: [],
      // Dropbox doesn't support PKCE
      usePKCE: false,
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

</Tabs>

<!-- End Dropbox -->

### Facebook

<CreateAppButton name="Facebook" href="https://developers.facebook.com/apps/" />

| Website                 | Provider | PKCE      | Auto Discovery |
| ----------------------- | -------- | --------- | -------------- |
| [More Info][c-facebook] | OAuth    | Supported | Not Available  |

[c-facebook]: https://developers.facebook.com/

- Learn more about [manually building a login flow](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/).

#### Expo Go

You must use the proxy service in the Expo Go app because `exp://` cannot be added to your Facebook app as a redirect.

- Go to: (Sidebar) Products > Facebook Login > Settings > Client OAuth Settings. The URL should be: `https://developers.facebook.com/apps/<YOUR ID>/fb-login/settings/`

<img alt="Facebook Console for URIs" src="/static/images/sdk/auth-session/guide/facebook-proxy-guide.png" />

- Under "Valid OAuth Redirect URIs" add `https://auth.expo.io/@username/slug` and any other web URLs you may want to add.
- Press "Save Changes" in the footer.
- Copy the "App ID" in the header into your `expoClientId: '<YOUR FBID>'`. Ex: `{ expoClientId: '474614477183384' }` (no `fb` prefix).
- Now you're ready to use the demo component in the Expo Go app on iOS and Android.

> ⚠️ If you forget to add the correct URL to the "Valid OAuth Redirect URIs", you will get an error like: `Can't Load URL: The domain of this URL isn't included in the app's domains. To be able to load this URL, add all domains and subdomains of your app to the App Domains field in your app settings.`

#### Custom Apps

Consider using the [`expo-facebook`](/versions/latest/sdk/facebook) module for native auth as it supports some nonstandard OAuth features implemented by Facebook.

- The custom scheme provided by Facebook is `fb` followed by the **project ID** (ex: `fb145668956753819`):
- Add `facebookScheme: 'fb<YOUR FBID>'` to your `app.config.js` or `app.json`. Example: `{ facebookScheme: "fb145668956753819" }` (notice the `fb` prefix).
- You'll need to make a new native build to add this redirect URI into your app's `AndroidManifest.xml` and `Info.plist`:
  - iOS: `eas build` or `expo build:ios`.
  - Android: `eas build` or `expo build:android`.
- **Bare:**
  - Regenerate your native projects with `expo eject`, or add the redirects manually with `npx uri-scheme add fb<YOUR FBID>`
  - Rebuild the projects with `yarn ios` & `yarn android`

#### Native iOS

- Go to: (Sidebar) Settings > Basic. The URL should be: `https://developers.facebook.com/apps/<YOUR ID>/settings/basic/`
- Scroll all the way down and click **`+ Add Platform`**, then select **`iOS`**.

<img alt="Facebook Console for URIs" src="/static/images/sdk/auth-session/guide/facebook-ios-guide.png" />

- Under iOS > Bundle ID: Add your app's bundle identifier, this should match the value in your `app.json` - `expo.ios.bundleIdentifier`. If you don't have one set, run `expo eject` to create one (then rebuild the native app).
- Press "Save Changes" in the footer.
- Copy the "App ID" in the header into your `iosClientId: '<YOUR FBID>'` or `clientId`. Ex: `{ iosClientId: '474614477183384' }` (no `fb` prefix).
- Now you're ready to use the demo component in your native iOS app.

#### Native Android

- Go to: (Sidebar) Settings > Basic. The URL should be: `https://developers.facebook.com/apps/<YOUR ID>/settings/basic/`
- Scroll all the way down and click **`+ Add Platform`**, then select **`Android`**.

<img alt="Facebook Console for URIs" src="/static/images/sdk/auth-session/guide/facebook-android-guide.png" />

- Under Android > Google Play Package Name: Add your app's android package, this should match the value in your `app.json` - `expo.android.package`. If you don't have one set, run `expo eject` to create one (then rebuild the native app).
- Under Android > Class Name: This should match the package name + `.MainActivity`, i.e. `com.bacon.yolo15.MainActivity`.
- Under Android > Key Hashes: You'll need to create two different values, one for Debug and one for Release. Learn how to create the [Key Hash here](https://stackoverflow.com/questions/4388992/key-hash-for-android-facebook-app).
  - In your app root, run: `keytool -exportcert -alias androiddebugkey -keystore android/app/debug.keystore | openssl sha1 -binary | openssl base64` you don't need a password, but it is recommended.
  - Copy the value formatted like `XX2BBI1XXXXXXXX3XXXX44XX5XX=` into the console.
- Press "Save Changes" in the footer.
  - If you get a popup for the package name select "Use this package name".
- Copy the "App ID" in the header into your `androidClientId: '<YOUR FBID>'` or `clientId`. Ex: `{ androidClientId: '474614477183384' }` (no `fb` prefix).
- Now you're ready to use the demo component in your native Android app.

If the App crashes upon authentication, then run `adb logcat` and look for any runtime Errors.

If the Android app crashes with `Didn't find class "com.facebook.CustomTabActivity" on ...` then you may need to remove the native Facebook code for `expo-facebook` from the `AndroidManifest.xml`:

```diff
-    <activity android:name="com.facebook.CustomTabActivity" android:exported="true">
-      <intent-filter>
-        <action android:name="android.intent.action.VIEW"/>
-        <category android:name="android.intent.category.DEFAULT"/>
-        <category android:name="android.intent.category.BROWSABLE"/>
-        <data android:scheme="fb<YOUR ID>"/>
-      </intent-filter>
-    </activity>
```

Then add `<data android:scheme="fb<YOUR ID>"/>` to the `.MainActivity` `intent-filter` or use `npx uri-scheme add fb<YOUR ID> --android`.

#### Troubleshooting native

> ⚠️ The `native` redirect URI **must** be formatted like `fb<YOUR FBID>://authorize`, ex: `fb474614477183384://authorize`. Using the `Facebook` provider will do this automatically.

- If the protocol/suffix is not your FBID then you will get an error like: `No redirect URI in the params: No redirect present in URI`.
- If the path is not `://authorize` then you will get an error like: `Can't Load URL: The domain of this URL isn't included in the app's domains. To be able to load this URL, add all domains and subdomains of your app to the App Domains field in your app settings.`

#### Websites

- Go to: (Sidebar) Products > Facebook Login > Settings > Client OAuth Settings. The URL should be: `https://developers.facebook.com/apps/<YOUR ID>/fb-login/settings/`

<img alt="Facebook Console for URIs" src="/static/images/sdk/auth-session/guide/facebook-web-dev-guide.png" />

- Under "Valid OAuth Redirect URIs" add `https://localhost:19006` and any other web URLs you may want to add.
- Press "Save Changes" in the footer.
- Copy the "App ID" in the header into your `webClientId: '<YOUR FBID>'`. Ex: `{ webClientId: '474614477183384' }` (no `fb` prefix).
- Now start the dev server with `expo start --https`, ensure this is the only server running, otherwise the port will not be `19006`.

<Tabs tabs={["Auth Code", "Implicit Flow", "Firebase"]}>

<Tab>

<SnackInline label='Facebook Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

export default function App() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: '<YOUR FBID>',
    /* @info Request that the server returns a <code>code</code> for server exchanges. */
    responseType: ResponseType.Code,
  /* @end */});

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
    /* @end */}
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
      /* @end */}}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

<SnackInline label='Facebook Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

export default function App() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: '<YOUR FBID>',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info A <code>TokenResponse</code> object with authentication data like accessToken. */
      const { authentication } = response;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
      /* @end */}}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

- Be sure to setup Facebook auth as described above, this is basically identical.
- 🔥 Create a new Firebase project
- Enable Facebook auth, save the project.

<SnackInline label='Facebook Firebase' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser', 'firebase']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import firebase from 'firebase';
import { Button } from 'react-native';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    /* Config */
  });
}

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

export default function App() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
    responseType: ResponseType.Token,
    /* @end */
    clientId: '<YOUR FBID>',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */

      /* @info Create a Facebook credential with the <code>access_token</code> */
      const credential = firebase.auth.FacebookAuthProvider.credential(access_token);
      /* @end */
      // Sign in with the credential from the Facebook user.
      firebase.auth().signInWithCredential(credential);
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
      /* @end */}}
    />
  );
}
```

</SnackInline>

</Tab>

</Tabs>

<!-- End Facebook -->

### FitBit

<CreateAppButton name="FitBit" href="https://dev.fitbit.com/apps/new" />

| Website                     | Provider  | PKCE      | Auto Discovery |
| --------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-fitbit] | OAuth 2.0 | Supported | Not Available  |

[c-fitbit]: https://dev.fitbit.com/apps/new

- Provider only allows one redirect URI per app. You'll need an individual app for every method you want to use:
  - Expo Go: `exp://localhost:19000/--/*`
  - Expo Go + Proxy: `https://auth.expo.io/@you/your-app`
  - Standalone or Bare: `com.your.app://*`
  - Web: `https://yourwebsite.com/*`
- The `redirectUri` requires 2 slashes (`://`).

<Tabs tabs={["Auth Code", "Implicit Flow"]}>
<Tab>

<SnackInline label='FitBit Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button, Platform } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
  tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
  revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['activity', 'sleep'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

<SnackInline label='FitBit Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Button, Platform } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

const useProxy = Platform.select({ web: false, default: true });

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
  tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
  revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      scopes: ['activity', 'sleep'],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        useProxy,
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync({ useProxy });
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

</Tabs>

<!-- End FitBit -->

### GitHub

<CreateAppButton name="Github" href="https://github.com/settings/developers" />

| Website                     | Provider  | PKCE      | Auto Discovery |
| --------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-github] | OAuth 2.0 | Supported | Not Available  |

[c-github]: https://github.com/settings/developers

- Provider only allows one redirect URI per app. You'll need an individual app for every method you want to use:
  - Expo Go: `exp://localhost:19000/--/*`
  - Expo Go + Proxy: `https://auth.expo.io/@you/your-app`
  - Standalone or Bare: `com.your.app://*`
  - Web: `https://yourwebsite.com/*`
- The `redirectUri` requires 2 slashes (`://`).
- `revocationEndpoint` is dynamic and requires your `config.clientId`.

<Tabs tabs={["Auth Code", "Implicit Flow"]}>
<Tab>

<SnackInline label='GitHub Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/<CLIENT_ID>',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

- Implicit grant is [not supported for Github](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/).

</Tab>

</Tabs>

<!-- End Github -->

### Google

<CreateAppButton name="Google" href="https://console.developers.google.com/apis/credentials" />

| Website                     | Provider | PKCE      | Auto Discovery |
| --------------------------- | -------- | --------- | -------------- |
| [Get Your Config][c-google] | OpenID   | Supported | Available      |

[c-google]: https://console.developers.google.com/apis/credentials

> Be sure to install the peerDependency `yarn add expo-application`

There are 4 different types of client IDs you can provide:

- `expoClientId`: Proxy client ID for use in the **Expo Go** on iOS and Android.
- `iosClientId`: iOS native client ID for use in standalone and bare workflow.
- `androidClientId`: Android native client ID for use in standalone, bare workflow.
- `webClientId`: Expo web client ID for use in the browser.

To create a client ID, go to the [Credentials Page][c-google]:

- Create an app for your project if you haven't already.
- Once that's done, click "Create Credentials" and then "OAuth client ID." You will be prompted to set the product name on the consent screen, go ahead and do that.

#### Development in the Expo Go app

While developing in Expo Go, you cannot use proper native authentication. Instead you must use web login during development. Be sure to follow the **standalone** guide below for setting up production apps.

First, be sure to login to your Expo account `expo login`. This will be part of the redirect URL.

[Create a new Google Client ID][c-google] that will be used with `expoClientId`.

- **Application Type**: Web Application
- Give it a name (e.g. "Expo Go Proxy").
- **URIs** (Authorized JavaScript origins): https://auth.expo.io
- **Authorized redirect URIs**: https://auth.expo.io/@your-username/your-project-slug

#### iOS Native

This can only be used in standalone and bare workflow apps. This method cannot be used in the Expo Go app.

[Create a new Google Client ID][c-google] that will be used with `iosClientId`.

- **Application Type**: iOS Application
- Give it a name (e.g. "iOS App").
- **Bundle ID**: Must match the value of `ios.bundleIdentifier` in your `app.json`.
- Your app needs to conform to the URI scheme matching your bundle identifier.
  - _Standalone_: Automatically added, do nothing.
  - _Bare workflow_: Run `npx uri-scheme add <your bundle id> --ios`
- To test this you can:
  1. Eject to bare: `expo eject` and run `yarn ios`
  2. Build a simulator app: `expo build:ios -t simulator`
  3. Build a production IPA: `expo build:ios`
- Whenever you change the values in `app.json` you'll need to rebuild the native app.

**Troubleshooting**

- If you get `Error 401: invalid_client` `The OAuth client was not found`: Ensure the clientId is defined correctly in your React code. Either as `11111111-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com` or without the `.apps.googleusercontent.com` extension.

#### Android Native

This can only be used in Standalone, and bare workflow apps. This method cannot be used in the Expo Go app.

[Create a new Google Client ID][c-google] that will be used with `androidClientId`.

- **Application Type**: Android Application
- Give it a name (e.g. "Android App").
- **Package name**: Must match the value of `android.package` in your `app.json`.
- Your app needs to conform to the URI scheme matching your `android.package` (ex. `com.myname.mycoolapp:/`).
  - _Standalone_: Automatically added, do nothing.
  - _Bare workflow_: Run `npx uri-scheme add <your android.package> --android`
- **Signing-certificate fingerprint**:
  - Run `expo credentials:manager -p android` then select "Update upload Keystore" -> "Generate new keystore" -> "Go back to experience overview"
  - Copy your "Google Certificate Fingerprint", it will output a string that looks like `A1:B2:C3` but longer.
- To test this you can:
  1. Eject to bare: `expo eject` and run `yarn android`
  2. Build a production IPA: `expo build:android`
- Whenever you change the values in `app.json` you'll need to rebuild the native app.

#### Web Apps

Expo web client ID for use in the browser.

[Create a new Google Client ID][c-google] that will be used with `webClientId`.

- **Application Type**: Web Application
- Give it a name (e.g. "Web App").
- **URIs** (Authorized JavaScript origins): https://localhost:19006 & https://yourwebsite.com
- **Authorized redirect URIs**: https://localhost:19006 & https://yourwebsite.com
- To test this be sure to start your app with `expo start:web --https`.

<Tabs tabs={["Standard", "Firebase"]}>
<Tab>

<SnackInline label='Google Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

export default function App() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
    iosClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
    androidClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
    webClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info A <code>TokenResponse</code> object with authentication data like accessToken. */
      const { authentication } = response;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

- 🔥 Create a new Firebase project
- Enable Google auth
  - Open "Web SDK configuration"
  - Save "Web client ID" you'll need it later
  - Press Save
- Replace `YOUR_GUID` with your "Web client ID" and open this link:
  - https://console.developers.google.com/apis/credentials/oauthclient/YOUR_GUID.apps.googleusercontent.com
- Under "URIs" add your hosts URLs
  - Web dev: https://localhost:19006
  - Expo Go Proxy: https://auth.expo.io
- Under "Authorized redirect URIs"
  - Web dev: https://localhost:19006 -- this is assuming you want to invoke `WebBrowser.maybeCompleteAuthSession();` from the root URL of your app.
  - Expo Go Proxy: https://auth.expo.io/@yourname/your-app

<img alt="Google Firebase Console for URIs" src="/static/images/sdk/auth-session/guide/google-firebase-auth-console.png" />

<SnackInline label='Google Firebase' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser', 'firebase']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import firebase from 'firebase';
import { Button } from 'react-native';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    /* Config */
  });
}

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

export default function App() {

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      /* @info This comes from the Firebase Google authentication panel. */
      clientId: 'Your-Web-Client-ID.apps.googleusercontent.com',
      /* @end */
    },
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { id_token } = response.params;
      /* @end */

      /* @info Create a Google credential with the <code>id_token</code> */
      const credential = firebase.auth.GoogleAuthProvider.credential(id_token);
      /* @end */
      firebase.auth().signInWithCredential(credential);
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

</Tabs>

<!-- End Google -->

### Imgur

<CreateAppButton name="Imgur" href="https://api.imgur.com/oauth2/addclient" />

| Website                    | Provider  | PKCE      | Auto Discovery |
| -------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-imgur] | OAuth 2.0 | Supported | Not Available  |

[c-imgur]: https://api.imgur.com/oauth2/addclient

- You will need to create a different provider app for each platform (dynamically choosing your `clientId`).
- Learn more here: [imgur.com/oauth2](https://api.imgur.com/oauth2)

<Tabs tabs={["Auth Code", "Implicit Flow"]}>
<Tab>

<SnackInline label='Imgur Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button, Platform } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

const discovery = {
  authorizationEndpoint: 'https://api.imgur.com/oauth2/authorize',
  tokenEndpoint: 'https://api.imgur.com/oauth2/token',
};

export default function App() {
  // Request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app',
        /* @end */
      }),
      // imgur requires an empty array
      scopes: [],
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

<SnackInline label='Imgur Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Button, Platform } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

const discovery = {
  authorizationEndpoint: 'https://api.imgur.com/oauth2/authorize',
  tokenEndpoint: 'https://api.imgur.com/oauth2/token',
};

export default function App() {
  // Request
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app',
        /* @end */
      }),
      scopes: [],
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

</Tabs>

<!-- End Imgur -->

### Okta

<CreateAppButton name="Okta" href="https://developer.okta.com/signup" />

| Website                          | Provider | PKCE      | Auto Discovery |
| -------------------------------- | -------- | --------- | -------------- |
| [Sign-up][c-okta] > Applications | OpenID   | Supported | Available      |

[c-okta]: https://developer.okta.com/signup/

- You cannot define a custom `redirectUri`, Okta will provide you with one.
- You can use the Expo proxy to test this without a native rebuild, just be sure to configure the project as a website.

<Tabs tabs={["Auth Code", "Implicit Flow"]}>
<Tab>

<SnackInline label='Okta Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { Button, Platform } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

const useProxy = Platform.select({ web: false, default: true });

export default function App() {
  // Endpoint
  const discovery = useAutoDiscovery('https://<OKTA_DOMAIN>.com/oauth2/default');
  // Request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['openid', 'profile'],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: 'com.okta.<OKTA_DOMAIN>:/callback',
        useProxy,
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync({ useProxy });
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

- This flow is not documented yet, learn more [from the Okta website](https://developer.okta.com/docs/guides/implement-implicit/use-flow/).

</Tab>

</Tabs>

<!-- End Okta -->

### Reddit

<CreateAppButton name="Reddit" href="https://www.reddit.com/prefs/apps" />

| Website                     | Provider  | PKCE      | Auto Discovery |
| --------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-reddit] | OAuth 2.0 | Supported | Not Available  |

[c-reddit]: https://www.reddit.com/prefs/apps

- Provider only allows one redirect URI per app. You'll need an individual app for every method you want to use:
  - Expo Go: `exp://localhost:19000/--/*`
  - Expo Go + Proxy: `https://auth.expo.io/@you/your-app`
  - Standalone or Bare: `com.your.app://*`
  - Web: `https://yourwebsite.com/*`
- The `redirectUri` requires 2 slashes (`://`).

<Tabs tabs={["Auth Code", "Implicit Flow"]}>

<Tab>

<SnackInline label='Reddit Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.reddit.com/api/v1/authorize.compact',
  tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: 'your.app://redirect',
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

- You must select the `installed` option for your app on Reddit to use implicit grant.

<SnackInline label='Reddit Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.reddit.com/api/v1/authorize.compact',
  tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>
</Tabs>

<!-- End Reddit -->

### Slack

<CreateAppButton name="Slack" href="https://api.slack.com/apps" />

| Website                    | Provider  | PKCE      | Auto Discovery |
| -------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-slack] | OAuth 2.0 | Supported | Not Available  |

[c-slack]: https://api.slack.com/apps

- The `redirectUri` requires 2 slashes (`://`).
- `redirectUri` can be defined under the "OAuth & Permissions" section of the website.
- `clientId` and `clientSecret` can be found in the **"App Credentials"** section.
- Scopes must be joined with ':' so just create one long string.
- Navigate to the **"Scopes"** section to enable scopes.
- `revocationEndpoint` is not available.

<Tabs tabs={["Auth Code", "Implicit Flow"]}>

<Tab>

<SnackInline label='Slack Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://slack.com/oauth/authorize',
  tokenEndpoint: 'https://slack.com/api/oauth.access',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['emoji:read'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

- Slack does not support implicit grant.

</Tab>

</Tabs>

<!-- End Slack -->

### Spotify

<CreateAppButton name="Spotify" href="https://developer.spotify.com/dashboard/applications" />

| Website                      | Provider  | PKCE      | Auto Discovery |
| ---------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-spotify] | OAuth 2.0 | Supported | Not Available  |

[c-spotify]: https://developer.spotify.com/dashboard/applications

- Setup your redirect URIs: Your project > Edit Settings > Redirect URIs (be sure to save after making changes).
  - _Expo Go_: `exp://localhost:19000/--/`
  - _Web dev_: `https://localhost:19006`
    - Important: Ensure there's no slash at the end of the URL unless manually changed in the app code with `makeRedirectUri({ path: '/' })`.
    - Run `expo start:web --https` to run with **https**, auth won't work otherwise.
  - _Custom app_: `your-scheme://`
    - Scheme should be specified in app.json `expo.scheme: 'your-scheme'`, then added to the app code with `makeRedirectUri({ native: 'your-scheme://' })`)
  - _Proxy_: `https://auth.expo.io/@username/slug`
    - If `useProxy` is enabled (native only), change **username** for your Expo username and **slug** for the `slug` in your app.json. Try not to change the slug for your app after using it for auth as this can lead to versioning issues.
  - _Web production_: `https://yourwebsite.com`
    - Set this to whatever your deployed website URL is.
- For simpler authentication, use the **Implicit Flow** as it'll return an `access_token` without the need for a code exchange server request.
- Learn more about the [Spotify API](https://developer.spotify.com/documentation/web-api/).

<Tabs tabs={["Auth Code", "Implicit Flow"]}>
<Tab>

<SnackInline label='Spotify Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['user-read-email', 'playlist-modify-public'],
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

<SnackInline label='Spotify Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      scopes: ['user-read-email', 'playlist-modify-public'],
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>
</Tabs>

<!-- End Spotify -->

### Strava

<CreateAppButton name="Strava" href="https://www.strava.com/settings/api" />

| Website                     | Provider  | PKCE      | Auto Discovery |
| --------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-strava] | OAuth 2.0 | Supported | Not Available  |

[c-strava]: https://www.strava.com/settings/api

- Learn more about the [Strava API](http://developers.strava.com/docs/reference/).
- The "Authorization Callback Domain" refers to the final path component of your redirect URI. Ex: In the URI `com.bacon.myapp://redirect` the domain would be `redirect`.
- No Implicit auth flow is provided by Strava.

<Tabs tabs={["Auth Code"]}>
<Tab>

<SnackInline label='Strava Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['activity:read_all'],
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        // the "redirect" must match your "Authorization Callback Domain" in the Strava dev console.
        native: 'your.app://redirect',
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

Strava doesn't provide an implicit auth flow, you should send the code to a server or serverless function to perform the access token exchange.
For **debugging** purposes, you can perform the exchange client-side using the following method:

<!-- prettier-ignore -->
```tsx
const { accessToken } = await AuthSession.exchangeCodeAsync(
  {
    clientId: request?.clientId,
    redirectUri,
    code: result.params.code,
    extraParams: {
      // You must use the extraParams variation of clientSecret.
      // Never store your client secret on the client.
      client_secret: 'CLIENT_SECRET',
    },
  },
  { tokenEndpoint: 'https://www.strava.com/oauth/token' }
);
```

</SnackInline>

</Tab>

</Tabs>

<!-- End Strava -->

### Twitch

<CreateAppButton name="Twitch" href="https://dev.twitch.tv/console/apps/create" />

| Website                     | Provider | PKCE      | Auto Discovery | Scopes           |
| --------------------------- | -------- | --------- | -------------- | ---------------- |
| [Get your Config][c-twitch] | OAuth    | Supported | Not Available  | [Info][s-twitch] |

[c-twitch]: https://dev.twitch.tv/console/apps/create
[s-twitch]: https://dev.twitch.tv/docs/authentication#scopes

- You will need to enable 2FA on your Twitch account to create an application.

<Tabs tabs={["Auth Code", "Implicit Flow"]}>

<Tab>

<SnackInline label='Twitch Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://id.twitch.tv/oauth2/authorize',
  tokenEndpoint: 'https://id.twitch.tv/oauth2/token',
  revocationEndpoint: 'https://id.twitch.tv/oauth2/revoke',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
      scopes: ['openid', 'user_read', 'analytics:read:games'],
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

<SnackInline label='Twitch Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://id.twitch.tv/oauth2/authorize',
  tokenEndpoint: 'https://id.twitch.tv/oauth2/token',
  revocationEndpoint: 'https://id.twitch.tv/oauth2/revoke',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
      scopes: ['openid', 'user_read', 'analytics:read:games'],
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

</Tabs>

<!-- End Twitch -->

### Uber

<CreateAppButton name="Uber" href="https://developer.uber.com/docs/riders/guides/authentication/introduction" />

| Website                   | Provider  | PKCE      | Auto Discovery |
| ------------------------- | --------- | --------- | -------------- |
| [Get Your Config][c-uber] | OAuth 2.0 | Supported | Not Available  |

[c-uber]: https://developer.uber.com/docs/riders/guides/authentication/introduction

- The `redirectUri` requires 2 slashes (`://`).
- `scopes` can be difficult to get approved.

<Tabs tabs={["Auth Code", "Implicit Flow"]}>

<Tab>

<SnackInline label='Uber Auth Code' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://login.uber.com/oauth/v2/authorize',
  tokenEndpoint: 'https://login.uber.com/oauth/v2/token',
  revocationEndpoint: 'https://login.uber.com/oauth/v2/revoke',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['profile', 'delivery'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Exchange the code for an access token in a server. Alternatively you can use the <b>Implicit</b> auth method. */
      const { code } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

<Tab>

<SnackInline label='Uber Implicit' dependencies={['expo-auth-session', 'expo-random', 'expo-web-browser']}>

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://login.uber.com/oauth/v2/authorize',
  tokenEndpoint: 'https://login.uber.com/oauth/v2/token',
  revocationEndpoint: 'https://login.uber.com/oauth/v2/revoke',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      scopes: ['profile', 'delivery'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      /* @info Use this access token to interact with user data on the provider's server. */
      const { access_token } = response.params;
      /* @end */
    }
  }, [response]);

  return (
    <Button
      /* @info Disable the button until the request is loaded asynchronously. */
      disabled={!request}
      /* @end */
      title="Login"
      onPress={() => {
        /* @info Prompt the user to authenticate in a user interaction or web browsers will block it. */
        promptAsync();
        /* @end */
      }}
    />
  );
}
```

</SnackInline>

</Tab>

</Tabs>

<!-- End Uber -->

<!-- End Guides -->

## Redirect URI patterns

Here are a few examples of some common redirect URI patterns you may end up using.

#### Expo Proxy

> `https://auth.expo.io/@yourname/your-app`

- **Environment:** Development or production projects in Expo Go, or in a standalone build.
- **Create:** Use `AuthSession.makeRedirectUri({ useProxy: true })` to create this URI.
  - The link is constructed from your Expo username and the Expo app name, which are appended to the proxy website.
  - For custom apps, you'll need to rebuild the native app if you change users or if you reassign your `slug`, or `owner` properties in the app.json. We highly recommend **not** using the proxy in custom apps (standalone, bare, custom).
- **Usage:** `promptAsync({ useProxy: true, redirectUri })`

#### Published project in the Expo Go app

> `exp://exp.host/@yourname/your-app`

- **Environment:** Production projects that you `expo publish`'d and opened in the Expo Go app.
- **Create:** Use `AuthSession.makeRedirectUri({ useProxy: false })` to create this URI.
  - The link is constructed from your Expo username and the Expo app name, which are appended to the Expo Go app URI scheme.
  - You could also create this link with using `Linking.makeUrl()` from `expo-linking`.
- **Usage:** `promptAsync({ redirectUri })`

#### Development project in the Expo Go app

> `exp://localhost:19000`

- **Environment:** Development projects in the Expo Go app when you run `expo start`.
- **Create:** Use `AuthSession.makeRedirectUri({ useProxy: false })` to create this URI.
  - This link is built from your Expo server's `port` + `host`.
  - You could also create this link with using `Linking.makeUrl()` from `expo-linking`.
- **Usage:** `promptAsync({ redirectUri })`

#### Standalone and Bare

> `yourscheme://path`

In some cases there will be anywhere between 1 to 3 slashes (`/`).

- **Environment:**
  - Bare workflow
    - `npx create-react-native-app` or `expo eject`
  - Standalone builds in the App or Play Store
    - `expo build:ios` or `expo build:android`
  - Standalone builds for local testing
    - `expo build:ios -t simulator` or `expo build:android -t apk`

- **Create:** Use `AuthSession.makeRedirectUri({ native: '<YOUR_URI>' })` to select native when running in the correct environment.
  - `your.app://redirect` -> `makeRedirectUri({ scheme: 'your.app', path: 'redirect' })`
  - `your.app:///` -> `makeRedirectUri({ scheme: 'your.app', isTripleSlashed: true })`
  - `your.app:/authorize` -> `makeRedirectUri({ native: 'your.app:/authorize' })`
  - `your.app://auth?foo=bar` -> `makeRedirectUri({ scheme: 'your.app', path: 'auth', queryParams: { foo: 'bar' } })`
  - `exp://exp.host/@yourname/your-app` -> `makeRedirectUri({ useProxy: true })`
  - This link can often be created automatically but we recommend you define the `scheme` property at least. The entire URL can be overridden in custom apps by passing the `native` property. Often this will be used for providers like Google or Okta which require you to use a custom native URI redirect. You can add, list, and open URI schemes using `npx uri-scheme`.
  - If you change the `expo.scheme` after ejecting then you'll need to use the `expo apply` command to apply the changes to your native project, then rebuild them (`yarn ios`, `yarn android`).
- **Usage:** `promptAsync({ redirectUri })`

## Improving User Experience

The "login flow" is an important thing to get right, in a lot of cases this is where the user will _commit_ to using your app again. A bad experience can cause users to give up on your app before they've really gotten to use it.

Here are a few tips you can use to make authentication quick, easy, and secure for your users!

### Warming the browser

On Android you can optionally warm up the web browser before it's used. This allows the browser app to pre-initialize itself in the background. Doing this can significantly speed up prompting the user for authentication.

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';

function App() {
  React.useEffect(() => {
    /* @info <strong>Android only:</strong> Start loading the default browser app in the background to improve transition time. */
    WebBrowser.warmUpAsync();
    /* @end */

    return () => {
      /* @info <strong>Android only:</strong> Cool down the browser when the component unmounts to help improve memory on low-end Android devices. */
      WebBrowser.coolDownAsync();
      /* @end */
    };
  }, []);

  // Do authentication ...
}
```

### Implicit login

You should never store your client secret locally in your bundle because there's no secure way to do this. Luckily a lot of providers have an "Implicit flow" which enables you to request an access token without the client secret. By default `expo-auth-session` requests an exchange code as this is the most widely applicable login method.

Here is an example of logging into Spotify without using a client secret.

<!-- prettier-ignore -->
```tsx
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, ResponseType } from 'expo-auth-session';

/* @info <strong>Web only:</strong> This method should be invoked on the page that the auth popup gets redirected to on web, it'll ensure that authentication is completed properly. On native this does nothing. */
WebBrowser.maybeCompleteAuthSession();
/* @end */

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
};

function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      /* @info Request that the server returns an <code>access_token</code>, not all providers support this. */
      responseType: ResponseType.Token,
      /* @end */
      clientId: 'CLIENT_ID',
      scopes: ['user-read-email', 'playlist-modify-public'],
      redirectUri: makeRedirectUri({
        /* @info The URI <code>[scheme]://</code> to be used in bare and standalone. If undefined, the <code>scheme</code> property of your app.json or app.config.js will be used instead. */
        scheme: 'your.app'
        /* @end */
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response && response.type === 'success') {
      /* @info You can use this access token to make calls into the Spotify API. */
      const token = response.params.access_token;
      /* @end */
    }
  }, [response]);

  return <Button disabled={!request} onPress={() => promptAsync()} title="Login" />;
}
```

### Storing data

On native platforms like iOS, and Android you can secure things like access tokens locally using a package called [`expo-secure-store`](/versions/latest/sdk/securestore) (This is different to `AsyncStorage` which is not secure). This package provides native access to [keychain services](https://developer.apple.com/documentation/security/keychain_services) on iOS and encrypted [`SharedPreferences`](https://developer.android.com/training/basics/data-storage/shared-preferences.html) on Android. There is no web equivalent to this functionality.

You can store your authentication results and rehydrate them later to avoid having to prompt the user to login again.

<!-- prettier-ignore -->
```tsx
import * as SecureStore from 'expo-secure-store';

const MY_SECURE_AUTH_STATE_KEY = 'MySecureAuthStateKey';

function App() {
  const [, response] = useAuthRequest({});

  React.useEffect(() => {
    if (response && response.type === 'success') {
      const auth = response.params;
      const storageValue = JSON.stringify(auth);

      if (Platform.OS !== 'web') {
        // Securely store the auth on your device
        SecureStore.setItemAsync(MY_SECURE_AUTH_STATE_KEY, storageValue);
      }
    }
  }, [response]);

  // More login code...
}
```

[userinfo]: https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
[provider-meta]: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
[oidc-dcr]: https://openid.net/specs/openid-connect-discovery-1_0.html#OpenID.Registration
[oidc-autherr]: https://openid.net/specs/openid-connect-core-1_0.html#AuthError
[oidc-authreq]: https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationRequest
