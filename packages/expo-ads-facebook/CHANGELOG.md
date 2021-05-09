# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- [plugin] Added ability to disable permissions in plugin. ([#12627](https://github.com/expo/expo/pull/12627) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

## 10.0.4 — 2021-04-13

_This version does not introduce any user-facing changes._

## 10.0.3 — 2021-03-31

_This version does not introduce any user-facing changes._

## 10.0.2 — 2021-03-30

### 🎉 New features

- Updated user tracking permission message. ([#12322](https://github.com/expo/expo/pull/12322) by [@EvanBacon](https://github.com/EvanBacon))

## 10.0.1 — 2021-03-23

### 🎉 New features

- Added SKAdNetwork identifiers to iOS plugin. ([#12243](https://github.com/expo/expo/pull/12243) by [@EvanBacon](https://github.com/EvanBacon))
- Added user tracking permission to iOS plugin. ([#12219](https://github.com/expo/expo/pull/12219) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Stop passing through `iconSize` and `orientation` to `AdOptionsView` on iOS, where it is not supported. ([#12200](https://github.com/expo/expo/pull/12200) by [@brentvatne](https://github.com/brentvatne))

## 10.0.0 — 2021-03-10

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))
- Added the app tracking permission. ([#12123](https://github.com/expo/expo/pull/12123) by [@lukmccall](https://github.com/lukmccall))
- Update FBAudienceNetwork to 6.3.0. ([#12133](https://github.com/expo/expo/pull/12133) by [@tsapeta](https://github.com/tsapeta))

## 9.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

## 8.4.1 — 2020-10-05

_This version does not introduce any user-facing changes._

## 8.5.0 — 2020-09-30

### 🐛 Bug fixes

- Upgraded the underlying Android SDK to 5.11.0 (was 5.1.1, which has been deprecated and would result in an error). No user-facing changes involved. ([#10430](https://github.com/expo/expo/pull/10430) by [@cruzach](https://github.com/cruzach))
- Upgraded the underlying iOS SDK to 5.9.0. No user-facing changes involved. ([#10430](https://github.com/expo/expo/pull/10430) by [@cruzach](https://github.com/cruzach))
- Removed extra padding above banner ads on iOS. ([#10433](https://github.com/expo/expo/pull/10433) by [@cruzach](https://github.com/cruzach))

## 8.4.0 — 2020-08-18

_This version does not introduce any user-facing changes._

## 8.3.0 — 2020-06-24

### 🎉 New features

- Add `onError` property to components created with `withNativeAd` that lets you get notified of errors that might occur when the native SDK tries to fetch ads. ([#8662](https://github.com/expo/expo/pull/8662) by [@sjchmiela](https://github.com/sjchmiela))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

_This version does not introduce any user-facing changes._
