# Changelog

## Unpublished

### 🛠 Breaking changes

- Added `AndroidManifest.xml` queries for intent handling. ([#13388](https://github.com/expo/expo/pull/13388) by [@EvanBacon](https://github.com/EvanBacon))

### 🎉 New features

### 🐛 Bug fixes

- Fixed Android intent XML parsing issues. ([#13401](https://github.com/expo/expo/pull/13401) by [@quicksnap](https://github.com/quicksnap))

### 💡 Others

## 9.2.0 — 2021-06-16

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

### 💡 Others

- Converted Android code to Kotlin ([#13505](https://github.com/expo/expo/pull/13505) by [@kkafar](https://github.com/kkafar))

- Build Android code using Java 8 to fix Android instrumented test build error. ([#12939](https://github.com/expo/expo/pull/12939) by [@kudo](https://github.com/kudo))
- Removed unnecessary dependency on `unimodules-permissions-interface`. ([#12961](https://github.com/expo/expo/pull/12961) by [@tsapeta](https://github.com/tsapeta))
- Export missing types used by the API: `SMSAttachment` and `SMSOptions`. ([#13240](https://github.com/expo/expo/pull/13240) by [@Simek](https://github.com/Simek))

## 9.1.2 — 2021-04-13

_This version does not introduce any user-facing changes._

## 9.1.1 — 2021-03-31

_This version does not introduce any user-facing changes._

## 9.1.0 — 2021-03-10

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

## 9.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

## 8.4.0 — 2020-11-17

_This version does not introduce any user-facing changes._

## 8.3.0 — 2020-08-11

### 🐛 Bug fixes

- Fixed rare crashes on iOS caused by `MFMessageComposeViewController` being initialized not from the main thread. ([#8575](https://github.com/expo/expo/pull/8575) by [@tsapeta](https://github.com/tsapeta))

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

### 🎉 New features

- Add `attachments` as an optional parameter to `sendSMSAsync`. It can be used to provide an attachment along with the recipients and message arguments. ([#7967](https://github.com/expo/expo/pull/7967) by [@thorbenprimke](https://github.com/thorbenprimke))
