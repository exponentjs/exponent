# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- Added `isAvailableAsync` method. ([#10171](https://github.com/expo/expo/pull/10171) by [@akinncar](https://github.com/akinncar))

### 🐛 Bug fixes

## 10.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugins ([#11538](https://github.com/expo/expo/pull/11538) by [@EvanBacon](https://github.com/EvanBacon))

## 9.5.0 — 2020-11-17

### 🐛 Bug fixes

- Guard against crash on Android when `FragmentActivity` is null creating the Biometric Prompt. ([#10679](https://github.com/expo/expo/pull/10679) by [@vascofg](https://github.com/vascofg))
- Guard against Null Pointer Exception on Android when calling `authenticate` on the Biometric Prompt after resuming the app on some devices. ([#10965](https://github.com/expo/expo/pull/10965) by [@vascofg](https://github.com/vascofg))

## 9.4.0 — 2020-10-12

### 🐛 Bug fixes

- Fixed `cancelAuthenticate` not working in Android as expected. ([#10482](https://github.com/expo/expo/pull/10482) by [@huisf](https://github.com/HuiSF))

## 9.3.0 — 2020-08-18

_This version does not introduce any user-facing changes._

## 9.2.0 — 2020-07-02

### 🐛 Bug fixes

- Fix crash when `NSFaceIDUsageDescription` is not provided and device fallback is disabled. ([#8595](https://github.com/expo/expo/pull/8595) by [@tsapeta](https://github.com/tsapeta))
- Added missing biometric permission to Android. ([#8692](https://github.com/expo/expo/pull/8692) by [@byCedric](https://github.com/byCedric))
- Use hardcoded system feature strings to support Android SDK 28. ([#9034](https://github.com/expo/expo/pull/9034) by [@bycedric](https://github.com/bycedric))

## 9.1.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 9.1.0 — 2020-05-27

### 🎉 New features

- Added support for `promptMessage`, `cancelLabel` and `disableDeviceFallback` on Android. ([#8219](https://github.com/expo/expo/pull/8219) by [@diegolmello](https://github.com/diegolmello))
- Added iris local authentication type for Android. ([#8431](https://github.com/expo/expo/pull/8364) by [@bycedric](https://github.com/bycedric))

### 🐛 Bug fixes

- Added estimate of supported authentication types for Android. ([#8431](https://github.com/expo/expo/pull/8431) by [@bycedric](https://github.com/bycedric))
