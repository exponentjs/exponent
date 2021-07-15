# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

### 💡 Others

## 10.2.0 — 2021-06-16

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

### 💡 Others

- Converted Android code to Kotlin ([#13564](https://github.com/expo/expo/pull/13564) by [@kkafar](https://github.com/kkafar))
- Build Android code using Java 8 to fix Android instrumented test build error. ([#12939](https://github.com/expo/expo/pull/12939) by [@kudo](https://github.com/kudo))

## 10.1.0 — 2021-03-10

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

## 10.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

## 9.0.0 — 2020-11-17

### 🛠 Breaking changes

- Renamed all methods to include the 'Async' suffix:
  - `initialize` to `initializeAsync`
  - `setUserId` to `setUserIdAsync`
  - `setUserProperties` to `setUserPropertiesAsync`
  - `clearUserProperties` to `clearUserPropertiesAsync`
  - `logEvent` to `logEventAsync`
  - `logEventWithProperties` to `logEventWithPropertiesAsync`
  - `setGroup` to `setGroupAsync`
  - `setTrackingOptions` to `setTrackingOptionsAsync`
([#9212](https://github.com/expo/expo/pull/9212/) by [@cruzach](https://github.com/cruzach))
- All methods now return a Promise. ([#9212](https://github.com/expo/expo/pull/9212/) by [@cruzach](https://github.com/cruzach))

## 8.3.1 — 2020-08-24

### 🛠 Breaking changes

- Upgraded native Amplitude iOS library from `4.7.1` to `6.0.0`. This removes the IDFA code that was previously included with the Amplitude library. `disableIDFA` option for `Amplitude.setTrackingOptions` is removed. If you would like to collect the IDFA, you must be in the bare workflow. ([#9880](https://github.com/expo/expo/pull/9880) by [@bbarthec](https://github.com/bbarthec))

## 8.3.0 — 2020-08-18

_This version does not introduce any user-facing changes._

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

_This version does not introduce any user-facing changes._
