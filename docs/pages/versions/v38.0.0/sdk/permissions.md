---
title: Permissions
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-38/packages/expo-permissions'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

When it comes to adding functionality that can access potentially sensitive information on a user's device, such as their location, or possibly send them possibly unwanted push notifications, you will need to ask the user for their permission first. Unless you've already asked their permission, then no need. And so we have the **`expo-permissions`** module.

If you are deploying your app to the Apple iTunes Store, you must add additional metadata to your app in order to customize the system permissions dialog, and more importantly, explain why your app requires permissions. **Without this explanation, your app may be rejected from the App Store.** See more info in the [App Store Deployment Guide](../../../distribution/app-stores.md#system-permissions-dialogs-on-ios).

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-permissions" />

### Usage in bare workflow

`expo-permissions` includes the shared infrastructure for handling system permissions, it does not include the code specific to particular permissions. For example, if you want to use the `CAMERA_ROLL` permission, you need to install `expo-image-picker` or `expo-media-library`.

The following table shows you which permissions correspond to which packages.

| Permission type             | Packages                                  |
| --------------------------- | ----------------------------------------- |
| `NOTIFICATIONS`             | `expo-notifications`                      |
| `USER_FACING_NOTIFICATIONS` | `expo-notifications`                      |
| `LOCATION`                  | `expo-location`                           |
| `CAMERA`                    | `expo-camera`, `expo-barcode-scanner`     |
| `AUDIO_RECORDING`           | `expo-av`                                 |
| `CONTACTS`                  | `expo-contacts`                           |
| `CAMERA_ROLL`               | `expo-image-picker`, `expo-media-library` |
| `CALENDAR`                  | `expo-calendar`                           |
| `REMINDERS`                 | `expo-calendar`                           |
| `SYSTEM_BRIGHTNESS`         | `expo-brightness`                         |
| `MOTION`                    | `expo-sensors`                            |

## Usage

### Manually testing permissions

Often you want to be able to test what happens when you reject a permission to ensure that it has the desired behavior. An operating-system level restriction on both iOS and Android prohibits an app from asking for the same permission more than once (you can imagine how this could be annoying for the user to be repeatedly prompted for permissions). So in order to test different flows involving permissions, you may need to uninstall and reinstall the Expo app. In the simulator this is as easy as deleting the app and expo-cli will automatically install it again next time you launch the project from it.

## API

```js
import * as Permissions from 'expo-permissions';
```

### `Permissions.getAsync(...permissionTypes)`

Determines whether your app has already been granted access to the provided permissions types.

#### Arguments

- **permissionTypes (_string_)** -- The names of the permissions types.

#### Returns

A `Promise` that is resolved with information about the permissions, including status, expiration, and scope (if applicable).
The top-level `status`, `expires` and `canAskAgain` keys are a reduction of the values from each individual permission.
If all single permissions have a `status` of `'denied'`, then that the top level `status` is `denied`; in other words, the top-level `status` is `'granted'` if and only if all of the individual permissions are `'granted'`. Otherwise, `status` is`undetermined`.
If any single permission has a `status` different then `granted`, then top-level `granted` is `false`. Otherwise, it is `true`.
Top-level `expires` has value of the earliest expirated permission.

Examples `[...componentsValues] => topLevelStatus`:

- `[granted, denied, granted] => denied`
- `[granted, granted, granted] => granted`

```javascript
{
  status, // combined status of all component permissions being asked for, if any of has status !== 'granted' then that status is propagated here
  expires, // combined expires of all permissions being asked for, same as status
  canAskAgain,
  granted,
  permissions: { // an object with an entry for each permission requested
    [Permissions.TYPE]: {
      status,
      expires,
      canAskAgain,
      granted,
      ... // any additional permission-specific fields
    },
    ...
  },
}
```

#### Example

```javascript
async function alertIfRemoteNotificationsDisabledAsync() {
  const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  if (status !== 'granted') {
    alert('Hey! You might want to enable notifications for my app, they are good.');
  }
}

async function checkMultiPermissions() {
  const { status, expires, permissions } = await Permissions.getAsync(
    Permissions.CALENDAR,
    Permissions.CONTACTS
  );
  if (status !== 'granted') {
    alert('Hey! You have not enabled selected permissions');
  }
}
```

### `Permissions.askAsync(...types)`

Prompt the user for types of permissions. If they have already granted access, response will be success.

#### Arguments

- **types (_string_)** -- The names of the permissions types.

#### Returns

Same as for `Permissions.getAsync`

#### Example

```javascript
async function getLocationAsync() {
  // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
  const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION);
  if (status === 'granted') {
    return Location.getCurrentPositionAsync({ enableHighAccuracy: true });
  } else {
    throw new Error('Location permission not granted');
  }
}
```

## Permissions types

### `Permissions.NOTIFICATIONS`

The permission type for user-facing notifications **and** remote push notifications.

> **Note:** On iOS, asking for this permission asks the user not only for permission to register for push/remote notifications, but also for showing notifications as such. At the moment remote notifications will only be received when notifications are permitted to play a sound, change the app badge or be displayed as an alert. As iOS is more detailed when it comes to notifications permissions, this permission status will contain not only `status` and `expires`, but also Boolean values for `allowsSound`, `allowsAlert` and `allowsBadge`.

> **Note:** On iOS, this does not disambiguate `undetermined` from `denied` and so will only ever return `granted` or `undetermined`. This is due to the way the underlying native API is implemented. On iOS simulators, since they don't support registering for push notifications, you will always get `undetermined` result.

> **Note:** Android does not differentiate between permissions for local and remote notifications, so status of permission for `NOTIFICATIONS` should always be the same as the status for `USER_FACING_NOTIFICATIONS`.

### `Permissions.USER_FACING_NOTIFICATIONS`

The permission type for user-facing notifications. This does **not** register your app to receive remote push notifications; see the `NOTIFICATIONS` permission.

> **Note:** iOS provides more detailed permissions, so the permission status will contain not only `status` and `expires`, but also Boolean values for `allowsSound`, `allowsAlert` and `allowsBadge`.

> **Note:** Android does not differentiate between permissions for local and remote notifications, so status of permission for `USER_FACING_NOTIFICATIONS` should always be the same as the status for `NOTIFICATIONS`.

### `Permissions.LOCATION`

The permission type for location access.

<!-- TODO: Permissions.LOCATION issue (search by this phrase) -->

> **Note:** If your app is being launched on Android 10 or newer, permission will be treated as granted only when user accepted it for backgrounded app. To check whether permission is granted for when app is in use, use the `foregroundGranted` boolean attribute. For example, if permission is granted for when app is in use, resolving a call to `Permissions.getAsync(Permissions.LOCATION)` provides an object as such (only relevant properties shown): `{ status: 'denied', granted: false, permissions: { location: { status: 'denied', granted: false, foregroundGranted: true } } }`

> **Note:** iOS is not working with this permission being not individually, `Permissions.askAsync(Permissions.SOME_PERMISSIONS, Permissions.LOCATION, Permissions.CAMERA, ...)` would throw.
> On iOS ask for this permission type individually.

> **Note (iOS):** In Expo client this permission will always ask the user for permission to access location data while the app is in use.

> **Note (iOS):** iOS provides more detailed permissions, returning `{ status, permissions: { location: { ios } } }` where `ios` which is an object containing: `{ scope: 'whenInUse' | 'always' | 'none' }`
> If you would like to access location data in a standalone app, note that you'll need to provide location usage descriptions in `app.json`. For more information see [Deploying to App Stores guide](../../../distribution/app-stores.md#system-permissions-dialogs-on-ios).
>
> **What location usage descriptions should I provide?** Due to the design of the location permission API on iOS we aren't able to provide you with methods for asking for `whenInUse` or `always` location usage permission specifically. However, you can customize the behavior by providing the following sets of usage descriptions:
>
> - if you provide only `NSLocationWhenInUseUsageDescription`, your application will only ever ask for location access permission "when in use",
> - if you provide both `NSLocationWhenInUseUsageDescription` and `NSLocationAlwaysAndWhenInUseUsageDescription`, your application will only ask for "when in use" permission on iOS 10, whereas on iOS 11+ it will show a dialog to the user where he'll be able to pick whether he'd like to give your app permission to access location always or only when the app is in use,
> - if you provide all three: `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription` and `NSLocationAlwaysUsageDescription`, your application on iOS 11+ will still show a dialog described above and on iOS 10 it will only ask for "always" location permission.

### `Permissions.CAMERA`

The permission type for photo and video taking.

### `Permissions.AUDIO_RECORDING`

The permission type for audio recording.

### `Permissions.CONTACTS`

The permission type for reading contacts.

### `Permissions.CAMERA_ROLL`

The permission type for reading or writing to the camera roll.

### `Permissions.CALENDAR`

The permission type for reading or writing to the calendar.

### `Permissions.REMINDERS`

The permission type for reading or writing reminders.
(iOS only, on Android would return `granted` immediately)

### `Permissions.SYSTEM_BRIGHTNESS`

The permissions type for changing brightness of the screen

### `Permissions.MOTION`

The permission for accessing `DeviceMotion` and `DeviceOrientation` in the web browser. This can only be requested from a website using HTTPS (`expo web --https`). This permission cannot be silently retrieved, you can only request it. This permission can only be requested with a user interaction i.e. a button press.

## Android: permissions equivalents inside `app.json`

In order to request permissions in a standalone Android app (Managed Workflow only), you need to specify the corresponding native permission types in the `android.permissions` key inside `app.json` ([read more about configuration](../../../workflow/configuration.md#android)). The mapping between `Permissions` values and native permission types is as follows:

| Expo            | Android                                       |
| --------------- | --------------------------------------------- |
| LOCATION        | ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION  |
| CAMERA          | CAMERA                                        |
| AUDIO_RECORDING | RECORD_AUDIO                                  |
| CONTACTS        | READ_CONTACTS                                 |
| CAMERA_ROLL     | READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE |
| CALENDAR        | READ_CALENDAR, WRITE_CALENDAR                 |

For example, if your app asks for `AUDIO_RECORDING` permission at runtime but no other permissions, you should set `android.permissions` to `["RECORD_AUDIO"]` in `app.json`.

> **Note:** If you don't specify `android.permissions` inside your `app.json`, by default your standalone Android app will require all of the permissions listed above.

## Types

### `PermissionResponse`

| Field name  | Type                       | Description                                                                                                                                                                                    |
| ----------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| status      | _string_                   | Permission status with possible values: `granted`, `denied`, `undetermined`.                                                                                                                   |
| granted     | _boolean_                  | Boolean value meaning whether the permission is granted or not.                                                                                                                                |
| canAskAgain | _boolean_                  | Boolean value determining if it's possible to request permission again. It's `false` if the user selected `don't ask again` option on Android or `don't allow` on iOS. Otherwise, it's `true`. |
| ios         | depends on permission type | Additional detail on iOS (**optional**)                                                                                                                                                        |
| android     | depends on permission type | Additional detail on Android (**optional**)                                                                                                                                                    |
