# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

- Fix bug causing synchronous calls to break React Native Debugger. ([#13616](https://github.com/expo/expo/pull/13616) by [@stdavis](https://github.com/stdavis))

### 💡 Others

## 11.2.0 — 2021-06-16

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

### 💡 Others

- Build Android code using Java 8 to fix Android instrumented test build error. ([#12939](https://github.com/expo/expo/pull/12939) by [@kudo](https://github.com/kudo))

## 11.1.2 — 2021-04-13

_This version does not introduce any user-facing changes._

## 11.1.1 — 2021-04-09

_This version does not introduce any user-facing changes._

## 11.1.0 — 2021-03-10

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

## 11.0.0 — 2021-01-15

### 🛠 Breaking changes

- Remove side-effect, binding the manifest environment variables to the app's `process.env` ([#11559](https://github.com/expo/expo/pull/11559) by [@EvanBacon](https://github.com/EvanBacon))
- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🐛 Bug fixes

- Export JSON from `react-native.config` ([#11456](https://github.com/expo/expo/pull/11456) by [@EvanBacon](https://github.com/EvanBacon))

## 10.0.0 — 2020-11-17

### 🛠 Breaking changes

- On iOS enabled `use_frameworks!` usage by replacing `React` dependency with `React-Core`. ([#11057](https://github.com/expo/expo/pull/11057) by [@bbarthec](https://github.com/bbarthec))

## 9.0.1 — 2020-10-28

### 🐛 Bug fixes

- Clarify that react-native-unimodules is a dependency in README
- Add a placeholder .xcodeproj file so that React Native CLI autolinking will detect the EXRandom podspec

## 9.0.0 — 2020-09-15

_This version does not introduce any user-facing changes._

## 8.3.0 — 2020-08-18

### 🎉 New features

- Add a synchronous version of `getRandomBytesAsync` called `getRandomBytes`. ([#9750](https://github.com/expo/expo/pull/9750) by [@brentvatne](https://github.com/brentvatne))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

_This version does not introduce any user-facing changes._
