---
title: Gyroscope
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-sensors'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';

`Gyroscope` from **`expo-sensors`** provides access to the device's gyroscope sensor to respond to changes in rotation in 3D space.

<PlatformsSection android emulator ios web />

## Installation

<InstallSection packageName="expo-sensors" />

## Usage

<SnackInline label='Basic Gyroscope usage' templateId='gyroscope' dependencies={['expo-sensors']}>

```js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';

function useGyroscope(isEnabled, updateInterval) {
  const [data, setData] = useState({});
  
  useEffect(() => {
    if(isEnabled) {
      const subscription = Gyroscope.addListener(gyroscopeData => {
        setData(gyroscopeData);
      });
      
      return () => subscription.remove();
    }
  }, [isEnabled, setData]);

  useEffect(() => {
    Gyroscope.setUpdateInterval(updateInterval);
  }, [updateInterval]);
  
  return data;
}

export default function App() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(1000);
  
  const data = useGyroscope(isEnabled, updateInterval);

  let { x, y, z } = data;
  return (
    <View style={styles.sensor}>
      <Text style={styles.text}>Gyroscope:</Text>
      <Text style={styles.text}>
        x: {Math.round(x)} y: {Math.round(y)} z: {Math.round(z)}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => setIsEnabled(wasEnabled => !wasEnabled)} style={styles.button}>
          <Text>Toggle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setUpdateInterval(1000)} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setUpdateInterval(300)} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

</SnackInline>

## API

```js
import { Gyroscope } from 'expo-sensors';
```

## Methods

### `Gyroscope.isAvailableAsync()`

> You should always check the sensor availability before attempting to use it.

Returns whether the gyroscope is enabled on the device.

On mobile web, you must first invoke `Permissions.askAsync(Permissions.MOTION)` in a user interaction (i.e. touch event) before you can use this module. If the `status` is not equal to `granted` then you should inform the end user that they may have to open settings.

On **web** this starts a timer and waits to see if an event is fired. This should predict if the iOS device has the **device orientation** API disabled in `Settings > Safari > Motion & Orientation Access`. Some devices will also not fire if the site isn't hosted with **HTTPS** as `DeviceMotion` is now considered a secure API. There is no formal API for detecting the status of `DeviceMotion` so this API can sometimes be unreliable on web.

#### Returns

- A promise that resolves to a `boolean` denoting the availability of the sensor.

### `Gyroscope.addListener(listener)`

Subscribe for updates to the gyroscope.

#### Arguments

- **listener (_function_)** -- A callback that is invoked when an gyroscope update is available. When invoked, the listener is provided a single argument that is an object containing keys x, y, z.

#### Returns

- An EventSubscription object that you can call `remove()` on when you would like to unsubscribe the listener.

### `Gyroscope.removeAllListeners()`

Remove all listeners.

### `Gyroscope.setUpdateInterval(intervalMs)`

Subscribe for updates to the gyroscope.

#### Arguments

- **intervalMs (_number_)** -- Desired interval in milliseconds between gyroscope updates.
