# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

- Install the Segment-Firebase integration via `aar` package to avoid potential build-time crashes. ([#10972](https://github.com/expo/expo/pull/10972) by [@cruzach](https://github.com/cruzach/))

### 💡 Others

## 10.2.0 — 2021-06-16

### 🐛 Bug fixes

- Enable kotlin in all modules. ([#12716](https://github.com/expo/expo/pull/12716) by [@wschurman](https://github.com/wschurman))
- Update Android segment package from `v4.8.2` to `v4.9.2` . ([#13263](https://github.com/expo/expo/pull/13263) by [@ajsmth](https://github.com/ajsmth))

### 💡 Others

- Converted Android code to Kotlin. ([#13562](https://github.com/expo/expo/pull/13562) by [@kkafar](https://github.com/kkafar))
- Migrated constants interface from `unimodules-constants-interface` to `expo-modules-core`. ([#12876](https://github.com/expo/expo/pull/12876) by [@tsapeta](https://github.com/tsapeta))
- Build Android code using Java 8 to fix Android instrumented test build error. ([#12939](https://github.com/expo/expo/pull/12939) by [@kudo](https://github.com/kudo))
- Replace various arguments generic object types with `Record`s. ([#13207](https://github.com/expo/expo/pull/13207) by [@Simek](https://github.com/Simek))

## 10.1.1 — 2021-03-30

_This version does not introduce any user-facing changes._

## 10.1.0 — 2021-03-10

### 🎉 New features

- Updated Android build configuration to target Android 11 (added support for Android SDK 30). ([#11647](https://github.com/expo/expo/pull/11647) by [@bbarthec](https://github.com/bbarthec))

### 🐛 Bug fixes

- Remove peerDependencies and unimodulePeerDependencies from Expo modules. ([#11980](https://github.com/expo/expo/pull/11980) by [@brentvatne](https://github.com/brentvatne))

## 10.0.0 — 2021-01-15

### 🛠 Breaking changes

- Dropped support for iOS 10.0 ([#11344](https://github.com/expo/expo/pull/11344) by [@tsapeta](https://github.com/tsapeta))

## 9.1.0 — 2020-11-17

_This version does not introduce any user-facing changes._

## 9.0.0 — 2020-08-18

### 🛠 Breaking changes

- Upgraded Segment Analytics iOS to 4.0.4. **This removes the IDFA code that was previously included with the Segment library.** If you would like to collect the IDFA, you must be in the bare workflow or use SDK < 39. ([#9606](https://github.com/expo/expo/pull/9606) by [@cruzach](https://github.com/cruzach/)).
- The `options` argument for `Segment.alias` now accepts context configuration as well as integration configuration. Previously, this expected just the `integrations` configuration. ([#9606](https://github.com/expo/expo/pull/9606) by [@cruzach](https://github.com/cruzach/)). The expected format now is:

```js
{
    integrations: {
        [integrationName]: {
            enabled: boolean,
            options: {[key: string]: any}
        }
    },
    context: {
        [key: string]: any
    }
}
```### 🎉 New features

- You can now pass in custom options to `identifyWithTraits`, `groupWithTraits`, `alias`, `trackWithProperties`, and `screenWithProperties`. This allows you to set [these common fields](https://segment.com/docs/connections/spec/common/). ([#9606](https://github.com/expo/expo/pull/9606) by [@cruzach](https://github.com/cruzach/)).

## 8.2.1 — 2020-05-29

_This version does not introduce any user-facing changes._

## 8.2.0 — 2020-05-27

_This version does not introduce any user-facing changes._
```
