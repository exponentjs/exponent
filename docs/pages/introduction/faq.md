---
title: Common questions
---

In addition to the questions below, see the [forums](http://forums.expo.io/) for more common questions and answers. Some of this information is repeated from earlier sections of the introduction but we include it here for comprehensiveness.

<details><summary><h4>Is Expo similar to React for web development?</h4></summary>
<p>

Expo and React Native are similar to React. You'll have to learn a new set of components (`View` instead of `div`, for example) and writing mobile apps is very different from websites; you think more in terms of screens and different navigators instead of separate web pages, but much more of your knowledge carries over than if you were writing a traditional Android or iOS app.

</p>
</details>

<details><summary><h4>What is the difference between Expo and React Native?</h4></summary>
<p>

Learn more about this on the [Already used React Native?](../workflow/already-used-react-native.md) page.

</p>
</details>

<details><summary><h4>How much does Expo cost?</h4></summary>
<p>

Expo tools are free to use and open source. You can view the source for the Expo SDK and client at https://github.com/expo/expo

</p>
</details>

<details><summary><h4>How do you make money if Expo is free?</h4></summary>
<p>

Just because you can run everything that Expo provides on your own hardware doesn't mean setting up and managing all of the services you need is the right fit for your team.

If that sounds like you, you can see what we offer at https://expo.io/developer-services

</p>
</details>

<details><summary><h4>How do I add custom native code to my Expo project?</h4></summary>
<p>

Managed Expo projects don't support custom native code, including third-party libraries which require custom native components. In a managed project, you only write JavaScript.

In [our SDK](/versions/latest/), we give you a large set of commonly desired, high-quality native modules. We recommend doing as much in JavaScript as possible, since it can immediately deploy to all your users and work across both platforms, and will always continue to benefit from Expo SDK updates.

However, if you need something custom that isn't possible with the native modules provided in the SDK, like on-the-fly video processing or low-level control over the Bluetooth radio to do a firmware update and [other features requested here](https://expo.canny.io/feature-requests), you can run `expo eject` and have full control over the underlying native projects.

</p>
</details>

<details><summary><h4>How do I share my Expo project? Can I submit it to the app stores?</h4></summary>
<p>

The fastest way to share your managed Expo project is to publish it. You can do this by clicking 'Publish' in Expo Dev Tools or running `expo publish` in your project. This gives your app a URL; you can share this URL with anybody who has the Expo client for Android and they can open your app immediately. [Read more about publishing on Expo](https://blog.expo.io/publishing-on-exponent-790493660d24). To share with iOS users, you can use Apple TestFlight or sign up for the [Priority Plan](https://expo.io/developer-services) in order to share your app with teammates through the Expo client.

When you're ready, you can create a standalone app (`.ipa` and `.apk`) for submission to Apple and Google's app stores. Expo will build the binary for you when you run one command; see [Building Standalone Apps](../distribution/building-standalone-apps.md#3-start-the-build). Apple charges $99/year to publish your app in the App Store and Google charges a $25 one-time fee for the Play Store.

</p>
</details>

<details><summary><h4>How do I get my existing React Native project running with Expo?</h4></summary>
<p>

Right now, the easiest way to do this is to use `expo init` (with Expo CLI) to make a new project, and then copy over all your JavaScript source code from your existing project, and then `yarn add` the library dependencies you have.

If you have similar native module dependencies to what is exposed through the Expo SDK, this process shouldn't take more than a few minutes (not including `npm install` time). Please feel free to ask us questions if you run into any issues.

If you are using native libraries that aren't supported by Expo, you will either have to rewrite some parts of your application to use similar APIs that are part of Expo, or you just might not be able to get all parts of your app to work. Many things do though!

</p>
</details>

<details><summary><h4>What version of Android and iOS are supported by Expo apps?</h4></summary>
<p>

Expo supports Android 5+ and iOS 10+.

</p>
</details>

## Up next

- 👩‍💻 The time has come to write some code. Almost. First we need to install a couple tools. [Continue to "Installation"](../get-started/installation.md).
