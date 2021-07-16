# @expo/stories

The goal of this project is to provide a high quality and iterable experience for developing components. Stories are a great way to render components in isolation, but historically it is difficult to configure with react-native

## Setup

1. Configure metro bundler

```js
const { createMetroConfiguration } = require("expo-yarn-workspaces");
const withExpoStories = require("@expo/stories/metro-config");

const defaultConfig = createMetroConfiguration(__dirname);

module.exports = withExpoStories(defaultConfig);
```

2. Wrap your application in the `<ExpoStories />` component

```tsx
import * as React from "react";
import { ExpoStories } from "@expo/stories";

export default function App() {
  return (
    <ExpoStories>
      <YourAppHere />
    </ExpoStories>
  );
}
```

3. Start server in your project root


```js
const { startServer } = require("@expo/stories/server");

startServer();
```

4. Navigate to `http://localhost:7001` in a browser for an ugly webview of your current stories!


## Usage

For any component that you want to see as a story, create a `MyComponent.stories.tsx` file and export your examples:

```tsx
// e.g MyButton.stories.tsx

import * as React from "react";
import MyButton from "./MyButton";

const Basic = () => (
  <MyButton title="Hello" color="blue" onPress={console.log} />
);

const Danger = () => (
  <MyButton title="Uh oh!" color="red" onPress={console.log} />
);

const Success = () => (
  <MyButton title="Wow" color="green" onPress={console.log} />
);

const Indigo = () => (
  <MyButton title="I am Indigo" color="indigo" onPress={console.log} />
);

export { Basic, Danger, Success, Indigo };
```

## VSCode Extension

- Navigate to the `expo-stories-extension` package
- Run `Start Debugging`
- Open your project in extension the development window
- Go to one of your `.stories` files and `Ctrl + Shift + P` and select `View Expo Story`!
