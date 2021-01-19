---
title: Location
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-36/packages/expo-location'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

import SnackInline from '~/components/plugins/SnackInline';

**`expo-location`** allows reading geolocation information from the device. Your app can poll for the current location or subscribe to location update events.

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-location" />

## Configuration

In Managed and bare apps, `Location` requires `Permissions.LOCATION`.

In order to use [Background Location Methods](#background-location-methods), the following requirements apply:

- `Permissions.LOCATION` permission must be granted. On iOS it must be granted with `Always` option — see [Permissions.LOCATION](permissions.md#permissionslocation) for more details.
- `"location"` background mode must be specified in `Info.plist` file. See [background tasks configuration guide](task-manager.md#configuration). **(_iOS only_)**
- Background location task must be defined in the top-level scope, using [TaskManager.defineTask](task-manager.md#taskmanagerdefinetasktaskname-task).

In order to use [Geofencing Methods](#geofencing-methods), the following requirements apply:

- `Permissions.LOCATION` permission must be granted. On iOS it must be granted with `Always` option — see [Permissions.LOCATION](permissions.md#permissionslocation) for more details.
- Geofencing task must be defined in the top-level scope, using [TaskManager.defineTask](task-manager.md#taskmanagerdefinetasktaskname-task).
- On iOS, there is a [limit of 20](https://developer.apple.com/documentation/corelocation/monitoring_the_user_s_proximity_to_geographic_regions) `regions` that can be simultaneously monitored.

## Usage

If you're using the iOS or Android Emulators, ensure that [Location is enabled](#enabling-emulator-location).

<SnackInline label='Linear Gradient' templateId='location' dependencies={['expo-location', 'expo-constants']}>

```js
import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  });

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}
```

</SnackInline>

## API

```js
import * as Location from 'expo-location';
```

## Methods

### `Location.hasServicesEnabledAsync()`

Checks whether location services are enabled by the user.

#### Returns

A promise resolving to `true` if location services are enabled on the device, or `false` if not.

### `Location.requestPermissionsAsync()`

Asks the user to grant permissions for location. Alias for `Permissions.askAsync(Permissions.LOCATION)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](permissions.md#permissionresponse), where `ios` field is type of [PermissionDetailsLocationIOS](#PermissionDetailsLocationIOS) and `android` field is type of [PermissionDetailsLocationAndroid](#PermissionDetailsLocationIOS).

### `Location.getPermissionsAsync()`

Checks user's permissions for accessing location. Alias for `Permissions.getAsync(Permissions.LOCATION)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](permissions.md#permissionresponse), where `ios` field is type of [PermissionDetailsLocationIOS](#PermissionDetailsLocationIOS) and `android` field is type of [PermissionDetailsLocationAndroid](#PermissionDetailsLocationIOS).

### `Location.getLastKnownPositionAsync()`

Get the last known position of the device.

#### Returns

Returns a promise resolving to an object representing [Location](#type-location) type.

### `Location.getCurrentPositionAsync(options)`

Get the current position of the device.

> **Note:** calling it on iOS causes the location manager to obtain a location fix which may take several seconds. Consider using [Location.getLastKnownPositionAsync](#locationgetlastknownpositionasync) if you expect to get a quick response and high accuracy is not required.

#### Arguments

- **options (_object_)** -- A map of options:
  - **accuracy : [Location.Accuracy](#locationaccuracy)** -- Location manager accuracy. Pass one of [Location.Accuracy](#locationaccuracy) enum values. For low-accuracy the implementation can avoid geolocation providers that consume a significant amount of power (such as GPS).
  - **maximumAge (_number_)** -- (Android only). If specified, allow returning a previously cached position that is at most this old in milliseconds. If not specified, always gets a new location. On iOS this option is ignored and a new location is always returned.
  - **timeout (_number_)** -- (Android only). Specifies the duration of time in milliseconds to wait before timing out the location request.

#### Returns

Returns a promise resolving to an object representing [Location](#type-location) type.

### `Location.watchPositionAsync(options, callback)`

Subscribe to location updates from the device. Please note that updates will only occur while the application is in the foreground. To get location updates while in background you'll need to use [Location.startLocationUpdatesAsync](#locationstartlocationupdatesasynctaskname-options).

#### Arguments

- **options (_object_)** -- A map of options:

  - **accuracy : [Location.Accuracy](#locationaccuracy)** -- Location manager accuracy. Pass one of [Location.Accuracy](#locationaccuracy) enum values. For low accuracy the implementation can avoid geolocation providers that consume a significant amount of power (such as GPS).
  - **timeInterval (_number_)** -- Minimum time to wait between each update in milliseconds.
  - **distanceInterval (_number_)** -- Receive updates only when the location has changed by at least this distance in meters.
  - **mayShowUserSettingsDialog (_boolean_)** -- Specifies whether to ask the user to turn on improved accuracy location mode which uses Wi-Fi, cell networks and GPS sensor. The dialog can be shown only when the location mode is set to **Device only**. Defaults to `true`. (**Android only**)

- **callback (_function_)** --

  This function is called on each location update. It is passed exactly one parameter: an object representing [Location](#type-location) type.

#### Returns

Returns a promise resolving to a subscription object, which has one field:

- **remove (_function_)** -- Call this function with no arguments to remove this subscription. The callback will no longer be called for location updates.

### `Location.getProviderStatusAsync()`

Check status of location providers.

#### Returns

Returns a promise resolving to an object with the following fields:

- **locationServicesEnabled (_boolean_)** -- Whether location services are enabled. See [Location.hasServicesEnabledAsync](#locationhasservicesenabledasync) for a more convenient solution to get this value.
- **gpsAvailable (_boolean_)** (android only) -- If the GPS provider is available, if yes, location data will be from GPS.
- **networkAvailable (_boolean_)** (android only) -- If the network provider is available, if yes, location data will be from cellular network.
- **passiveAvailable (_boolean_)** (android only) -- If the passive provider is available, if yes, location data will be determined passively.

### `Location.enableNetworkProviderAsync()`

Asks the user to turn on high accuracy location mode which enables network provider that uses Google Play services to improve location accuracy and location-based services.

#### Returns

A promise resolving as soon as the user accepts the dialog. Rejects if denied.

### `Location.getHeadingAsync()`

Gets the current heading information from the device

#### Returns

Object with:

- **magHeading (_number_)** — measure of magnetic north in degrees
- **trueHeading (_number_)** — measure of true north in degrees (needs location permissions, will return -1 if not given)
- **accuracy (_number_)** — level of callibration of compass.
  - 3: high accuracy, 2: medium accuracy, 1: low accuracy, 0: none
  - Reference for iOS: 3: < 20 degrees uncertainty, 2: < 35 degrees, 1: < 50 degrees, 0: > 50 degrees

### `Location.watchHeadingAsync(callback)`

Subscribe to compass updates from the device.

#### Arguments

- **callback (_function_)** --

  This function is called on each compass update. It is passed exactly one parameter: an object with the following fields:

  - **magHeading (_number_)** — measure of magnetic north in degrees
  - **trueHeading (_number_)** — measure of true north in degrees (needs location permissions, will return -1 if not given)
  - **accuracy (_number_)** — level of callibration of compass.
    - 3: high accuracy, 2: medium accuracy, 1: low accuracy, 0: none
    - Reference for iOS: 3: < 20 degrees uncertainty, 2: < 35 degrees, 1: < 50 degrees, 0: > 50 degrees

#### Returns

Returns a promise resolving to a subscription object, which has one field:

- **remove (function)** — Call this function with no arguments to remove this subscription. The callback will no longer be called for location updates.

### `Location.geocodeAsync(address)`

Geocode an address string to latitiude-longitude location.

> **Note**: Geocoding is resource consuming and has to be used reasonably. Creating too many requests at a time can result in an error so they have to be managed properly.
>
> On Android, you must request a location permission (`Permissions.LOCATION`) from the user before geocoding can be used.

#### Arguments

- **address (_string_)** -- A string representing address, eg. "Baker Street London"

#### Returns

Returns a promise resolving to an array (in most cases its size is 1) of geocoded location objects with the following fields:

- **latitude (_number_)** -- The latitude in degrees.
- **longitude (_number_)** -- The longitude in degrees.
- **altitude (_number_)** -- The altitude in meters above the WGS 84 reference ellipsoid.
- **accuracy (_number_)** -- The radius of uncertainty for the location, measured in meters.

### `Location.reverseGeocodeAsync(location)`

Reverse geocode a location to postal address.

> **Note**: Geocoding is resource consuming and has to be used reasonably. Creating too many requests at a time can result in an error so they have to be managed properly.

> On Android, you must request a location permission (`Permissions.LOCATION`) from the user before geocoding can be used.

#### Arguments

- **location (_object_)** -- An object representing a location:

  - **latitude (_number_)** -- The latitude of location to reverse geocode, in degrees.
  - **longitude (_number_)** -- The longitude of location to reverse geocode, in degrees.

#### Returns

Returns a promise resolving to an array (in most cases its size is 1) of address objects with following fields:

- **city (_string_)** -- City name of the address.
- **street (_string_)** -- Street name of the address.
- **region (_string_)** -- Region/area name of the address.
- **postalCode (_string_)** -- Postal code of the address.
- **country (_string_)** -- Localized country name of the address.
- **name (_string_)** -- Place name of the address, for example, "Tower Bridge".

### `Location.setApiKey(apiKey)`

Sets a Google API Key for using Geocoding API. This method can be useful for Android devices that do not have Google Play Services, hence no Geocoder Service. After setting the key using Google's API will be possible.

#### Arguments

- **apiKey (_string_)** -- API key collected from Google Developer site.

### `Location.installWebGeolocationPolyfill()`

Polyfills `navigator.geolocation` for interop with the core React Native and Web API approach to geolocation.

## Background Location Methods

The Background Location API can notify your app about new locations while your app is backgrounded. Make sure you've followed the required steps detailed [here](#configuration).

### `Location.startLocationUpdatesAsync(taskName, options)`

Registers for receiving location updates that can also come when the app is in the background.

#### Arguments

- **taskName (_string_)** -- Name of the task receiving location updates.
- **options (_object_)** -- An object of options passed to the location manager.
  - **accuracy : [Location.Accuracy](#locationaccuracy)** -- Location manager accuracy. Pass one of [Location.Accuracy](#locationaccuracy) enum values. For low-accuracy the implementation can avoid geolocation providers that consume a significant amount of power (such as GPS).
  - **timeInterval (_number_)** -- Minimum time to wait between each update in milliseconds. Default value depends on `accuracy` option. (**Android only**)
  - **distanceInterval (_number_)** -- Receive updates only when the location has changed by at least this distance in meters. Default value may depend on `accuracy` option.
  - **deferredUpdatesInterval (_number_)** -- Minimum time interval in miliseconds that must pass since last reported location before all later locations are reported in a batched update. Defaults to `0`.
  - **deferredUpdatesDistance (_number_)** -- The distance in meters that must occur between last reported location and the current location before deferred locations are reported. Defaults to `0`.
  - **showsBackgroundLocationIndicator (_boolean_)** -- A boolean indicating whether the status bar changes its appearance when location services are used in the background. Defaults to `false`. (**Takes effect only on iOS 11.0 and later**)
  - **foregroundService (_object_)** -- Use this option to put the location service into a foreground state, which will make location updates in the background as frequent as in the foreground state. As a downside, it requires a sticky notification, so the user will be aware that your app is running and consumes more resources even if backgrounded. (**Available since Android 8.0**)
    - **notificationTitle (_string_)** -- Title of the foreground service notification. _required_
    - **notificationBody (_string_)** -- Subtitle of the foreground service notification. _required_
    - **notificationColor (_string_)** -- Color of the foreground service notification. Accepts `#RRGGBB` and `#AARRGGBB` hex formats. _optional_
  - **pausesUpdatesAutomatically (_boolean_)** -- A boolean value indicating whether the location manager can pause location updates to improve battery life without sacrificing location data. When this option is set to `true`, the location manager pauses updates (and powers down the appropriate hardware) at times when the location data is unlikely to change. You can help the determination of when to pause location updates by assigning a value to the `activityType` property. Defaults to `false`. (**iOS only**)
  - **activityType : [Location.ActivityType](#locationactivitytype)** -- The type of user activity associated with the location updates. See [Apple docs](https://developer.apple.com/documentation/corelocation/cllocationmanager/1620567-activitytype) for more details. Defaults to `Location.ActivityType.Other`. (**iOS only**)

> Deferred updates provide a way to report locations in a batch when the app is in the background state. Location updates aren't being deferred in the foreground.

#### Returns

A promise resolving once the task with location updates is registered.

#### Task parameters

Background location task will be receiving following data:

- **locations : [Location](#type-location)[]** - An array of the new locations.

```javascript
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask(YOUR_TASK_NAME, ({ data: { locations }, error }) => {
  if (error) {
    // check `error.message` for more details.
    return;
  }
  console.log('Received new locations', locations);
});
```

### `Location.stopLocationUpdatesAsync(taskName)`

Stops location updates for given task.

#### Arguments

- **taskName (_string_)** -- Name of the background location task to stop.

#### Returns

A promise resolving as soon as the task is unregistered.

### `Location.hasStartedLocationUpdatesAsync(taskName)`

#### Arguments

- **taskName (_string_)** -- Name of the location task to check.

#### Returns

A promise resolving to boolean value indicating whether the location task is started or not.

## Geofencing Methods

Geofencing API notifies your app when the device enters or leaves geographical regions you set up.
To make it work in the background, it uses [TaskManager](task-manager.md) Native API under the hood. Make sure you've followed the required steps detailed [here](#configuration).

### `Location.startGeofencingAsync(taskName, regions)`

Starts geofencing for given regions. When the new event comes, the task with specified name will be called with the region that the device enter to or exit from.
If you want to add or remove regions from already running geofencing task, you can just call `startGeofencingAsync` again with the new array of regions.

#### Arguments

- **taskName (_string_)** -- Name of the task that will be called when the device enters or exits from specified regions.
- **regions (_array_)** -- Array of region objects to be geofenced.
  - **identifier (_string_)** -- The identifier of the region object. Defaults to auto-generated UUID hash.
  - **latitude (_number_)** -- The latitude in degrees of region's center point. _required_
  - **longitude (_number_)** -- The longitude in degrees of region's center point. _required_
  - **radius (_number_)** -- The radius measured in meters that defines the region's outer boundary. _required_
  - **notifyOnEnter (_boolean_)** -- Boolean value whether to call the task if the device enters the region. Defaults to `true`.
  - **notifyOnExit (_boolean_)** -- Boolean value whether to call the task if the device exits the region. Defaults to `true`.

#### Returns

A promise resolving as soon as the task is registered.

#### Task parameters

Geofencing task will be receiving following data:

- **eventType : [Location.GeofencingEventType](#locationgeofencingeventtype)** -- Indicates the reason for calling the task, which can be triggered by entering or exiting the region. See [Location.GeofencingEventType](#locationgeofencingeventtype).
- **region : [LocationRegion](#locationregion)** -- Object containing details about updated region. See [LocationRegion](#type-region) for more details.

```javascript
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask(YOUR_TASK_NAME, ({ data: { eventType, region }, error }) => {
  if (error) {
    // check `error.message` for more details.
    return;
  }
  if (eventType === Location.GeofencingEventType.Enter) {
    console.log("You've entered region:", region);
  } else if (eventType === Location.GeofencingEventType.Exit) {
    console.log("You've left region:", region);
  }
});
```

### `Location.stopGeofencingAsync(taskName)`

Stops geofencing for specified task. It unregisters the background task so the app will not be receiving any updates, especially in the background.

#### Arguments

- **taskName (_string_)** -- Name of the task to unregister.

#### Returns

A promise resolving as soon as the task is unregistered.

### `Location.hasStartedGeofencingAsync(taskName)`

#### Arguments

- **taskName (_string_)** -- Name of the geofencing task to check.

#### Returns

A promise resolving to boolean value indicating whether the geofencing task is started or not.

## Types

### `Location`

Object of type `Location` contains following keys:

- **coords (_object_)** -- The coordinates of the position, with the following fields:
  - **latitude (_number_)** -- The latitude in degrees.
  - **longitude (_number_)** -- The longitude in degrees.
  - **altitude (_number_)** -- The altitude in meters above the WGS 84 reference ellipsoid.
  - **accuracy (_number_)** -- The radius of uncertainty for the location, measured in meters.
  - **altitudeAccuracy (_number_)** -- The accuracy of the altitude value, in meters (iOS only).
  - **heading (_number_)** -- Horizontal direction of travel of this device, measured in degrees starting at due north and continuing clockwise around the compass. Thus, north is 0 degrees, east is 90 degrees, south is 180 degrees, and so on.
  - **speed (_number_)** -- The instantaneous speed of the device in meters per second.
- **timestamp (_number_)** -- The time at which this position information was obtained, in milliseconds since epoch.

### `LocationRegion`

Object of type `LocationRegion` includes following fields:

- **identifier (_string_)** -- The identifier of the region object passed to `startGeofencingAsync` or auto-generated.
- **latitude (_number_)** -- The latitude in degress of region's center point.
- **longitude (_number_)** -- The longitude in degress of region's center point.
- **radius (_number_)** -- The radius measured in meters that defines the region's outer boundary.
- **state : [Location.GeofencingRegionState](#locationgeofencingregionstate)** -- One of [Location.GeofencingRegionState](#locationgeofencingregionstate) region state. Determines whether the device is inside or outside a region.

### `PermissionDetailsLocationIOS`

Object of type `PermissionDetailsLocationIOS` contains only one field:

- **scope** (_string_) - The scope of granted permission, which indicates when it's possible to use location. Possible values: `whenInUse`, `always`.

### `PermissionDetailsLocationAndroid`

Object of type `PermissionDetailsLocationAndroid` contains only one field:

- **scope** (_string_) - The scope of granted permission, which indicates the type of location provider. Possible values: `fine`, `coarse`, `none`.

## Enums

### `Location.Accuracy`

| Accuracy                     | Value | Description                                                                                   |
| ---------------------------- | ----- | --------------------------------------------------------------------------------------------- |
| `Accuracy.Lowest`            | 1     | Accurate to the nearest three kilometers.                                                     |
| `Accuracy.Low`               | 2     | Accurate to the nearest kilometer.                                                            |
| `Accuracy.Balanced`          | 3     | Accurate to within one hundred meters.                                                        |
| `Accuracy.High`              | 4     | Accurate to within ten meters of the desired target.                                          |
| `Accuracy.Highest`           | 5     | The best level of accuracy available.                                                         |
| `Accuracy.BestForNavigation` | 6     | The highest possible accuracy that uses additional sensor data to facilitate navigation apps. |

### `Location.ActivityType`

| ActivityType                        | Value | Description                                                                                                           |
| ----------------------------------- | :---: | --------------------------------------------------------------------------------------------------------------------- |
| `ActivityType.Other`                |   1   | Default activity type. Use it if there is no other type that matches the activity you track.                          |
| `ActivityType.AutomotiveNavigation` |   2   | Location updates are being used specifically during vehicular navigation to track location changes to the automobile. |
| `ActivityType.Fitness`              |   3   | Use this activity type if you track fitness activities such as walking, running, cycling, and so on.                  |
| `ActivityType.OtherNavigation`      |   4   | Activity type for movements for other types of vehicular navigation that are not automobile related.                  |
| `ActivityType.Airborne`             |   5   | Intended for airborne activities. **Available since iOS 12.0, fall backs to `ActivityType.Other` otherwise.**         |

### `Location.GeofencingEventType`

| Event type                  | Value | Description                                        |
| --------------------------- | ----- | -------------------------------------------------- |
| `GeofencingEventType.Enter` | 1     | Emitted when the device entered observed region.   |
| `GeofencingEventType.Exit`  | 2     | Occurs as soon as the device left observed region. |

### `Location.GeofencingRegionState`

| Region state                    | Value | Description                                     |
| ------------------------------- | ----- | ----------------------------------------------- |
| `GeofencingRegionState.Inside`  | 1     | Indicates that the device is inside the region. |
| `GeofencingRegionState.Outside` | 2     | Inverse of inside state.                        |

## Enabling Emulator Location

### iOS Simulator

With Simulator open, go to Debug > Location and choose any option besides "None" (obviously).

![iOS Simulator location](/static/images/ios-simulator-location.png)

### Android Emulator

Open Android Studio, and launch your AVD in the emulator. Then, on the options bar for your device, click the icon for "More" and navigate to the "Location" tab.

![Android Simulator location](/static/images/android-emulator-location.png)

If you don't receive the locations in the emulator, you may have to turn off "Improve Location Accuracy" in Settings - Location in the emulator. This will turn off Wi-Fi location and only use GPS. Then you can manipulate the location with GPS data through the emulator.
