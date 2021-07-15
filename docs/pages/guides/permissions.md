---
title: Permissions
---

When you are creating an app that requires access to potentially sensitive information on a user's device, such as their location or contacts, you need to ask for the user's permission first. For example, to access the user's media library, you will need to use [MediaLibrary.requestPermissionsAsync()](../../versions/latest/sdk/media-library.md#medialibraryrequestpermissionsasync).

In Expo Go, there isn't much you need to think about to interact with permissions beyond requesting permissions before using certain APIs. This changes when you want to deploy your app to an app store. Please read the [permissions on iOS](#permissions-on-ios) and [permissions on Android](#permissions-on-android) sections carefully before deploying your app to stores. If you don't configure or explain the permissions properly **it may result in your app getting rejected or pulled from the stores**. Read more about deploying to the stores in the [App Store Deployment Guide](../../../distribution/app-stores.md#system-permissions-dialogs-on-ios).

## iOS

### Managed workflow

To request permissions on iOS, you have to describe why the permissions are requested and [install the library](#permissions-and-required-packages-on-ios) that can request this permission. In the managed workflow, you can do that by customizing the `ios.infoPlist` property in your [`app.json` file](../../versions/latest/config/app/#ios).

You can find the full list of available properties in [Apple's InfoPlistKeyReference](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html#//apple_ref/doc/uid/TP40009251-SW1). Apple also documents the basic guidelines for the structure of the message in the [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/app-architecture/requesting-permission/).

> **Note:** apps using permissions without descriptions _may be rejected from the App Store_. (see the [App Store Deployment Guide](../../../distribution/app-stores.md#system-permissions-dialogs-on-ios))

### Bare workflow

To request permissions on iOS, you have to describe why the permissions are requested and install the library that requests and uses the permission. When using the bare workflow, you have to edit the project `Info.plist`.

You can find the full list of available properties in [Apple's InfoPlistKeyReference](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html#//apple_ref/doc/uid/TP40009251-SW1). Apple also documents the basic guidelines for the structure of the message in the [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/app-architecture/requesting-permission/).

## Android

### Managed workflow

On Android, permissions are little bit simpler than iOS. In the managed workflow, permissions are controlled via the `android.permissions` property in your [`app.json` file](../../versions/latest/config/app/#android). In the bare workflow, they have to be defined in your `AndroidManifest.xml`.

Some Expo and React Native modules include permissions by default. If you use `expo-location`, for example, both the `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` are implied and added to your app's permissions automatically.

To limit the permissions your managed workflow app requires, set the `android.permissions` property in your [`app.json` file](../../versions/latest/config/app/#android) to list only the permissions you need, and Expo will also include the minimum permissions it requires to run. See the [`Permission types`](#permission-types) below to learn about which Android permissions are added. You can find a full list of all available permissions in the [Android Manifest.permissions reference](https://developer.android.com/reference/android/Manifest.permission).

- [See the `android.permissions` documentation](../../versions/latest/config/app.md#permissions) to learn about which permissions are always included.
- Apps using dangerous or signature permissions without valid reasons _may be rejected by Google_. Make sure you follow the [Android permissions best practices](https://developer.android.com/training/permissions/usage-notes) when submitting your app.
- By default, the permissions implied by the modules you installed are added to the `AndroidManifest.xml` at build time. To exclude permissions, you have to define the `android.permissions` manifest property.

### Bare workflow

In the bare workflow, permissions are controlled in your project `AndroidManifest.xml`.

Some Expo and React Native modules include permissions by default. If you use `expo-location`, for example, both the `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` are implied and added to your app's permissions automatically. To limit the permissions your managed workflow app requires, add them them to a [list of explicitly excluded permissions](#excluding-android-permissions).

Apps using dangerous or signature permissions without valid reasons _may be rejected by Google_. Make sure you follow the [Android permissions best practices](https://developer.android.com/training/permissions/usage-notes) when submitting your app.

#### Excluding Android permissions

When adding Expo and other React Native modules to your project, certain Android permissions might be implied automatically. The modules should only add relevant permissions **required** to use the module, however, sometimes you may want to remove some of these permissions.

Since the `android.permissions` manifest property doesn't work in the bare workflow- when you want to exclude specific permissions from the build, you have to "blacklist" them in your `AndroidManifest.xml`. You can do that with the `tools:node="remove"` attribute on the `<use-permission>` tag.

```xml
<manifest xmlns:tools="http://schemas.android.com/tools">
  <uses-permission tools:node="remove" android:name="android.permission.ACCESS_FINE_LOCATION" />
</manifest>
```

> **Note:** you have to define the `xmlns:tools` attribute on `<manifest>` before you can use the `tools:node` attribute on permissions.

## Permissions on Web

On web permissions like the `Camera` and `Location` can only be requested from a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts#When_is_a_context_considered_secure), e.g. using `https://` or `http://localhost`. This limitation is similar to Android's manifest permissions and iOS's infoPlist usage messages and enforced to increase privacy.

## Manually testing permissions

Often you want to be able to test what happens when a user rejects a permission, to ensure that it has the desired behavior. An operating-system level restriction on both iOS and Android prohibits an app from asking for the same permission more than once (you can imagine how this could be annoying for the user to be repeatedly prompted for permissions). So in order to test different flows involving permissions in development, you may need to uninstall and reinstall the Expo Go app. In the simulator this is as easy as deleting the app, and `expo-cli` will automatically install it again next time you launch the project.
