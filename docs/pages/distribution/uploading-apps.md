---
title: Uploading Apps to the Apple App Store and Google Play
---

This guide will help you upload your Expo standalone apps to Apple TestFlight and to Google Play.
You'll need a paid developer account for each platform for which you wish to upload and publish an app. You can create an Apple Developer account on [Apple's developer site](https://developer.apple.com/account/) and a Google Play Developer account on the [Google Play Console sign-up page](https://play.google.com/apps/publish/signup/).

## 1. Build a standalone app

To learn how to build native binaries, see [Building Standalone Apps](building-standalone-apps.md) or [Building Standalone Apps on Your CI](turtle-cli.md).

## 2. Start the upload

To upload the previously built standalone app to the appropriate app store, you simply run `expo upload:android` or `expo upload:ios`. However, you have a few options for choosing which app binary you want to upload (remember to choose one at the time):

- `--latest` - uploads the latest build for the given platform found on Expo Servers
- `--url <url>` - uploads a build from given URL
- `--path <path>` - uploads a build from the local file system
- `--id <id>` - uploads a build with the given ID

## 2.1. If you choose to upload your Android app to Google Play

**Important:**

- Beware that this feature works properly only on macOS, unless you pass the `--use-submission-service` flag.
- You have to create a Google Service Account and download its JSON private key.
- After that, you'll have to create an app on [Google Play Console](https://play.google.com/apps/publish/) and upload your app manually at least once.

#### Creating a Google Service Account

See [expo.fyi/creating-google-service-account](https://expo.fyi/creating-google-service-account) to learn more.

#### Manually uploading your app for the first time

Before using `expo upload:android` for uploading your standalone app builds, you have to upload your app manually at least once.<br />
See [expo.fyi/first-android-submission](https://expo.fyi/first-android-submission) to learn more.

#### Using expo-cli to upload the further builds of your app

After these steps, you can make use of `expo-cli` to upload your further app builds to Google Play.

To upload your Android app to Google Play, simply run `expo upload:android`. You can set following options when uploading an Android standalone app:

- `--type <archive-type>` - the archive type, by default, it's inferred from the filename extension, choose from: apk, aab
- `--key <key>` - path to the JSON key used to authenticate with the Google Play Store
- `--track <track>` - the track of the application to use, choose from: production, beta, alpha, internal, rollout (default: internal)
- `--release-status <release-status>` - release status (used when uploading new apks/aabs), choose from: completed, draft, halted, inProgress (default: completed)
- `--android-package <android-package>` - the Android package of your app, if you don't pass this parameter it'll be read from `app.json`
- `--use-submission-service` - **Experimental:** Use Submission Service for uploading your app. The upload process will happen on Expo servers.
- `--verbose` - always print logs from Submission Service

#### Uploading your app with Submission Service

**Beware:** This feature is still experimental! However, using it can not cause any damage to your app. In the worst-case scenario, your app won't get submitted to Google Play Store.

If you would like to upload your app from any other operating system than macOS, you can give the Expo Submission Service a try. It lets you upload your standalone app directly from Expo Servers.

Using the Submission Service is easy - it's just one additional flag: `expo upload:android --use-submission-service`.

## 2.2. If you choose to upload your iOS app to TestFlight

**Disclaimer:** This feature only works on macOS. If you want to upload an iOS app to the App Store you will need to have access to a macOS device.

Start by creating an app profile in App Store Connect:

1. Go to https://appstoreconnect.apple.com/apps and sign in. Make sure you've accepted the terms.
2. Click the blue plus button by the Apps header, then click "New App". 
3. Add your app's name, language, bundle ID (you'll need to create this separately, use the link below this field), and SKU (this isn't seen by end users, just needs to be unique. A common choice is your app's bundle ID, then something like "\_1", e.g. "com.exampleco.appname_1"). 
4. Click create. You've created your application record! You can now proceed with the app upload using either method below.

### Using expo-cli

To upload your iOS app to TestFlight, run `expo upload:ios`. You can set following options when uploading an iOS standalone app:

- `--apple-id <apple-id>` **(required)** - your Apple ID login. Alternatively you can set the `EXPO_APPLE_ID` environment variable.
- `--apple-id-password <apple-id-password>` **(required)** - your Apple ID password. Alternatively you can set the `EXPO_APPLE_PASSWORD` environment variable.
- `--app-name <app-name>` - your app display name, will be used to name an app on App Store Connect
- `--sku <sku>` - a unique ID for your app that is not visible on the App Store, will be generated unless provided
- `--language <language>` - primary language (e.g. English, German; run `expo upload:ios --help` to see the list of available languages) (default: English)

### Manually uploading your app

In order to see your app on Testflight, you will first need to submit your .IPA file to Apple using **Transporter** (previously known as Application Loader), available on the App Store ([link](https://apps.apple.com/app/transporter/id1450874784)). In order to do this:

1. Make sure you have logged into iTunes connect at least once with your Apple ID and accepted the terms.
2. Download Transporter from the [App Store](https://apps.apple.com/app/transporter/id1450874784).
3. Sign in with your Apple ID.
4. Add the IPA either by dragging it onto the Transporter window or by selecting it from the file dialog opened with **+** or **Add App** button.
5. Submit the IPA by clicking the **Deliver** button.

This process can take a few minutes. After this process is complete, you can check the status of your app submission to TestFlight in [App Store Connect](https://appstoreconnect.apple.com):

1. Login to https://appstoreconnect.apple.com with your Apple ID and regular password (NOT your app specific password)
2. Select 'My Apps' and you should see your app listed.
3. Click 'TestFlight' from the menu bar at the top.
4. This will show your current app builds that are available for testing.
5. In order to test the app on your device, you will need to install the TestFlight iOS app from the App Store, and sign in using your Apple ID.
