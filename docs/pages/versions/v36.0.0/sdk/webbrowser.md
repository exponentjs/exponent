---
title: WebBrowser
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-36/packages/expo-web-browser'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';

**`expo-web-browser`** provides access to the system's web browser and supports handling redirects. On iOS, it uses `SFSafariViewController` or `SFAuthenticationSession`, depending on the method you call, and on Android it uses `ChromeCustomTabs`. As of iOS 11, `SFSafariViewController` no longer shares cookies with the Safari, so if you are using `WebBrowser` for authentication you will want to use `WebBrowser.openAuthSessionAsync`, and if you just want to open a webpage (such as your app privacy policy), then use `WebBrowser.openBrowserAsync`.

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-web-browser" />

## Usage

<SnackInline label="Basic WebBrowser usage" templateId="web-browser" dependencies={["expo-web-browser"]}>

```js
import React, { Component } from 'react';
import { Button, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default class App extends Component {
  state = {
    result: null,
  };

  render() {
    return (
      <View>
        <Button title="Open WebBrowser" onPress={this._handlePressButtonAsync} />
        <Text>{this.state.result && JSON.stringify(this.state.result)}</Text>
      </View>
    );
  }

  _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync('https://expo.io');
    this.setState({ result });
  };
}
```

</SnackInline>

### Handling deep links from the WebBrowser

