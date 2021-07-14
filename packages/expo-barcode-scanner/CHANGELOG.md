# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

### 💡 Others

## 10.2.0 — 2021-06-16

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))
- On iOS removed the requirement for the presence of `NSMicrophoneUsageDescription` key in `Info.plist` ([#12860](https://github.com/expo/expo/pull/12772) by [@ajsmth](https://github.com/ajsmth))

### 💡 Others

- Migrated interfaces from their own packages to `expo-modules-core`. ([#12912](https://github.com/expo/expo/pull/12912) by [@tsapeta](https://github.com/tsapeta))

## 10.1.2 — 2021-04-13

_This version does not introduce any user-facing changes._

## 10.1.1 — 2021-03-31

_This version does not introduce any user-facing changes._

## 10.1.0 — 2021-03-10

### 🎉 New features

- Remove lodash. ([#11900](https://github.com/expo/expo/pull/11900) by [@EvanBacon](https://github.com/EvanBacon))
- Converted plugin to TypeScript. ([#11715](https://github.com/expo/expo/pull/11715) by [@EvanBacon](https://github.com/EvanBacon))
- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))
- Added support for string literal as bar code types input in iOS ([#11796](https://github.com/expo/expo/pull/11796) by [@jarvisluong](https://github.com/jarvisluong))

### 🐛 Bug fixes

- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))

## 10.0.0 — 2021-01-15

### ⚠️ Notices

- The package is now shipped with prebuilt binaries on iOS. You can read more about it on [expo.fyi/prebuilt-modules](https://expo.fyi/prebuilt-modules). ([#11224](https://github.com/expo/expo/pull/11224) by [@tsapeta](https://github.com/tsapeta))

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugins ([#11538](https://github.com/expo/expo/pull/11538) by [@EvanBacon](https://github.com/EvanBacon))

## 9.1.0 — 2020-11-17

### 🐛 Bug fixes

- Allow `onBarCodeScanned` prop to be `undefined`. ([#10068](https://github.com/expo/expo/pull/10068) by [@josmithua](https://github.com/josmithua))

## 9.0.0 — 2020-08-18

### 🛠 Breaking changes

- Added camera permissions declarations to `AndroidManifest.xml` on Android. ([#9227](https://github.com/expo/expo/pull/9227) by [@bycedric](https://github.com/bycedric))

### 🎉 New features

- Added constants on web. ([#4166](https://github.com/expo/expo/pull/4166) by [@EvanBacon](https://github.com/EvanBacon))
- Delete `prop-types` in favor of TypeScript. ([#8678](https://github.com/expo/expo/pull/8678) by [@EvanBacon](https://github.com/EvanBacon))
- `BarCodeScanner` is now returning barcode's bounding box on iOS. ([#8865](https://github.com/expo/expo/pull/8865) by [@lukmccall](https://github.com/lukmccall))

### 🐛 Bug fixes

- Fixed scanner throwing `NullPointerException` when barcode type isn't recognized on Android. ([#9006](https://github.com/expo/expo/pull/9006) by [@lukmccall](https://github.com/lukmccall))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

_This version does not introduce any user-facing changes._
