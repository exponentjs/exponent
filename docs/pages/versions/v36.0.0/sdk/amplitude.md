---
title: Amplitude
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-36/packages/expo-analytics-amplitude'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

Provides access to [Amplitude](https://amplitude.com/) mobile analytics which basically lets you log various events to the Cloud. This module wraps Amplitude's [iOS](https://github.com/amplitude/Amplitude-iOS) and [Android](https://github.com/amplitude/Amplitude-Android) SDKs. For a great example of usage, see the [Expo app source code](https://github.com/expo/expo/blob/master/home/api/Analytics.ts).

**Please note:** Session tracking may not work correctly when running Experiences in the main Expo app. It will work correctly if you create a standalone app. For example, the version logged when running experiences in the Expo app will be the [Expo app version](constants.md#constantsexpoversion). Whereas in standalone apps, the version set in `app.json` is used. For more information see [this issue on GitHub](https://github.com/expo/expo/issues/4720).

<PlatformsSection android emulator ios simulator web={{ pending: 'https://github.com/expo/expo/issues/6886' }} />

## Installation

<InstallSection packageName="expo-analytics-amplitude" />

## API

```js
import * as Amplitude from 'expo-analytics-amplitude';
```

**[Methods](#methods)**

- [`Amplitude.initialize(apiKey)`](#amplitudeinitializeapikey)
- [`Amplitude.setUserId(userId)`](#amplitudesetuseriduserid)
- [`Amplitude.setUserProperties(userProperties)`](#amplitudesetuserpropertiesuserproperties)
- [`Amplitude.clearUserProperties()`](#amplitudeclearuserproperties)
- [`Amplitude.logEvent(eventName)`](#amplitudelogeventeventname)
- [`Amplitude.logEventWithProperties(eventName, properties)`](#amplitudelogeventwithpropertieseventname-properties)
- [`Amplitude.setGroup(groupType, groupNames)`](#amplitudesetgroupgrouptype-groupnames)

## Methods

### `Amplitude.initialize(apiKey)`

Initializes Amplitude with your Amplitude API key. If you're having trouble finding your API key, see [step 4 of these instructions](https://amplitude.zendesk.com/hc/en-us/articles/207108137-Introduction-Getting-Started#getting-started).

#### Arguments

- **apiKey (_string_)** -- Your Amplitude application's API key.

### `Amplitude.setUserId(userId)`

Assign a user ID to the current user. If you don't have a system for user IDs you don't need to call this. See [this page](https://amplitude.zendesk.com/hc/en-us/articles/206404628-Step-2-Assign-User-IDs-and-Identify-your-Users) for details.

#### Arguments

- **userId (_string_)** -- User ID for the current user.

### `Amplitude.setUserProperties(userProperties)`

Set properties for the current user. See [here for details](https://amplitude.zendesk.com/hc/en-us/articles/207108327-Step-4-Set-User-Properties-and-Event-Properties).

#### Arguments

- **userProperties (_object_)** -- A map of custom properties.

### `Amplitude.clearUserProperties()`

Clear properties set by [`Amplitude.setUserProperties()`](#amplitudeclearuserproperties 'Amplitude.setUserProperties').

### `Amplitude.logEvent(eventName)`

Log an event to Amplitude. For more information about what kind of events to track, [see here](https://amplitude.zendesk.com/hc/en-us/articles/206404698-Step-3-Track-Events-and-Understand-the-Actions-Users-Take).

#### Arguments

- **eventName (_string_)** -- The event name.

### `Amplitude.logEventWithProperties(eventName, properties)`

Log an event to Amplitude with custom properties. For more information about what kind of events to track, [see here](https://amplitude.zendesk.com/hc/en-us/articles/206404698-Step-3-Track-Events-and-Understand-the-Actions-Users-Take).

#### Arguments

- **eventName (_string_)** -- The event name.
- **properties (_object_)** -- A map of custom properties.

### `Amplitude.setGroup(groupType, groupNames)`

Add the current user to a group. For more information, see here for [iOS](https://github.com/amplitude/Amplitude-iOS#setting-groups) and see here for [Android](https://github.com/amplitude/Amplitude-Android#setting-groups).

#### Arguments

- **groupType (_string_)** -- The group name, e.g. "sports".
- **groupNames (_object_)** -- An array of group names, e.g. \["tennis", "soccer"]. Note: the iOS and Android Amplitude SDKs allow you to use a string or an array of strings. We only support an array of strings. Just use an array with one element if you only want one group name.

### `Amplitude.setTrackingOptions(trackingOptions)`

By default the Amplitude SDK will track several user properties such as carrier and city. You can use this method to customize and disable individual fields.

> **Note:** These configurations will prevent default properties from being tracked on newly created projects, where data has not yet been sent. Please contact platform@amplitude.com if you would like default properties blocked (moving forward) on projects with existing data.

#### Arguments

- **trackingOptions (object)** -- Options object for what should not be tracked. The table below describes what properties the object may contain. All properties are expected to be booleans. For example, passing `disableCarrier: true` disables tracking the device's carrier.

| Property                    | Description                                                                |
| --------------------------- | -------------------------------------------------------------------------- |
| `disableCarrier`            | Disable tracking of the device's carrier.                                  |
| `disableCity`               | Disable tracking of the user's city.                                       |
| `disableCountry`            | Disable tracking of the user's country.                                    |
| `disableDeviceManufacturer` | Disable tracking of the device manufacturer.                               |
| `disableDeviceModel`        | Disable tracking of the device model.                                      |
| `disableDMA`                | Disable tracking of the user's DMA.                                        |
| `disableIDFV`               | Disable tracking of the user's IDFV.                                       |
| `disableIPAddress`          | Disable tracking of the user's IP address.                                 |
| `disableLanguage`           | Disable tracking of the device's language.                                 |
| `disableLatLng`             | Disable tracking of the user's current latitude and longitude coordinates. |
| `disableOSName`             | Disable tracking of the device's OS name.                                  |
| `disableOSVersion`          | Disable tracking of the device's OS version.                               |
| `disablePlatform`           | Disable tracking of the device's platform.                                 |
| `disableRegion`             | Disable tracking of the user's region.                                     |
| `disableVersionName`        | Disable tracking of the app version the user is on for your app.           |
