---
title: Expo SDK
sidebar_title: Expo SDK
---

## What is the Expo SDK?

You can think of the Expo SDK as a toolbox that you can pull from as needed while building your app, except instead of hammers and screwdrivers you get cameras, haptics, push notifications, and other operating system features that are native to the platform you're building for. You can find a list of all the libraries (tools in this stretched metaphor) included in the SDK in the [API Reference](/versions/latest/). These aren't the only libraries you can use when developing your app, they are the libraries that Expo provides and provides support for.

### Versions of the SDK and release schedule

Expo operates on a quarterly SDK release schedule, which allows for meaningful changes that have been thoroughly tested to be included in each SDK, and also provides some predictability for Expo developers.

> [How do I upgrade my SDK version?](/workflow/upgrading-expo-sdk-walkthrough.md)

### React Native version

Each Expo SDK includes support for a particular version of React Native. It is usually up-to-date with the most recent _stable_ release (this does mean we will wait after a new release to see if there are any breaking changes or widely impacting bugs that we'd like to see fixed before we upgrade). When you upgrade your Expo SDK with `expo upgrade`, Expo automatically handles upgrading your version of React Native as well.

In the bare workflow, you are [not as tied to the Expo SDK](#significance-of-the-expo-sdk-in), so you can upgrade React Native independent of your current SDK version (this will impact how you can use Expo Go, as detailed further on in this guide.

### What is `expo install`?

`expo install` ensures your app is using the appropriate version of a package, based on your SDK version. Please refer to ["Using Expo SDK libraries"](/workflow/using-libraries/#using-expo-sdk-libraries) for information.

## Significance of the Expo SDK in:

### Expo Go

Expo Go is where your Expo SDK version is most important. Whether you are in the bare workflow or the managed workflow, if you use Expo Go for development, you should be aware of your Expo SDK version and use `expo install` when you install dependencies.

We version the native code in Expo Go so that you can run projects on different SDK versions easily, but this means you need to tell Expo Go which version of native code to run. This is usually done via the `expo` package in your `package.json` (unless you override it with the `sdkVersion` property in `app.json`), which points to a particular SDK version (e.g. "^41.0.0").

### Vanilla React Native development

If you are developing with `react-native cli` and without Expo Go, then the Expo SDK version has very little impact on your development workflow. We recommend keeping up with our SDK releases just so you're aware of new features and changes, but you can install packages normally without `expo install`, and the native code for your project is defined by the packages you have installed themselves, rather than by the Expo SDK version. This also means you can edit the native code files and see those changes in your project.

### EAS Build

[EAS Build](/build/introduction.md) is similar to Non-Expo development- the native code for your project is defined by your individual dependencies, rather than by the Expo SDK version. Additionally, unlike [Classic `expo build`](), _only_ the native code for the dependencies you have excplicitly installed is included with your build. This has a lot of good consequences, like:

- Smaller app size 📦
- Ability to leave out unwanted code 🙅
- Ability to add in libraries that are not included in the Expo SDK 🤝
- Ability to install private packages 🤫

but also comes with some caveats:

- The entire SDK is **no longer included by default**, so you'll need to ship a new binary when you add in a new Expo package. For example, if you'd like to add camera functionality to your app, but didn't have `expo-camera` as a dependency during your last build, you cannot add in `expo-camera` via an OTA Update like you could previously when using Classic `expo build`. Instead, you'll need to install `expo-camera`, and rebuild with `eas build`.
- Similar to the point above, it is easier to ship an incompatible OTA Update to your app, so you'll need to be aware of that.

### Classic Build (`expo build`)

The [classic `expo build` infrastructure](/distribution/building-standalone-apps.md) (including `turtle-cli`) functions similar to Expo Go: your app is relying on the native code included in the Expo SDK, not in the individual packages you have installed in your `package.json`. This also means the native code for every package in the Expo SDK is included in your app, and you cannot add in any custom native code or 3rd party libraries that rely on their own native code.

## Common questions

### When can I upgrade my `expo-*` packages?

- Expo Go & Classic `expo build`: These packages are upgraded during each SDK upgrade, and can also be upgraded in between as long as you use `expo install <that package>`, since it will protect you from installing an incompatible version.

- EAS Build (or other local/remote build service): You can upgrade to whatever package version you want. If there's a fix available in `expo-notifications` that you need and you can test in a built version of your app rather than in Expo Go, go for it!

### When should I upgrade my Expo SDK version?

- Expo Go & Classic `expo build`: We recommend keeping up with our SDK releases and upgrading incrementally as they release. One common workflow is to plan on submitting a new version of your app about every quarter, so once with each SDK release. In between those releases, you can send out any JavaScript changes via an OTA Update.

- EAS Build (or other local/remote build service): If you use Expo Go for development, we recommend keeping up with SDK releases as they come out. Your individual builds will not rely on the SDK version.

### When should I upgrade my React Native version?

- Expo Go & Classic `expo build`: Your React Native version gets upgraded as part of `expo upgrade` when you upgrade your SDK version.

- EAS Build (or other local/remote build service): Although you can upgrade your React Native version whenever you want, if you use Expo Go for development, you should use the same version of React Native as is pinned by whatever Expo SDK version you have in your `package.json`. This will help to prevent instances of the [React Native version mismatch error](/troubleshooting/react-native-version-mismatch.md).
