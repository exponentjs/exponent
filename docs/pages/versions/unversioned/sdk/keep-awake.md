---
title: KeepAwake
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-keep-awake'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';

**`expo-keep-awake`** provides a React hook that prevents the screen from sleeping and a pair of functions to enable this behavior imperatively.

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-keep-awake" />

## Usage

### Example: hook

<SnackInline label='Keep Awake hook' dependencies={['expo-keep-awake']}>

```javascript
import { useKeepAwake } from 'expo-keep-awake';
import React from 'react';
import { Text, View } from 'react-native';

export default function KeepAwakeExample() {
  /* @info As long as this component is mounted, the screen will not turn off from being idle. */
  useKeepAwake();
  /* @end */
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>This screen will never sleep!</Text>
    </View>
  );
}
```

</SnackInline>

### Example: functions

<SnackInline label='Keep Awake functions' dependencies={['expo-keep-awake']}>

```javascript
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import React from 'react';
import { Button, View } from 'react-native';

export default class KeepAwakeExample extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button onPress={this._activate} title="Activate" />
        <Button onPress={this._deactivate} title="Deactivate" />
      </View>
    );
  }

  _activate = () => {
    /* @info Screen will remain on after called until <strong>deactivateKeepAwake()</strong> is called. */ activateKeepAwake(); /* @end */

    alert('Activated!');
  };

  _deactivate = () => {
    /* @info Deactivates KeepAwake, or does nothing if it was never activated. */ deactivateKeepAwake(); /* @end */

    alert('Deactivated!');
  };
}
```

</SnackInline>

## API

```js
import KeepAwake from 'expo-keep-awake';
```

## Methods

### `isAvailableAsync()`

Resolves with whether this keep awake API is available on the current device. The value of this property is `true` on native platforms. On web, it depends on whether the browser supports the keep-awake API.

### `useKeepAwake(tag?)`

A React hook to keep the screen awake for as long as the owner component is mounted. The optionally provided `tag` argument is used when activating and deactivating the keep-awake feature. If unspecified, the default tag is used. See the documentation for `activateKeepAwake` below to learn more about the `tag` argument.

### `activateKeepAwake(tag?)`

Prevents the screen from sleeping until `deactivateKeepAwake` is called with the same `tag` value.

If the `tag` argument is specified, the screen will not sleep until you call `deactivateKeepAwake` with the same `tag` argument. When using multiple `tags` for activation you'll have to deactivate each one in order to re-enable screen sleep. If `tag` is unspecified, the default tag is used.

#### Arguments

- **tag (_string_)** -- **optional** -- Tag to lock screen sleep prevention. If not provided, the default tag is used.

### `deactivateKeepAwake(tag?)`

Releases the lock on screen-sleep prevention associated with the given `tag` value. If `tag` is unspecified, it defaults to the same default tag that `activateKeepAwake` uses.

#### Arguments

- **tag (_string_)** -- **optional** -- Tag to release the lock on screen sleep prevention. If not provided, the default tag is used.
