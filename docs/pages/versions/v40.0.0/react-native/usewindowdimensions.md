---
id: usewindowdimensions
title: useWindowDimensions
---

```js
import { useWindowDimensions } from 'react-native';
```

`useWindowDimensions` automatically updates `width` and `height` values when screen size changes. You can get your application window's width and height like so:

```js
const { width, height } = useWindowDimensions();
```

## Example

```js
import React from "react";
import { View, StyleSheet, Text, useWindowDimensions } from "react-native";

const App = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <Text>{`Window Dimensions: height - ${height}, width - ${width}`}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default App;
```

- The [useDimensions](https://github.com/react-native-community/react-native-hooks#usedimensions) hook from the community [React native hooks](https://github.com/react-native-community/react-native-hooks) library aims to make handling screen/window size changes easier to work with.
- [React Native Responsive Dimensions](https://github.com/DaniAkash/react-native-responsive-dimensions) also comes with responsive hooks.

## Properties

### `width`

The width in pixels of the window or screen your app occupies.

```js
useWindowDimensions().width;
```

### `height`

The height in pixels of the window or screen your app occupies.

```js
useWindowDimensions().height;
```

### `scale`

The pixel ratio of the device your app is running on.

```js
useWindowDimensions().scale;
```

### `fontScale`

The scale of the font currently used. Some operating systems allow users to scale their font sizes larger or smaller for reading comfort. This property will let you know what is in effect.

```js
useWindowDimensions().fontScale;
```

> A value of `1` indicates PPI/DPI of 96 (76 on some platforms). `2` indicates a Retina or high DPI display.
