# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- [plugin] Added ability to disable permissions in plugin. ([#12627](https://github.com/expo/expo/pull/12627) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

## 9.1.2 — 2021-04-13

_This version does not introduce any user-facing changes._

## 9.1.1 — 2021-03-31

_This version does not introduce any user-facing changes._

## 9.1.0 — 2021-03-10

### 🎉 New features

- Converted plugin to TypeScript. ([#11715](https://github.com/expo/expo/pull/11715) by [@EvanBacon](https://github.com/EvanBacon))
- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))

## 9.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugins ([#11538](https://github.com/expo/expo/pull/11538) by [@EvanBacon](https://github.com/EvanBacon))

## 8.4.0 — 2020-11-17

### 🐛 Bug fixes

- Removed use of `org.unimodules.core.InvalidArgumentException` in favor of its coded version, `org.unimodules.core.errors.InvalidArgumentException`. ([#9961](https://github.com/expo/expo/pull/9961) by [@sjchmiela](https://github.com/sjchmiela))

## 8.3.0 — 2020-08-18

### 🎉 New features

- Add permissions for web. ([#9671](https://github.com/expo/expo/pull/9671) by [@EvanBacon](https://github.com/EvanBacon))
- Create `isAvailableAsync` method. ([#9668](https://github.com/expo/expo/pull/9668) by [@EvanBacon](https://github.com/EvanBacon))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

### 🐛 Bug fixes

- Fixed `Brightness.requestPermissionsAsync` throwing `permission cannot be null or empty` error on Android. ([#7276](https://github.com/expo/expo/pull/7276) by [@lukmccall](https://github.com/lukmccall))
