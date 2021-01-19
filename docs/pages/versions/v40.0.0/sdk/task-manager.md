---
title: TaskManager
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-40/packages/expo-task-manager'
---

import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-task-manager`** provides an API that allows you to manage long-running tasks, in particular those tasks that can run while your app is in the background.
Some features of this module are used by other modules under the hood. Here is a list of Expo modules that use TaskManager:

- [Location](location.md)
- [BackgroundFetch](background-fetch.md)

<PlatformsSection android emulator ios simulator />

## Installation

For [managed](../../../introduction/managed-vs-bare.md#managed-workflow) apps, you'll need to run `expo install expo-task-manager`. To use it in [bare](../../../introduction/managed-vs-bare.md#bare-workflow) React Native app, follow its [installation instructions](https://github.com/expo/expo/tree/master/packages/expo-task-manager);

## Configuration for standalone apps

### Background modes on iOS

`TaskManager` works out of the box in the Expo client on Android, but on iOS you'll need to test using [a custom Expo client](../../../guides/adhoc-builds.md).

Standalone apps need some extra configuration: on iOS, each background feature requires a special key in `UIBackgroundModes` array in your `Info.plist` file. In standalone apps this array is empty by default, so in order to use background features you will need to add appropriate keys to your `app.json` configuration.
Here is an example of an `app.json` configuration that enables background location and background fetch:

```json
{
  "expo": {
    ...
    "ios": {
      ...
      "infoPlist": {
        ...
        "UIBackgroundModes": [
          "location",
          "fetch"
        ]
      }
    }
  }
}
```

For bare React Native apps, you need to add those keys manually. You can do it by clicking on your project in Xcode, then `Signing & Capabilities`, adding the `BackgroundMode` capability (if absent), and checking either `Location updates` or `Background fetch`, depending on your needs.

### AppDelegate.h

Make sure that in your `AppDelegate.h`, `AppDelegate` subclasses the `UMAppDelegateWrapper` class from `@unimodules/core`, like so:

```objc
#import <UMCore/UMAppDelegateWrapper.h>

@interface AppDelegate : UMAppDelegateWrapper <RCTBridgeDelegate>
```

## API

```js
import * as TaskManager from 'expo-task-manager';
```

### `TaskManager.defineTask(taskName, task)`

Defines task function.
It must be called in the global scope of your JavaScript bundle. In particular, it **cannot** be called in any of React lifecycle methods like `componentDidMount`.
This limitation is due to the fact that when the application is launched in the background, we need to spin up your JavaScript app, run your task and then shut down — no views are mounted in this scenario.

#### Arguments

- **taskName (_string_)** -- Name of the task.
- **task (_function_)** -- A function that will be invoked when the task with given **taskName** is executed.

### `TaskManager.isAvailableAsync()`

Determine if the `TaskManager` API can be used in this app.

#### Returns

A promise resolves to `true` if the API can be used, and `false` otherwise.

- Always returns `false` in the browser.

### `TaskManager.isTaskRegisteredAsync(taskName)`

Determine whether the task is registered. Registered tasks are stored in a persistent storage and preserved between sessions.

#### Arguments

- **taskName (_string_)** -- Name of the task.

#### Returns

Returns a promise resolving to a boolean value whether or not the task with given name is already registered.

### `TaskManager.getTaskOptionsAsync(taskName)`

Retrieves options associated with the task, that were passed to the function registering the task (eg. `Location.startLocationUpdatesAsync`).

#### Arguments

- **taskName (_string_)** -- Name of the task.

#### Returns

Returns a promise resolving to the options object that was passed while registering task with given name or `null` if task couldn't be found.

### `TaskManager.getRegisteredTasksAsync()`

Provides information about tasks registered in the app.

#### Returns

Returns a promise resolving to an array of tasks registered in the app.
Example:

```javascript
[
  {
    taskName: 'location-updates-task-name',
    taskType: 'location',
    options: {
      accuracy: Location.Accuracy.High,
      showsBackgroundLocationIndicator: false,
    },
  },
  {
    taskName: 'geofencing-task-name',
    taskType: 'geofencing',
    options: {
      regions: [...],
    },
  },
]
```

### `TaskManager.unregisterTaskAsync(taskName)`

Unregisters task from the app, so the app will not be receiving updates for that task anymore.
_It is recommended to use methods specialized by modules that registered the task, eg. [Location.stopLocationUpdatesAsync](location.md#locationstoplocationupdatesasynctaskname)._

#### Arguments

- **taskName (_string_)** -- Name of the task to unregister.

#### Returns

Returns a promise resolving as soon as the task is unregistered.

### `TaskManager.unregisterAllTasksAsync()`

Unregisters all tasks registered for the running app.

### Returns

Returns a promise that resolves as soon as all tasks are completely unregistered.

## Example

```javascript
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

export default class Component extends React.Component {
  onPress = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  };

  render() {
    return (
      <TouchableOpacity onPress={this.onPress}>
        <Text>Enable background location</Text>
      </TouchableOpacity>
    );
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    // do something with the locations captured in the background
  }
});
```
