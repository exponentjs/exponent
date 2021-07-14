---
title: Linear gradients in Expo and React Native apps
sidebar_title: Using linear gradients
---

import ImageSpotlight from '~/components/plugins/ImageSpotlight';
import TerminalBlock from '~/components/plugins/TerminalBlock';
import SnackInline from '~/components/plugins/SnackInline';

To add linear gradients to our Expo and React Native apps, we're going to use `expo-linear-gradient`. We're using this package because it is included in the Expo SDK and also because gradients are not otherwise supported out of the box with React Native.

## How to add a gradient

First, we'll want to install `expo-linear-gradient`. This package provides a native React view that transitions between multiple colors in a linear direction and is maintained by the Expo team.

### Installing `expo-linear-gradient`

If you have an Expo project, you can install with the following command:
<TerminalBlock cmd={['expo install expo-linear-gradient']} />

For a bare React Native app, you should also follow these [installation instructions](https://github.com/expo/expo/tree/master/packages/expo-linear-gradient).

### Adding and configuring a gradient

Next, we'll want to import `LinearGradient`:

```js
import { LinearGradient } from 'expo-linear-gradient';
```

Now we can use the `LinearGradient` props `colors`, `start`, `end`, and `locations` to customize and configure our gradient views. 

For more details, check out the [Linear Gradient docs](../versions/latest/sdk/linear-gradient).

## Example

In this example, we are creating a button with text over a gradient.

<SnackInline>

<!-- prettier-ignore -->
```js
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <View style={styles.container}>
      <LinearGradient
        // Button Linear Gradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.button}>
        <Text style={styles.text}>Button with Text over Gradient</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#fff',
  },
});
```

</SnackInline>

The example above renders a button like this:

<ImageSpotlight style={{ maxWidth: 276 }} containerStyle={{ marginTop: 0 }} src="/static/images/linear-gradient-expo-rn-example.png" alt="Button with Text over Gradient" />
