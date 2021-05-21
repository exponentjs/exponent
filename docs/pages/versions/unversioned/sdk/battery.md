---
title: Battery
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-battery'
---

import APISection from '~/components/plugins/APISection';
import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';

**`expo-battery`** provides battery information for the physical device (such as battery level, whether or not the device is charging, and more) as well as corresponding event listeners.

<PlatformsSection android emulator ios web />

## Installation

<InstallSection packageName="expo-battery" />

## Usage

<SnackInline label='Basic Battery Usage' dependencies={['expo-battery']}>

```jsx
import React, { useState, useEffect } from 'react';
import * as Battery from 'expo-battery';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  let [isAvailable, setIsAvailable] = useState(null);
  let [batteryLevel, setBatteryLevel] = useState(null);
  let [batteryState, setBatteryState] = useState(null);
  let [powerMode, setPowerMode] = useState(null);

  useEffect(() => {
    let levelListener;
    let stateListener;
    let powerModeListener;

    (async () => {
      setIsAvailable(await Battery.isAvailableAsync());
      setBatteryLevel(await Battery.getBatteryLevelAsync());
      setBatteryState(await Battery.getBatteryStateAsync());
      setPowerMode((await Battery.getPowerStateAsync()).lowPowerMode);

      function batteryLevelListener({ batteryLevel }) {
        console.log(`Battery level changed to ${batteryLevel}`);
        setBatteryLevel(batteryLevel);
      }

      function batteryStateListener({ batteryState }) {
        console.log(`Battery state changed to ${batteryState}`);
        setBatteryState(batteryState);
      }

      function lowPowerModeListener({ lowPowerMode }) {
        console.log(`Battery low power mode changed to ${lowPowerMode}`);
        setPowerMode(lowPowerMode);
      }

      levelListener = Battery.addBatteryLevelListener(batteryLevelListener);
      stateListener = Battery.addBatteryStateListener(stateListener);
      powerModeListener = Battery.addLowPowerModeListener(lowPowerModeListener);
    })();

    return function cleanup() {
      levelListener && levelListener.remove();
      stateListener && stateListener.remove();
      powerModeListener && powerModeListener.remove();
    };
  }, []);

  if (isAvailable === null) {
    return <View />;
  } else if (isAvailable === false) {
    return (
      <View style={styles.container}>
        <Text>Battery APIs not available on this device</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Current Battery Level: {batteryLevel}</Text>
      <Text>Current Battery State: {batteryState}</Text>
      <Text>Current Low Power Mode: {JSON.stringify(powerMode)}</Text>
      <BatteryView level={batteryLevel} lowPowerMode={powerMode} />
      <BatteryStateIndicator batteryState={batteryState} />
    </View>
  );
}

/* @hide const styles = StyleSheet.create({ ... }); */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function BatteryStateIndicator(props, context) {
  let description = 'Unknown';
  switch (props.batteryState) {
    case Battery.BatteryState.UNPLUGGED:
      description = '🔌 Unplugged';
      break;
    case Battery.BatteryState.CHARGING:
      description = '⚡ Charging';
      break;
    case Battery.BatteryState.FULL:
      description = '💯 Full';
      break;
    case Battery.BatteryState.UNKNOWN:
    default:
      description = '❓ Unknown';
      break;
  }
  return (
    <View
      style={{
        alignContent: 'center',
        marginTop: 8,
      }}>
      <Text
        style={{
          fontSize: 22,
          alignContent: 'center',
        }}>
        {description}
      </Text>
    </View>
  );
}

function BatteryView(props, context) {
  let fillColor = '#53d769';
  if (props.lowPowerMode) {
    fillColor = '#fecb2e';
  }
  return (
    <View
      style={{
        marginTop: 10,
        borderRadius: 4,
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 4,
        width: 100,
        height: 62,
      }}>
      <View
        style={{
          width: Math.floor(92 * props.level),
          backgroundColor: fillColor,
          height: 54,
        }}
      />
    </View>
  );
}
/* @end */
```

</SnackInline>

## API

```js
import * as Battery from 'expo-battery';
```

<APISection packageName="expo-battery" />
