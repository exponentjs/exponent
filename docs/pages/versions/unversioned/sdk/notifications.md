---
title: Notifications
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-notifications'
---

import SnackInline from '~/components/plugins/SnackInline';
import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

The **`expo-notifications`** provides an API to fetch push notification tokens and to present, schedule, receive and respond to notifications.

### Features

- 📣 schedule a one-off notification for a specific date, or some time from now,
- 🔁 schedule a notification repeating in some time interval (or a calendar date match on iOS),
- 1️⃣ get and set application badge icon number,
- 📲 fetch a native device push token so you can send push notifications with FCM and APNS,
- 😎 fetch an Expo push token so you can send push notifications with Expo,
- 📬 listen to incoming notifications,
- 👆 listen to interactions with notifications (tapping or dismissing),
- 🎛 handle notifications when the app is in foreground,
- 🔕 imperatively dismiss notifications from Notification Center/tray,
- 🗂 create, update, delete Android notification channels,
- 🎨 set custom icon and color for notifications on Android.

<PlatformsSection title="Push notifications Platform Compatibility" android ios web={{ pending: 'https://github.com/expo/expo/issues/6895' }} />

<PlatformsSection title="Local notifications Platform Compatibility" android emulator ios simulator web={{ pending: 'https://github.com/expo/expo/issues/6895' }} />

## Installation

<InstallSection packageName="expo-notifications" />

### Android

Open your `app.json` and add the following inside of the "expo" field:

```
{
  "expo": {
    ...
    "android": {
      ...
      "useNextNotificationsApi": true,
    }
  }
}
```

On Android, this module requires permission to subscribe to device boot. It's used to setup the scheduled notifications right after the device (re)starts. The `RECEIVE_BOOT_COMPLETED` permission is added automatically.

Unless you're still running your project in the Expo client, Firebase Cloud Messaging is required for all [managed](../../../push-notifications/sending-notifications.md) and [bare workflow](../../../push-notifications/sending-notifications-custom.md) Android apps made with Expo. To set up your Expo Android app to get push notifications using your own FCM credentials, [follow this guide closely](../../../push-notifications/using-fcm.md).

## Common gotchas / known issues

### Sending notifications directly through APNs and FCM

