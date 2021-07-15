# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

### 💡 Others

## 0.6.4 — 2021-07-08

### 🐛 Bug fixes

- Fixed Android release builds. ([#13544](https://github.com/expo/expo/pull/13544) by [@esamelson](https://github.com/esamelson))
- Fixed web compatibility. ([#13535](https://github.com/expo/expo/pull/13535) by [@lukmccall](https://github.com/lukmccall))

## 0.6.3 — 2021-06-30

### 🐛 Bug fixes

- [plugin] Fixed error handlers weren't initialize after running `expo run:ios`. ([#13438](https://github.com/expo/expo/pull/13438) by [@lukmccall](https://github.com/lukmccall))
- Order dev menu items consistently across platforms. ([#13449](https://github.com/expo/expo/pull/13449) by [@lukmccall](https://github.com/lukmccall))
- Fixed error message when trying to load a production app without expo-updates. ([#13458](https://github.com/expo/expo/pull/13458) by [@esamelson](https://github.com/esamelson))

## 0.6.2 — 2021-06-28

### 🐛 Bug fixes

- Fixed can't reload app from the blue screen. ([#13422](https://github.com/expo/expo/pull/13422) by [@lukmccall](https://github.com/lukmccall))
- Fixed `JSPackagerClient` wasn't close on React Native 0.63.4 what may lead to various bugs on Android. ([#13423](https://github.com/expo/expo/pull/13423) by [@lukmccall](https://github.com/lukmccall))
- Fixed the blue screen was shown instead of the LogBox on iOS. ([#13421](https://github.com/expo/expo/pull/13421) by [@lukmccall](https://github.com/lukmccall))

## 0.6.1 — 2021-06-24

### 🛠 Breaking changes

- Reset Updates module state on each dev client load. ([#13346](https://github.com/expo/expo/pull/13346) by [@esamelson](https://github.com/esamelson))
- Ensure error handler is initialized. ([#13384](https://github.com/expo/expo/pull/13384) by [@lukmccall](https://github.com/lukmccall))

### 🎉 New features

- Added expo-updates integration to config plugin. ([#13198](https://github.com/expo/expo/pull/13198) by [@esamelson](https://github.com/esamelson))

### 🐛 Bug fixes

- Fixed switching from published to local bundle loading on Android. ([#13363](https://github.com/expo/expo/pull/13363) by [@esamelson](https://github.com/esamelson))
- [plugin] Use Node module resolution to find package paths for Podfile ([#13382](https://github.com/expo/expo/pull/13382) by [@fson](https://github.com/fson))
- Send expo-updates-environment: DEVELOPMENT header in manifest requests. ([#13375](https://github.com/expo/expo/pull/13375) by [@esamelson](https://github.com/esamelson))

## 0.5.1 — 2021-06-16

_This version does not introduce any user-facing changes._

## 0.5.0 — 2021-06-10

### 🛠 Breaking changes

- Renamed the iOS protocol in expo-updates-interface to EXUpdatesExternalInterface. ([#13214](https://github.com/expo/expo/pull/13214) by [@esamelson](https://github.com/esamelson))

## 0.4.0 — 2021-06-08

### 🎉 New features

- Added ability to load published projects via expo-updates. (Android: [#13031](https://github.com/expo/expo/pull/13031) and iOS: [#13087](https://github.com/expo/expo/pull/13087) by [@esamelson](https://github.com/esamelson))
- Support remote JavaScript inspecting. ([#13041](https://github.com/expo/expo/pull/13041) by [@kudo](https://github.com/kudo))
- Updated the footer style on the main screen. ([#13000](https://github.com/expo/expo/pull/13000) by [@lukmccall](https://github.com/lukmccall))

### 🐛 Bug fixes

- Updates integration: make Update nullable in onSuccess callback ([#13136](https://github.com/expo/expo/pull/13136) by [@esamelson](https://github.com/esamelson))
- Reduced app crashes when the user is spamming deep links on Android. ([#13020](https://github.com/expo/expo/pull/13020) by [@lukmccall](https://github.com/lukmccall))
- Shown the error screen on deep link failure on iOS. ([#13002](https://github.com/expo/expo/pull/13002) by [@lukmccall](https://github.com/lukmccall))

## 0.3.4 — 2021-05-20

### 🐛 Bug fixes

- Fixed the application hanging on the splash screen on iOS. ([#12971](https://github.com/expo/expo/pull/12971) by [@lukmccall](https://github.com/lukmccall))

## 0.3.3 — 2021-05-13

### 🐛 Bug fixes

- Fix flash of dev launcher screen during launch and incorrect dev menu shown on the 1st launch. ([#12765](https://github.com/expo/expo/pull/12765) by [@fson](https://github.com/fson))

## 0.3.2 — 2021-05-12

### 🎉 New features

- [plugin] Prevent plugin from running multiple times in a single process. ([#12715](https://github.com/expo/expo/pull/12715) by [@EvanBacon](https://github.com/EvanBacon))
- [plugin] Added AppDelegate tests. ([#12651](https://github.com/expo/expo/pull/12651) by [@EvanBacon](https://github.com/EvanBacon))
- Added the ability to open managed apps inside the dev-launcher. ([#12698](https://github.com/expo/expo/pull/12698) by [@lukmccall](https://github.com/lukmccall))
- Included `expo-dev-launcher` in `expo-dev-client` package, an easier way to install it. ([#12765](https://github.com/expo/expo/pull/12765) by [@fson](https://github.com/fson))
- Added better URL validation. ([#12799](https://github.com/expo/expo/pull/12799) by [@lukmccall](https://github.com/lukmccall))
- Added better error handling. ([#12848](https://github.com/expo/expo/pull/12848) and [#12800](https://github.com/expo/expo/pull/12800) by [@lukmccall](https://github.com/lukmccall))

### 🐛 Bug fixes

- Fixed not finding the `Expo Go` on Android 11+ when the user tries to scan the QR code. ([#12328](https://github.com/expo/expo/pull/12328) by [@lukmccall](https://github.com/lukmccall))
- Account for rubocop formatting in plugin. ([#12480](https://github.com/expo/expo/pull/12480) by [@EvanBacon](https://github.com/EvanBacon))
- Fix bundled images. ([#12668](https://github.com/expo/expo/pull/12668) by [@fson](https://github.com/fson))
- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))
- [plugin] Fix config plugin not including `expo-dev-launcher` in `Podfile`. ([#12828](https://github.com/expo/expo/pull/12828) by [@fson](https://github.com/fson))
- Fix incorrect color of safe area view on iOS. ([#12851](https://github.com/expo/expo/pull/12851) by [@lukmccall](https://github.com/lukmccall))
- Fixed application crashing with the `VerifyError` exception on Android. ([#12855](https://github.com/expo/expo/pull/12855) by [@lukmccall](https://github.com/lukmccall))
- Fixed XCode warnings. ([#12798](https://github.com/expo/expo/pull/12798) by [@lukmccall](https://github.com/lukmccall))

## 0.3.1 — 2021-04-09

### 🐛 Bug fixes

- Fix misspellings in READMEs. ([#12346](https://github.com/expo/expo/pull/12346) by [@wschurman](https://github.com/wschurman))

## 0.3.0 — 2021-03-24

### 🎉 New features

- Rewrote UI and added a dark theme support. ([#12236](https://github.com/expo/expo/pull/12236) by [@lukmccall](https://github.com/lukmccall))
- Fetched the development session if the user is logged into his Expo account. ([#12236](https://github.com/expo/expo/pull/12236) by [@lukmccall](https://github.com/lukmccall))
