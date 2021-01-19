---
title: Create a Splash Screen
---

A splash screen, also known as a launch screen, is the first screen that a user sees when opening your app, and it stays visible while the app is loading. You can control when the splash screen disappears by using the [AppLoading](../versions/latest/sdk/app-loading.md) component or [SplashScreen module](../versions/latest/sdk/splash-screen.md).

## Customize the splash screen for your app

The default splash screen is a blank white screen. This might work for you, if it does, you're in luck! If not, you're also in luck because it's quite easy to customize using `app.json` and the `splash` key. Let's walk through it.

### Video walkthrough

Create an app icon and splash image with the [Figma template](https://www.figma.com/file/ddc0glVeILssZl0Dcn1lSS/App-Icon-and-Splash?node-id=0%3A1) and video below:

<object width="100%" height="400">
   <param name="movie" value="https://youtube.com/embed/mVOFvLSiJ_s" />
   <param name="wmode" value="transparent" />
   <embed src="https://youtube.com/embed/mVOFvLSiJ_s" type="application/x-shockwave-flash" wmode="transparent" width="100%" height="400" />
 </object>

### Make a splash image

The [iOS Human Interface Guidelines](https://developer.apple.com/ios/human-interface-guidelines/icons-and-images/launch-screen/) list the static launch image sizes. I'll go with `1242` pixels wide and `2436` pixels tall -- this is the width of the iPhone 8 Plus (the widest iPhone) and the height of the iPhone X (the tallest iPhone). Expo will resize the image for you depending on the size of the device, and we can specify the strategy used to resize the image with `splash.resizeMode`.

Android screen sizes vary greatly with the massive variety of devices on the market. One strategy to deal with this is to look at the most common resolutions and design around that - [you can see a list of devices and their resolutions here](https://material.io/resources/devices/). Given that we can resize and crop our splash image automatically, it looks like we can stick with our dimensions, as long as we don't depend on the splash image fitting the screen exactly. This is convenient because we can use one splash image for both iOS and Android - less for you to read in this guide and less work for you to do.

You can work off of [this Sketch template](https://github.com/expo/files/blob/b264c7f7bf2cacfbdb45640063988ab61dfbbe23/splash-template.sketch?raw=true) if you like. I did, and I changed the background color to a faint yellow and put a Noodle emoji in the middle. It's worth noting that the splash image supports transparency, although we didn't use it here.

![](/static/images/splash-example.png)

Export the image as a PNG and put it in your project directory. I'll assume it's in the `assets` directory and named `splash.png`.

### `splash.image`

Open your `app.json` and add the following inside of the `"expo"` field:

```
"splash": {
  "image": "./assets/splash.png"
}
```

Now re-open the Expo client and open your app, and you should see your beautiful splash screen. There may be a delay before it shows up, see ["Differences between environments" below](#differences-between-environments---ios) for more information on that.

> **Note**: It's required to close and re-open the Expo client app on iOS in order to see changes to the splash screen in the manifest. This is a known issue that we are working to resolve. On Android, you need to press the refresh button from the notification drawer.

### `splash.backgroundColor`

If you set a background color other than white for your splash image, you may see white border around it. This is due to the `splash.resizeMode` property (which we will discuss shortly) and the default background color, which is `#ffffff` (white). Let's resolve this by setting the `splash.backgroundColor` to be the same as our splash image background color.

```
"splash": {
  "image": "./assets/splash.png",
  "backgroundColor": "#FEF9B0"
}
```

![backgroundColor Example](/static/images/backgroundColor-noodles.png)

### `splash.resizeMode`

Any splash image that you provide will be resized to maintain its aspect ratio and to fit the resolution of the user's device. There are two strategies that can be used for resizing: `contain` (default) and `cover`. In both cases, the splash image is within the splash screen. These work the same as the React Native `<Image>` component's `resizeMode` style equivalents, as demonstrated in the following diagram.

![resizeMode](/static/images/resizeMode.png)

Applying this to our noodles example, let's remove the `backgroundColor` and try it out:

```
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "cover"
}
```

![resizeMode Example](/static/images/resizeMode-noodles.png)

Notice that in the last example, we stretched the image to fill the entire width, while maintaining the aspect ratio, and so the noodles emoji ended up being larger than it was when `resizeMode` was set to `contain`. If you are still unclear about the difference between contain and cover, [this blog post describes precisely what they mean](http://blog.vjeux.com/2013/image/css-container-and-cover.html).

### Customizing the configuration for iOS and Android

Any of the splash options can be configured on a per-platform basis by nesting the configuration under the `android` or `ios` keys within `app.json` (the same as how you would customize an icon for either platform). In addition to this, certain configuration options are only available on iOS or Android.

- On iOS, you can set [ios.splash.tabletImage](../workflow/configuration.md#tabletimage) if you would like to have a different splash image on iPads.
- On Android, you can set splash images for [different device DPIs](../workflow/configuration.md#android), from `mdpi` to `xxxhdpi`.

### Using `AppLoading` and/or `SplashScreen`

As long as `AppLoading` is the only component rendered in your application, your splash screen will remain visible. We recommend using `AppLoading` while caching assets or fetching any data from `AsyncStorage` to set the app up. However, if you want to control the moment of splash screen visibility change use `SplashScreen`.

Read more about [AppLoading](../versions/latest/sdk/app-loading.md) and [SplashScreen](../versions/latest/sdk/splash-screen.md).

### Differences between environments - iOS

Your app can be opened from the Expo client or in a standalone app, and it can be either published or in development. There are slighty differences in the splash screen behavior between these environments.

![](https://media.giphy.com/media/l378l98EI0VQdwRzy/giphy.gif)

- **On the left**, we are in the Expo client and loading an app that is currently in development. Notice that on the bottom of the splash screen you see an information bar that shows information relevant to preparing the JavaScript and downloading it to the device. We see an orange screen before the splash image appears, because the background color is set immediately but the image needs to be downloaded.
- **In the middle**, we are in the Expo client and we are loading a published app. Notice that again the splash image does not appear immediately.
- **On the right**, we are in a standalone app. Notice that the splash image appears immediately.

### Using a `.xib` file as the launch screen for the standalone iOS app

For iOS, you can also choose to use a `.xib` interface builder document as the splash screen of the standalone iOS app. Simply set `ios.splash.xib` in `app.json` to the path to your `.xib` file.

> **Note**: `.xib` file will only be used in the standalone app. The splash image will continue to be used in the Expo client.

### Splash screen API limitations on Android

Splash screen behaves in most cases exactly the same as in iOS case.

There is a slight difference when it comes down to **standalone Android applications**.
In this scenario extra attention should be paid to [`android.splash` section](../workflow/configuration.md#android) configuration inside [`app.json`](../workflow/configuration.md#android).

Depending on the `resizeMode` you will get the following behavior:

- **contain** - on Android, the splash screen API is unable to stretch/scale the splash image (see the **native** mode). As a result, the `contain` mode will initially display only the background color, and when the initial view hierarchy is mounted then `splash.image` will be displayed.
- **cover** - this mode has the limitations as **contain** for the same reasons.
- **native** - in this mode your app will be leveraging Android's ability to present a static bitmap while the application is starting up. Android (unlike iOS) does not support stretching the provided image, so the application will present the given image centered on the screen. By default `splash.image` would be used as the `xxxdpi` resource. It's up to you to provide graphics that meet your expectations and fit the screen dimension. To achieve this, use different resolutions for [different device DPIs](../workflow/configuration.md#android), from `mdpi` to `xxxhdpi`.

### Bare workflow apps

To setup and customize your splash screen in a bare app, refer to [this guide](https://github.com/expo/expo/tree/master/packages/expo-splash-screen#-installation-in-bare-react-native-projects).

### Known issues

The following exists are known to us and will be resolved shortly.

- iOS splash screen status bar is white in standalone apps but dark in Expo client. It should be dark in standalone apps by default too, and also it should be customizable.

### iOS Caching

Splash Screens on iOS standalone apps can sometimes encounter a caching issue where the previous image will flash before showing the new, intended image. When this occurs, we recommend you try power cycling your device and uninstalling and re-installing the application. However,the caching sometimes can persist for a day or two so be patient if the aforementioned steps were unable to resolve the issue.

### Migrating from the `loading` API

The `loading` API is deprecated as of SDK 22 and has a strictly worse user experience, so we recommend you change over to `splash` as soon as you have time - the `loading` API will be removed in favor of `splash` in SDK 25.
