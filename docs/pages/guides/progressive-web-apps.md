---
title: Progressive Web Apps
---

A progressive web app (or PWA for short) is a website that can be installed on the user's device and used offline. If you build your native app with Expo, then Expo CLI can generate a lot of the PWA automatically based on how the native app works. Ex: icons, splash screens, orientation, etc. Just [enable service workers](https://expo.fyi/enabling-web-service-workers) to get a complete PWA.

You can test your PWA in an Emulator and Simulator by running `expo start:web --ios --android` then installing the PWA via the mobile browser.

## Usage

Expo web projects generate PWA assets and manifests by default, you only need to [enable offline web support](https://expo.fyi/enabling-web-service-workers) to get a full PWA. You can disable asset and manifest generation by passing the `--no-pwa` to `expo build:web`, this won't effect favicon generation.

When you run `expo build:web` the Webpack config reads your `app.config.js` (or `app.json`) and generates a PWA from it.

The following properties can be used to customize your PWA:

| `app.config.js`                     | `manifest.json`               | `index.html`                                            |
| ----------------------------------- | ----------------------------- | ------------------------------------------------------- |
| `web.backgroundColor`               | `background_color`            |                                                         |
| `web.description \| description`    | `description`                 | `<meta name="description" />`                           |
| `web.dir`                           | `dir`                         |                                                         |
| `web.display`                       | `display`                     |                                                         |
| `web.lang`                          | `lang`                        | `<html lang="">`                                        |
| `web.name \| name`                  | `name`                        | `<title />`                                             |
| `web.orientation \| orientation`    | `orientation`                 |                                                         |
| `web.scope`                         | `scope`                       |                                                         |
| `web.shortName \| web.name`         | `short_name`                  | `<meta name="apple-mobile-web-app-title"/>`             |
| `web.startUrl`                      | `start_url`                   |                                                         |
| `web.themeColor \| primaryColor`    | `theme_color`                 | `<meta name="theme-color" />`                           |
| `web.crossorigin`                   | `crossorigin`                 |                                                         |
| `web.relatedApplications`           | `related_applications`        |                                                         |
| `web.preferRelatedApplications`     | `prefer_related_applications` |                                                         |
| `android.icon \| icon`              | `icons`                       |                                                         |
| `ios.icon \| icon`                  |                               | `<link rel="apple-touch-icon" >`                        |
| `web.favicon \| icon`               |                               | `<link rel="shortcut icon" >`                           |
| `web.barStyle`                      |                               | `<meta name="apple-mobile-web-app-status-bar-style" />` |
| `web.splash \| ios.splash \| splash`|                               | `<link rel="apple-touch-startup-image" >`               |

If you need finer control on how the PWA is generated, you should eject the `web/index.html` and add it there.

### Icons

Icons are generated in Webpack using the [`expo-pwa`][expo-pwa] CLI. You can customize and override icon generation by using the `expo-pwa` CLI directly. [Learn more about `expo-pwa`][expo-pwa].

[expo-pwa]: https://github.com/expo/expo-cli/tree/master/packages/pwa

### Chrome

Chrome PWAs use the `manifest.json` and various meta tags in the `<head />` element of the website's `index.html`. Chrome PWAs are far more robust than iOS/Safari PWAs so you may find that certain features don't line up as well as they do natively.

### Safari

Safari PWAs do not use the `manifest.json`, instead they rely on meta tags in the `<head/>` element of a website's `index.html`. Expo unifies values as much as possible to simplify this.

- Safari icons are resolved with: `ios.icon | icon`.
  - All icons can be individually overwritten with `<link rel="apple-touch-icon" />` in the `web/index.html`
- Splash screens are resolved with: `web.splash | ios.splash | splash`.
  - All splash screens can be individually overwritten with `<link rel="apple-touch-startup-image" />` in the `web/index.html`
- Status Bar Style is resolved with: `web.meta.apple.barStyle | web.barStyle`.
  - The default status bar style is `black-translucent` (the only full screen setting).
  - This can be overwritten with `<meta name="apple-mobile-web-app-status-bar-style" />` in the `web/index.html`
- The home screen name is resolved with: `web.shortName | web.name | name`.
  - This can be overwritten with `<meta name="apple-mobile-web-app-title" />` in the `web/index.html`

### Offline

By default we enable offline support using the Webpack Workbox plugin, you can learn more about how Expo service workers function here: [Expo Webpack Service Workers docs](https://github.com/expo/expo-cli/tree/master/packages/webpack-config#service-workers).

### Related Applications

[Related applications](https://developer.mozilla.org/en-US/docs/Web/Manifest#related_applications) are a way of telling your website which apps it should install in favor of a PWA, Expo websites try to recommend the native app when possible.

Related applications can be inferred automatically from the following native `app.config.js` properties:

```js
// app.config.js
export default {
  ios: {
    bundleIdentifier: 'com.myapp',
    appStoreUrl: 'app store url',
  },
  android: {
    androidPackage: 'package',
    // This is optional as it can be inferred from the androidPackage.
    playStoreUrl: 'play store url',
  },
};
```

**Optionally** you could override these values by manually defining the related applications:

```js
export default {
  web: {
    relatedApplications: [
      {
        platform: 'itunes',
        url: 'app store url',
        id: 'iOS bundle identifier',
      },
      {
        platform: 'play',
        url: 'play store url',
        id: 'android package',
      },
    ],
    preferRelatedApplications: true,
  },
};
```

### Manual Setup

Under the hood `@expo/webpack-config` uses a CLI called `expo-pwa`. If you want more control on how PWAs are generated, you can use the `expo-pwa` CLI directly.

Firstly, you'll need to eject the `web/index.html` with `expo customize:web`. Now you can generate custom files and link them in the `web/index.html`. `@expo/webpack-config` will check to see if assets are linked first before attempting to generate new ones.

#### manifest.json

- `touch web/manifest.json` or `expo-pwa manifest`
- Add the following line to the `<head/>` element of your `web/index.html`:

```html
<link rel="manifest" href="/manifest.json" />
```

Now `expo build:web` will copy the `web/manifest.json` file into the build folder and skip converting the `app.config.js` or `app.json` into a `manifest.json`.

Note that if the `icons` property is not defined then the build step will still attempt to generate and append Chrome icons to your `manifest.json`.
