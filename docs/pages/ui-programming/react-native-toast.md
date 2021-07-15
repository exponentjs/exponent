---
title: How to display a popup toast
sidebar_title: How to display a popup toast
---

import ImageSpotlight from '~/components/plugins/ImageSpotlight';

## What is a toast?

Toasts are the standard technique in mobile development for notifying your users about something without interrupting what they are doing.

According to the [Android Developers
Documentation](https://developer.android.com/guide/topics/ui/notifiers/toasts): "A toast provides
simple feedback about an operation in a small popup. It only fills the amount of space required for
the message and the current activity remains visible and interactive. Toasts automatically disappear
after a timeout".

To present a toast, we recommend two solutions: an API from the `react-native` package and a library
maintained by the React Native community.

## Android-only: `ToastAndroid`

Toasts are a native feature of Android, but iOS doesn't have this by default. If you only need
toasts on Android, you can use the [`ToastAndroid`](https://reactnative.dev/docs/toastandroid) API
provided by React Native.

### Usage

To show a basic toast with `ToastAndroid`, import `ToastAndroid` from the `'react-native'` package
and call `ToastAndroid.show` with a message and duration option:

```jsx
import React from 'react';
import { View, StyleSheet, ToastAndroid, Button, StatusBar } from 'react-native';

export default function App() {
  function showToast() {
    ToastAndroid.show('Request sent successfully!', ToastAndroid.SHORT);
  }

  return (
    <View style={styles.container}>
      <Button title="Show Toast" onPress={showToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#6638f0',
    padding: 8,
  },
});
```

The code above results in this on a Pixel 3a:

<ImageSpotlight style={{maxWidth: 360}} alt="Pixel 3a showing toast message in an Expo app" src="/static/images/ToastAndroid.png" />

There are many other ways to configure your toast position, duration, and gravity options. Read the
[React Native `ToastAndroid`](https://reactnative.dev/docs/toastandroid) docs to learn more.

## Cross-platform: `react-native-root-toast`

Since iOS doesn't have a built-in toast feature, React Native developers have to implement their own
cross-platform toast libraries.
[`react-native-root-toast`](https://github.com/magicismight/react-native-root-toast) is one such
solution that the developer has shared with the React Native community.

We recommend this solution because it's one of the most used and maintained open-source libraries that
work on iOS and Android without the need for native code. It also provides a lot of customization
options, which means that you will be able to match the design of your toasts to the rest of your app.

### Usage

To use `react-native-root-toast`, you have to [install the module](https://github.com/magicismight/react-native-root-toast) from npm with `npm install react-native-root-toast`.

Next, you must wrap the root component of your app with `<RootSiblingParent>` to allow toasts in any
part of your app.

```jsx
import { RootSiblingParent } from 'react-native-root-siblings';

// in your render function
return (
  <RootSiblingParent>  // <- use RootSiblingParent to wrap your root component
    <App />
  </RootSiblingParent>
);
```

Then, anywhere in your app, you can `import Toast from 'react-native-root-toast';` and call
`Toast.show` and `Toast.hide` to manage toasts on your screen.

```jsx
// Add a Toast on screen.
let toast = Toast.show('Request failed to send.', {
  duration: Toast.durations.LONG,
});

// You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
setTimeout(function hideToast() {
  Toast.hide(toast);
}, 500);

// You can also pass in additional options such as
let toast = Toast.show('Request was sent.', {
  containerStyle: {padding:3}, // StyleProp<ViewStyle>
  duration:3000, // number // milliseconds
  visible: true, // boolean
  position:80, // number
  animation:true, // boolean
  shadow:true, // boolean
  backgroundColor:'#27AE60', // string
  opacity:1, // number
  shadowColor:'#000000', // string
  textColor:'#FFFFFF', // string
  textStyle:{fontFamily:"Nunito_700Bold",fontSize: 16}, // StyleProp<TextStyle> // Only if you have imported that font family
  delay:3, // number
  keyboardAvoiding: true, // boolaean
  hideOnPress:true, // boolaean
  onHide: ()=>{}, // function
  onHidden: ()=>{}, // function
  onShow: ()=>{}, // function
  onShown: ()=>{}, // function
  onPress: ()=>{}, // function
});
```

`react-native-root-toast` also has a component API if you want to manage your toasts declaratively.

```jsx
<Toast visible={this.state.visible}>Thanks for subscribing!</Toast>
```

This library has many options for [customizing the appearance and behavior](https://github.com/crazycodeboy/react-native-easy-toast#api) of your toast.
docs](https://github.com/magicismight/react-native-root-toast) to learn more.
