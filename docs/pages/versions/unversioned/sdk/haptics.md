---
title: Haptics
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-haptics'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import TableOfContentSection from '~/components/plugins/TableOfContentSection';

**`expo-haptics`** provides haptic (touch) feedback for

- iOS 10+ devices using the Taptic Engine
- Android devices using Vibrator system service.

On iOS, _the Taptic engine will do nothing if any of the following conditions are true on a user's device:_

- Low Power Mode is enabled ([Feature Request](https://expo.canny.io/feature-requests/p/expose-low-power-mode-ios-battery-saver-android))
- User disabled the Taptic Engine in settings ([Feature Request](https://expo.canny.io/feature-requests/p/react-native-settings))
- Haptic engine generation is too low (less than 2nd gen) - Private API
  - Using private API will get your app rejected: `[[UIDevice currentDevice] valueForKey: @"_feedbackSupportLevel"]` so this is not added in Expo
- iOS version is less than 10 (iPhone 7 is the first phone to support this)
  - This could be found through: `Constants.platform.ios.systemVersion` or `Constants.platform.ios.platform`

<PlatformsSection android emulator ios simulator />

## Installation

<InstallSection packageName="expo-haptics" />

## Configuration

On Android, this module requires permission to control vibration on the device. The `VIBRATE` permission is added automatically.

## API

```js
import * as Haptics from 'expo-haptics';
```

<TableOfContentSection title='Methods' contents={['Haptics.selectionAsync()', 'Haptics.notificationAsync(type)', 'Haptics.impactAsync(style)']} />

## Methods

### `Haptics.isAvailableAsync()`

Returns whether the Haptics API is enabled on the current device.

#### Returns

A `Promise` resolving to either `true` or `false`.

### `Haptics.selectionAsync()`

Used to let a user know when a selection change has been registered

#### Returns

A `Promise` resolving once native size haptics functionality is triggered.

### `Haptics.notificationAsync(type)`

The kind of notification response used in the feedback

#### Arguments

- **type: `NotificationFeedbackType`** -- A notification feedback type that on `iOS` is directly mapped to [UINotificationFeedbackType](https://developer.apple.com/documentation/uikit/uinotificationfeedbacktype), while on `Android` these are simulated using [Vibrator](https://developer.android.com/reference/android/os/Vibrator). You can use one of `Haptics.NotificationFeedbackType.{Success, Warning, Error}`.

#### Returns

A `Promise` resolving once native size haptics functionality is triggered.

### `Haptics.impactAsync(style)`

#### Arguments

- **style: `ImpactFeedbackStyle`** -- A collision indicator that on `iOS` is directly mapped to [UIImpactFeedbackStyle](https://developer.apple.com/documentation/uikit/uiimpactfeedbackstyle), while on `Android` these are simulated using [Vibrator](https://developer.android.com/reference/android/os/Vibrator). You can use one of `Haptics.ImpactFeedbackStyle.{Light, Medium, Heavy}`.

#### Returns

A `Promise` resolving once native size haptics functionality is triggered.
