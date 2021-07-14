---
title: Receiving Notifications
---

You can now successfully send a notification to your app! If all you wanted was purely informational notifications, then you can stop here. But Expo provides the capabilities to do so much more: maybe you want to update the UI based on the notification, or maybe navigate to a particular screen if a notification was selected.

Like most things with Expo, handling notifications is simple and straightforward across all platforms. All you need to do is add a listener using the [`Notifications` API](../versions/latest/sdk/notifications.md).

<!-- prettier-ignore -->
```javascript
import React from 'react';
import { Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';

// This refers to the function defined earlier in this guide, in Push Notifications Set Up
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';

/* @info This handler determines how your app handles notifications that come in while the app is foregrounded */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
/* @end */

export default class App extends React.Component {
  state = {
    notification: {},
  };

  componentDidMount() {
    registerForPushNotificationsAsync();

    /* @info This listener is fired whenever a notification is received while the app is foregrounded. */
    Notifications.addNotificationReceivedListener(this._handleNotification);
    /* @end */

    /* @info This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed). This listener is especially useful for routing users to a particular screen after they tap on a particular notification. */
    Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);/* @end */

  }

  _handleNotification = notification => {
    /* @info Want to know what the format of the object this listener receives is? Find the specifics in the expo-notifications documentation */
    this.setState({ notification: notification });/* @end */

  };

  _handleNotificationResponse = response => {
    /* @info Want to know what the format of the object this listener receives is? Find the specifics in the expo-notifications documentation */
    console.log(response);/* @end */

  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Your expo push token: {this.state.expoPushToken}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {this.state.notification.request.content.title}</Text>
          <Text>Body: {this.state.notification.request.content.body}</Text>
          <Text>Data: {JSON.stringify(this.state.notification.request.content.data)}</Text>
        </View>
      </View>
    );
  }
}
```

## Navigate to a particular screen if a push notification was tapped

```
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

// the first screen component to render in our route configuration
export default function HomeScreen({ navigation }) {
  // A React hook always returning the notification response that was received most recently
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    // if a user taps on a notification and there is data in it...
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      // deconstruct the data we need from the push notification
      const {
        questionSetId,
        questionId
      } = lastNotificationResponse.notification.request.content.data;

      // use that data to navigate to the screen we want
      navigation.navigate('QuestionScreen', {
        questionSetId,
        questionId
      });
    }
  }, [lastNotificationResponse]);

  return (
    <View>
      <Text>HomeScreen</Text>
    </View>
  );
}
```

## Foreground Notification Behavior

**Important Note**: To set the behavior for when notifications are received while your app is **foregrounded**, use [`Notifications.setNotificationHandler`](../versions/latest/sdk/notifications.md#setnotificationhandlerhandler-notificationhandler--null-void). You can use the callback to set options like:

- `shouldShowAlert`
- `shouldPlaySound`
- `shouldSetBadge`

## Closed Notification Behaviour

On Android, users can set certain OS-level settings (**usually** revolving around performance and battery optimisation), that can prevent notifications from being delivered when the app is closed. One such setting is the "Deep Clear" option on OnePlus devices.

## Notification Event Listeners

Event listeners added using `addNotificationReceivedListener` and `addNotificationResponseReceivedListener` will receive an object when a notification is received or interacted with, respectively. See the [documentation](../versions/latest/sdk/notifications.md#notification) for information on these objects.

There are two different subscriptions for this so that you can easily address cases where a notification comes in while your app is open and foregrounded, **and** cases where a notification comes in while your app is backgrounded or closed, and the user taps on the notification.

## Next steps

Now that you're able to send & receive notifications, read through all of [`expo-notifications`'s feature set](../versions/latest/sdk/notifications.md) to get a sense of the possibilities!

## See also

- Having trouble? Visit [Expo's notification FAQ page](./faq.md)
