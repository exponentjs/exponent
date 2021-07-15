# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

### 💡 Others

- Rewrite BatteryModule from Java to Kotlin. ([#13504](https://github.com/expo/expo/pull/13504) by [@mstach60161](https://github.com/mstach60161))
([#13504](https://github.com/expo/expo/pull/13504) by [@mstach60161](https://github.com/mstach60161))

- Add unit tests. ([#13629](https://github.com/expo/expo/pull/13629) by [@mstach60161](https://github.com/mstach60161))

## 5.0.0 — 2021-06-16

### 🛠 Breaking changes

- Removed following types: `BatteryLevelUpdateListener `, `BatteryStateUpdateListener` and `PowerModeUpdateListener` as they were only wrapping one-argument events responses. Use event types explicitly instead: `BatteryLevelEvent `, `BatteryStateEvent` and `PowerModeEvent`. ([#12592](https://github.com/expo/expo/pull/12592) by [@Simek](https://github.com/simek))

### 🎉 New features

- Added `isBatteryOptimizationEnabledAsync` method to check if the battery optimization is enabled on android. ([#13138](https://github.com/expo/expo/pull/13138) by [@FelipeACP](https://github.com/FelipeACP))

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

### 💡 Others

- Build Android code using Java 8 to fix Android instrumented test build error. ([#12939](https://github.com/expo/expo/pull/12939) by [@kudo](https://github.com/kudo))

## 4.1.0 — 2021-03-10

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))

## 4.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

## 3.1.0 — 2020-11-17

_This version does not introduce any user-facing changes._

## 3.0.0 — 2020-08-18

### 🛠 Breaking changes

- Added support for FULL state on web. ([#8937](https://github.com/expo/expo/pull/8937) by [@EvanBacon](https://github.com/EvanBacon))

### 🎉 New features

- Remove `fbjs` dependency. ([#8822](https://github.com/expo/expo/pull/8822) by [@EvanBacon](https://github.com/EvanBacon))

## 2.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 2.2.0 — 2020-05-27

### 🛠 Breaking changes

- Removed deprecated `isSupported` method. ([#7206](https://github.com/expo/expo/pull/7206) by [@bbarthec](https://github.com/bbarthec))
