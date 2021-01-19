---
title: Using Electron with Expo for Web
---

> 🚨 Electron support is experimental, so the workflow is suboptimal and subject to breaking changes. If you find bugs please report them on [expo/expo-cli](https://github.com/expo/expo-cli/issues) with the `[electron]` tag in the title.

[Electron][electron] is a framework for creating desktop apps that run in a Chromium wrapper. Using Expo with Electron will enable you to use your existing components to build OSX, Windows, and Linux apps.

To simplify this we created the package `@expo/electron-adapter` which wraps [`electron-webpack`][electron-webpack] and adds support for Expo web and other universal React packages.

- [🏁 Setup](#-setup)
- [⚽️ Usage](#️-usage)
  - [Starting a project](#starting-a-project)
  - [Customizing the main process](#customizing-the-main-process)
  - [Building your project](#building-your-project)
- [🧸 Behavior](#🧸-behavior)
- [Contributing](#contributing)
- [Learn More](#learn-more-about-electron)

## 🏁 Setup

- Create a new Expo project - `expo init`
- Install - `yarn add -D @expo/electron-adapter`
- Bootstrap Electron - `yarn expo-electron`

  - Append electron generated files to the `.gitignore`
  - Install the required dependencies: `electron`, `@expo/webpack-config`, `react-native-web`, etc...
  - Create a new [`electron-webpack`][electron-webpack] config file
    `electron-webpack.js`

    ```js
    const { withExpoAdapter } = require('@expo/electron-adapter');

    module.exports = withExpoAdapter({
      projectRoot: __dirname,
      // Provide any overrides for electron-webpack: https://github.com/electron-userland/electron-webpack/blob/master/docs/en/configuration.md
    });
    ```

## ⚽️ Usage

### Starting a project

- Start the project with `yarn expo-electron start`, this will do the following:
  - Ensure that you have an `electron-webpack.js` file created in your root directory.
  - Disable security warnings (`ELECTRON_DISABLE_SECURITY_WARNINGS=1`)
  - Start two webpack processes, one for the main process, and one for the render process.

### Customizing the main process

- To reveal the main process (highly recommended) run - `yarn expo-electron customize`
  - This will generate the `electron/main/` and `electron/webpack.config.js` files for you to customize.
  - Everything running in the `electron/main/` folder is on a different process to the rest of your app. Think of this like the native code in the Expo client app (but not really because it's JavaScript and simple).
- To revert back to the default main process or reset to the latest default template simply delete the `electron/` folder and the adapter will go back to using the hidden version.

### Building your project

`@expo/electron-adapter` doesn't do anything to streamline the build phase of Electron projects just yet. But until it does here is a guide for building projects using [`electron-builder`][electron-builder].

- Install the package with `yarn add -D electron-builder`
- Use the builder with: `yarn electron-webpack && yarn electron-builder --dir -c.compression=store -c.mac.identity=null` (`-c.compression=store` speeds the builds up a lot, delete this for actual production builds)
- Learn more about configuring your build here: [Configuring electron-builder][electron-builder-config]

## 🧸 Behavior

- Webpack now resolves files with `.electron.js` & `.web.js` extensions in that order. If you want to use `electron` features then put them in a file like `foo.electron.js`.
- Every universal package you have installed will be transpiled automatically, this includes packages that start with the name: `expo`, `@expo`, `@unimodules`, `@react-navigation`, `react-navigation`, `react-native`. You can add more by appending them to the array for key `expo.web.build.babel.include` in your `app.json` (this feature is experimental and subject to change).

## Contributing

If you would like to help make Electron support in Expo better, please feel free to open a PR or submit an issue:

- [Expo CLI][expo-cli]

If you want to add first-class electron support to any of the Unimodules then you can submit PRs to the expo/expo repo:

- [Expo SDK packages][expo-packages]

## Learn more about Electron

Learn more about how to use Electron in their [docs][electron-docs].

[expo-packages]: https://github.com/expo/expo/tree/master/packages
[expo-cli]: https://github.com/expo/expo-cli/
[electron]: https://electronjs.org/
[electron-docs]: https://electronjs.org/docs/
[electron-builder]: https://www.electron.build/
[electron-webpack]: https://github.com/electron-userland/electron-webpack
[electron-builder-config]: https://www.electron.build/configuration/configuration
