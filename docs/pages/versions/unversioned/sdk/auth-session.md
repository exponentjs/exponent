---
title: AuthSession
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-auth-session'
---

import PlatformsSection from '~/components/plugins/PlatformsSection';
import InstallSection from '~/components/plugins/InstallSection';

import { SocialGrid, SocialGridItem, CreateAppButton } from '~/components/plugins/AuthSessionElements';
import TerminalBlock from '~/components/plugins/TerminalBlock';
import SnackInline from '~/components/plugins/SnackInline';
import { InlineCode } from '~/components/base/code';

`AuthSession` is the easiest way to add web browser based authentication (for example, browser-based OAuth flows) to your app, built on top of [WebBrowser](webbrowser.md), [Crypto](crypto.md), and [Random](random.md). If you would like to understand how it does this, read this document from top to bottom. If you just want to use it, jump to the [Authentication Guide](../../../guides/authentication.md).

<PlatformsSection android emulator ios simulator web />

## Installation

> `expo-random` is a peer dependency and must be installed alongside `expo-auth-session`.

<InstallSection packageName="expo-auth-session expo-random" />

In **bare-workflow** you can use the [`uri-scheme` package][n-uri-scheme] to easily add, remove, list, and open your URIs.

[n-uri-scheme]: https://www.npmjs.com/package/uri-scheme

To make your native app handle `mycoolredirect://` simply run:

<TerminalBlock cmd={['npx uri-scheme add mycoolredirect']} />

<br />

You should now be able to see a list of all your project's schemes by running:

<TerminalBlock cmd={['npx uri-scheme list']} />

<br />

You can test it to ensure it works like this:

<TerminalBlock cmd={[
'# Rebuild the native apps, be sure to use an emulator',
'yarn ios',
'yarn android',
'',
'# Open a URI scheme',
'npx uri-scheme open mycoolredirect://some/redirect'
]} />

### Usage in standalone apps

`app.json`

```json
{
  "expo": {
    "scheme": "mycoolredirect"
  }
}
```

