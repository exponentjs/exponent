---
title: Location
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-location'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import APISection from '~/components/plugins/APISection';
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

On Android, This module requires the permissions for approximate and exact device location. It also needs the foreground service permission to subscribe to location updates, while the app is in use. The `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, and `FOREGROUND_SERVICE` permissions are automatically added.

## Usage

If you're using the iOS or Android Emulators, ensure that [Location is enabled](#enabling-emulator-location).

<SnackInline label='Location' dependencies={['expo-location', 'expo-constants']}>

```jsx
import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
/* @hide */
import Constants from 'expo-constants';
/* @end */
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      /* @hide */
      if (Platform.OS === 'android' && !Constants.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android emulator. Try it on your device!'
        );
        return;
      }
      /* @end */
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

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

/* @hide const styles = StyleSheet.create({ ... }); */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
/* @end */
```

</SnackInline>

## API

```js
import * as Location from 'expo-location';
```

<APISection packageName="expo-location" apiName="Location" />


### `LocationActivityType`

| ActivityType                        | Value | Description                                                                                                           |
| ----------------------------------- | :---: | --------------------------------------------------------------------------------------------------------------------- |
| `ActivityType.Other`                |   1   | Default activity type. Use it if there is no other type that matches the activity you track.                          |
| `ActivityType.AutomotiveNavigation` |   2   | Location updates are being used specifically during vehicular navigation to track location changes to the automobile. |
| `ActivityType.Fitness`              |   3   | Use this activity type if you track fitness activities such as walking, running, cycling, and so on.                  |
| `ActivityType.OtherNavigation`      |   4   | Activity type for movements for other types of vehicular navigation that are not automobile related.                  |
| `ActivityType.Airborne`             |   5   | Intended for airborne activities. **Available since iOS 12.0, fall backs to `ActivityType.Other` otherwise.**         |

### `LocationGeofencingEventType`

| Event type                  | Value | Description                                        |
| --------------------------- | :---: | -------------------------------------------------- |
| `GeofencingEventType.Enter` |   1   | Emitted when the device entered observed region.   |
| `GeofencingEventType.Exit`  |   2   | Occurs as soon as the device left observed region. |

### `LocationGeofencingRegionState`

| Region state                    | Value | Description                                     |
| ------------------------------- | :---: | ----------------------------------------------- |
| `GeofencingRegionState.Inside`  |   1   | Indicates that the device is inside the region. |
| `GeofencingRegionState.Outside` |   2   | Inverse of inside state.                        |

## Enabling Emulator Location

### iOS Simulator

With Simulator open, go to Debug > Location and choose any option besides "None" (obviously).

![iOS Simulator location](/static/images/ios-simulator-location.png)

### Android Emulator

Open Android Studio, and launch your AVD in the emulator. Then, on the options bar for your device, click the icon for "More" and navigate to the "Location" tab.

![Android Simulator location](/static/images/android-emulator-location.png)

If you don't receive the locations in the emulator, you may have to turn off "Improve Location Accuracy" in Settings - Location in the emulator. This will turn off Wi-Fi location and only use GPS. Then you can manipulate the location with GPS data through the emulator.
