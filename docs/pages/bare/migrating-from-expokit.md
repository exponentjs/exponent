---
title: Migrating from ExpoKit
hideTOC: true
---

Historically when you have run `expo eject`, you'd end up with an [ExpoKit](../expokit/overview.md) project. ExpoKit is a large library that includes the entire Expo SDK, and it leaves you in this place where you're not quite writing a vanilla React Native project and you're not quite using the Expo managed workflow. At Expo we decided to move away from the ExpoKit architecture towards the "bare workflow" model, where your project is a "bare" or "vanilla" React Native project with only the pieces of the Expo SDK that you need for your project, no more.

Now that the bare worfklow has reached (or exceeded) feature parity with ExpoKit, we have deprecated ExpoKit with SDK 38. After SDK 38, your ExpoKit apps in the App Store and Play Store will continue to run indefinitely, but you'll need to migrate to the bare or managed workflows in order to get bugfixes and new features in Expo modules.

## Migrating your project to a bare workflow project

Depending on the size of your project and your level of experience this may take a few hours or more to complete.

We wish we could tell you that this is as easy as running one command, but due to the fact that when you are using ExpoKit you can customize your app in any way that you like, it's not feasible to build an automated tool to handle the migration.

The cleanest way to migrate your project is to initialize a new project with the bare workflow template and slowly migrate your existing project over. The rough process would go something like this:

- Ensure you have updated your existing project to the same React Native version that is used by the latest version of the Expo SDK and that your existing project is running as expected with all tests passing.
- Copy your assets and JS/TS source files to your new project.
- Copy the dependencies from your package.json to your new project, install and configure them. Do not include the `expokit` dependency.
- Ensure your JS tests pass.
- Copy custom native code (if any) to your new project.
- Copy and configure native assets (splash screens, icons).
- Compare configuration files like `Info.plist` and `AndroidManifest.xml` between projects, update the new project as necessary.
