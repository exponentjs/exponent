---
title: Debugging
---

import Video from '~/components/plugins/Video'

Whether you're developing your app locally, sending it out to select beta testers, or launching your app live to the app stores, you'll always find yourself debugging issues. It's useful to split errors out into two categories:

1. Errors you encounter in development
2. Errors you (or your users) encounter in production

Let's go through some of our recommended practices when it comes to each of these situations, and at the end of this guide, we'll recommend tools that can make debugging easier.

## Development errors

These are way more common, and we won't delve too much into how to approach these. Usually, debugging when running your app locally with `expo-cli` is pretty easy, thanks to [all the tools available in the Expo client app](#developer-menu).

Sometimes you'll be able to tell exactly what's wrong just by the [stacktrace](../get-started/errors.md#redbox-errors-and-stack-traces), but other times the error message is a little more cryptic. For errors that aren't as intuitive to solve, here's a good list of steps to take:

- Search for the error message in Google and [Stack Overflow](https://stackoverflow.com/questions), it's likely you're not the first person to ever run into this
- **Isolate the code that's throwing the error**. This step is _vital_ in fixing obscure errors. To do this:
  - Revert back to a working version of your code (this may even be a completely blank `expo init` project)
  - Apply your recent changes piece by piece, until it breaks
    - If the code you're adding in each "piece" is complex, you may want to simplify what you're doing. For example, if you use a state management library like Redux, you can try removing that from the equation completely to see if the issue lies in your state management (which is really common in React apps)
  - This should narrow down the possible sources of the error, and provide you with more information to search the internet for others who have had the same problem
- Use breakpoints (or `console.log`s) to check and make sure a certain piece of code is being run, or that a variable has a certain value. Using `console.log` for debugging isn't considered the best practice, but it's fast, easy, and oftentimes provides some illuminating information

If you are able to simplify your code as much as possible, tracking down the source of an error gets exponentially easier. That's exactly why so many open source repos require a [minimal reproducible demo](https://stackoverflow.com/help/minimal-reproducible-example) in their bug reports- it ensures you have isolated the issue and identified exactly where the problem lies! If your app is too large and complex to do that, try and extract the functionality you're trying to add to it's own blank `expo init` project, and go from there.

## Production errors

Errors or bugs in your production app can be much harder to solve, mainly because you have less context around the error (i.e. where, how, and why did the error occur?). **The best first step in addressing a production error is to reproduce it locally.** Once you reproduce an error locally, you can follow the [development debugging process](#development-errors) to isolate and address the root cause.

> **Hint**: sometimes, running your app in "production mode" locally will show errors that normally wouldn't be thrown. You can run an app locally in production by running `expo start --no-dev --minify`. "--no-dev" tells the server not to be run in development mode, and "--minify" will minify your code the same way it is for production Javascript bundles.

Using an automated error logging system like [Sentry](../guides/using-sentry.md) is a huge help in identifying, tracking, and resolving Javascript errors in your production app. This will give you a good sense of how many people are running into an error, how often, when, **and it even provides sourcemaps so you will have stacktraces of your errors!** Sentry is one of those tools that if you wait until you need it to install it, then you waited too long. Also- Sentry is free up to 5000 events/month.

### My production app is crashing

This can be a really frustrating scenario, since it gives you very little information to go off of on first glance. But, in reality, crashes can be one of the easiest-to-solve errors once you:

- [Access the native device logs](logging.md#optional-manually-access-device-logs)
- Reproduce the crash (either using your production app, or the Expo client app)
- Search the logs for a "fatal exception" (there could be a few) to see exactly what is causing your app to crash

With that information, you should be able to identify where the error is coming from, or at least search the internet for possible causes & solutions.

### My app crashes on certain (older) devices

This might indicate that there is a performance issue. You likely need to run your app through a profiler to get a better idea of what processes are killing the app, and [React Native provides some great documentation for this](https://reactnative.dev/docs/profiling). We also recommend using [React Devtools](https://www.npmjs.com/package/react-devtools) and the included profiler, which makes it super easy to identify performance sinks in your app.

## Stuck?

The Expo community and the React and React Native communities are great resources for help when you get stuck. There's a good chance someone else has run into the exact same error as you, so make sure to read the documentation, search the [forums](https://forums.expo.io/), [Github issues](https://github.com/expo/expo/issues/), and [StackOverflow](https://stackoverflow.com/).

## Useful tools for debugging

Below are a few tools we recommend, and use ourselves, when it comes to debugging your Expo app:

## Developer menu

This menu gives you access to several functions which are useful for debugging, and is built into the Expo client app. The way you open it is a bit different depending on where you're running the Expo client:

- iOS Device: Shake the device a little bit, or touch 3 fingers to the screen.
- iOS Simulator: Hit `Ctrl-Cmd-Z` on a Mac in the emulator to simulate the shake gesture, or press `Cmd+D`.
- Android Device: Shake the device vertically a little bit, or run `adb shell input keyevent 82` in your terminal window if your device is connected via USB.
- Android Emulator: Either hit `Cmd+M`, or run `adb shell input keyevent 82` in your terminal window.

The Developer Menu gives you a couple different functionalities. A few are pretty self-explanatory, like:

- Reload manifest & JS bundle: this will reload your app. Usually this isn't necessary if you have Live or Hot Reload enabled, since it will automatically refresh whenever you save your changes in your text editor.
- Go to Expo Home: Leave your app and navigate back to the Expo client homescreen
- Enable/Disable Live Reload: When enabled, your app will automatically refresh the JS bundle whenever you save file changes in your project directory.

> **Note**: In order to use Live Reload, your components must be **class** components, rather than a functional components. You can read about their differences [here](https://reactjs.org/docs/components-and-props.html#function-and-class-components).

Now let's explore some of the more exciting functionalities...

#### Show Performance Monitor

This opens up a small window giving you performance information of your app. You will see:

- RAM usage of your project
- Javascript heap (this is an easy way to know of any memory leaks in your application)
- 2 numbers for Views, the top indicates the number of views for the screen, the bottom indicates the number of views in the component
- Frames Per Second for the UI and JS threads. The UI thread is used for native Android or iOS UI rendering. The JS thread is where most of your logic will be run, including API calls, touch events, etc.

#### Toggle Element Inspector & Debug Remote JS

Both of these work best in tandem with either `react-native-debugger` or `react-devtools`. Read on to see more!

## React Native Debugger

The React Native Debugger includes a lot of the tools listed later in this page, all bundled into one, including React-DevTools ([guide below](#debugging-with-react-devtools)) and network request inspection. For this reason, if you use one tool on this page, it should probably be this one!

We'll give a quick look at it here, but check out their [documentation](https://github.com/jhen0409/react-native-debugger#documentation) for a more in-depth look.

You can install it via the [release page](https://github.com/jhen0409/react-native-debugger/releases), or if you're on a mac you can run:

```sh
brew cask install react-native-debugger
```

### Startup

After firing up React Native Debugger, you'll need to specify the port (shortcuts: `Command+T` on macOS, `Ctrl+T` on Linux/Windows) to `19001`. After that, run your project with `expo start`, and select `Debug remote JS` from the Developer Menu. The debugger should automatically connect.

In the debugger console, you can see the Element tree, as well as the props, state, and children of whatever element you select. You also have the Chrome console on the right, and if you type `$r` in the console, you will see the breakdown of your selected element.

If you right-click anywhere in the React Native Debugger, you'll get some handy short-cuts to reload your JS, enable/disable the element inspector, network inspector, and to log and clear your `AsyncStorage` content.

<Video file="debugging/react-native-debugger.mp4" />

### Inspecting network traffic

It's easy to use the React Native Debugger to debug your network requests. Simple right-click to `Enable Network Inspect`, which allows you to open the Network tab and inspect requests of `fetch` and `XMLHttpRequest`. There are [some limitations](https://github.com/jhen0409/react-native-debugger/blob/master/docs/network-inspect-of-chrome-devtools.md#limitations), so there are a few other alternatives, all require using a proxy. The following options will all work:

- [Charles Proxy](https://www.charlesproxy.com/documentation/configuration/browser-and-system-configuration/) (\$50 USD, our preferred tool)
- [Proxyman](https://proxyman.io) (Free version available or $49 to $59 USD)
- [mitmproxy](https://medium.com/@rotxed/how-to-debug-http-s-traffic-on-android-7fbe5d2a34#.hnhanhyoz)
- [Fiddler](http://www.telerik.com/fiddler)

## Debugging Redux

[Redux](https://redux.js.org/) is a popular library for managing the state of your app that doesn't belong to any single component, and instead it shared throughout the app. You can use the React Native Debugger (told you this tool does it all), the set up is as follows:

1. Download React Native Debugger from the [releases page](https://github.com/jhen0409/react-native-debugger/releases).
2. Open the app, press `⌘+t`/`ctrl+t` to open new window, then set the port to 19001.
3. Start your app, open the in-app developer menu, and select “Debug JS Remotely.”
4. Configure `__REDUX_DEVTOOLS_EXTENSION__` as [shown here](https://github.com/zalmoxisus/redux-devtools-extension#11-basic-store).

You're now good to go! If you are experiencing any issues or want to learn more about how to use these tools, refer to this [guide](https://medium.com/@tetsuyahasegawa/how-to-integrate-react-native-debugger-to-your-expo-react-native-project-db1d631fad02).

## Debugging with React DevTools

React DevTools is a great way to get a look at each of your components' props and state. First, you'll need to run

```sh
npm install -g react-devtools
# if you are using Expo SDK <= 37: npm install -g react-devtools@^3
```

(if you don't want to install it globally, run `npm install --dev react-devtools` to install it as a project dependency).

After running `expo start` in your project's root directory, use a separate terminal tab to run `react-devtools`. This will open up the React Devtools console (for it to connect, you need to select `Debug remote JS` from the Developer Menu in the Expo client). From this console, you can search for your React components at the top, or open up the Developer Menu and enable the Element Inspector. Once you do that, you can tap on any element on screen and React DevTools will automatically find and display that element in the tree. From there, you can inspect the elements state, props, etc.

<Video file="debugging/react-devtools.mp4" />

React DevTools can also be paired with remote debugging, allowing you to inspect props, state, and instance properties in the Chrome console. If you have any questions on setting that up, give the next section a look!

## Remote debugging with Chrome Developer Tools

You can debug Expo apps using the Chrome debugger tools. Rather than running your app's JavaScript on your phone, it will instead run it inside of a webworker in Chrome. You can then set breakpoints, inspect variables, execute code, etc, as you would when debugging a web app.

- To ensure the best debugging experience, first change your host type in Expo Dev Tools to `LAN` or `localhost`. If you use `Tunnel` with debugging enabled, you are likely to experience so much latency that your app is unusable. While here, also ensure that `Development Mode` is checked.

- If you are using `LAN`, make sure your device is on the same wifi network as your development machine. This may not work on some public networks. `localhost` will not work for iOS unless you are in the simulator, and it only work on Android if your device is connected to your machine via usb.

- Open the app on your device, reveal the developer menu then tap on `Debug JS Remotely`. This should open up a Chrome tab with the URL `http://localhost:19001/debugger-ui`. From there, you can set breakpoints and interact through the JavaScript console. Shake the device and stop Chrome debugging when you're done.

- Line numbers for `console.log` statements don't work by default when using Chrome debugging. To get correct line numbers open up the Chrome Dev Tools settings, go to the "Blackboxing" tab, make sure that "Blackbox content scripts" is checked, and add `expo/build/logs/RemoteConsole.js` as a pattern with "Blackbox" selected.

### Troubleshooting localhost debugging

When you start a project with Expo CLI and when you press `Run on Android device/emulator` in Expo Dev Tools (or `a` in the terminal), Expo CLI will automatically tell your device to forward `localhost:19000` and `19001` to your development machine, as long as your device is plugged in or emulator is running. If you are using `localhost` for debugging and it isn't working, close the app and open it up again using `Open on Android`. Alternatively, you can manually forward the ports using the following command if you have the Android developer tools installed: `adb reverse tcp:19000 tcp:19000` - `adb reverse tcp:19001 tcp:19001`

### Source maps and async functions

Source maps and async functions aren't 100% reliable. React Native doesn't play well with Chrome's source mapping in every case, so if you want to make sure you're breakpointing in the correct place, you should use the `debugger` call directly from your code.

## Debugging production apps with Sentry

In a perfect world, your app would ship without any bugs. However, that's usually not the case. So, it's usually a good idea to implement a crash and bug reporting system into your app. This way, if any user experiences a fatal JS error (or any event that you've configured to notify Sentry) you can see the details in your Sentry dashboard.

Expo provides a wrapper called [sentry-expo](../guides/using-sentry.md) which allows you to get as much information as possible from crashes and other events. Plus, when running in the managed workflow, you can configure sourcemaps so that the stracktraces you see in Sentry will look much more like the code in your editor.
