---
title: Installing a Custom iOS Expo client
---

Build and install a custom version of the [Expo client](../get-started/installation.md#2-mobile-app-expo-client-for-ios) with your own Apple Credentials using our build service. This custom version of the Expo client contains features that were previously only available on the Android versions. Our build service will prepare your custom Expo client, and you can install it to your iOS device directly from our website.

#### Installation overview

![Adhoc Builds Overview](/static/images/adhoc-builds-overview.jpg)

## 0. Prerequisites

- You’ll need a **paid** [Apple Developer Account](https://developer.apple.com/programs) to configure credentials required for the development and distribution process of an app. Learn more [here](https://developer.apple.com/programs/whats-included/).
- Install the `expo-cli` command line app by following the instructions [here](../workflow/expo-cli.md).

**Windows users** must have WSL enabled. You can follow the installation guide [here](https://docs.microsoft.com/en-us/windows/wsl/install-win10). We recommend picking Ubuntu from the Windows Store. Be sure to launch Ubuntu at least once. After that, use an Admin powershell to run:
`Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux`

### Optional additional configuration steps

#### Push Notifications

Push Notifications are currently unavailable with ad hoc clients until we complete our work to add an extra authentication layer to the Expo Push Notification service.

#### Google Maps

You will need to run `expo client:ios` in a project directory with a valid `app.json`, or pass in the flag to your custom configuration file with `--config <path-to-file.json>`. Make sure you set your Google API key in `ios.config.googleMapsApiKey` as described [here](../versions/latest/sdk/map-view.md#deploying-google-maps-to-a-standalone-app-on-ios).

#### Facebook

Add the following fields to your `app.json` file:

- `facebookScheme` set to your Facebook login redirect URL scheme found [here](https://developers.facebook.com/docs/facebook-login/ios) under "_4. Configure Your info.plist_." It should look like `"fb123456"`. If you do not do this, Facebook will not be able to redirect to your app after logging in.

- `facebookAppId` and `facebookDisplayName`, using your [Facebook App ID and Facebook Display Name](https://developers.facebook.com/docs/facebook-login/ios), respectively.

- [_Optional_] `facebookAutoInitEnabled`, defaults to `false`

Then, after following steps 1 & 2 below, your bundle ID (it should look something like: `dev.expo.client.xxxxx`) will be included in the terminal output. Add that bundle ID to your app settings page in the [Facebook developer console](https://developers.facebook.com/apps/).

## 1. Start the build

Run `expo client:ios`

### 1a. Provide Apple Credentials

You are given a choice of letting `expo-cli` create the necessary credentials for you, while still having a chance to provide your own overrides. Your Apple ID and password are used locally and never saved on Expo's servers.

Letting Expo handle credentials for you will greatly simplify the build process. Learn more [here](../distribution/security.md) on what these credentials are and how we store them.

```sh
$ expo client:ios
[16:44:37] Checking if current build exists...

[16:44:37] No currently active or previous builds for this project.
[16:44:37]
Please enter your Apple Developer Program account credentials. These credentials are needed to manage certificates, keys and provisioning profiles in your Apple Developer account.

The password is only used to authenticate with Apple and never stored.

? What\'s your Apple ID? xxx@yyy.zzz
? Password? [hidden]
✔ Authenticated with Apple Developer Portal successfully!
[16:44:46] You have 4 teams associated with your account
? Which team would you like to use? 3) ABCDEFGHIJ "John Turtle" (Individual)

? Select an iOS distribution certificate to use for code signing:
❯ [Create a new certificate]
  [Upload an existing certificate]

? Select an authentication token signing key to use for push notifications: (Use arrow keys)
❯ Used in apps: @john-turtle/expo-client-home-xxx (Key ID: XXX)
  [Create a new key]
  [Upload an existing key]
```

If valid credentials are found on the Expo servers from your previous use of `expo-cli` building an iOS binary, they will be automatically used.

#### Distribution certificates

If a Distribution Certificate cannot be found on the Expo servers, `expo-cli` will give you options to produce one. We describe these choices in more detail [here](#distribution-certificate-cli-options).

#### Push Notification Credentials

> Push Notifications are currently unavailable with ad hoc clients

We'll also help you handle your Push Notifications service key and provisioning profile. Remember that Push Notifications service keys can be reused across different Expo apps as well. If a Push Key cannot be found on the Expo servers, `expo-cli` will give you options to produce one. We describe these choices in more detail [here](#push-key-cli-options).

### 1b. Determine UDID of your iOS Device

In order to install your custom build of the Expo client on your iOS device, we will need to determine your device UDID so we can configure your provisioning profile and authorize your device to download the Expo client.

```sh
Custom builds of the Expo client can only be installed on devices which have been registered with Apple at build-time.
These devices are currently registered on your Apple Developer account:
┌───────────────┬──────────────────────────────────────────┐
│ Name          │ Identifier                               │
├───────────────┼──────────────────────────────────────────┤
│ muh iphone    │ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx         │
└───────────────┴──────────────────────────────────────────┘

? Would you like to register new devices to use the Expo client with? (Y/n) Y
```

If you would like to install the Expo client on an iOS device that is not listed above, follow the prompts to register your device.

```sh
? Would you like to register new devices to use the Expo client with? Yes

==================
[QR Code redacted]
==================

Open the following link on your iOS device (or scan the QR code) and follow the instructions to install the development profile:

https://expo.io/udid/XXXXXXXXXXXXX


After you register your device, we'll start building your client, and you'll receive an email when it's ready to install.
```

You will need to open this QR code on the iOS device you wish to register. Read [this](#registering-multiple-ios-devices) if you wish to register more than one iOS device.

On iOS versions earlier than 12.2, if you aren't taken to the `Installing Profile` page after pressing the `Register` button, try quitting your `Settings` app and try again.

![UDID Workflow](/static/images/adhoc-builds-udid.png)

#### iOS 12.2+

On iOS versions 12.2 or later, a window will popup saying `Profile Downloaded`. Close the popup, go to the `Settings` app and navigate to the `Profile Downloaded` option to download the device enrollment challenge.

![UDID Workflow](/static/images/adhoc-builds-udid2.png)

### 2. Wait for it to finish building

You can monitor the status of your Expo client build by visiting the link. You will also be notified via email when there are updates to your build. More details can be found on your build dashboard [here](https://expo.io/builds).

```sh
==================
[QR Code redacted]
==================

Your custom Expo client is being built! 🛠
Open this link on your iOS device (or scan the QR code) to view build logs and install the client:

https://expo.io/client/XXXXXXXXXX
```

### 3. Install the Custom Expo client on your iOS device

![Install Workflow](/static/images/adhoc-builds-install.png)

Once your build is complete, open the status page on your iOS device and tap the `Install` button.

### 4. You're done!

You're all set to use the custom version of the Expo client, containing features that were previously only available on the Android versions 🎉

# Troubleshooting

## Cannot generate/revoke credentials

### Apple Enterprise Accounts - Insufficient permissions

If you are part of an organization with an Apple Enterprise account, you will need to ensure that you are given sufficient permissions to create and revoke certificates.

The administrator of the Apple Enterprise account will need to make you an App Manager and give you access to Developer Resources from the [Apple Development Portal](https://developer.apple.com/account/).

![Apple Development Portal Permissions](/static/images/adhoc-builds-apple-org.png)

## App crashes / App icon is blacked out

If your app icon is blacked out like [this](/static/images/adhoc-builds-black-icon.jpg) or if it crashes at the splash screen like [this](/static/images/adhoc-builds-app-crash.gif), check that your ad hoc provisioning profile is still valid. You can do this by navigating to the Apple Development Portal [profile list](https://developer.apple.com/account/resources/profiles/list). The Expo client ad hoc profile should be prefixed with `*[expo]` for a bundle identifier that starts with `dev.expo.client`.

An invalid profile can be caused by revoking the distribution certificate or disabling the iOS devices associated with the profile. You can fix this by associating valid certificates and devices to the profile and pressing `Save` from the Apple Development Portal interface.

![Invalid Profile](/static/images/adhoc-builds-invalid-profile.png)

# Frequently Asked Questions

## Distribution certificate CLI options

`expo-cli` will give you options to produce a distribution certificate, and this section describes these options in more detail.

### Creating a new certificate (recommended)

This will create a new iOS distribution certificate with a password. This option won't be available if you've already reached Apple's limit of two active certificates in your developer account.

### Revoking existing certificates

Revoking an existing distribution certificate associated with an app is safe if:

- Your app is distributed through the App Store and you are **NOT** on an Apple Enterprise account.

Revoking an existing distribution certificate associated with an app is **NOT** safe if:

- Your app is distributed through the App Store and you are on an Apple Enterprise account.
- Your app is distributed ad hoc (distributed outside of the App Store for testing purposes).

An App Store app gets re-signed with an Apple certificate when it goes on the store with non-Enterprise accounts. Revoking the certificate therefore won't affect it. Enterprise apps and apps distributed ad hoc use the original certificate, which means revoking it will cause the app to stop functioning on all devices it is installed on.

### Uploading existing certificate

If you have a password-protected certificate, you can provide the path to your `.p12` file as well as your password for upload. We recommend following [this excellent guide on making a P12 file](https://calvium.com/how-to-make-a-p12-file/) for making your own certificates.

**Note:** this guide recommends leaving the P12's password blank, but a **P12 password is required** to upload your own certificate to Expo's service. Please enter a password when prompted.

## Push key CLI options

`expo-cli` will give you options to produce a push key, and this section describes these options in more detail.

### Creating a new push key (recommended)

This will create a new push key. This option won't be available if you've already reached Apple's limit of two active keys in your developer account.

### Revoking existing push keys

If you revoke an existing push key, you will no longer be able to send Push Notifications to your apps with the revoked key.

### Uploading an existing push key

If you have your push key on file, you can provide the path to your `.p8` file for upload.

### Skip uploading a push key

Push Notifications will be disabled on the Expo client if you choose not to upload your credentials. See [here](#push-notifications-arent-working) for more details.

## Registering multiple iOS devices

You can register multiple iOS devices by submitting multiple requests to build the Expo client. We've currently limited one iOS device registration per build request.

## Simulator Builds

We do not support simulator builds for adhoc Expo client builds yet.
