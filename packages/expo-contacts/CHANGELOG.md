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

### ⚠️ Notices

- The package is now shipped with prebuilt binaries on iOS. You can read more about it on [expo.fyi/prebuilt-modules](https://expo.fyi/prebuilt-modules). ([#11224](https://github.com/expo/expo/pull/11224) by [@tsapeta](https://github.com/tsapeta))

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

### 🎉 New features

- Created config plugins ([#11538](https://github.com/expo/expo/pull/11538) by [@EvanBacon](https://github.com/EvanBacon))

## 8.6.0 — 2020-09-14

### 🐛 Bug fixes

- `getContactsAsync` no longer requires an exact match when providing the `name` query on Android. ([#10127](https://github.com/expo/expo/pull/10127) by [@cruzach](https://github.com/cruzach))

## 8.5.0 — 2020-08-18

### 🎉 New features

- Add permissions for web. ([#9671](https://github.com/expo/expo/pull/9671) by [@EvanBacon](https://github.com/EvanBacon))

## 8.4.0 — 2020-08-11

### 🎉 New features

- Added `isAvailableAsync()` method for guarding against web usage. ([#9640](https://github.com/expo/expo/pull/9640) by [@EvanBacon](https://github.com/evanbacon))

### 🐛 Bug fixes

- Fixed bug, where sorting contacts by `firstName` or `lastName` could cause crash on Android. ([#9582](https://github.com/expo/expo/pull/9582) by [@barthap](https://github.com/barthap))

## 8.3.0 — 2020-07-27

### 🐛 Bug fixes

- Fixed `getContactById` not resolving promise when contact with provided id doesn't exist on Android. ([#8976](https://github.com/expo/expo/pull/8976) by [@lukmccall](https://github.com/lukmccall))
- Fixed `addContactAsync` returning incorrect id on Android. ([#8980](https://github.com/expo/expo/pull/8980) by [@lukmccall](https://github.com/lukmccall))
- Fixed `updateContactAsync` creating a new contact on Android. ([#9031](https://github.com/expo/expo/pull/9031) by [@lukmccall](https://github.com/lukmccall))
- Fixed `updateContactAsync` not returning a contact id on iOS. ([#9031](https://github.com/expo/expo/pull/9031) by [@lukmccall](https://github.com/lukmccall))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

### 🐛 Bug fixes

- Fix `Contacts.presentFormAsync` pre-filling. ([#7285](https://github.com/expo/expo/pull/7285) by [@abdelilah](https://github.com/abdelilah) & [@lukmccall](https://github.com/lukmccall))
