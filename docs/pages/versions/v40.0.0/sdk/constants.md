---
title: Constants
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-40/packages/expo-constants'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-constants`** provides system information that remains constant throughout the lifetime of your app's install.

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-constants" />

## API

```js
import Constants from 'expo-constants';
```

## Properties

### `Constants.appOwnership`

Returns `expo`, `standalone`, or `guest`. If `expo`, the experience is running inside of the Expo client. If `standalone`, it is a [standalone app](../../../distribution/building-standalone-apps.md). If `guest`, it has been opened through a link from a standalone app.

### `Constants.deviceName`

A human-readable name for the device type.

### `Constants.deviceYearClass`

The [device year class](https://github.com/facebook/device-year-class) of this device.

### `Constants.expoVersion`

The version string of the Expo client currently running.

### `Constants.getWebViewUserAgentAsync()`

Gets the user agent string which would be included in requests sent by a web view running on this device. This is probably not the same user agent you might be providing in your JS `fetch` requests.

### `Constants.installationId`

An identifier that is unique to this particular device and installation of the Expo client.

### `Constants.isDevice`

`true` if the app is running on a device, `false` if running in a simulator or emulator.

### `Constants.manifest`

The [manifest](../../../workflow/how-expo-works.md#expo-manifest) object for the app.

### `Constants.nativeAppVersion`

The `Info.plist` value for `CFBundleShortVersionString` on iOS and the version name set by `version` in app.json on Android at the time the native app was built.

### `Constants.nativeBuildVersion`

The `Info.plist` value for `CFBundleVersion` on iOS (set with `ios.buildNumber` value in `app.json` in a standalone app) and the version code set by `android.versionCode` in app.json on Android at the time the native app was built.

### `Constants.platform`

- `ios`

  - `buildNumber`

    The build number specified in the embedded `Info.plist` value for `CFBundleVersion` in this app.
    In a standalone app, you can set this with the `ios.buildNumber` value in `app.json`. This
    may differ from the value in `Constants.manifest.ios.buildNumber` because the manifest
    can be updated over the air, whereas this value will never change for a given native binary.
    The value is set to `null` in case you run your app in Expo client.

  - `platform`

    The Apple internal model identifier for this device, e.g. `iPhone1,1`.

  - `model`

  The human-readable model name of this device, e.g. `iPhone 7 Plus`.

  - `userInterfaceIdiom`

  The user interface idiom of this device, i.e. whether the app is running on an iPhone or an iPad. Current supported values are `handset` and `tablet`. Apple TV and CarPlay will show up as `unsupported`.

  - `systemVersion`

  The version of iOS running on this device, e.g. `10.3`.

- `android`

  - `versionCode`

    The version code set by `android.versionCode` in app.json.
    The value is set to `null` in case you run your app in Expo client.

### `Constants.sessionId`

A string that is unique to the current session of your app. It is different across apps and across multiple launches of the same app.

### `Constants.statusBarHeight`

The default status bar height for the device. Does not factor in changes when location tracking is in use or a phone call is active.

### `Constants.systemFonts`

A list of the system font names available on the current device.
