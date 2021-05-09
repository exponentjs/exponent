# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features
- On iOS added new `codec` parameter in `recordAsync()` method and new method `getAvailableVideoCodecsAsync()` that queries the device for available video codecs. ([#12772](https://github.com/expo/expo/pull/12772)) by [@ajsmth](https://github.com/ajsmth))


### 🐛 Bug fixes

## 11.0.3 — 2021-05-03

- [plugin] Added ability to disable permissions in plugin. ([#12627](https://github.com/expo/expo/pull/12627) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))
- Add `unimodules-permissions-interface` dependency. ([#12739](https://github.com/expo/expo/pull/12739) by [@ajsmth](https://github.com/ajsmth))

## 11.0.2 — 2021-04-13

_This version does not introduce any user-facing changes._

## 11.0.1 — 2021-04-01

### 🐛 Bug fixes

- Fix typing on `Camera.Constants`. ([#12343](https://github.com/expo/expo/pull/12343) by [@HBiede](https://github.com/HBiede))

## 11.0.0 — 2021-03-10

### 🛠 Breaking changes

- Remove deprecated `barCodeTypes` prop in favor of `barCodeScannerSettings.barCodeTypes`. ([#11904](https://github.com/expo/expo/pull/11904) by [@EvanBacon](https://github.com/EvanBacon))

### 🎉 New features

- Remove lodash. ([#11900](https://github.com/expo/expo/pull/11900) by [@EvanBacon](https://github.com/EvanBacon))
- Add requestPermissionsAsync and getPermissionsAsync for web. ([#11694](https://github.com/expo/expo/pull/11694) by [@IjzerenHein](https://github.com/IjzerenHein))
- Converted plugin to TypeScript. ([#11715](https://github.com/expo/expo/pull/11715) by [@EvanBacon](https://github.com/EvanBacon))
- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))

## 10.0.0 — 2021-01-15

### ⚠️ Notices

- The package is now shipped with prebuilt binaries on iOS. You can read more about it on [expo.fyi/prebuilt-modules](https://expo.fyi/prebuilt-modules). ([#11224](https://github.com/expo/expo/pull/11224) by [@tsapeta](https://github.com/tsapeta))

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugins ([#11538](https://github.com/expo/expo/pull/11538) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Removed `fbjs` dependency ([#11396](https://github.com/expo/expo/pull/11396) by [@cruzach](https://github.com/cruzach))

## 9.1.1 — 2020-12-14

_This version does not introduce any user-facing changes._

## 9.1.0 — 2020-11-17

### 🎉 New features

- Added support for video poster to show while the camera is loading on web. ([#9930](https://github.com/expo/expo/pull/9930) by [@liorJuice](https://github.com/liorJuice))

## 9.0.0 — 2020-08-18

### 🛠 Breaking changes

- Fix bug where `barCodeTypes` needed to be defined on web. ([#9630](https://github.com/expo/expo/pull/9630) by [@EvanBacon](https://github.com/EvanBacon))
- Fix bug where camera would sometimes not start on web desktop. ([#9630](https://github.com/expo/expo/pull/9630) by [@EvanBacon](https://github.com/EvanBacon))
- Deleted `CaptureOptions` in favor of `CameraPictureOptions` ([#9558](https://github.com/expo/expo/pull/9558) by [@EvanBacon](https://github.com/EvanBacon))
- Added camera permissions declarations to `AndroidManifest.xml` on Android. ([#9224](https://github.com/expo/expo/pull/9224) by [@bycedric](https://github.com/bycedric))

### 🎉 New features

- Added support for QR scanning on web. ([#4166](https://github.com/expo/expo/pull/4166) by [@EvanBacon](https://github.com/EvanBacon))
- Remove `fbjs` dependency
- Delete `prop-types` in favor of TypeScript. ([#8680](https://github.com/expo/expo/pull/8680) by [@EvanBacon](https://github.com/EvanBacon))
- [camera] Directly import `createElement` from `react-native-web` for RNW v12 support. ([#8773](https://github.com/expo/expo/pull/8773) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Fix QR scanning on Android and iOS. ([#9741](https://github.com/expo/expo/pull/9741) by [@EvanBacon](https://github.com/EvanBacon))
- [web] Fix bug where swapping cameras caused screen to flicker ([#9558](https://github.com/expo/expo/pull/9558) by [@EvanBacon](https://github.com/EvanBacon))
- [web] Fix bug where swapping cameras doesn't persist camera settings ([#9558](https://github.com/expo/expo/pull/9558) by [@EvanBacon](https://github.com/EvanBacon))

## 8.3.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.3.0 — 2020-05-27

### 🛠 Breaking changes

- The base64 output will no longer contain newline and special character (`\n`, `\r`) on Android. ([#7841](https://github.com/expo/expo/pull/7841) by [@jarvisluong](https://github.com/jarvisluong))

### 🎉 New features

- Added exports for TypeScript definitions: CameraType, ImageType, ImageParameters, ImageSize, CaptureOptions, CapturedPicture ([#8457](https://github.com/expo/expo/pull/8457) by [@jarvisluong](https://github.com/jarvisluong))
