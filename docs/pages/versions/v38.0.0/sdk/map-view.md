---
title: MapView
sourceCodeUrl: 'https://github.com/react-native-community/react-native-maps'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';

**`react-native-maps`** provides a Map component that uses Apple Maps or Google Maps on iOS and Google Maps on Android. Expo uses react-native-maps at [react-community/react-native-maps](https://github.com/react-community/react-native-maps). No setup required for use within the Expo Client app. See below for instructions on how to configure for deployment as a standalone app on Android and iOS.

<PlatformsSection android emulator ios simulator />

## Installation

<InstallSection packageName="react-native-maps" href="https://github.com/react-native-community/react-native-maps" />

## Usage

See full documentation at [react-native-community/react-native-maps](https://github.com/react-native-community/react-native-maps).

<SnackInline label='MapView' dependencies={['react-native-maps']}>

```js
import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <MapView style={styles.mapStyle} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
```

</SnackInline>

## Configuration

### Deploying to a standalone app on Android

If you have already integrated Google Sign In into your standalone app, this is very easy. Otherwise, there are some additional steps.

- **If you already have Google Sign In configured**
  1.  Open your browser to the [Google API Manager](https://console.developers.google.com/apis).
  2.  Select your project and enable the **Google Maps SDK for Android**
  3.  In `app.json`, copy the API key from `android.config.googleSignIn` to `android.config.googleMaps.apiKey`.
  4.  Rebuild your standalone app.
- **If you already have not configured Google Sign In**
  1.  [Build your app for Android](/distribution/building-standalone-apps/#if-you-choose-to-build-for-android) with `expo build:android`. Take note of your [Android package name](https://expo.fyi/android-package).
  2.  Open your browser to the [Google API Manager](https://console.developers.google.com/apis) and create a project.
  3.  Once it's created, go to the project and enable the **Google Maps SDK for Android**
  4.  Go back to <https://console.developers.google.com/apis/credentials> and click **Create Credentials**, then **API Key**.
  5.  In the modal that popped up, click **RESTRICT KEY**.
  6.  Choose the **Android apps** radio button under **Key restriction**.
  7.  Click the **+ Add package name and fingerprint** button.
  8.  Add your `android.package` from `app.json` (eg: `ca.brentvatne.growlerprowler`) to the Package name field.
  9.  Run `expo fetch:android:hashes`.
  10. Copy `Google Certificate Fingerprint` from the output from step 9 and insert it in the "SHA-1 certificate fingerprint" field.
  11. Copy the API key (the first text input on the page) into `app.json` under the `android.config.googleMaps.apiKey` field. [See an example diff](https://github.com/brentvatne/growler-prowler/commit/3496e69b14adb21eb2025ef9e0719c2edbef2aa2).
  12. Press `Save` and then rebuild the app like in step 1.

#### Deploying to the Google Play Store

Since your app is most likely using App Signing by Google Play, you will need to grab their app signing certificate in production rather than the upload certificate returned by `expo fetch:android:hashes`. You can do this by grabbing the signature from Play Console -> Your App -> Release management -> App signing, and then going to the [API Dashboard](https://console.developers.google.com/apis/) -> Credentials and adding the signature to your existing credential.

**Note:** The API key can be accessed through your app's [Constants](../../sdk/constants#constantsmanifest) (via `Constants.manifest.android.config.googleMaps.apiKey`) if you'd prefer not to have it in your code directly.

### Deploying Google Maps to a standalone app on iOS

Apple Maps will work with no extra configuration. For Google Maps:

1.  Open your browser to the [Google API Manager](https://console.developers.google.com/apis) and create a project, or select your existing project if you've already made one for this app.
2.  Go to the project and enable the **Google Maps SDK for iOS**
3.  Go back to <https://console.developers.google.com/apis/credentials> and click **Create Credentials**, then **API Key**.
4.  In the modal that popped up, click **RESTRICT KEY**.
5.  Choose the **iOS apps** radio button under **Key restriction**.
6.  Under **Accept requests from an iOS application with one of these bundle identifiers**, click the **Add an item** button.
7.  Add your `ios.bundleIdentifier` from `app.json` (eg: `ca.brentvatne.growlerprowler`) to the bundle ID field.
8.  Copy the API key (the first text input on the page) into `app.json` under the `ios.config.googleMapsApiKey` field.
9.  Press `Save` and then rebuild the app.

**Note:** This can also be accessed through your app's [Constants](../../sdk/constants#constantsmanifest) (via `Constants.manifest.ios.config.googleMapsApiKey`) if you'd prefer not to have the API key in your code.

### Deploying Google Maps to ExpoKit for iOS

If you want to add MapView with Google Maps to an [ExpoKit](../../expokit/overview/) (ejected) project on iOS, you may need to manually provide a key by calling:

```
[GMSServices provideApiKey:@"your api key"]
```

Alternatively, you can provide the `GMSApiKey` key in your app's `Info.plist` and ExpoKit will pick it up automatically. If you ejected after already configuring Google Maps, the eject step may have already provided this for you.

### Web Setup

> Web is experimental! You may need to add the web target to your Expo app.

To use this in web, add the following script to your `web/index.html`. This script may already be present, if this is the case, just replace the `API_KEY` with your Google Maps API key which you can obtain here: [Google Maps: Get API key](https://developers.google.com/maps/documentation/javascript/get-api-key)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- At the end of the <head/> element... -->

    <script
      async
      defer
      src="https://maps.googleapis.com/maps/api/js?key=API_KEY"
      type="text/javascript"
    ></script>

    <!-- Use your web API Key in place of API_KEY: https://developers.google.com/maps/documentation/javascript/get-api-key -->
  </head>

  <!-- <body /> -->
</html>
```
