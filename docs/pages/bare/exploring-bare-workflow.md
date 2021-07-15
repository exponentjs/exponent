---
title: Bare Workflow Walkthrough
sidebar_title: Walkthrough
---

import Video from '~/components/plugins/Video'

If you're a top-down learner and you would like to get a high-level understanding of what it looks like to build an app with the bare workflow, this is the right place for you. **Feel free to skip this if you just want to write code as quickly as possible** &mdash; [Up and Running](hello-world.md) is for you.

## Initialize a project

If you’re just starting a new bare project then you should initialize it with `expo-cli` so it will be preconfigured to include relevant Expo tools.

<Video file="exploring-bare/init.mp4" spaceAfter={30} />

> _Note: You may see several `peerDependencies` warnings when installing the dependencies for a new project. These are caused by some external packages having overly strict or unnecessary dependencies, and it's a work in progress to clean them up. They won't cause any harm to your project._

### Existing React Native apps

If you already have a React Native project that has been created with `react-native init`, `ignite init`, or another similar tool, we'll need to install and configure the `react-native-unimodules` package to enable you to use packages from the Expo SDK.

<Video file="exploring-bare/setup.mp4" />

> _Note: We moved superhumanly fast in this video. You're not meant to follow along, we just want to give you a rough sense of what's involved in this process. Full instructions to get set up are available in the [react-native-unimodules README](https://github.com/expo/expo/tree/master/packages/react-native-unimodules)._

### Existing Expo managed workflow apps

If you already have an Expo managed workflow app and you need to customize the native code, you can eject to the bare workflow by running `expo eject`. This will give you a vanilla React Native app that includes all of the Expo SDK APIs that you were using already, and no more than that. The outcome is that you will be in just as good of a position as if you had started your app in the bare workflow from scratch, only you probably saved yourself some time!

> 💡 We recommend upgrading to the latest SDK version before ejecting. It will be more difficult to upgrade your app after ejecting because you will also be responsible for native iOS and Android related upgrade steps.

<Video file="exploring-bare/eject.mp4" spaceAfter />

## Build and open the project

Now we just run `yarn ios` or `yarn android` to start the JavaScript bundler server and build the project binary. This requires Xcode or Android Studio, depending on the platform.

<Video file="exploring-bare/buildopen.mp4" spaceAfter />

## Adding a library from the Expo SDK

To add a library from the Expo SDK we install it with `expo install`, run `npx pod-install` to link the iOS native dependency, and then recompile our projects for iOS and Android.

<Video file="exploring-bare/expoinstall.mp4" spaceAfter />

## Adding your own custom native code

The process for doing this is the same as any other React Native app. Here we are adding `react-native-mapbox-gl` to the app we just ejected.

<Video file="exploring-bare/custom.mp4" spaceAfter />

## Open the project with the Expo Go app on iOS or Android

You can continue using the Expo Go app _even after you’ve added native code that the client doesn’t support_, you just need to add guards to prevent the native APIs from being invoked when they aren’t available. In this block of code, we're going to prevent the `AttractionList` component from being imported when we were in Expo Go, because `AttractionList` uses `react-native-mapbox-gl`, which is not included in the Expo SDK.

<Video file="exploring-bare/guard.mp4" />

Now when we go to the screen where you would expect to see the `AttractionList`, we won't see anything because we substituted a plain `View` in its place.

<Video file="exploring-bare/clientopen.mp4" spaceAfter />

## Open the app in your web browser

Expo for web also works on bare projects. Here we will just import one simple component into `App.web.js` to demonstrate it, and run `expo start --web`.

<Video file="exploring-bare/web.mp4" spaceAfter />

## Releasing to App Store and Play Store

You can use ```eos``` command for your bare apps.

## That's it!

You are now, at a very high level, familiar with the steps you would go through to get started on building an app with the bare workflow. Continue on to [Up and Running](hello-world.md) to get started coding!

Are you feeling intimidated? It might be better for you to start out with the managed workflow if you're new to this. Check out the [managed workflow walkthrough](../introduction/walkthrough.md) for more information.
