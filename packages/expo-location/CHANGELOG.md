# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- Use stable manifest ID where applicable. ([#12964](https://github.com/expo/expo/pull/12964) by [@wschurman](https://github.com/wschurman))
- Added steetNumber to `reverseGeocodeAsync` for iOS ([#13556](https://github.com/expo/expo/pull/13556) by [@chrisdrackett](https://github.com/chrisdrackett))

### 🐛 Bug fixes

### 💡 Others

## 12.1.0 — 2021-06-16

### 🐛 Bug fixes

- Fixed `startLocationUpdatesAsync` requiring the background location permission even if was used when the app is in the foreground on iOS. ([#12594](https://github.com/expo/expo/pull/12594) by [@lukmccall](https://github.com/lukmccall))
- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

### 💡 Others

- Migrated from `unimodules-permissions-interface` to `expo-modules-core`. ([#12961](https://github.com/expo/expo/pull/12961) by [@tsapeta](https://github.com/tsapeta))

## 12.0.4 — 2021-04-13

_This version does not introduce any user-facing changes._

## 12.0.3 — 2021-04-09

### 🐛 Bug fixes

- Add support for user-initiated background tracking without background permission ([#12456](https://github.com/expo/expo/pull/12456) by [@bycedric](https://github.com/bycedric))

## 12.0.2 — 2021-03-29

### 🐛 Bug fixes

- Lock the unimodules-permissions-interface dependency to the same version in react-native-unimodules

## 12.0.1 — 2021-03-26

### 🐛 Bug fixes

- Add missing unimodules-permissions-interface dependency

## 12.0.0 — 2021-03-10

### 🛠 Breaking changes

- Splitting location permissions into `Foreground` and `Background` permissions. ([#12063](https://github.com/expo/expo/pull/12063) by [@lukmccall](https://github.com/lukmccall))

### 🎉 New features

- Converted plugin to TypeScript. ([#11715](https://github.com/expo/expo/pull/11715) by [@EvanBacon](https://github.com/EvanBacon))
- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Remove sticky notification on service stop on Android. ([#11775](https://github.com/expo/expo/pull/11775) by [@zaguiini](https://github.com/zaguiini))
- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))

## 11.0.0 — 2021-01-15

### ⚠️ Notices

- The package is now shipped with prebuilt binaries on iOS. You can read more about it on [expo.fyi/prebuilt-modules](https://expo.fyi/prebuilt-modules). ([#11224](https://github.com/expo/expo/pull/11224) by [@tsapeta](https://github.com/tsapeta))

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugins ([#11538](https://github.com/expo/expo/pull/11538) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Fixed background location permission check on Android. ([#11399](https://github.com/expo/expo/pull/11399) by [@peterdn](https://github.com/peterdn))

## 10.0.0 — 2020-11-17

### 🛠 Breaking changes

- Make background location an opt-in permission on Android. ([#10989](https://github.com/expo/expo/pull/10989) by [@bycedric](https://github.com/bycedric))

## 9.0.1 — 2020-10-02

### 🐛 Bug fixes

- Redeliver intent when restarting task service. ([#10410](https://github.com/expo/expo/pull/10410) by [@byCedric](https://github.com/byCedric))

## 9.0.0 — 2020-08-18

### 🛠 Breaking changes

- Add `scope` field in returned value to indicate whether background permissions are granted. Add `android.accuracy` field to determine whether `coarse` or `fine` location permission is granted. ([#9446](https://github.com/expo/expo/pull/9446) by [@mczernek](https://github.com/mczernek))
- `getLastKnownPositionAsync` no longer rejects when the last known location is not available – now it returns `null`. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Removed the deprecated `enableHighAccuracy` option of `getCurrentPositionAsync`. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Removed `maximumAge` and `timeout` options from `getCurrentPositionAsync` – it's been Android only and the same behavior can be achieved on all platforms on the JavaScript side. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Made type and enum names more consistent and in line with our standards — they all are now prefixed by `Location`. The most common ones are still accessible without the prefix, but it's not the recommended way. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- `geocodeAsync` and `reverseGeocodeAsync` no longer falls back to Google Maps API on Android. ([#9444](https://github.com/expo/expo/pull/9444) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Added missing `altitudeAccuracy` to the location object on Android (requires at least Android 8.0). ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Improved support for Web — added missing methods for requesting permissions and getting last known position. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Added `maxAge` and `requiredAccuracy` options to `getLastKnownPositionAsync`. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Google Maps Geocoding API can now be used on all platforms with the new `useGoogleMaps` option. ([#9444](https://github.com/expo/expo/pull/9444) by [@tsapeta](https://github.com/tsapeta))
- Added `district`, `subregion` and `timezone` values to reverse-geocoded address object. ([#9444](https://github.com/expo/expo/pull/9444) by [@tsapeta](https://github.com/tsapeta))

### 🐛 Bug fixes

- Fixed different types being used on Web platform. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- `getLastKnownPositionAsync` no longer requests for the current location on iOS and just returns the last known one as it should be. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Fixed `getCurrentPositionAsync` not resolving on Android when the lowest accuracy is used. ([#9251](https://github.com/expo/expo/pull/9251) by [@tsapeta](https://github.com/tsapeta))
- Fixed `LocationGeocodedAddress` type to reflect the possibility of receiving `null` values. ([#9444](https://github.com/expo/expo/pull/9444) by [@tsapeta](https://github.com/tsapeta))

## 8.3.0 — 2020-07-16

### 🐛 Bug fixes

- Added some safety checks to prevent `NullPointerExceptions` in background location on Android. ([#8864](https://github.com/expo/expo/pull/8864) by [@mczernek](https://github.com/mczernek))
- Add `isoCountryCode` to `Address` type and reverse lookup. ([#8913](https://github.com/expo/expo/pull/8913) by [@bycedric](https://github.com/bycedric))
- Fix geocoding requests not resolving/rejecting on iOS when the app is in the background or inactive state. It makes it possible to use geocoding in such app states, however it's still discouraged. ([#9178](https://github.com/expo/expo/pull/9178) by [@tsapeta](https://github.com/tsapeta))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

_This version does not introduce any user-facing changes._