If you are using the `WebBrowser` window for authentication or another use case where you would like to pass information back into your app through a deep link, be sure to add a handler with `Linking.addEventListener` before opening the browser. When the listener fires, you should call [dismissBrowser](#webbrowserdismissbrowser) -- it will not automatically dismiss when a deep link is handled. Aside from that, redirects from `WebBrowser` work the same as other deep links. [Read more about it in the Linking guide](../../../workflow/linking.md#handling-links-into-your-app).

## API

```js
import * as WebBrowser from 'expo-web-browser';
```

### `WebBrowser.openBrowserAsync(url)`

Opens the url with Safari in a modal on iOS using [`SFSafariViewController`](https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller), and Chrome in a new [custom tab](https://developer.chrome.com/multidevice/android/customtabs) on Android. On iOS, the modal Safari will not share cookies with the system Safari. If you need this, use [openAuthSessionAsync](#webbrowseropenauthsessionasync).

#### Arguments

- **url (_string_)** -- The url to open in the web browser.
- **options (_object_)** (_optional_) --
  A dictionary with following key-value pairs:

  - **toolbarColor (_optional_) (_string_)** -- color of the toolbar in either `#AARRGGBB` or `#RRGGBB` format.
  - **enableBarCollapsing (_optional_) (_boolean_)** -- a boolean determining whether the toolbar should be hiding when a user scrolls the website
  - **showInRecents (_optional_) (_boolean_)** -- (_Android only_) a boolean determining whether browsed website should be shown as separate entry in Android recents/multitasking view. Default: `false`
  - **controlsColor (_optional_) (_string_)** -- (_iOS only_) tint color for controls in SKSafariViewController in `#AARRGGBB` or `#RRGGBB` format.
  - **showTitle (_optional_) (_boolean_)** -- (_Android only_) a boolean determining whether the browser should show the title of website on the toolbar
  - **browserPackage (_optional_) (_string_)** -- (_Android only_). Package name of a browser to be used to handle Custom Tabs. List of available packages is to be queried by [getCustomTabsSupportingBrowsers](#webbrowsergetcustomtabssupportingbrowsersasync) method.

  Note that behavior customization options depend on the actual browser and its version. Some or all of the arguments may be ignored.

#### Returns

The promise behaves differently on iOS and Android.

On Android promise resolves with `{type: 'opened'}` if we were able to open browser.

On iOS:

- If the user closed the web browser, the Promise resolves with `{ type: 'cancel' }`.
- If the browser is closed using [`dismissBrowser`](#webbrowserdismissbrowser) , the Promise resolves with `{ type: 'dismiss' }`.

### `WebBrowser.openAuthSessionAsync(url, redirectUrl)`

Opens the url with Safari in a modal on iOS using `SFAuthenticationSession`. The user will be asked whether to allow the app to authenticate using the given url. Unavailable on Android.

#### Arguments

- **url (_string_)** -- The url to open in the web browser. This should be a login page.
- **redirectUrl (_string_)** -- **optional**: the url to deep link back into your app. By default, this will be [Constants.linkingUrl](constants.md#expoconstantslinkinguri)

Returns a Promise:

- If the user does not permit the application to authenticate with the given url, the Promise resolved with `{ type: 'cancel' }`.
- If the user closed the web browser, the Promise resolves with `{ type: 'cancel' }`.
- If the browser is closed using [`dismissBrowser`](#webbrowserdismissbrowser), the Promise resolves with `{ type: 'dismiss' }`.

### `WebBrowser.warmUpAsync(browserPackage)`

_Android only_

This method calls `warmUp` method on [CustomTabsClient](<https://developer.android.com/reference/android/support/customtabs/CustomTabsClient.html#warmup(long)>) for specified package.

#### Arguments

- **browserPackage (_string_)** -- **optional** -- package of browser to be warmed up. If not set, preferred browser will be warmed.

#### Returns

A promise resolving with `{ package: string }`

### `WebBrowser.mayInitWithUrlAsync(url, package)`

_Android only_

This method initiates (if needed) [CustomTabsSession](https://developer.android.com/reference/android/support/customtabs/CustomTabsSession.html#maylaunchurl) and calls its `mayLaunchUrl` method for browser specified by the package.

#### Arguments

- **url (_string_)** -- url of page that is likely to be loaded firts when opening browser
- **package (_string_)** -- **optional** -- package of browser to be informed. If not set, preferred browser will be used.

#### Returns

The promise resolves with `{ package: string }`.

### `WebBrowser.coolDownAsync(browserPackage)`

_Android only_

This methods removes all bindings to services created by [`warmUpAsync`](#webbrowserwarmupasyncbrowserpackage) or [`mayInitWithUrlAsync`](#webbrowsermayinitwithurlasyncurl-package). You should call this method once you don't need them to avoid potential memory leaks. However, those binding would be cleared once your application is destroyed, which might be sufficient in most cases.

#### Arguments

- **browserPackage (_string_)** -- **optional** -- package of browser to be cooled. If not set, preferred browser will be used.

#### Returns

The promise resolves with `{ package: string }` when cooling is performed, or an empty object when there was no connection to be dismissed.

### `WebBrowser.dismissBrowser()`

_iOS only_

Dismisses the presented web browser.

#### Returns

The promise resolves with `{ type: 'dismiss' }`.

### `WebBrowser.getCustomTabsSupportingBrowsersAsync`

_Android only_

Returns a list of applications package names supporting Custom Tabs, Custom Tabs service, user chosen and preferred one. This may not be fully reliable, since it uses `PackageManager.getResolvingActivities` under the hood. (For example, some browsers might not be present in `browserPackages` list once another browser is set to defult.)

#### Returns

The promise resolves with `{ browserPackages: string[], defaultBrowserPackage: string, servicePackages: string[], preferredBrowserPackage: string }`

- **browserPackages (_string[]_)** : All packages recognized by `PackageManager` as capable of handling Custom Tabs. Empty array means there is no supporting browsers on device.
- **defaultBrowserPackage (_string_ | null)** : Default package chosen by user. Null if there is no such packages. Null usually means, that user will be prompted to choose from available packages.
- **servicePackages (_string[]_)** : All packages recognized by `PackageManager` as capable of handling Custom Tabs Service. This service is used by [`warmUpAsync`](#webbrowserwarmupasyncbrowserpackage), [`mayInitWithUrlAsync`](#webbrowsermayinitwithurlasyncurl-package) and [`coolDownAsync`](#webbrowsercooldownasyncbrowserpackage).
- **preferredBrowserPackage (_string_ | null)** : Package preferred by `CustomTabsClient` to be used to handle Custom Tabs. It favors browser chosen by user as default, as long as it is present on both `browserPackages` and `servicePackages` lists. Only such browsers are considered as fully supporting Custom Tabs. It might be `null` when there is no such browser installed or when default browser is not in `servicePackages` list.

In general, services are used to perform background tasks. If a browser is available in `servicePackage` list, it should be capable of performing [`warmUpAsync`](#webbrowserwarmupasyncbrowserpackage), [`mayInitWithUrlAsync`](#webbrowsermayinitwithurlasyncurl-package) and [`coolDownAsync`](#webbrowsercooldownasyncbrowserpackage). For opening an actual web page, browser must be in `browserPackages` list. A browser has to be present in both lists to be considered as fully supporting Custom Tabs.

#
