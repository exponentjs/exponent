---
title: Running in the Browser
---

You can use Expo to create web apps that run in the browser using the same code-base as your existing native app.

## Adding web support to Expo projects

All projects after _SDK 32_ come with web support by default. To add web support to an existing Expo app you can do the following:

- Install the latest version of the Expo CLI: `npm i -g expo-cli`
- Add web dependencies: `expo install react-native-web react-dom`
  - Ensure your project has at least `expo@^33.0.0` installed.
  - If your project has at least `expo@^39.0.0` installed then you will need to install `react-native-web@~0.13`
- Start your project with `expo start` then press `w` to start Webpack and open the project in the browser.

**Tips**

- Startup faster in web-only mode by running `expo web`
- Test protected APIs like Camera and Sharing by using the `--https` or `--no-https` flags.

## Frameworks

The Expo Unimodules and dev-tools are highly composable and can be used in _any_ **react.js** project. Here are a few popular integrations:

- [**Next.js:**](https://dev.to/evanbacon/next-js-expo-and-react-native-for-web-3kd9) Server Side Render your website and get incredible SEO.
- [**Gatsby:**](https://dev.to/evanbacon/gatsby-react-native-for-web-expo-2kgc) Prerender your static-site.
- [**Storybook:**](https://github.com/expo/examples/tree/master/with-storybook) Create and test beautiful design languages.

## Tree-Shaking

The package `babel-preset-expo` extends `@babel/preset-env` on web and is used to configure your project for Unimodules. The core feature is that it won't compile your modules to **`core.js`** when targeting web, this means that you get optimal tree-shaking and dead-code-elimination.
This step is optional with the React Native CLI but you'll get a much smaller bundle size and faster website if you do choose to use it. This is because `module:metro-react-native-babel-preset` is made for usage with the Metro bundler and not Webpack.

> `babel-preset-expo` is required for usage with Create React App, optional but recommended for all React Native projects using Unimodules.

- Install: `yarn add -D babel-preset-expo`
- Change the babel preset in `babel.config.js`. If your project has a `.babelrc` then you should upgrade to **Babel 7+** first.
  ```diff
  module.exports = {
  -   presets: ['module:metro-react-native-babel-preset']
  +   presets: ['babel-preset-expo']
  };
  ```

## App Entry

The initial file of your web app. Be sure to use `registerRootComponent` from `expo` to ensure web is initialized correctly.

### Managed

- Remove the `main` field of your `package.json`:
  ```diff
  {
  -   "main": "index.js",
  }
  ```
- Create an `App.js` in the root of your project:

```tsx
import React from 'react';
import { View } from 'react-native';

export default () => <View />;
```

- And that's it, `expo-cli` will handle the rest!

### Bare Workflow

- Remove the `main` field of your `package.json` or set it to `./index`:
- Install Expo: `yarn add expo`
- Change the root `index.js` to look like this:

```tsx
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
```

- That's all! You don't need to invoke `ReactDOM.render` or `AppRegistry.registerComponent` because `registerRootComponent` will do this for you for each platform automatically.

[rnw]: https://github.com/necolas/react-native-web/
[forums]: http://forums.expo.io/
[canny]: https://expo.canny.io/feature-requests
