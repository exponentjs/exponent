---
title: Fonts
---

import SnackInline from '~/components/plugins/SnackInline';

Both iOS and Android and most desktop operating systems come with their own set of platform fonts but if you want to inject some more brand personality into your app, a well picked font can go a long way. And since each
operating system has its own set of platform fonts, if you want to produce an experience that is consistent for all users, you'll want to use your own fonts in your project. This guide will show you how to do that.

## Using a Google Font

Expo has first-class support for all fonts listed in [Google Fonts](https://fonts.google.com/). To use one of these, check out the [Expo Google Fonts](https://github.com/expo/google-fonts) project. With these packages you can quickly integrate any font or font variants.

To use the Inter font you can install the [`@expo-google-fonts/inter`](https://www.npmjs.com/package/@expo-google-fonts/inter) package with the command below.

```sh
$ expo install expo-font @expo-google-fonts/inter
```

After that, you can integrate this in your project by using the `useFonts` hook in the root of your app.

```jsx
import React from 'react';
import { Text } from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts, Inter_900Black } from '@expo-google-fonts/inter';

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return <Text style={{ fontFamily: 'Inter_900Black' }}>Inter Black</Text>;
}
```

## A minimal but complete working example

To create a new project including this example, run `npx create-react-native-app --template with-custom-font` in your terminal.

<SnackInline
label="Custom Font"
dependencies={['expo-font', 'expo-app-loading']}
files={{
    'assets/fonts/Inter-Black.otf': 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/44b1541a96341780b29112665c66ac67'
  }}>

```jsx
import React from 'react';
import { Text, View } from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';

export default props => {
  let [fontsLoaded] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter-Black', fontSize: 40 }}>Inter Black</Text>
        <Text style={{ fontSize: 40 }}>Platform Default</Text>
      </View>
    );
  }
};
```

</SnackInline>

When you load it on your device, you should see something like this:

<img src="/static/images/font-example-custom-font.jpg" style={{maxWidth: 305}} />

Inter Black is very bold and dark and pretty distinctive so you should be able to tell if you're able to
get the example working right, or if something is wrong. If the platform default font looks a little different
for you, that's fine; the platform default font can vary depending on the operating system and the device manufacturer (on Android).

## Getting a font

The first thing you'll need is a font file. In this example, we use Inter Black from the free and open source [Inter font family](https://rsms.me/inter/) by Rasmus Anderson. The convention in Expo apps is to put your fonts in an `./assets/fonts` directory, but you can put them anywhere you like.

### Supported font formats

The two officially supported font formats for the Expo platform are OTF and TTF. You should use one of those formats whenever you can. If your font is in another format, try to convert it to
one of those formats.

These are the only font formats that work consistently in Expo across web, Android, and iOS.

If you have both OTF and TTF versions of a font, prefer OTF. OTF is a newer format and `.otf` files are often smaller than `.ttf` files and sometimes OTF files will render slightly better in certain contexts. In general, both formats are very similar and perfectly acceptable.

### Beyond OTF and TTF

If you need to use another format, you may need to [customize the Metro bundler configuration](../guides/customizing-metro.md) to get anything other than TTF and OTF to work. In general, just don't do that unless you are really sure you want to. Trying to render a font format that a platform doesn't support may in some cases cause your app to crash.

But, for reference, here is a table of which formats work on which platforms.

| Format | Web | iOS | Android |
| ------ | --- | --- | ------- |
| ttf    | ✅  | ✅  | ✅      |
| otf    | ✅  | ✅  | ✅      |
| woff   | ✅  | ✅  |         |
| woff2  | ✅  | ✅  |         |
| dfont  |     |     | ✅      |
| svg    | ✳️  |     |         |
| eot    | ✳️  |     |         |
| fon    |     |     |         |
| bdf    |     |     |         |
| ps     |     |     |         |
| ttc    |     |     |         |

### Platform built-in fonts

If you don't want to use a custom font, your best bet is to just use the platform default font by not specifying a font family. Each platform that Expo apps support has a different set of fonts available by default, so there's no good way to specify one that will work everywhere without supplying your own custom font.

If you are curious, [Nader Dabit](https://twitter.com/dabit3) maintains a [list of fonts always available on iOS and Android](https://github.com/react-native-training/react-native-fonts).

And on web, there are a number of generic font families that you can specify. Different users, browsers, and operating systems will be configured to use different fonts for each of these font family specifications. For example, Safari on an iPhone will use San Francisco as its default for `sans-serif` while Microsoft Edge on Windows will use Arial, and Chrome on Android will typically use Roboto, though OnePlus phones will often use Slate, etc., etc..

- `sans-serif`
- `serif`
- `monospace`
- `fantasy`
- `cursive`

In general, your safest bets are just to use the system default which will usually be an easy-to-read sans-serif font that the user of any system should be familiar with; or to use your own custom font so you have precise control over what the user will see.

## Using the `<AppLoading />` component

Since your fonts won't be ready right away, it is generally a good practice to not render anything until the font is ready.

A great way we can do that is to use the [`<AppLoading />`](../versions/latest/sdk/app-loading.md) component. In its simplest form, you can just render it while you're waiting for your app to load.

Sometimes -- particularly on the web -- people choose to render their content in a platform default font while their custom font is loading. Or, alternatively, to render the rest of their content, that doesn't depend on the custom font while the font is loading.

These approaches are called FOUT and FOIT and you can read a lot more about them on the web.

In general, these strategies are not recommended for Expo apps. If you include your fonts in your project, the
fonts will always be delivered to the user by the time your code is running. The one exception to this is that you may prefer to do this on the web.

## Additional information

You probably don't need to know anything beyond this point in this guide to use custom fonts effectively in your app, but if you are curious or your use case has not been addressed by the above information, please continue reading.

### Loading a remote font directly from the web

In general, it's best and safest to load fonts from your local assets. If you submit to app stores, they
will be bundled with the download and available immediately. And you don't have to worry about CORS or other potential issues.

But if you want to do it, it is also possible to load a remote font file directly from the web rather than from your project's assets.

To do this, just replace the `require('./assets/fonts/MyFont.otf')` with the URL of your font.

Here is a minimal, complete example.

<SnackInline label='Remote Font' dependencies={['expo-font', 'expo-app-loading']}>

```jsx
import React from 'react';
import { Text, View } from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';

export default props => {
  let [fontsLoaded] = useFonts({
    'Inter-SemiBoldItalic': 'https://rsms.me/inter/font-files/Inter-SemiBoldItalic.otf?v=3.12',
  });
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter-SemiBoldItalic' }}>Inter SemiBoldItalic</Text>
        <Text>Platform Default</Text>
      </View>
    );
  }
};
```

</SnackInline>

> ⚠️ **If loading remote fonts, make sure they are being served from an origin with CORS properly configured** If you don't do this, your remote font might not load properly on the web platform.

### Using `Font.loadAsync` instead of the `useFonts` hook

If you don't want to use the `useFonts` hook (for example, maybe you prefer class components), you can use `Font.loadAsync` directly. What is happening under the hood is that your fonts are being loaded using `Font.loadAsync` from the [`expo-font` library](../versions/latest/sdk/font.md). You can use that directly if you prefer, or if you want to have more fine-grained control over when your fonts are loaded before rendering.

<SnackInline
label="Font loadAsync"
dependencies={['expo-font', 'expo-app-loading']}
files={{
    'assets/fonts/Inter-Black.otf': 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/44b1541a96341780b29112665c66ac67'
  }}>

```jsx
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';

let customFonts = {
  'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  'Inter-SemiBoldItalic': 'https://rsms.me/inter/font-files/Inter-SemiBoldItalic.otf?v=3.12',
};

export default class App extends React.Component {
  state = {
    fontsLoaded: false,
  };

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
  }

  render() {
    if (this.state.fontsLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Platform Default</Text>
          <Text style={{ fontFamily: 'Inter-Black' }}>Inter Black</Text>
          <Text style={{ fontFamily: 'Inter-SemiBoldItalic' }}>Inter SemiBoldItalic</Text>
        </View>
      );
    } else {
      return <AppLoading />;
    }
  }
}
```

</SnackInline>