In order to be able to deep link back into your app, you will need to set a `scheme` in your project `app.config.js`, or `app.json`, and then build your standalone app (it can't be updated with an OTA update). If you do not include a scheme, the authentication flow will complete but it will be unable to pass the information back into your application and the user will have to manually exit the authentication modal (resulting in a cancelled event).

## Guides

The guides have moved: [Authentication Guide](../../../guides/authentication.md).

## How web browser based authentication flows work

The typical flow for browser-based authentication in mobile apps is as follows:

- **Initiation**: the user presses a sign in button
- **Open web browser**: the app opens up a web browser to the authentication provider sign in page. The url that is opened for the sign in page usually includes information to identify the app, and a URL to redirect to on success. _Note: the web browser should share cookies with your system web browser so that users do not need to sign in again if they are already authenticated on the system browser -- Expo's [WebBrowser](webbrowser.md) API takes care of this._
- **Authentication provider redirects**: upon successful authentication, the authentication provider should redirect back to the application by redirecting to URL provided by the app in the query parameters on the sign in page ([read more about how linking works in mobile apps](../../../guides/linking.md)), _provided that the URL is in the allowlist of allowed redirect URLs_. Allowlisting redirect URLs is important to prevent malicious actors from pretending to be your application. The redirect includes data in the URL (such as user id and token), either in the location hash, query parameters, or both.
- **App handles redirect**: the redirect is handled by the app and data is parsed from the redirect URL.

## What `auth.expo.io` does for you

> The `auth.expo.io` proxy is only used when `startAsync` is called, or when `useProxy: true` is passed to the `promptAsync()` method of an `AuthRequest`.

### It reduces boilerplate

`AuthSession` handles most of the app-side responsibilities for you:

- It opens the sign in URL for your authentication provider (`authUrl`, you must provide it) in a web browser that shares cookies with your system browser.
- It handles success redirects and extracts all of the data encoded in the URL.
- It handles failures and provides information to you about what went wrong.

### It makes redirect URL allowlists easier to manage for development and working in teams

Additionally, `AuthSession` **simplifies setting up authorized redirect URLs** by using an Expo service that sits between you and your authentication provider ([read Security considerations for caveats](#security-considerations)). This is particularly valuable with Expo because your app can live at various URLs. In development, you can have a tunnel URL, a lan URL, and a localhost URL. The tunnel URL on your machine for the same app will be different from a co-worker's machine. When you publish your app, that will be another URL that you need to allowlist. If you have multiple environments that you publish to, each of those will also need to be allowlisted. `AuthSession` gets around this by only having you allowlist one URL with your authentication provider: `https://auth.expo.io/@your-username/your-app-slug`. When authentication is successful, your authentication provider will redirect to that Expo Auth URL, and then the Expo Auth service will redirect back to your appplication. If the URL that the auth service is redirecting back to does not match the published URL for the app or the standalone app scheme (eg: `exp://expo.io/@your-username/your-app-slug`, or `yourscheme://`), then it will show a warning page before asking the user to sign in. This means that in development you will see this warning page when you sign in, a small price to pay for the convenience.

How does this work? When you open an authentication session with `AuthSession`, it first visits `https://auth.expo.io/@your-username/your-app-slug/start` and passes in the `authUrl` and `returnUrl` (the URL to redirect back to your application) in the query parameters. The Expo Auth service saves away the `returnUrl` (and if it is not a published URL or your registered custom theme, shows a warning page) and then sends the user off to the `authUrl`. When the authentication provider redirects back to `https://auth.expo.io/@your-username/your-app-slug` on success, the Expo Auth services redirects back to the `returnUrl` that was provided on initiating the authentication flow.

## Security considerations

If you are authenticating with a popular social provider, when you are ready to ship to production you should be sure that you do not directly request the access token for the user. Instead, most providers give an option to request a one-time code that can be combined with a secret key to request an access token. For an example of this flow, [see the _Confirming Identity_ section in the Facebook Login documentation](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/#confirm).

**Never put any secret keys inside of your app, there is no secure way to do this!** Instead, you should store your secret key(s) on a server and expose an endpoint that makes API calls for your client and passes the data back.

# API

```js
import * as AuthSession from 'expo-auth-session';
```

## Hooks

### `useAuthRequest`

```ts
const [request, response, promptAsync] = useAuthRequest({ ... }, { ... });
```

Load an authorization request for a code. Returns a loaded request, a response, and a prompt method.
When the prompt method completes then the response will be fulfilled.

> 🚨 In order to close the popup window on web, you need to invoke `WebBrowser.maybeCompleteAuthSession()`. See the [Identity example](../../../guides/authentication.md#identity-4) for more info.

If an Implicit grant flow was used, you can pass the `response.params` to `TokenResponse.fromQueryParams()` to get a `TokenResponse` instance which you can use to easily refresh the token.

#### Arguments

- **config (_AuthRequestConfig_)** -- A valid [`AuthRequestConfig`](#authrequestconfig) that specifies what provider to use.
- **discovery (_DiscoveryDocument_)** -- A loaded [`DiscoveryDocument`](#discoverydocument) with endpoints used for authenticating. Only `authorizationEndpoint` is required for requesting an authorization code.

#### Returns

- **request (_AuthRequest | null_)** -- An instance of [`AuthRequest`](#authrequest) that can be used to prompt the user for authorization. This will be `null` until the auth request has finished loading.
- **response (_AuthSessionResult | null_)** -- This is `null` until `promptAsync` has been invoked. Once fulfilled it will return information about the authorization.
- **promptAsync (_function_)** -- When invoked, a web browser will open up and prompt the user for authentication. Accepts an [`AuthRequestPromptOptions`](#authrequestpromptoptions) object with options about how the prompt will execute. You can use this to enable the Expo proxy service `auth.expo.io`.

### `useAutoDiscovery`

```ts
const discovery = useAutoDiscovery('https://example.com/auth');
```

Given an OpenID Connect issuer URL, this will fetch and return the [`DiscoveryDocument`](#discoverydocument) (a collection of URLs) from the resource provider.

#### Arguments

- **issuer (_string_)** -- URL using the `https` scheme with no query or fragment component that the OP asserts as its Issuer Identifier.

#### Returns

- **discovery (_DiscoveryDocument | null_)** -- Returns `null` until the [`DiscoveryDocument`](#discoverydocument) has been fetched from the provided issuer URL.

## Methods

### `AuthSession.makeRedirectUri()`

Create a redirect url for the current platform and environment. You need to manually define the redirect that will be used in a bare workflow React Native app, or an Expo standalone app, this is because it cannot be inferred automatically.

- **Web:** Generates a path based on the current `window.location`. For production web apps, you should hard code the URL as well.
- **Managed, and Custom workflow:** Uses the `scheme` property of your `app.config.js` or `app.json`.
  - **Proxy:** Uses auth.expo.io as the base URL for the path. This only works in Expo Go and standalone environments.
- **Bare workflow:** Will fallback to using the `native` option for bare workflow React Native apps.

#### Arguments

- **options (_AuthSessionRedirectUriOptions_)** -- Additional options for configuring the path.

#### Returns

- **redirectUri (_string_)** -- The `redirectUri` to use in an authentication request.

### `AuthSession.fetchDiscoveryAsync()`

Fetch a `DiscoveryDocument` from a well-known resource provider that supports auto discovery.

#### Arguments

- **issuer (_Issuer_)** -- An `Issuer` URL to fetch from.

#### Returns

- **discovery (_DiscoveryDocument_)** -- A discovery document that can be used for authentication.

### `AuthSession.exchangeCodeAsync()`

Exchange an authorization code for an access token that can be used to get data from the provider.

#### Arguments

- **config (_TokenRequestConfig_)** -- Configuration used to exchange the code for a token.

#### Returns

- **discovery (_DiscoveryDocument_)** -- A discovery document with a valid `tokenEndpoint` URL.

### `AuthSession.refreshAsync()`

Refresh an access token.

- If the provider didn't return a `refresh_token` then the access token may not be refreshed.
- If the provider didn't return a `expires_in` then it's assumed that the token does not expire.
- Determine if a token needs refreshed via `TokenResponse.isTokenFresh()` or `shouldRefresh()` on an instance of `TokenResponse`.

#### Arguments

- **config (_TokenRequestConfig_)** -- Configuration used to refresh the given access token.

#### Returns

- **discovery (_DiscoveryDocument_)** -- A discovery document with a valid `tokenEndpoint` URL.

### `AuthSession.revokeAsync()`

Revoke a token with a provider. This makes the token unusable, effectively requiring the user to login again.

#### Arguments

- **config (_RevokeTokenRequestConfig_)** -- Configuration used to revoke a refresh or access token.

#### Returns

- **discovery (_DiscoveryDocument_)** -- A discovery document with a valid `revocationEndpoint` URL. Many providers do not support this feature.

### `AuthSession.startAsync(options)`

Initiate an authentication session with the given options. Only one `AuthSession` can be active at any given time in your application; if you attempt to open a second session while one is still in progress, the second session will return a value to indicate that `AuthSession` is locked.

#### Arguments

- **options (_object_)** --

  A map of options:

  - **authUrl (_string_)** -- **Required**. The URL that points to the sign in page that you would like to open the user to.

  - **returnUrl (_string_)** -- The URL to return to the application. In managed apps, it's optional (defaults to `${Constants.linkingUrl}expo-auth-session`, for example, `exp://expo.io/@yourname/your-app-slug+expo-auth-session`). However, in the bare app, it's required - `AuthSession` needs to know where to wait for the response. Hence, this method will throw an exception, if you don't provide `returnUrl`.

  - **showInRecents (_optional_) (_boolean_)** -- (_Android only_) a boolean determining whether browsed website should be shown as separate entry in Android recents/multitasking view. Default: `false`

#### Returns

Returns a Promise that resolves to a result object of the following form:

- If the user cancelled the authentication session by closing the browser, the result is `{ type: 'cancel' }`.
- If the authentication is dismissed manually with `AuthSession.dismiss()`, the result is `{ type: 'dismiss' }`.
- If the authentication flow is successful, the result is `{type: 'success', params: Object, event: Object }`
- If the authentication flow is returns an error, the result is `{type: 'error', params: Object, errorCode: string, event: Object }`
- If you call `AuthSession.startAsync` more than once before the first call has returned, the result is `{type: 'locked'}`, because only one `AuthSession` can be in progress at any time.

### `AuthSession.dismiss()`

Cancels an active `AuthSession` if there is one. No return value, but if there is an active `AuthSession` then the Promise returned by the `AuthSession.startAsync` that initiated it resolves to `{ type: 'dismiss' }`.

### `AuthSession.getRedirectUrl()`

```ts
AuthSession.getRedirectUrl(extraPath?: string): string
```

Get the URL that your authentication provider needs to redirect to. For example: `https://auth.expo.io/@your-username/your-app-slug`. You can pass an additional path component to be appended to the default redirect URL.

> **Note** This method will throw an exception if you're using the bare workflow on native.

```js
const url = AuthSession.getRedirectUrl('redirect');

// Managed: https://auth.expo.io/@your-username/your-app-slug/redirect
// Web: https://localhost:19006/redirect
```

### `AuthSession.loadAsync()`

Load an authorization request for a code.

#### Arguments

- **config (_AuthRequestConfig_)** -- A valid [`AuthRequestConfig`](#authrequestconfig) that specifies what provider to use.
- **discovery (_IssuerOrDiscovery_)** -- A loaded [`DiscoveryDocument`](#discoverydocument) or issuer URL. (Only `authorizationEndpoint` is required for requesting an authorization code).

#### Returns

- **request (_AuthRequest_)** -- An instance of `AuthRequest` that can be used to prompt the user for authorization.

## Classes

### `AuthRequest`

Used to manage an authorization request according to the OAuth spec: [Section 4.1.1][s411].
You can use this class directly for more info around the authorization.

**Common use-cases**

- Parse a URL returned from the authorization server with `parseReturnUrlAsync()`.
- Get the built authorization URL with `makeAuthUrlAsync()`.
- Get a loaded JSON representation of the auth request with crypto state loaded with `getAuthRequestConfigAsync()`.

```ts
// Create a request.
const request = new AuthRequest({ ... });

// Prompt for an auth code
const result = await request.promptAsync(discovery, { useProxy: true });

// Get the URL to invoke
const url = await request.makeAuthUrlAsync(discovery);

// Get the URL to invoke
const parsed = await request.parseReturnUrlAsync("<URL From Server>");
```

### `AuthError`

Represents an authorization response error: [Section 5.2][s52].
Often times providers will fail to return the proper error message for a given error code.
This error method will add the missing description for more context on what went wrong.

## Types

### `AuthSessionResult`

Object returned after an auth request has completed.

| Name           | Type                                           | Description                                                                | Default |
| -------------- | ---------------------------------------------- | -------------------------------------------------------------------------- | ------- |
| type           | `string`                                       | How the auth completed `'cancel', 'dismiss', 'locked', 'error', 'success'` | `.Code` |
| url            | `string`                                       | Auth URL that was opened                                                   |         |
| error          | <InlineCode>AuthError \| null</InlineCode>     | Possible error if the auth failed with type `error`                        |         |
| params         | `Record<string, string>`                       | Query params from the `url` as an object                                   |         |
| authentication | <InlineCode>TokenResponse \| null</InlineCode> | Returned when the auth finishes with an `access_token` property            |         |
| errorCode      | <InlineCode>string \| null</InlineCode>        | Legacy error code query param, use `error` instead                         |         |

- If the user cancelled the auth session by closing the browser or popup, the result is `{ type: 'cancel' }`.
- If the auth is dismissed manually with `AuthSession.dismiss()`, the result is `{ type: 'dismiss' }`.
- If the auth flow is successful, the result is `{type: 'success', params: Object, event: Object }`
- If the auth flow is returns an error, the result is `{type: 'error', params: Object, errorCode: string, event: Object }`
- If you call `promptAsync()` more than once before the first call has returned, the result is `{type: 'locked'}`, because only one `AuthSession` can be in progress at any time.

### `ResponseType`

The client informs the authorization server of the
desired grant type by using the a response type: [Section 3.1.1][s311].

| Name    | Description                                     | Spec                   |
| ------- | ----------------------------------------------- | ---------------------- |
| Code    | For requesting an authorization code            | [Section 4.1.1][s411]. |
| Token   | For requesting an access token (implicit grant) | [Section 4.2.1][s421]  |
| IdToken | Custom for Google OAuth ID Token auth           | N/A                    |

### `AuthRequestConfig`

Represents an OAuth authorization request as JSON.

| Name                | Type                                            | Description                                                    | Default | Spec                            |
| ------------------- | ----------------------------------------------- | -------------------------------------------------------------- | ------- | ------------------------------- |
| responseType        | <InlineCode>ResponseType \| string</InlineCode> | Specifies what is returned from the authorization server       | `.Code` | [Section 3.1.1][s311]           |
| clientId            | `string`                                        | Unique ID representing the info provided by the client         |         | [Section 2.2][s22]              |
| redirectUri         | `string`                                        | The server will redirect to this URI when complete             |         | [Section 3.1.2][s312]           |
| prompt              | `Prompt`                                        | Should the user be prompted to login or consent again.         |         | [Section 3.1.2.1][oidc-authreq] |
| scopes              | `string[]`                                      | List of strings to request access to                           |         | [Section 3.3][s33]              |
| clientSecret        | `?string`                                       | Client secret supplied by an auth provider                     |         | [Section 2.3.1][s231]           |
| codeChallengeMethod | `CodeChallengeMethod`                           | Method used to generate the code challenge                     | `.S256` | [Section 6.2][s62]              |
| codeChallenge       | `?string`                                       | Derived from the code verifier using the `CodeChallengeMethod` |         | [Section 4.2][s42]              |
| state               | `?string`                                       | Used for protection against Cross-Site Request Forgery         |         | [Section 10.12][s1012]          |
| usePKCE             | `?boolean`                                      | Should use Proof Key for Code Exchange                         | `true`  | [PKCE][pkce]                    |
| extraParams         | `?Record<string, string>`                       | Extra query params that'll be added to the query string        |         | `N/A`                           |

### `AuthRequestPromptOptions`

Options passed to the `promptAsync()` method of `AuthRequest`s.

| Name          | Type       | Description                                                                | Default         |
| ------------- | ---------- | -------------------------------------------------------------------------- | --------------- |
| useProxy      | `?boolean` | Should use `auth.expo.io` proxy for redirecting requests                   | `false`         |
| showInRecents | `?boolean` | Should browsed website be shown as a separate entry in Android multitasker | `false`         |
| url           | `?string`  | URL that'll begin the auth request, usually this should be left undefined  | Preloaded value |

### `CodeChallengeMethod`

| Name  | Description                                                            |
| ----- | ---------------------------------------------------------------------- |
| S256  | The default and recommended method for transforming the code verifier. |
| Plain | When used, the code verifier will be sent to the server as-is.         |

### `Prompt`

Informs the server if the user should be prompted to login or consent again.
This can be used to present a dialog for switching accounts after the user has already been logged in. You should use this in favor of clearing cookies (which is mostly not possible on iOS).

[Section 3.1.2.1](https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationRequest)

| Name          | Description                                                                                        | Errors                                   |
| ------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| None          | Server must not display any auth or consent UI. Can be used to check for existing auth or consent. | `login_required`, `interaction_required` |
| Login         | Server should prompt the user to reauthenticate.                                                   | `login_required`                         |
| Consent       | Server should prompt the user for consent before returning information to the client.              | `consent_required`                       |
| SelectAccount | Server should prompt the user to select an account. Can be used to switch accounts.                | `account_selection_required`             |

### `GrantType`

Grant type values used in dynamic client registration and auth requests.

[Appendix A.10](https://tools.ietf.org/html/rfc6749#appendix-A.10)

| Name              | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| AuthorizationCode | Used for exchanging an authorization code for one or more tokens. |
| Implicit          | Used when obtaining an access token.                              |
| RefreshToken      | Used when exchanging a refresh token for a new token.             |
| ClientCredentials | Used for client credentials flow.                                 |

### `TokenTypeHint`

A hint about the type of the token submitted for revocation. If not included then the server should attempt to deduce the token type.

[Section 2.1](https://tools.ietf.org/html/rfc7009#section-2.1)

| Name         | Description               |
| ------------ | ------------------------- |
| AccessToken  | Provided an access token. |
| RefreshToken | Provided a refresh token. |

### `DiscoveryDocument`

| Name                  | Type               | Description                                                          | Spec                                    |
| --------------------- | ------------------ | -------------------------------------------------------------------- | --------------------------------------- |
| authorizationEndpoint | `?string`          | Interact with the resource owner and obtain an authorization grant   | [Section 3.1][s31]                      |
| tokenEndpoint         | `?string`          | Obtain an access token by presenting its auth grant or refresh token | [Section 3.2][s32]                      |
| revocationEndpoint    | `?string`          | Used to revoke a token (generally for signing out)                   | [Section 2.1][s21]                      |
| userInfoEndpoint      | `?string`          | URL to return info about the authenticated user                      | [UserInfo][userinfo]                    |
| endSessionEndpoint    | `?string`          | URL to request that the End-User be logged out at the OP.            | [OP Metadata][opmeta]                   |
| registrationEndpoint  | `?string`          | URL of the OP's "Dynamic Client Registration" endpoint               | [Dynamic Client Registration][oidc-dcr] |
| discoveryDocument     | `ProviderMetadata` | All metadata about the provider                                      | [ProviderMetadata][provider-meta]       |

### `TokenRequestConfig`

Shared properties for token requests (refresh, exchange, revoke).

| Name         | Type                      | Description                                             | Spec |
| ------------ | ------------------------- | ------------------------------------------------------- | ---- |
| clientId     | `string`                  | Unique ID representing the info provided by the client  |      | [Section 2.2][s22] |
| clientSecret | `?string`                 | Client secret supplied by an auth provider              |      | [Section 2.3.1][s231] |
| extraParams  | `?Record<string, string>` | Extra query params that'll be added to the query string |      | `N/A` |
| scopes       | `?string[]`               | List of strings to request access to                    |      | [Section 3.3][s33] |

### `AccessTokenRequestConfig`

> Extends `TokenRequestConfig` meaning all properties of `TokenRequestConfig` can be used.

Config used to exchange an authorization code for an access token.

[Section 4.1.3](https://tools.ietf.org/html/rfc6749#section-4.1.3)

| Name        | Type      | Description                                                                                              | Spec                  |
| ----------- | --------- | -------------------------------------------------------------------------------------------------------- | --------------------- |
| code        | `string`  | The authorization code received from the authorization server.                                           | [Section 3.1][s31]    |
| redirectUri | `?string` | If the `redirectUri` parameter was included in the `AuthRequest`, then it must be supplied here as well. | [Section 3.1.2][s312] |

### `RefreshTokenRequestConfig`

> Extends `TokenRequestConfig` meaning all properties of `TokenRequestConfig` can be used.

Config used to request a token refresh, or code exchange.

[Section 6](https://tools.ietf.org/html/rfc6749#section-6)

| Name         | Type     | Description                             |
| ------------ | -------- | --------------------------------------- |
| refreshToken | `string` | The refresh token issued to the client. |

### `RevokeTokenRequestConfig`

> Extends `Partial<TokenRequestConfig>` meaning all properties of `TokenRequestConfig` can optionally be used.

Used for revoking a token.

[Section 2.1](https://tools.ietf.org/html/rfc7009#section-2.1)

| Name          | Type             | Description                                                  | Spec               |
| ------------- | ---------------- | ------------------------------------------------------------ | ------------------ |
| token         | `string`         | The token that the client wants to get revoked.              | [Section 3.1][s31] |
| tokenTypeHint | `?TokenTypeHint` | A hint about the type of the token submitted for revocation. | [Section 3.2][s32] |

### `Issuer`

Type: `string`

URL using the `https` scheme with no query or fragment component that the OP asserts as its Issuer Identifier.

### `ProviderMetadata`

Metadata describing the [OpenID Provider][provider-meta].

### `AuthSessionRedirectUriOptions`

Options passed to `makeRedirectUriAsync`.

| Name            | Type       | Description                                                                                         |
| --------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| native          | `?string`  | The URI scheme that will be used in a bare React Native or standalone Expo app                      |
| path            | `?string`  | Optional path to append to a URI                                                                    |
| preferLocalhost | `?boolean` | Attempt to convert the Expo server IP address to localhost. Should only be used with iOS simulators |
| useProxy        | `?boolean` | Should use the `auth.expo.io` proxy                                                                 |

### `TokenType`

Access token type [Section 7.1](https://tools.ietf.org/html/rfc6749#section-7.1)

`'bearer' | 'mac'`

### `GoogleAuthRequestConfig`

An extension of the [`AuthRequestConfig`][#authrequestconfig] for use with the built-in Google provider.

| Name                   | Type       | Description                                                                           |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------- |
| language               | `?string`  | Language code ISO 3166-1 alpha-2 region code, such as 'it' or 'pt-PT'                 |
| loginHint              | `?string`  | User email to use as the default option                                               |
| selectAccount          | `?boolean` | Used in favor of `prompt: Prompt.SelectAccount` to switch accounts                    |
| expoClientId           | `?string`  | Proxy client ID for use in Expo Go on iOS and Android.                                |
| webClientId            | `?string`  | Web client ID for use in the browser (web apps).                                      |
| iosClientId            | `?string`  | iOS native client ID for use in standalone, bare-workflow, and custom clients.        |
| androidClientId        | `?string`  | Android native client ID for use in standalone, bare-workflow, and custom clients.    |
| shouldAutoExchangeCode | `?boolean` | Should the hook automatically exchange the response code for an authentication token. |

## Providers

AuthSession has built-in support for some popular providers to make usage as easy as possible. These allow you to skip repetitive things like defining endpoints and abstract common features like `language`.

## Google

```tsx
import * as Google from 'expo-auth-session/providers/google';
```

- See the guide for more info on usage: [Google Authentication](../../../guides/authentication.md#google).
- Provides an extra `loginHint` parameter. If the user's email address is known ahead of time, it can be supplied to be the default option.
- Enforces minimum scopes to `['openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']` for optimal usage with services like Firebase and Auth0.
- By default, the authorization `code` will be automatically exchanged for an access token. This can be overridden with `shouldAutoExchangeCode`.
- Automatically uses the proxy in Expo Go because native auth is not supported due to custom build time configuration. This can be overridden with `redirectUriOptions.useProxy`.
- Defaults to using the bundle ID and package name for the native URI redirect instead of the reverse client ID.
- Disables PKCE for implicit and id-token based auth responses.
- On web, the popup is presented with the dimensions that are optimized for the Google login UI (`{ width: 515, height: 680 }`).

### useAuthRequest()

A hook used for opinionated Google authentication that works across platforms.

#### Arguments

- **config (_GoogleAuthRequestConfig_)** -- An object with client IDs for each platform that should be supported.
- **redirectUriOptions (_AuthSessionRedirectUriOptions_)** -- Optional properties used to construct the redirect URI (passed to `makeRedirectUriAsync()`).

#### Returns

- **request (_GoogleAuthRequest | null_)** -- An instance of [`GoogleAuthRequest`](#googleauthrequest) that can be used to prompt the user for authorization. This will be `null` until the auth request has finished loading.
- **response (_AuthSessionResult | null_)** -- This is `null` until `promptAsync` has been invoked. Once fulfilled it will return information about the authorization.
- **promptAsync (_function_)** -- When invoked, a web browser will open up and prompt the user for authentication. Accepts an [`AuthRequestPromptOptions`](#authrequestpromptoptions) object with options about how the prompt will execute. This **should not** be used to enable the Expo proxy service `auth.expo.io`, as the proxy will be automatically enabled based on the platform.

### discovery

An object containing the discovery URLs used for Google auth.

## Facebook

```tsx
import * as Facebook from 'expo-auth-session/providers/facebook';
```

- Uses implicit auth (`ResponseType.Token`) by default.
- See the guide for more info on usage: [Facebook Authentication](../../../guides/authentication.md#facebook).
- Enforces minimum scopes to `['public_profile', 'email']` for optimal usage with services like Firebase and Auth0.
- Uses `display=popup` for better UI results.
- Automatically uses the proxy in Expo Go because native auth is not supported due to custom build time configuration.
- The URI redirect must be added to your `app.config.js` or `app.json` as `facebookScheme: 'fb<YOUR FBID>'`.
- Disables PKCE for implicit auth response.
- On web, the popup is presented with the dimensions `{ width: 700, height: 600 }`

### useAuthRequest()

A hook used for opinionated Facebook authentication that works across platforms.

#### Arguments

- **config (_FacebookAuthRequestConfig_)** -- An object with client IDs for each platform that should be supported.
- **redirectUriOptions (_AuthSessionRedirectUriOptions_)** -- Optional properties used to construct the redirect URI (passed to `makeRedirectUriAsync()`).

#### Returns

- **request (_FacebookAuthRequest | null_)** -- An instance of [`FacebookAuthRequest`](#facebookauthrequest) that can be used to prompt the user for authorization. This will be `null` until the auth request has finished loading.
- **response (_AuthSessionResult | null_)** -- This is `null` until `promptAsync` has been invoked. Once fulfilled it will return information about the authorization.
- **promptAsync (_function_)** -- When invoked, a web browser will open up and prompt the user for authentication. Accepts an [`AuthRequestPromptOptions`](#authrequestpromptoptions) object with options about how the prompt will execute.

### discovery

An object containing the discovery URLs used for Facebook auth.

## Usage in the bare React Native app

In managed apps, `AuthSession` uses Expo servers to create a proxy between your application and the auth provider. If you'd like, you can also create your own proxy service.

### Proxy Service

This service is responsible for:

- redirecting traffic from your application to the authentication service
- redirecting response from the auth service to your application using a deep link

To better understand how it works, check out this implementation in `node.js`:

```js
const http = require('http');
const url = require('url');

const PORT = PORT;
const DEEP_LINK = DEEP_LINK_TO_YOUR_APPLICATION;

function redirect(response, url) {
  response.writeHead(302, {
    Location: url,
  });
  response.end();
}

http
  .createServer((request, response) => {
    // get parameters from request
    const parameters = url.parse(request.url, true).query;

    // if parameters contain authServiceUrl, this request comes from the application
    if (parameters.authServiceUrl) {
      // redirect user to the authUrl
      redirect(response, decodeURIComponent(parameters.authServiceUrl));
      return;
    }

    // redirect response from the auth service to your application
    redirect(response, DEEP_LINK);
  })
  .listen(PORT);
```

Client code which works with this service:

```js
const authServiceUrl = encodeURIComponent(YOUR_AUTH_URL); // we encode this, because it will be send as a query parameter
const authServiceUrlParameter = `authServiceUrl=${authServiceUrl}`;
const authUrl = `YOUR_PROXY_SERVICE_URL?${authServiceUrlParameter}`;
const result = await AuthSession.startAsync({
  authUrl,
  returnUrl: YOUR_DEEP_LINK,
});
```

## Advanced usage

### Filtering out AuthSession events in Linking handlers

There are many reasons why you might want to handle inbound links into your app, such as push notifications or just regular deep linking (you can read more about this in the [Linking guide](../../../guides/linking.md)); authentication redirects are only one type of deep link, and `AuthSession` handles these particular links for you. In your own `Linking.addEventListener` handlers, you can filter out deep links that are handled by `AuthSession` by checking if the URL includes the `+expo-auth-session` string -- if it does, you can ignore it. This works because `AuthSession` adds `+expo-auth-session` to the default `returnUrl`; however, if you provide your own `returnUrl`, you may want to consider adding a similar identifier to enable you to filter out `AuthSession` events from other handlers.

#### With React Navigation v5

If you are using deep linking with React Navigation v5, filtering through `Linking.addEventListener` will not be sufficient, because deep linking is [handled differently](https://reactnavigation.org/docs/configuring-links/#advanced-cases). Instead, to filter these events you can add a custom `getStateFromPath` function to your linking configuration, and then filter by URL in the same way as described above.

#

[userinfo]: https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
[provider-meta]: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
[oidc-dcr]: https://openid.net/specs/openid-connect-discovery-1_0.html#OpenID.Registration
[oidc-autherr]: https://openid.net/specs/openid-connect-core-1_0.html#AuthError
[oidc-authreq]: https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationRequest
[opmeta]: https://openid.net/specs/openid-connect-session-1_0-17.html#OPMetadata
[s1012]: https://tools.ietf.org/html/rfc6749#section-10.12
[s62]: https://tools.ietf.org/html/rfc7636#section-6.2
[s52]: https://tools.ietf.org/html/rfc6749#section-5.2
[s421]: https://tools.ietf.org/html/rfc6749#section-4.2.1
[s42]: https://tools.ietf.org/html/rfc7636#section-4.2
[s411]: https://tools.ietf.org/html/rfc6749#section-4.1.1
[s311]: https://tools.ietf.org/html/rfc6749#section-3.1.1
[s311]: https://tools.ietf.org/html/rfc6749#section-3.1.1
[s312]: https://tools.ietf.org/html/rfc6749#section-3.1.2
[s33]: https://tools.ietf.org/html/rfc6749#section-3.3
[s32]: https://tools.ietf.org/html/rfc6749#section-3.2
[s231]: https://tools.ietf.org/html/rfc6749#section-2.3.1
[s22]: https://tools.ietf.org/html/rfc6749#section-2.2
[s21]: https://tools.ietf.org/html/rfc7009#section-2.1
[s31]: https://tools.ietf.org/html/rfc6749#section-3.1
[pkce]: https://oauth.net/2/pkce/
