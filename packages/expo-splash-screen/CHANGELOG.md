# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

- Allows you to configure if you want the Splash Screen yet to be shown to automatically hide, so you don't need to call prevent and risk doing it too late after it already hid

### 🐛 Bug fixes

### 💡 Others

## 0.11.0 — 2021-06-16

### 🎉 New features

- [plugin] Re-export unversioned expo-cli plugin as a versioned plugin. ([#13241](https://github.com/expo/expo/pull/13241) by [@EvanBacon](https://github.com/EvanBacon))
- Bump `@expo/configure-splash-screen@0.4.0`. ([#12940](https://github.com/expo/expo/pull/12940) by [@EvanBacon](https://github.com/EvanBacon))

### 🐛 Bug fixes

- [plugin] Match status bar color on android. ([#13227](https://github.com/expo/expo/pull/13227) by [@EvanBacon](https://github.com/EvanBacon))
- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))

### 💡 Others

- Build Android code using Java 8 to fix Android instrumented test build error. ([#12939](https://github.com/expo/expo/pull/12939) by [@kudo](https://github.com/kudo))

## 0.10.2 — 2021-04-13

_This version does not introduce any user-facing changes._

## 0.10.1 — 2021-04-09

_This version does not introduce any user-facing changes._

## 0.10.0 — 2021-03-10

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))
- Bump `@expo/configure-splash-screen`. ([#11831](https://github.com/expo/expo/pull/11831) by [@EvanBacon](https://github.com/EvanBacon))

## 0.9.0 — 2021-01-15

### ⚠️ Notices

- The package is now shipped with prebuilt binaries on iOS. You can read more about it on [expo.fyi/prebuilt-modules](https://expo.fyi/prebuilt-modules). ([#11224](https://github.com/expo/expo/pull/11224) by [@tsapeta](https://github.com/tsapeta))

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

## 0.8.1 — 2020-11-26

_This version does not introduce any user-facing changes._

## 0.8.0 — 2020-11-17

### 🛠 Breaking changes

- On iOS enabled `use_frameworks!` usage by replacing `React` dependency with `React-Core`. ([#11057](https://github.com/expo/expo/pull/11057) by [@bbarthec](https://github.com/bbarthec))
- Upgrade `androidx.appcompat` to `1.2.0`. ([#11018](https://github.com/expo/expo/pull/11018) by [@bbarthec](https://github.com/bbarthec))

## 0.7.1 — 2020-09-28

## 0.7.0 — 2020-09-21

## 0.6.2 - 2020-09-28

### 🛠 Breaking changes

- On Android fixed `SplashScreen` methods not working in managed workflow. Scoped the `SplashScreen` native object to the separate `singletons` sub-package to work with versioned code. ([#10294](https://github.com/expo/expo/pull/10294) by [@bbarthec](https://github.com/bbarthec))
- Updated `@expo/configure-splash-screen` to `v0.2.0`.
  - This version fixes the problem with the wrong `SplashScreen.show` method signature on Android. It properly adds the `ReactRootView` parameter now.
  - Additionally it properly imports the `SplashScreen` object from the `singletons` sub-packagae on Android.
- `yarn run expo-splash-screen` changed its parameters layout. Run `yarn run expo-splash-screen --help` to see the new options layout. Every parameter has to provided via the `--[option name]` syntax now.

## 0.6.1 - 2020-09-17

### 🐛 Bug fixes

- On iOS fixed non-working `SplashScreen.preventAutoHide` introduced in version `0.4.0`. ([#10192](https://github.com/expo/expo/pull/10192) by [@bbarthec](https://github.com/bbarthec))
- Fixed crash when the app was opened in the background on iOS. ([#10157](https://github.com/expo/expo/pull/10157) by [@sjchmiela](https://github.com/sjchmiela))

## 0.6.0 — 2020-08-18

### 🎉 New features

- On iOS the name of the LaunchScreen file is read from the project configuration and fallbacks to default `SplashScreen` if not found. ([#9622](https://github.com/expo/expo/pull/9622) by [@bbarthec](https://github.com/bbarthec))

## 0.5.0 — 2020-07-30

### 🐛 Bug fixes

- Bump dependency on @expo/configure-splash-screen to transitively bump logkitty version pulled in through @react-native-community/cli-platform-android.
- Fixed crash adding `splashScreenView` to parent when it was already added on Android. ([#9451](https://github.com/expo/expo/pull/9451) by [@RodolfoGS](https://github.com/RodolfoGS))

## 0.4.0 — 2020-07-16

### 🛠 Breaking changes

- `SplashScreen.show()` native method changes it's signature. Its third argument is now a `Boolean` flag that tells the system whether the `StatusBar` component should be `translucent`. Pass `false` to preserve the previous default behavior. ([#8535](https://github.com/expo/expo/pull/8535) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Fixed flicker in-between SplashScreen and ReactApp phases on iOS. ([#8739](https://github.com/expo/expo/pull/8739) by [@bbarthec](https://github.com/bbarthec))

## 0.3.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 0.3.0 — 2020-05-27

### 🛠 Breaking changes

- `expo-splash-screen-command` is now replaced by `@expo/configure-splash-screen`. Functionality is not affected.

### 🐛 Bug fixes

- add polyfill for usage within managed workflow

## 0.2.0

### 🎉 New features

- expo-splash-screen-command is now bundled with expo-splash-screen and helps you to automatically configure your splash screen in bare React Native apps. Install expo-splash-screen in your project then run `yarn expo-splash-screen --help` for more information.
