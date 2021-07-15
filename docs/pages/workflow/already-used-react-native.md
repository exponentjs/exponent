---
title: Already used React Native?
---

This guide is intended to give developers who have already used React Native a quick outline on some of the key concepts, resources, and differences they will encounter when using Expo.

You can use every part of the [Expo SDK](/versions/latest/) in any vanilla React Native app - we call using the Expo tools in this context the "bare" workflow. See more about that [here](../bare/hello-world.md). It's basically no different than using libraries in your React Native app, we just offer a lot of well-tested, consistent, and increasingly comprehensive libraries that give you access to the underlying native APIs.

## Expo managed workflow

The Expo managed workflow provides a _shared native runtime_ so you don't write native code, you focus on writing your React app in JavaScript. You don't have to worry about iOS or Android specific settings, or even opening up Xcode. Managed Expo projects have their own workflow including Expo CLI (a command line interface) and Expo Dev Tools (a web UI) to make developing and deploying easy.

- If you've ever upgraded React Native or a native module you'll appreciate Expo's ability to seamlessly do this for you by only changing the version number.

Expo extends the React Native platform by offering additional, battle-tested modules that are maintained by the team. This means you're spending less time configuring and more time building.

- If you've ever had to go through the trouble of upgrading a module or installing something like `react-native-maps`, you'll appreciate when things _just work_.

Managed Expo projects also offer OTA (Over The Air) updates and a push notification service.

- If you've ever been in a situation where you find a spelling mistake in your app and have to wait for Apple to approve a change, you'll appreciate OTA updates - these changes will appear as soon as you run `expo publish`! You aren't limited to text either, this applies to assets like images and configuration updates too!

There's no need re-build or redeploy your app to the App and Play store. It's like [Code Push](https://microsoft.github.io/code-push/) if you've used that before. There are a few limitations, however. [Read about those here](../workflow/publishing.md#limitations).

Expo offers a shared configuration file we call a _manifest_.

- Configuration that you would typically do inside of your Xcode / plist files or Android studio / xml files is handled through `app.json`. For example, if you want to lock the orientation, change your icon, customize your splash screen, add/remove permissions and entitlements (in standalone apps), configure keys for Google Maps and other services, you set this in `app.json` and it will apply to both iOS and Android. [See the guide here](/workflow/configuration.md).

In the managed workflow, you can share your app with anyone, anywhere in the world while you're working through the Expo Go app [(available on the App / Play Store)](https://expo.io). Scan a QR code, or enter in a phone number and we'll send you a link that will instantly load your app on your device.

- Instead of having to sign up several external testers through App Store Connect, you can easily have them download the Expo Go app and immediately have a working version on their phone.

We talk about permissions we set within `app.json`, but there's also the [Permissions API](../versions/latest/sdk/permissions.md). Permissions inside `app.json` are meant to be used by Android standalone apps for things like camera access, geolocation, fingerprint, etc. The Permissions API on the other hand, is used to request and verify access at runtime. It offers an easy API for asking your users for push notifications, location, camera, audio recording and contacts.

## How does Expo work?

Since you write your code in Javascript, we bundle it up and serve it from S3. Every time you publish your app, we update those assets and then push them to your app so you've always got an up-to-date version.

## Developing in Expo

Apps are served from Expo CLI through a tunnel service by default (we currently use [ngrok](https://ngrok.com) for this) -- this means that you don't have to have your device connected to your computer, or to even be in the same room or country (or planet? I guess it should work from space) as the development machine and you can still live reload, use hot module reloading, enable remote JS debugging, and all of those things you can do normally with React Native. One caveat to this is that using a tunnel is a bit slower than using your LAN address or localhost, so if you can, you should use LAN or localhost. [See how to configure this in Expo CLI](../guides/how-expo-works.md).

- Expo streams your device logs to Expo CLI and Expo Dev Tools so you don't need to run `adb logcat` or the iOS equivalent -- the `console.log / warn /error` messages from any device that is connected to your app will show up automatically in your terminal and Expo Dev Tools.

## What Expo can't do

- See [Why not Expo?](../introduction/why-not-expo.md) for more information.

## Deploying to the App / Play Store

When you're ready, you can run `expo build:ios` or `expo build:android` and Expo will build your app and output a link to the binary required for you to submit. Then you can use something like [Transporter](https://apps.apple.com/app/transporter/id1450874784) for iOS, or directly upload an APK for Android.

If you prefer to build your app on your own machine, you can [follow these steps](https://github.com/expo/expo#standalone-apps).

## Helpful Tools & Resources

- [snack.expo.io](https://snack.expo.io)
  - The best way to test and share examples and small projects directly from your browser. Point your phone at the QR code and you have a sandbox environment you can build in the browser and test directly on your device.
- [docs.expo.io](/versions/latest/)
  - If there's something you don't understand or wish to learn more about, this is a great place to start.
- [forums.expo.io](https://forums.expo.io)
  - The fastest way to get help from the Expo team or community
- [github.com/expo](https://github.com/expo)
  - the Expo Go app and SDK are all open source. If there's something you'd like to fix, or figure out how we implement our native modules, you're welcome to look through the code yourself!

## Useful Commands

When developing a managed Expo project, you have the option to use command line tools instead. Here are some of our friends' favorite commands and workflows:

- `expo start -c --localhost --ios`
  - start expo server, clear cache, load only on localhost and open on iOS simulator
- `expo start --tunnel`
  - start expo server (don't clear cache) and run expo on a tunnel so you can share it with anyone!
- `expo send -s 2245551234`
  - send a link to a friend's phone number so they can view on their phone exactly what I'm working on
