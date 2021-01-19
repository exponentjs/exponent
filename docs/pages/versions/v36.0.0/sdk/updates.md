---
title: Updates
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-36/packages/expo/src/Updates'
---

import PlatformsSection from '~/components/plugins/PlatformsSection';

The `Updates` API from **`expo`** allows you to programatically control and respond to over-the-air updates to your app.

<PlatformsSection android emulator ios simulator />

## Installation

This API is pre-installed in [managed](../../../introduction/managed-vs-bare.md#managed-workflow) apps. It is not yet available for [bare](../../../introduction/managed-vs-bare.md#bare-workflow) React Native apps.

## API

```js
import { Updates } from 'expo';
```

### `Updates.reload()`

Immediately reloads the current experience. This will use your app.json `updates` configuration to fetch and load the newest available JS supported by the device's Expo environment. This is useful for triggering an update of your experience if you have published a new version.

### `Updates.reloadFromCache()`

Immediately reloads the current experience using the most recent cached version. This is useful for triggering an update of your experience if you have published and already downloaded a new version.

### `Updates.checkForUpdateAsync()`

Check if a new published version of your project is available. Does not actually download the update. Rejects if `updates.enabled` is `false` in app.json.

#### Returns

An object with the following keys:

- **isAvailable (_boolean_)** -- True if an update is available, false if you're already running the most up-to-date JS bundle.
- **manifest (_object_)** -- If `isAvailable` is true, the manifest of the available update. Undefined otherwise.

### `Updates.fetchUpdateAsync(params?)`

Downloads the most recent published version of your experience to the device's local cache. Rejects if `updates.enabled` is `false` in app.json.

#### Arguments

An optional `params` object with the following keys:

- **eventListener (_function_)** -- A callback to receive updates events. Will be called with the same events as a function passed into [`Updates.addListener`](#updatesaddlistenereventlistener) but will be subscribed and unsubscribed from events automatically.

#### Returns

An object with the following keys:

- **isNew (_boolean_)** -- True if the fetched bundle is new (i.e. a different version that the what's currently running).
- **manifest (_object_)** -- Manifest of the fetched update.

### `Updates.addListener(eventListener)`

Invokes a callback when updates-related events occur, either on the initial app load or as a result of a call to `Updates.fetchUpdateAsync`.

#### Arguments

- **eventListener (_function_)** -- A callback that is invoked with an updates event.

#### Returns

An [EventSubscription](#eventsubscription) object that you can call `remove()` on when you would like to unsubscribe from the listener.

### Related types

### `EventSubscription`

Returned from `addListener`.

- **remove() (_function_)** -- Unsubscribe the listener from future updates.

### `Event`

An object that is passed into each event listener when a new version is available.

- **type (_string_)** -- Type of the event (see [EventType](#eventtype)).
- **manifest (_object_)** -- If `type === Updates.EventType.DOWNLOAD_FINISHED`, the manifest of the newly downloaded update. Undefined otherwise.
- **message (_string_)** -- If `type === Updates.EventType.ERROR`, the error message. Undefined otherwise.

### `EventType`

- **`Updates.EventType.DOWNLOAD_STARTED`** -- A new update is available and has started downloading.
- **`Updates.EventType.DOWNLOAD_FINISHED`** -- A new update has finished downloading and is now stored in the device's cache.
- **`Updates.EventType.NO_UPDATE_AVAILABLE`** -- No updates are available, and the most up-to-date bundle of this experience is already running.
- **`Updates.EventType.ERROR`** -- An error occurred trying to fetch the latest update.
