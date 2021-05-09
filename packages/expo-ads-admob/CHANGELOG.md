# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- [plugin] Added ability to disable permissions in plugin. ([#12627](https://github.com/expo/expo/pull/12627) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Updated `BannerView` on Android to not create a new ad request on every layout change. ([#12599](https://github.com/expo/expo/pull/12599) by [@cruzach](https://github.com/cruzach))
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

## 10.0.0 — 2021-03-10

### 📚 native library updates

- Updated `Google-Mobile-Ads-SDK` from `7.55.1` to `7.69.0` on iOS and `com.google.android.gms:play-services-ads` from `17.2.1` to `19.4.0` on Android. ([#12125](https://github.com/expo/expo/pull/12125) by [@bbarthec](https://github.com/bbarthec))

### 🛠 Breaking changes

- Removed the `rewardedVideoWillLeaveApplication` event (use AppState instead). ([#12125](https://github.com/expo/expo/pull/12125) by [@bbarthec](https://github.com/bbarthec))
- Removed following events: `rewardedVideoDidRewardUser`, `rewardedVideoDidOpen`, `rewardedVideoDidComplete`, `rewardedVideoDidClose`, `rewardedVideoDidStart` and introduced: `rewardedVideoUserDidEarnReward`, `rewardedVideoDidPresent`, `rewardedVideoDidFailToPresent`, `rewardedVideoDidDismiss`. ([#12125](https://github.com/expo/expo/pull/12125) by [@bbarthec](https://github.com/bbarthec))

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))
- Added the app tracking permission. ([#12123](https://github.com/expo/expo/pull/12123) by [@lukmccall](https://github.com/lukmccall))

## 9.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugin. ([#11636](https://github.com/expo/expo/pull/11636) by [@EvanBacon](https://github.com/EvanBacon))

## 8.4.0 — 2020-11-17

_This version does not introduce any user-facing changes._

## 8.3.0 — 2020-08-18

### 🎉 New features

- Added `isAvailableAsync`. ([#9690](https://github.com/expo/expo/pull/9690) by [@EvanBacon](https://github.com/EvanBacon))
- Delete `prop-types` in favor of TypeScript. ([#8677](https://github.com/expo/expo/pull/8677) by [@EvanBacon](https://github.com/EvanBacon))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

_This version does not introduce any user-facing changes._
