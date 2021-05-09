# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- [plugin] Added ability to disable permissions in plugin. ([#12627](https://github.com/expo/expo/pull/12627) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Fixed `base64` return on web. ([#12529](https://github.com/expo/expo/pull/12529) by [@simonezuccala](https://github.com/simonezuccala) and [@misterdev](https://github.com/misterdev))
- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

## 10.1.3 — 2021-04-13

_This version does not introduce any user-facing changes._

## 10.1.2 — 2021-04-09

### 🐛 Bug fixes

- Added SSR guard. ([#12420](https://github.com/expo/expo/pull/12420) by [@EvanBacon](https://github.com/EvanBacon))
- Reverted focus state listener PR. ([#12420](https://github.com/expo/expo/pull/12420) by [@EvanBacon](https://github.com/EvanBacon))

## 10.1.1 — 2021-03-31

_This version does not introduce any user-facing changes._

## 10.1.0 — 2021-03-10

### 🎉 New features

- Converted plugin to TypeScript. ([#11715](https://github.com/expo/expo/pull/11715) by [@EvanBacon](https://github.com/EvanBacon))
- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Fixed `launchCameraAsync()` with `allowsEditing` option crashing for some android users. ([#11825](https://github.com/expo/expo/pull/11825) by [@lukmccall](https://github.com/lukmccall))
- Fixed cancelled picker dialog not resolving with expected result on web. ([#11847](https://github.com/expo/expo/pull/11847) by [@jayprado](https://github.com/jayprado))
- Fixed incorrect file URI on Android. ([#11823](https://github.com/expo/expo/pull/11823) by [@lukmccall](https://github.com/lukmccall))

## 10.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugins ([#11538](https://github.com/expo/expo/pull/11538) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Fixed possible unsafe call in VideoResultTask. ([#11552](https://github.com/expo/expo/pull/11552) by [@Duell10111](https://github.com/Duell10111))

## 9.2.1 — 2020-12-09

### 🐛 Bug fixes

- Fix typo in media library permission methods. ([#11292](https://github.com/expo/expo/pull/11292) by [@bycedric](https://github.com/bycedric))

## 9.2.0 — 2020-11-17

_This version does not introduce any user-facing changes._

## 9.1.1 — 2020-09-23

### 🐛 Bug fixes

- `launchImageLibraryAsync()` should be callable with no options argument ([#10306](https://github.com/expo/expo/pull/10306))

## 9.1.0 — 2020-08-18

### 🎉 New features

- Added a way to handle results when activity was killed by the android. ([#9697](https://github.com/expo/expo/pull/9697) by [@lukmccall](https://github.com/lukmccall))

### 🐛 Bug fixes

- Return array of `ImagePickerResult` when `allowsMultipleSelection` is set to `true` on Web. ([#9402](https://github.com/expo/expo/pull/9402) by [@isthaison](https://github.com/isthaison))
- video recorded on iOS recorded was producing [low resolution](https://github.com/expo/expo/issues/6224) videos, not it's fixed, and can be configured via the `videoQuality` option. ([#9808](https://github.com/expo/expo/pull/9808) by [@vujevits](https://github.com/vujevits))

## 9.0.0 — 2020-08-11

### 🛠 Breaking changes

- Added camera and external storage permissions declarations to `AndroidManifest.xml` on Android. ([#9230](https://github.com/expo/expo/pull/9230) by [@bycedric](https://github.com/bycedric))

### 🎉 New features

- Added support for the limited `CAMERA_ROLL` permission on iOS 14. ([#9423](https://github.com/expo/expo/pull/9423) by [@lukmccall](https://github.com/lukmccall))
- Added `videoMaxDuration` option to `launchCameraAsync()` to configure video recording duration limit. ([#9486](https://github.com/expo/expo/pull/9486) by [@barthap](https://github.com/barthap))

## 8.4.0 — 2020-07-27

### 🐛 Bug fixes

- Fixed downsizing cropped image, when `allowsEditing` was `true`. ([#9316](https://github.com/expo/expo/pull/9316) by [@barthap](https://github.com/barthap))

## 8.3.0 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

### 🛠 Breaking changes

- The base64 output will no longer contain newline and special character (`\n`, `\r`) on Android. ([#7841](https://github.com/expo/expo/pull/7841) by [@jarvisluong](https://github.com/jarvisluong))

### 🐛 Bug fixes

- Skip asking for camera permissions on web with `ImagePicker.getCameraPermissionsAsync`. ([#8475](https://github.com/expo/expo/pull/8475) by [@EvanBacon](https://github.com/EvanBacon))
- Fixed exception when calling `ImagePicker.getCameraPermissionsAsync` on Web. ([#7498](https://github.com/expo/expo/pull/7498) by [@IjzerenHein](https://github.com/IjzerenHein))
