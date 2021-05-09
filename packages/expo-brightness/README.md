# expo-brightness

Provides an API to get and set screen brightness.

# API documentation

- [Documentation for the master branch](https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/sdk/brightness.md)
- [Documentation for the latest stable release](https://docs.expo.io/versions/latest/sdk/brightness/)

# Installation in managed Expo projects

For managed [managed](https://docs.expo.io/versions/latest/introduction/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](https://docs.expo.io/versions/latest/sdk/brightness/).

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `react-native-unimodules` package](https://github.com/expo/expo/tree/master/packages/react-native-unimodules) before continuing.

### Add the package to your npm dependencies

```
expo install expo-brightness
```

### Configure for iOS

Run `npx pod-install` after installing the npm package.

### Configure for Android

Add [`android.permission.WRITE_SETTINGS`][write_settings] permission to your manifest (`android/app/src/main/AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.WRITE_SETTINGS" />
```

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).

[write_settings]: https://developer.android.com/reference/android/Manifest.permission#WRITE_SETTINGS