If you are not using [Expo's push notification service](../../../push-notifications/sending-notifications.md) and would instead like to communicate with Apple and Firebase directly, then you should read [this guide closely](../../../push-notifications/sending-notifications-custom.md), paying **special attention to the payload formats**, since providing different formats can result in unexpected behavior on both platforms.

### Fetching a push token takes a long time on iOS

`getDevicePushTokenAsync` and `getExpoPushTokenAsync` can sometimes take a long time to resolve on iOS. This is outside of `expo-notifications`'s control, as stated in Apple's [“Troubleshooting Push Notifications” technical note](https://developer.apple.com/library/archive/technotes/tn2265/_index.html):

> This is not necessarily an error condition. The system may not have Internet connectivity at all because it is out of range of any cell towers or Wi-Fi access points, or it may be in airplane mode. Instead of treating this as an error, your app should continue normally, disabling only that functionality that relies on push notifications.

As mentioned, the most common reasons for this this are either an invalid Internet connection (fetching a push token requires an Internet connection to register the device with the service provider) or an invalid configuration of your App ID or Provisioning Profile.

Here are a few ways people claim to have solved this problem, maybe one of these will help you solve it, too!

<details><summary><strong>Read the Apple's <a href="https://developer.apple.com/library/archive/technotes/tn2265/_index.html">Technical Note on troubleshooting push notifications</a></strong></summary> <p>

Go read the Apple's [Technical Note on troubleshooting push notifications](https://developer.apple.com/library/archive/technotes/tn2265/_index.html)! This the single most reliable source of information on this problem. To help you grasp what they're suggesting:

- Make sure the device has a reliable connection to the Internet (try turning off Wi-Fi or switching to another network, and disabling firewall block on port 5223, as suggested in [this SO answer](https://stackoverflow.com/a/34332047/1123156)).
- Make sure your app configuration is set properly for registering for push notifications (for bare workflow check out [this guide](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/AddingCapabilities/AddingCapabilities.html#//apple_ref/doc/uid/TP40012582-CH26-SW6), for managed workflow this is done automatically for you by `expo-cli`) as also suggested by [this StackOverflow answer](https://stackoverflow.com/a/10791240/1123156).
- If you're in bare workflow you may want to try to debug this even further by logging persistent connection debug information as outlined by [this StackOverflow answer](https://stackoverflow.com/a/8036052/1123156).

</p>
</details>

<details><summary><strong>Try again in a little while</strong></summary> <p>

- APNS servers near the device may be down as indicated by [this forum thread](https://developer.apple.com/forums/thread/52224). Take a walk and try again later!
- Try again in a few days time as suggested by [this GitHub comment](https://github.com/expo/expo/issues/10369#issuecomment-717872956).

</p>
</details>

<details><summary><strong>Disable network sharing on your device</strong></summary> <p>

You may need to disable network sharing as this may impact the registration as suggested by [this StackOverflow answer](https://stackoverflow.com/a/59156989/1123156).

</p>
</details>

<details><summary><strong>Restart your device</strong></summary> <p>

If you just changed the APNS servers where the app should be registering (by installing a TestFlight build over an Xcode build on the same device) you may need to restart your device as suggested by [this StackOverflow answer](https://stackoverflow.com/a/59864028/1123156).

</p>
</details>

<details><summary><strong>Setup your device with a SIM card</strong></summary> <p>

If the device you're experiencing this on hasn't been setup with a SIM card it looks like configuring it may help mitigate this bug as suggested by [this StackOverflow answer](https://stackoverflow.com/a/19432504/1123156).

</p>
</details>

### Setting custom notification sounds on Android

On Androids 8.0+, playing a custom sound for a notification requires more than setting the `sound` property on the `NotificationContentInput`. You will _also_ need to configure the `NotificationChannel` with the appropriate `sound`, and use it when sending/scheduling the notification.

```ts
import * as Notifications from 'expo-notifications';

// Prepare the notification channel
Notifications.setNotificationChannelAsync('new-emails', {
  name: 'E-mail notifications',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'email-sound.wav', // <- for Android 8.0+, see channelId property below
});

// Eg. schedule the notification
Notifications.scheduleNotificationAsync({
  content: {
    title: "You've got mail! 📬",
    body: 'Open the notification to read them all',
    sound: 'email-sound.wav', // <- for Android below 8.0
  },
  trigger: {
    seconds: 2,
    channelId: 'new-emails', // <- for Android 8.0+, see definition above
  },
});
```

## API

```js
import * as Notifications from 'expo-notifications';
```

The following methods are exported by the `expo-notifications` module:

- **fetching token for sending push notifications**
  - [`getExpoPushTokenAsync`](#getexpopushtokenasyncoptions-expotokenoptions-expopushtoken) -- resolves with an Expo push token
  - [`getDevicePushTokenAsync`](#getdevicepushtokenasync-devicepushtoken) -- resolves with a device push token
  - [`addPushTokenListener`](#addpushtokenlistenerlistener-pushtokenlistener-subscription) -- adds a listener called when a new push token is issued
  - [`removePushTokenSubscription`](#removepushtokensubscriptionsubscription-subscription-void) -- removes the listener registered with `addPushTokenListener`
- **listening to notification events**
  - [`useLastNotificationResponse`](#uselastnotificationresponse-undefined--notificationresponse--null) -- a React hook returning the most recently received notification response
  - [`addNotificationReceivedListener`](#addnotificationreceivedlistenerlistener-event-notification--void-void) -- adds a listener called whenever a new notification is received
  - [`addNotificationsDroppedListener`](#addnotificationsdroppedlistenerlistener---void-void) -- adds a listener called whenever some notifications have been dropped
  - [`addNotificationResponseReceivedListener`](#addnotificationresponsereceivedlistenerlistener-event-notificationresponse--void-void) -- adds a listener called whenever user interacts with a notification
  - [`removeNotificationSubscription`](#removenotificationsubscriptionsubscription-subscription-void) -- removes the listener registered with `addNotification*Listener()`
- **handling incoming notifications when the app is in foreground**
  - [`setNotificationHandler`](#setnotificationhandlerhandler-notificationhandler--null-void) -- sets the handler function responsible for deciding what to do with a notification that is received when the app is in foreground
- **fetching permissions information**
  - [`getPermissionsAsync`](#getpermissionsasync-promisenotificationpermissionsstatus) -- fetches current permission settings related to notifications
  - [`requestPermissionsAsync`](#requestpermissionsasyncrequest-notificationpermissionsrequest-promisenotificationpermissionsstatus) -- requests permissions related to notifications
- **managing application badge icon**
  - [`getBadgeCountAsync`](#getbadgecountasync-promisenumber) -- fetches the application badge number value
  - [`setBadgeCountAsync`](#setbadgecountasyncbadgecount-number-options-setbadgecountoptions-promiseboolean) -- sets the application badge number value
- **scheduling notifications**
  - [`getAllScheduledNotificationsAsync`](#getallschedulednotificationsasync-promisenotification) -- fetches information about all scheduled notifications
  - [`presentNotificationAsync`](#presentnotificationasynccontent-notificationcontentinput-identifier-string-promisestring) -- schedules a notification for immediate trigger
  - [`scheduleNotificationAsync`](#schedulenotificationasyncnotificationrequest-notificationrequestinput-promisestring) -- schedules a notification to be triggered in the future
  - [`cancelScheduledNotificationAsync`](#cancelschedulednotificationasyncidentifier-string-promisevoid) -- removes a specific scheduled notification
  - [`cancelAllScheduledNotificationsAsync`](#cancelallschedulednotificationsasync-promisevoid) -- removes all scheduled notifications
  - [`getNextTriggerDateAsync`](#getnexttriggerdateasynctrigger-schedulablenotificationtriggerinput-promisenumber--null) -- calculates next trigger date for a notification trigger
- **dismissing notifications**
  - [`getPresentedNotificationsAsync`](#getpresentednotificationsasync-promisenotification) -- fetches information about all notifications present in the notification tray (Notification Center)
  - [`dismissNotificationAsync`](#dismissnotificationasyncidentifier-string-promisevoid) -- removes a specific notification from the notification tray
  - [`dismissAllNotificationsAsync`](#dismissallnotificationsasync-promisevoid) -- removes all notifications from the notification tray
- **managing notification channels (Android-specific)**
  - [`getNotificationChannelsAsync`](#getnotificationchannelsasync-promisenotificationchannel) -- fetches information about all known notification channels
  - [`getNotificationChannelAsync`](#getnotificationchannelasyncidentifier-string-promisenotificationchannel--null) -- fetches information about a specific notification channel
  - [`setNotificationChannelAsync`](#setnotificationchannelasyncidentifier-string-channel-notificationchannelinput-promisenotificationchannel--null) -- saves a notification channel configuration
  - [`deleteNotificationChannelAsync`](#deletenotificationchannelasyncidentifier-string-promisevoid) -- deletes a notification channel
  - [`getNotificationChannelGroupsAsync`](#getnotificationchannelgroupsasync-promisenotificationchannelgroup) -- fetches information about all known notification channel groups
  - [`getNotificationChannelGroupAsync`](#getnotificationchannelgroupasyncidentifier-string-promisenotificationchannelgroup--null) -- fetches information about a specific notification channel group
  - [`setNotificationChannelGroupAsync`](#setnotificationchannelgroupasyncidentifier-string-channel-notificationchannelgroupinput-promisenotificationchannelgroup--null) -- saves a notification channel group configuration
  - [`deleteNotificationChannelGroupAsync`](#deletenotificationchannelgroupasyncidentifier-string-promisevoid) -- deletes a notification channel group
  - **managing notification categories (interactive notifications)**
  - [`setNotificationCategoryAsync`](#setnotificationcategoryasyncidentifier-string-actions-notificationaction-options-categoryoptions-promisenotificationcategory--null) -- creates a new notification category for interactive notifications
  - [`getNotificationCategoriesAsync`](#getnotificationcategoriesasync-promisenotificationcategory) -- fetches information about all active notification categories
  - [`deleteNotificationCategoryAsync`](#deletenotificationcategoryasyncidentifier-string-promiseboolean) -- deletes a notification category

Check out the Snack below to see Notifications in action, but be sure to use a physical device! Push notifications don't work on simulators/emulators.

<SnackInline label='Push Notifications' dependencies={['expo-constants', 'expo-permissions', 'expo-notifications']}>

```js
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
```

</SnackInline>

> **Note** this demo will not work with **remote** notifications (sent via the Expo Notifications service) on Android when you run it from the snack, because `app.json` needs to contain the `useNextNotificationsApi` flag. Unfortunately, Snack doesn't support custom `app.json` files.

## Custom notification icon and colors (Android only)

Setting a default icon and color for all of your app's notifications is almost too easy. In the managed workflow, just set your [`notification.icon`](../config/app.md#notification) and [`notification.color`](../config/app.md#notification) keys in `app.json`, and rebuild your app! In the bare workflow, you'll need to follow [these instructions](https://github.com/expo/expo/tree/master/packages/expo-notifications#configure-for-android).

For your notification icon, make sure you follow [Google's design guidelines](https://material.io/design/iconography/product-icons.html#design-principles) (the icon must be all white with a transparent background) or else it may not be displayed as intended.

In both the managed and bare workflow, you can also set a custom notification color _per-notification_ directly in your [`NotificationContentInput`](#notificationcontentinput) under the `color` attribute.

## Android push notification payload specification

When sending a push notification, put an object conforming to the following type as `data` of the notification:

```ts
export interface FirebaseData {
  title?: string;
  message?: string;
  subtitle?: string;
  sound?: boolean | string;
  vibrate?: boolean | number[];
  priority?: AndroidNotificationPriority;
  badge?: number;
}
```

## Fetching tokens for push notifications

### `getExpoPushTokenAsync(options: ExpoTokenOptions): ExpoPushToken`

Returns an Expo token that can be used to send a push notification to this device using Expo push notifications service. [Read more in the Push Notifications guide](../../../push-notifications/overview.md).

> **Note:** For Expo's backend to be able to send notifications to your app, you will need to provide it with push notification keys. This can be done using `expo-cli` (`expo credentials:manager`). [Read more in the “Upload notifications credentials” guide](../../../push-notifications/push-notifications-setup.md#credentials).

#### Arguments

This function accepts an optional object allowing you to pass in configuration, consisting of fields (all are optional, but some may have to be defined if configuration cannot be inferred):

- **experienceId (_string_)** -- The ID of the experience to which the token should be attributed. Defaults to [`Constants.manifest.id`](https://docs.expo.io/versions/latest/sdk/constants/#constantsmanifest) exposed by `expo-constants`. In the bare workflow, you must provide a value which takes the shape `@username/projectSlug`, where `username` is the Expo account that the project is associated with, and `projectSlug` is your [`slug` from `app.json`](../config/app.md#slug).
- **devicePushToken ([_DevicePushToken_](#devicepushtoken))** -- The device push token with which to register at the backend. Defaults to a token fetched with [`getDevicePushTokenAsync()`](#getdevicepushtokenasync-devicepushtoken).
- **applicationId (_string_)** -- The ID of the application to which the token should be attributed. Defaults to [`Application.applicationId`](https://docs.expo.io/versions/latest/sdk/application/#applicationapplicationid) exposed by `expo-application`.
- **development (_boolean_)** -- Makes sense only on iOS, where there are two push notification services: sandbox and production. This defines whether the push token is supposed to be used with the sandbox platform notification service. Defaults to [`Application.getIosPushNotificationServiceEnvironmentAsync()`](https://docs.expo.io/versions/latest/sdk/application/#applicationgetiospushnotificationserviceenvironmentasync) exposed by `expo-application` or `false`. Most probably you won't need to customize that. You may want to customize that if you don't want to install `expo-application` and still use the sandbox APNS.

#### Returns

Returns a `Promise` that resolves to an object with the following fields:

- **type (_string_)** -- Always `expo`.
- **data (_string_)** -- The push token as a string.

#### Examples

##### Fetching the Expo push token and uploading it to a server

```ts
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync(userId: string) {
  let experienceId = undefined;
  if (!Constants.manifest) {
    // Absence of the manifest means we're in bare workflow
    experienceId = '@username/example';
  }
  const expoPushToken = await Notifications.getExpoPushTokenAsync({
    experienceId,
  });
  await fetch('https://example.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      expoPushToken,
    }),
  });
}
```

### `getDevicePushTokenAsync(): DevicePushToken`

Returns a native APNS, FCM token or a [`PushSubscription` data](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription) that can be used with another push notification service.

#### Returns

A `Promise` that resolves to an object with the following fields:

- **type (_string_)** -- Either `ios`, `android` or `web`.
- **data (_string_ or _object_)** -- Either the push token as a string (for `type == "ios" | "android"`) or an object conforming to the type below (for `type == "web"`):
  ```ts
  {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    }
  }
  ```

### `addPushTokenListener(listener: PushTokenListener): Subscription`

In rare situations a push token may be changed by the push notification service while the app is running. When a token is rolled, the old one becomes invalid and sending notifications to it will fail. A push token listener will let you handle this situation gracefully by registering the new token with your backend right away.

#### Arguments

A single and required argument is a function accepting a push token as an argument. It will be called whenever the push token changes.

#### Returns

A [`Subscription`](#subscription) object representing the subscription of the provided listener.

#### Examples

Registering a push token listener using a React hook

```tsx
import React from 'react';
import * as Notifications from 'expo-notifications';

import { registerDevicePushTokenAsync } from '../api';

export default function App() {
  React.useEffect(() => {
    const subscription = Notifications.addPushTokenListener(registerDevicePushTokenAsync);
    return () => subscription.remove();
  }, []);

  return (
    // Your app content
  );
}
```

### `removePushTokenSubscription(subscription: Subscription): void`

Removes a push token subscription returned by a `addPushTokenListener` call.

#### Arguments

A single and required argument is a subscription returned by `addPushTokenListener`.

## Listening to notification events

### `useLastNotificationResponse(): undefined | NotificationResponse | null`

A React hook always returning the notification response that was received most recently (a notification response designates an interaction with a notification, such as tapping on it).

#### Returns

The hook may return one of these three types/values:

- `undefined` -- until we're sure of what to return
- `null` -- if no notification response has been received yet
- a [`NotificationResponse`](#notificationresponse) object -- if a notification response was received

#### Examples

Responding to a notification tap by opening a URL that could be put into the notification's `data` (opening the URL is your responsibility and is not a part of the `expo-notifications` API):

```ts
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

export default function App() {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  React.useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data.url &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      Linking.openURL(lastNotificationResponse.notification.request.content.data.url);
    }
  }, [lastNotificationResponse]);

  return (
    /*
     * your app
     */
  );
}
```

### `addNotificationReceivedListener(listener: (event: Notification) => void): void`

Listeners registered by this method will be called whenever a notification is received while the app is running.

#### Arguments

A single and required argument is a function accepting a notification ([`Notification`](#notification)) as an argument.

#### Returns

A [`Subscription`](#subscription) object representing the subscription of the provided listener.

#### Examples

Registering a notification listener using a React hook

```tsx
import React from 'react';
import * as Notifications from 'expo-notifications';

export default function App() {
  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });
    return () => subscription.remove();
  }, []);

  return (
    // Your app content
  );
}
```

### `addNotificationsDroppedListener(listener: () => void): void`

Listeners registered by this method will be called whenever some notifications have been dropped by the server. Applicable only to Firebase Cloud Messaging which we use as notifications service on Android. It corresponds to `onDeletedMessages()` callback. [More information can be found in Firebase docs](https://firebase.google.com/docs/cloud-messaging/android/receive#override-ondeletedmessages).

#### Arguments

A single and required argument is a function–callback.

#### Returns

A [`Subscription`](#subscription) object representing the subscription of the provided listener.

### `addNotificationResponseReceivedListener(listener: (event: NotificationResponse) => void): void`

Listeners registered by this method will be called whenever a user interacts with a notification (eg. taps on it).

#### Arguments

A single and required argument is a function accepting notification response ([`NotificationResponse`](#notificationresponse)) as an argument.

#### Returns

A [`Subscription`](#subscription) object representing the subscription of the provided listener.

#### Examples

##### Registering a notification listener using a React hook

```tsx
import React from 'react';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function Container() {
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data.url;
      Linking.openURL(url);
    });
    return () => subscription.remove();
  }, []);

  return (
    // Your app content
  );
}
```

##### Handling push notifications with React Navigation

If you'd like to deep link to a specific screen in your app when you receive a push notification, you can configure React Navigation's [linking](https://reactnavigation.org/docs/navigation-container#linking) prop to do that:

```tsx
import React from 'react';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer
      linking={{
        config: {
          // Configuration for linking
        },
        subscribe(listener) {
          const onReceiveURL = ({ url }: { url: string }) => listener(url);

          // Listen to incoming links from deep linking
          Linking.addEventListener('url', onReceiveURL);

          // Listen to expo push notifications
          const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const url = response.notification.request.content.data.url;

            // Any custom logic to see whether the URL needs to be handled
            //...

            // Let React Navigation handle the URL
            listener(url);
          });

          return () => {
            // Clean up the event listeners
            Linking.removeEventListener('url', onReceiveURL);
            subscription.remove();
          };
        },
      }}>
      {/* Your app content */}
    </NavigationContainer>
  );
}
```

See more details on [React Navigation documentation](https://reactnavigation.org/docs/deep-linking/#third-party-integrations).

### `removeNotificationSubscription(subscription: Subscription): void`

Removes a notification subscription returned by a `addNotification*Listener` call.

#### Arguments

A single and required argument is a subscription returned by `addNotification*Listener`.

## Handling incoming notifications when the app is in foreground

### `setNotificationHandler(handler: NotificationHandler | null): void`

When a notification is received while the app is running, using this function you can set a callback that will decide whether the notification should be shown to the user or not.

When a notification is received, `handleNotification` is called with the incoming notification as an argument. The function should respond with a behavior object within 3 seconds, otherwise the notification will be discarded. If the notification is handled successfully, `handleSuccess` is called with the identifier of the notification, otherwise (or on timeout) `handleError` will be called.

The default behavior when the handler is not set or does not respond in time is not to show the notification.

#### Arguments

The function receives a single argument which should be either `null` (if you want to clear the handler) or an object of fields:

- **handleNotification (_(Notification) =\> Promise\<NotificationBehavior\>_)** -- (required) a function accepting an incoming notification returning a `Promise` resolving to a behavior ([`NotificationBehavior`](#notificationbehavior)) applicable to the notification
- **handleSuccess (_(notificationId: string) =\> void_)** -- (optional) a function called whenever an incoming notification is handled successfully
- **handleError (_(error: Error) =\> void_)** -- (optional) a function called whenever handling of an incoming notification fails

#### Examples

Implementing a notification handler that always shows the notification when it is received

```ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

## Fetching information about notifications-related permissions

### `getPermissionsAsync(): Promise<NotificationPermissionsStatus>`

Calling this function checks current permissions settings related to notifications. It lets you verify whether the app is currently allowed to display alerts, play sounds, etc. There is no user-facing effect of calling this.

#### Returns

It returns a `Promise` resolving to an object representing permission settings (`NotificationPermissionsStatus`).

#### Examples

Check if the app is allowed to send any type of notifications (interrupting and non-interrupting–provisional on iOS)

```ts
import * as Notifications from 'expo-notifications';

export async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
```

### `requestPermissionsAsync(request?: NotificationPermissionsRequest): Promise<NotificationPermissionsStatus>`

Prompts the user for notification permissions according to request. **Request defaults to asking the user to allow displaying alerts, setting badge count and playing sounds**.

#### Arguments

An optional object of conforming to the following interface:

```ts
{
  android?: {};
  ios?: {
    allowAlert?: boolean;
    allowBadge?: boolean;
    allowSound?: boolean;
    allowDisplayInCarPlay?: boolean;
    allowCriticalAlerts?: boolean;
    provideAppNotificationSettings?: boolean;
    allowProvisional?: boolean;
    allowAnnouncements?: boolean;
  }
}
```

Each option corresponds to a different native platform authorization option (a list of iOS options is available [here](https://developer.apple.com/documentation/usernotifications/unauthorizationoptions), on Android all available permissions are granted by default and if a user declines any permission an app can't prompt the user to change).

#### Returns

It returns a `Promise` resolving to an object representing permission settings (`NotificationPermissionsStatus`).

#### Examples

Prompts the user to allow the app to show alerts, play sounds, set badge count and let Siri read out messages through AirPods

```ts
import * as Notifications from 'expo-notifications';

export function requestPermissionsAsync() {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
}
```

## Managing application badge icon

### `getBadgeCountAsync(): Promise<number>`

Fetches the number currently set as the badge of the app icon on device's home screen. A `0` value means that the badge is not displayed.

> **Note:** Not all Android launchers support application badges. If the launcher does not support icon badges, the method will always resolve to `0`.

#### Returns

It returns a `Promise` resolving to a number representing current badge of the app icon.

### `setBadgeCountAsync(badgeCount: number, options?: SetBadgeCountOptions): Promise<boolean>`

Sets the badge of the app's icon to the specified number. Setting to `0` clears the badge.

> **Note:** Not all Android launchers support application badges. If the launcher does not support icon badges, the method will resolve to `false`.

#### Arguments

The function accepts a number as the first argument. A value of `0` will clear the badge.

As a second, optional argument you can pass in an object of options configuring behavior applied in Web environment. The object should be of format:

```ts
{
  web?: badgin.Options
}
```

where the type `badgin.Options` is an object described [in the `badgin`'s documentation](https://github.com/jaulz/badgin#options).

#### Returns

It returns a `Promise` resolving to a boolean representing whether setting of the badge succeeded.

## Scheduling notifications

### `getAllScheduledNotificationsAsync(): Promise<Notification[]>`

Fetches information about all scheduled notifications.

#### Returns

It returns a `Promise` resolving to an array of objects conforming to the [`Notification`](#notification) interface.

### `presentNotificationAsync(content: NotificationContentInput, identifier?: string): Promise<string>`

Schedules a notification for immediate trigger.

> **Note:** This method has been deprecated in favor of using an explicit `NotificationHandler` and the `scheduleNotificationAsync` method. More info may be found at https://expo.fyi/presenting-notifications-deprecated.

#### Arguments

The only argument to this function is a [`NotificationContentInput`](#notificationcontentinput).

#### Returns

It returns a `Promise` resolving with the notification's identifier once the notification is successfully scheduled for immediate display.

#### Examples

##### Presenting the notification to the user (deprecated way)

```ts
import * as Notifications from 'expo-notifications';

Notifications.presentNotificationAsync({
  title: 'Look at that notification',
  body: "I'm so proud of myself!",
});
```

##### Presenting the notification to the user (recommended way)

```ts
import * as Notifications from 'expo-notifications';

// First, set the handler that will cause the notification
// to show the alert

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Second, call the method

Notifications.scheduleNotificationAsync({
  content: {
    title: 'Look at that notification',
    body: "I'm so proud of myself!",
  },
  trigger: null,
});
```

### `scheduleNotificationAsync(notificationRequest: NotificationRequestInput): Promise<string>`

Schedules a notification to be triggered in the future.

> **Note:** Please note that this does not mean that the notification will be presented when it is triggered. For the notification to be presented you have to set a notification handler with [`setNotificationHandler`](#setnotificationhandlerhandler-notificationhandler--null-void) that will return an appropriate notification behavior. For more information see the example below.

#### Arguments

The one and only argument to this method is a [`NotificationRequestInput`](#notificationrequestinput) describing the notification to be triggered.

#### Returns

It returns a `Promise` resolving to a string --- a notification identifier you can later use to cancel the notification or to identify an incoming notification.

#### Examples

##### Scheduling the notification that will trigger once, in one minute from now

```ts
import * as Notifications from 'expo-notifications';

Notifications.scheduleNotificationAsync({
  content: {
    title: "Time's up!",
    body: 'Change sides!',
  },
  trigger: {
    seconds: 60,
  },
});
```

##### Scheduling the notification that will trigger repeatedly, every 20 minutes

```ts
import * as Notifications from 'expo-notifications';

Notifications.scheduleNotificationAsync({
  content: {
    title: 'Remember to drink water!,
  },
  trigger: {
    seconds: 60 * 20,
    repeats: true
  },
});
```

##### Scheduling the notification that will trigger once, at the beginning of next hour

```ts
import * as Notifications from 'expo-notifications';

const trigger = new Date(Date.now() + 60 * 60 * 1000);
trigger.setMinutes(0);
trigger.setSeconds(0);

Notifications.scheduleNotificationAsync({
  content: {
    title: 'Happy new hour!',
  },
  trigger,
});
```

### `cancelScheduledNotificationAsync(identifier: string): Promise<void>`

Cancels a single scheduled notification. The scheduled notification of given ID will not trigger.

#### Arguments

The notification identifier with which `scheduleNotificationAsync` resolved when the notification has been scheduled.

#### Returns

A `Promise` resolving once the scheduled notification is successfully cancelled or if there is no scheduled notification for given identifier.

#### Examples

##### Scheduling and then canceling the notification

```ts
import * as Notifications from 'expo-notifications';

async function scheduleAndCancel() {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hey!',
    },
    trigger: { seconds: 5, repeats: true },
  });
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
```

### `cancelAllScheduledNotificationsAsync(): Promise<void>`

Cancels all scheduled notifications.

#### Returns

A `Promise` resolving once all the scheduled notifications are successfully cancelled or if there are no scheduled notifications.

### `getNextTriggerDateAsync(trigger: SchedulableNotificationTriggerInput): Promise<number | null>`

Allows you to check what will be the next trigger date for given notification trigger input.

#### Arguments

The schedulable notification trigger you would like to check next trigger date for (of type [`SchedulableNotificationTriggerInput`](#schedulablenotificationtriggerinput)).

#### Returns

If the return value is `null`, the notification won't be triggered. Otherwise, the return value is the Unix timestamp in milliseconds at which the notification will be triggered.

#### Examples

##### Calculating next trigger date for a notification trigger

```ts
import * as Notifications from 'expo-notifications';

async function logNextTriggerDate() {
  try {
    const nextTriggerDate = await Notifications.getNextTriggerDateAsync({
      hour: 9,
      minute: 0,
    });
    console.log(nextTriggerDate === null ? 'No next trigger date' : new Date(nextTriggerDate));
  } catch (e) {
    console.warn(`Couldn't have calculated next trigger date: ${e}`);
  }
}
```

## Dismissing notifications

### `getPresentedNotificationsAsync(): Promise<Notification[]>`

Fetches information about all notifications present in the notification tray (Notification Center).

> **Note:** This method is not supported on Android below 6.0 (API level 23) – on these devices it will resolve to an empty array.

#### Returns

A `Promise` resolving with a list of notifications ([`Notification`](#notification)) currently present in the notification tray (Notification Center).

### `dismissNotificationAsync(identifier: string): Promise<void>`

Removes notification displayed in the notification tray (Notification Center).

#### Arguments

The first and only argument to the function is the notification identifier, obtained either in `setNotificationHandler` or in the listener added with `addNotificationReceivedListener`.

#### Returns

Resolves once the request to dismiss the notification is successfully dispatched to the notifications manager.

### `dismissAllNotificationsAsync(): Promise<void>`

Removes all application's notifications displayed in the notification tray (Notification Center).

#### Returns

Resolves once the request to dismiss the notifications is successfully dispatched to the notifications manager.

## Managing notification channels (Android-specific)

> Starting in Android 8.0 (API level 26), all notifications must be assigned to a channel. For each channel, you can set the visual and auditory behavior that is applied to all notifications in that channel. Then, users can change these settings and decide which notification channels from your app should be intrusive or visible at all. [(source: developer.android.com)](https://developer.android.com/training/notify-user/channels)

If you do not specify a notification channel, `expo-notifications` will create a fallback channel for you, named _Miscellaneous_. We encourage you to always ensure appropriate channels with informative names are set up for the application and to always send notifications to these channels.

Calling these methods is a no-op for platforms that do not support this feature (iOS, Web and Android below version 8.0 (26)).

### `getNotificationChannelsAsync(): Promise<NotificationChannel[]>`

Fetches information about all known notification channels.

#### Returns

A `Promise` resolving to an array of channels. On platforms that do not support notification channels, it will always resolve to an empty array.

### `getNotificationChannelAsync(identifier: string): Promise<NotificationChannel | null>`

Fetches information about a single notification channel.

#### Arguments

The only argument to this method is the channel's identifier.

#### Returns

A `Promise` resolving to the channel object (of type [`NotificationChannel`](#notificationchannel)) or to `null` if there was no channel found for this identifier. On platforms that do not support notification channels, it will always resolve to `null`.

### `setNotificationChannelAsync(identifier: string, channel: NotificationChannelInput): Promise<NotificationChannel | null>`

Assigns the channel configuration to a channel of a specified name (creating it if need be). This method lets you assign given notification channel to a notification channel group.

> **Note:** For some settings to be applied on all Android versions, it may be necessary to duplicate the configuration across both a single notification _and_ it's respective notification channel. For example, for a notification to play a custom sound on Android versions **below** 8.0, the custom notification sound has to be set on the notification (through the [`NotificationContentInput`](#notificationcontentinput)), and for the custom sound to play on Android versions **above** 8.0, the relevant notification channel must have the custom sound configured (through the [`NotificationChannelInput`](#notificationchannelinput)). For more information, see ["Setting custom notification sounds on Android"](#setting-custom-notification-sounds-on-android).

#### Arguments

First argument to the method is the channel identifier.

Second argument is the channel's configuration of type [`NotificationChannelInput`](#notificationchannelinput)

#### Returns

A `Promise` resolving to the object (of type [`NotificationChannel`](#notificationchannel)) describing the modified channel or to `null` if the platform does not support notification channels.

### `deleteNotificationChannelAsync(identifier: string): Promise<void>`

Removes the notification channel.

#### Arguments

First and only argument to the method is the channel identifier.

#### Returns

A `Promise` resolving once the channel is removed (or if there was no channel for given identifier).

### `getNotificationChannelGroupsAsync(): Promise<NotificationChannelGroup[]>`

Fetches information about all known notification channel groups.

#### Returns

A `Promise` resolving to an array of channel groups. On platforms that do not support notification channel groups, it will always resolve to an empty array.

### `getNotificationChannelGroupAsync(identifier: string): Promise<NotificationChannelGroup | null>`

Fetches information about a single notification channel group.

#### Arguments

The only argument to this method is the channel group's identifier.

#### Returns

A `Promise` resolving to the channel group object (of type [`NotificationChannelGroup`](#notificationchannelgroup)) or to `null` if there was no channel group found for this identifier. On platforms that do not support notification channels, it will always resolve to `null`.

### `setNotificationChannelGroupAsync(identifier: string, channel: NotificationChannelGroupInput): Promise<NotificationChannelGroup | null>`

Assigns the channel group configuration to a channel group of a specified name (creating it if need be).

#### Arguments

First argument to the method is the channel group identifier.

Second argument is the channel group's configuration of type [`NotificationChannelGroupInput`](#notificationchannelgroupinput)

#### Returns

A `Promise` resolving to the object (of type [`NotificationChannelGroup`](#notificationchannelgroup)) describing the modified channel group or to `null` if the platform does not support notification channels.

### `deleteNotificationChannelGroupAsync(identifier: string): Promise<void>`

Removes the notification channel group and all notification channels that belong to it.

#### Arguments

First and only argument to the method is the channel group identifier.

#### Returns

A `Promise` resolving once the channel group is removed (or if there was no channel group for given identifier).

## Managing notification categories (interactive notifications)

Notification categories allow you to create interactive push notifications, so that a user can respond directly to the incoming notification either via buttons or a text response. A category defines the set of actions a user can take, and then those actions are applied to a notification by specifying the `categoryIdentifier` in the [`NotificationContent`](#notificationcontent).

<img width="50%" src="/static/images/sdk/notifications/categories.png" style={{width: 800}} alt="image of notification categories on iOS and Android"/>

On iOS, notification categories also allow you to customize your notifications further. With each category, not only can you set interactive actions a user can take, but you can also configure things like the placeholder text to display when the user disables notification previews for your app.

Calling one of the following methods is a no-op on Web.

### `setNotificationCategoryAsync(identifier: string, actions: NotificationAction[], options: CategoryOptions): Promise<NotificationCategory | null>`

#### Arguments

- `identifier`: A string to associate as the ID of this category. You will pass this string in as the `categoryIdentifier` in your [`NotificationContent`](#notificationcontent) to associate a notification with this category. **Don't use the characters `:` or `-` in your category identifier. If you do, categories might not work as expected.**
- `actions`: An array of [`NotificationAction`s](#notificationaction), which describe the actions associated with this category. Each of these actions takes the shape:
  - `identifier`: A unique string that identifies this action. If a user takes this action (i.e. selects this button in the system's Notification UI), your app will receive this `actionIdentifier` via the [`NotificationResponseReceivedListener`](#addnotificationresponsereceivedlistenerlistener-event-notificationresponse--void-void).
  - `buttonTitle`: The title of the button triggering this action.
  - `textInput`: **Optional** object which, if provided, will result in a button that prompts the user for a text response.
    - `submitButtonTitle`: (**iOS only**) A string which will be used as the title for the button used for submitting the text response.
    - `placeholder`: A string that serves as a placeholder until the user begins typing. Defaults to no placeholder string.
  - `options`: **Optional** object of additional configuration options.
    - `opensAppToForeground`: Boolean indicating whether triggering this action foregrounds the app (defaults to `true`). If `false` and your app is killed (not just backgrounded), [`NotificationResponseReceived` listeners](#addnotificationresponsereceivedlistenerlistener-event-notificationresponse--void-void) will not be triggered when a user selects this action.
    - `isAuthenticationRequired`: (**iOS only**) Boolean indicating whether triggering the action will require authentication from the user.
    - `isDestructive`: (**iOS only**) Boolean indicating whether the button title will be highlighted a different color (usually red). This usually signifies a destructive action such as deleting data.
- `options`: An optional object of additional configuration options for your category (**these are all iOS only**):
  - `previewPlaceholder`: Customizable placeholder for the notification preview text. This is shown if the user has disabled notification previews for the app. Defaults to the localized iOS system default placeholder (`Notification`).
  - `intentIdentifiers`: Array of [Intent Class Identifiers](https://developer.apple.com/documentation/sirikit/intent_class_identifiers). When a notification is delivered, the presence of an intent identifier lets the system know that the notification is potentially related to the handling of a request made through Siri. Defaults to an empty array.
  - `categorySummaryFormat`: A format string for the summary description used when the system groups the category’s notifications.
  - `customDismissAction`: A boolean indicating whether to send actions for handling when the notification is dismissed (the user must explicitly dismiss the notification interface- ignoring a notification or flicking away a notification banner does not trigger this action). Defaults to `false`.
  - `allowInCarPlay`: A boolean indicating whether to allow CarPlay to display notifications of this type. **Apps must be approved for CarPlay to make use of this feature.** Defaults to `false`.
  - `showTitle`: A boolean indicating whether to show the notification's title, even if the user has disabled notification previews for the app. Defaults to `false`.
  - `showSubtitle`: A boolean indicating whether to show the notification's subtitle, even if the user has disabled notification previews for the app. Defaults to `false`.
  - `allowAnnouncement`: A boolean indicating whether to allow notifications to be automatically read by Siri when the user is using AirPods. Defaults to `false`.

#### Returns

A `Promise` resolving to the category you just created.

### `getNotificationCategoriesAsync(): Promise<NotificationCategory[]>`

Fetches information about all known notification categories.

#### Returns

A `Promise` resolving to an array of `NotificationCategory`s. On platforms that do not support notification channels, it will always resolve to an empty array.

### `deleteNotificationCategoryAsync(identifier: string): Promise<boolean>`

Deletes the category associated with the provided identifier.

#### Arguments

Identifier initially provided to `setNotificationCategoryAsync` when creating the category.

#### Returns

A `Promise` resolving to `true` if the category was successfully deleted, or `false` if it was not. An example of when this method would return `false` is if you try to delete a category that doesn't exist.

## Types

### `DevicePushToken`

In simple terms, an object of `type: Platform.OS` and `data: any`. The `data` type depends on the environment -- on a native device it will be a string, which you can then use to send notifications via Firebase Cloud Messaging (Android) or APNS (iOS); on web it will be a registration object (VAPID).

```ts
export interface NativeDevicePushToken {
  type: 'ios' | 'android';
  data: string;
}

export interface WebDevicePushToken {
  type: 'web';
  data: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

export type DevicePushToken = NativeDevicePushToken | WebDevicePushToken;
```

### `PushTokenListener`

A function accepting a device push token ([`DevicePushToken`](#devicepushtoken)) as an argument.

> **Note:** You should not call `getDevicePushTokenAsync` inside this function, as it triggers the listener and may lead to an infinite loop.

### `ExpoPushToken`

Borrowing from `DevicePushToken` a little bit, it's an object of `type: 'expo'` and `data: string`. You can use the `data` value to send notifications via Expo Notifications service.

```ts
export interface ExpoPushToken {
  type: 'expo';
  data: string;
}
```

### `Subscription`

A common-in-React-Native type to abstract an active subscription. Call `.remove()` to remove the subscription. You can then discard the object.

```ts
export type Subscription = {
  remove: () => void;
};
```

### `Notification`

An object representing a single notification that has been triggered by some request ([`NotificationRequest`](#notificationrequest)) at some point in time.

```ts
export interface Notification {
  date: number;
  request: NotificationRequest;
}
```

### `NotificationRequest`

An object representing a request to present a notification. It has content — how it's being represented — and a trigger — what triggers the notification. Many notifications ([`Notification`](#notification)) may be triggered with the same request (eg. a repeating notification).

```ts
export interface NotificationRequest {
  identifier: string;
  content: NotificationContent;
  trigger: NotificationTrigger;
}
```

### `NotificationContent`

An object representing notification's content.

```ts
export type NotificationContent = {
  // Notification title - the bold text displayed above the rest of the content
  title: string | null;
  // On iOS - subtitle - the bold text displayed between title and the rest of the content
  // On Android - subText - the display depends on the platform
  subtitle: string | null;
  // Notification body - the main content of the notification
  body: string | null;
  // Data associated with the notification, not displayed
  data: { [key: string]: unknown };
  // Application badge number associated with the notification
  badge: number | null;
  sound: 'default' | 'defaultCritical' | 'custom' | null;
} & (
  | {
      // iOS-specific additions
      // See https://developer.apple.com/documentation/usernotifications/unnotificationcontent?language=objc
      // for more information on specific fields.
      launchImageName: string | null;
      attachments: {
        identifier: string | null;
        url: string | null;
        type: string | null;
      }[];
      summaryArgument?: string | null;
      summaryArgumentCount?: number;
      categoryIdentifier: string | null;
      threadIdentifier: string | null;
      targetContentIdentifier?: string;
    }
  | {
      // Android-specific additions
      // See https://developer.android.com/reference/android/app/Notification.html#fields
      // for more information on specific fields.
      priority?: AndroidNotificationPriority;
      vibrationPattern?: number[];
      // Format: '#AARRGGBB'
      color?: string;
    }
);
```

### `NotificationContentInput`

An object representing notification content that you pass in to `presentNotificationAsync` or as a part of `NotificationRequestInput`.

```ts
export interface NotificationContentInput {
  // Fields corresponding to NotificationContent
  title?: string;
  subtitle?: string;
  body?: string;
  data?: { [key: string]: unknown };
  badge?: number;
  sound?: boolean | string;

  // Android-specific fields
  // See https://developer.android.com/reference/android/app/Notification.html#fields
  // for more information on specific fields.
  vibrate?: boolean | number[];
  priority?: AndroidNotificationPriority;
  // Format: '#AARRGGBB', '#RRGGBB' or one of the named colors,
  // see https://developer.android.com/reference/kotlin/android/graphics/Color?hl=en
  color?: string;
  // If set to false, the notification will not be automatically dismissed when clicked.
  // The setting used when the value is not provided or is invalid is true (the notification
  // will be dismissed automatically). Corresponds directly to Android's `setAutoCancel`
  // behavior. In Firebase terms this property of a notification is called `sticky`.
  // See:
  // - https://developer.android.com/reference/android/app/Notification.Builder#setAutoCancel(boolean),
  // - https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#AndroidNotification.FIELDS.sticky
  autoDismiss?: boolean;
  // If set to true, the notification cannot be dismissed by swipe. This setting defaults
  // to false if not provided or is invalid. Corresponds directly do Android's `isOngoing` behavior.
  // See: https://developer.android.com/reference/android/app/Notification.Builder#setOngoing(boolean)
  sticky?: boolean;

  // iOS-specific fields
  // See https://developer.apple.com/documentation/usernotifications/unmutablenotificationcontent?language=objc
  // for more information on specific fields.
  launchImageName?: string;
  attachments?: {
    url: string;
    identifier?: string;

    typeHint?: string;
    hideThumbnail?: boolean;
    thumbnailClipArea?: { x: number; y: number; width: number; height: number };
    thumbnailTime?: number;
  }[];
}
```

### `NotificationRequestInput`

An object representing a notification request you can pass into `scheduleNotificationAsync`.

```ts
export interface NotificationRequestInput {
  identifier?: string;
  content: NotificationContentInput;
  trigger: NotificationTriggerInput;
}
```

### `AndroidNotificationPriority`

An enum corresponding to values appropriate for Android's [`Notification#priority`](https://developer.android.com/reference/android/app/Notification#priority) field.

```ts
export enum AndroidNotificationPriority {
  MIN = 'min',
  LOW = 'low',
  DEFAULT = 'default',
  HIGH = 'high',
  MAX = 'max',
}
```

### `NotificationTrigger`

A union type containing different triggers which may cause the notification to be delivered to the application.

```ts
export type NotificationTrigger =
  | PushNotificationTrigger
  | CalendarNotificationTrigger
  | LocationNotificationTrigger
  | TimeIntervalNotificationTrigger
  | DailyNotificationTrigger
  | UnknownNotificationTrigger;
```

### `PushNotificationTrigger`

An object representing a notification delivered by a push notification system.

On Android under `remoteMessage` field a JS version of the Firebase `RemoteMessage` may be accessed. On iOS under `payload` you may find full contents of [`UNNotificationContent`'s](https://developer.apple.com/documentation/usernotifications/unnotificationcontent?language=objc) [`userInfo`](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/1649869-userinfo?language=objc), i.e. [remote notification payload](https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CreatingtheNotificationPayload.html)

```ts
export type PushNotificationTrigger = { type: 'push' } & (
  | { payload: Record<string, unknown> } // iOS
  | { remoteMessage: FirebaseRemoteMessage } // Android
  | {}
);
```

### `FirebaseRemoteMessage`

A Firebase `RemoteMessage` that caused the notification to be delivered to the app.

```ts
export interface FirebaseRemoteMessage {
  collapseKey: string | null;
  data: { [key: string]: string };
  from: string | null;
  messageId: string | null;
  messageType: string | null;
  originalPriority: number;
  priority: number;
  sentTime: number;
  to: string | null;
  ttl: number;
  notification: null | {
    body: string | null;
    bodyLocalizationArgs: string[] | null;
    bodyLocalizationKey: string | null;
    channelId: string | null;
    clickAction: string | null;
    color: string | null;
    usesDefaultLightSettings: boolean;
    usesDefaultSound: boolean;
    usesDefaultVibrateSettings: boolean;
    eventTime: number | null;
    icon: string | null;
    imageUrl: string | null;
    lightSettings: number[] | null;
    link: string | null;
    localOnly: boolean;
    notificationCount: number | null;
    notificationPriority: number | null;
    sound: string | null;
    sticky: boolean;
    tag: string | null;
    ticker: string | null;
    title: string | null;
    titleLocalizationArgs: string[] | null;
    titleLocalizationKey: string | null;
    vibrateTimings: number[] | null;
    visibility: number | null;
  };
}
```

### `TimeIntervalNotificationTrigger`

A trigger related to an elapsed time interval. May be repeating (see `repeats` field).

```ts
export interface TimeIntervalNotificationTrigger {
  type: 'timeInterval';
  repeats: boolean;
  seconds: number;
}
```

### `DailyNotificationTrigger`

A trigger related to a daily notification. This is an Android-only type, the same functionality will be achieved on iOS with a `CalendarNotificationTrigger`.

```ts
export interface DailyNotificationTrigger {
  type: 'daily';
  hour: number;
  minute: number;
}
```

### `CalendarNotificationTrigger`

A trigger related to a [`UNCalendarNotificationTrigger`](https://developer.apple.com/documentation/usernotifications/uncalendarnotificationtrigger?language=objc), available only on iOS.

```ts
export interface CalendarNotificationTrigger {
  type: 'calendar';
  repeats: boolean;
  dateComponents: {
    era?: number;
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    weekday?: number;
    weekdayOrdinal?: number;
    quarter?: number;
    weekOfMonth?: number;
    weekOfYear?: number;
    yearForWeekOfYear?: number;
    nanosecond?: number;
    isLeapMonth: boolean;
    timeZone?: string;
    calendar?: string;
  };
}
```

### `LocationNotificationTrigger`

A trigger related to a [`UNLocationNotificationTrigger`](https://developer.apple.com/documentation/usernotifications/unlocationnotificationtrigger?language=objc), available only on iOS.

```ts
export interface LocationNotificationTrigger {
  type: 'location';
  repeats: boolean;
  region: CircularRegion | BeaconRegion;
}

interface Region {
  type: string;
  identifier: string;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
}

export interface CircularRegion extends Region {
  type: 'circular';
  radius: number;
  center: {
    latitude: number;
    longitude: number;
  };
}

export interface BeaconRegion extends Region {
  type: 'beacon';
  notifyEntryStateOnDisplay: boolean;
  major: number | null;
  minor: number | null;
  uuid?: string;
  beaconIdentityConstraint?: {
    uuid: string;
    major: number | null;
    minor: number | null;
  };
}
```

### `UnknownNotificationTrigger`

Represents a notification trigger that is unknown to `expo-notifications` and that it didn't know how to serialize for JS.

```ts
export interface UnknownNotificationTrigger {
  type: 'unknown';
}
```

### `NotificationTriggerInput`

A type representing possible triggers with which you can schedule notifications. A `null` trigger means that the notification should be scheduled for delivery immediately.

```ts
export type NotificationTriggerInput =
  | null
  | ChannelAwareTriggerInput
  | SchedulableNotificationTriggerInput;
```

### `SchedulableNotificationTriggerInput`

A type representing time-based, schedulable triggers. For these triggers you can check the next trigger date with [`getNextTriggerDateAsync`](#getnexttriggerdateasynctrigger-schedulablenotificationtriggerinput-promisenumber--null).

```ts
export type SchedulableNotificationTriggerInput =
  | DateTriggerInput
  | TimeIntervalTriggerInput
  | DailyTriggerInput
  | WeeklyTriggerInput
  | CalendarTriggerInput;
```

### `ChannelAwareTriggerInput`

A trigger that will cause the notification to be delivered immediately.

```ts
export type ChannelAwareTriggerInput = {
  channelId: string;
};
```

### `DateTriggerInput`

A trigger that will cause the notification to be delivered once at the specified `Date`. If you pass in a `number` it will be interpreted as a UNIX timestamp.

```ts
export type DateTriggerInput = Date | number | { channelId?: string; date: Date | number };
```

### `TimeIntervalTriggerInput`

A trigger that will cause the notification to be delivered once or many times (depends on the `repeats` field) after `seconds` time elapse.

```ts
export interface TimeIntervalTriggerInput {
  channelId?: string;
  repeats?: boolean;
  seconds: number;
}
```

### `DailyTriggerInput`

A trigger that will cause the notification to be delivered once per day.

```ts
export interface DailyTriggerInput {
  channelId?: string;
  hour: number;
  minute: number;
  repeats: true;
}
```

### `WeeklyTriggerInput`

A trigger that will cause the notification to be delivered once every week.

> **Note:** Weekdays are specified with a number from 1 through 7, with 1 indicating Sunday.

```ts
export interface WeeklyTriggerInput {
  channelId?: string;
  weekday: number;
  hour: number;
  minute: number;
  repeats: true;
}
```

### `CalendarTriggerInput`

A trigger that will cause the notification to be delivered once or many times when the date components match the specified values. Corresponds to native [`UNCalendarNotificationTrigger`](https://developer.apple.com/documentation/usernotifications/uncalendarnotificationtrigger?language=objc).

> **Note:** This type of trigger is only available on iOS.

```ts
export interface CalendarTriggerInput {
  channelId?: string;
  repeats?: boolean;
  timezone?: string;

  year?: number;
  month?: number;
  weekday?: number;
  weekOfMonth?: number;
  weekOfYear?: number;
  weekdayOrdinal?: number;
  day?: number;

  hour?: number;
  minute?: number;
  second?: number;
}
```

### `NotificationResponse`

An object representing user's interaction with the notification.

> **Note:** If the user taps on a notification `actionIdentifier` will be equal to `Notifications.DEFAULT_ACTION_IDENTIFIER`.

```ts
export interface NotificationResponse {
  notification: Notification;
  actionIdentifier: string;
  userText?: string;
}
```

### `NotificationBehavior`

An object representing behavior that should be applied to the incoming notification.

```ts
export interface NotificationBehavior {
  shouldShowAlert: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
  priority?: AndroidNotificationPriority;
}
```

### `NotificationChannel`

An object representing a notification channel (feature available only on Android).

```ts
export enum AndroidNotificationVisibility {
  UNKNOWN,
  PUBLIC,
  PRIVATE,
  SECRET,
}

export enum AndroidAudioContentType {
  UNKNOWN,
  SPEECH,
  MUSIC,
  MOVIE,
  SONIFICATION,
}

export enum AndroidImportance {
  UNKNOWN,
  UNSPECIFIED,
  NONE,
  MIN,
  LOW,
  DEFAULT,
  HIGH,
  MAX,
}

export enum AndroidAudioUsage {
  UNKNOWN,
  MEDIA,
  VOICE_COMMUNICATION,
  VOICE_COMMUNICATION_SIGNALLING,
  ALARM,
  NOTIFICATION,
  NOTIFICATION_RINGTONE,
  NOTIFICATION_COMMUNICATION_REQUEST,
  NOTIFICATION_COMMUNICATION_INSTANT,
  NOTIFICATION_COMMUNICATION_DELAYED,
  NOTIFICATION_EVENT,
  ASSISTANCE_ACCESSIBILITY,
  ASSISTANCE_NAVIGATION_GUIDANCE,
  ASSISTANCE_SONIFICATION,
  GAME,
}

export interface AudioAttributes {
  usage: AndroidAudioUsage;
  contentType: AndroidAudioContentType;
  flags: {
    enforceAudibility: boolean;
    requestHardwareAudioVideoSynchronization: boolean;
  };
}

export interface NotificationChannel {
  id: string;
  name: string | null;
  importance: AndroidImportance;
  bypassDnd: boolean;
  description: string | null;
  groupId?: string | null;
  lightColor: string;
  lockscreenVisibility: AndroidNotificationVisibility;
  showBadge: boolean;
  sound: 'default' | 'custom' | null;
  audioAttributes: AudioAttributes;
  vibrationPattern: number[] | null;
  enableLights: boolean;
  enableVibrate: boolean;
}
```

### `NotificationChannelInput`

An object representing a notification channel to be set.

```ts
export interface NotificationChannelInput {
  name: string | null;
  importance: AndroidImportance;
  // Optional attributes
  bypassDnd?: boolean;
  description?: string | null;
  groupId?: string | null;
  lightColor?: string;
  lockscreenVisibility?: AndroidNotificationVisibility;
  showBadge?: boolean;
  sound?: string | null;
  audioAttributes?: Partial<AudioAttributes>;
  vibrationPattern?: number[] | null;
  enableLights?: boolean;
  enableVibrate?: boolean;
}
```

### `NotificationChannelGroup`

An object representing a notification channel group (feature available only on Android).

```ts
export interface NotificationChannelGroup {
  id: string;
  name: string | null;
  description?: string | null;
  isBlocked?: boolean;
  channels: NotificationChannel[];
}
```

### `NotificationChannelGroupInput`

An object representing a notification channel group to be set.

```ts
export interface NotificationChannelGroupInput {
  name: string | null;
  description?: string | null;
}
```

### `NotificationCategory`

```ts
export interface NotificationCategory {
  identifier: string;
  actions: NotificationAction[];
  options: {
    // These options are ALL iOS-only
    previewPlaceholder?: string;
    intentIdentifiers?: string[];
    categorySummaryFormat?: string;
    customDismissAction?: boolean;
    allowInCarPlay?: boolean;
    showTitle?: boolean;
    showSubtitle?: boolean;
    allowAnnouncement?: boolean;
  };
}
```

### `NotificationAction`

```ts
export interface NotificationAction {
  identifier: string;
  buttonTitle: string;
  textInput?: {
    submitButtonTitle: string;
    placeholder: string;
  };
  options: {
    isDestructive?: boolean;
    isAuthenticationRequired?: boolean;
    opensAppToForeground?: boolean;
  };
}
```
