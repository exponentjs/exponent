<h1 align="center">@expo/html-elements</h1>

<img alt="Product: demo" src="https://dev-to-uploads.s3.amazonaws.com/i/xoc3yx7qfqf6e1w6mm2e.png" />

<p align="center">
  <!-- iOS -->
  <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  <!-- Android -->
  <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  <!-- Web -->
  <img alt="Supports Expo Web" longdesc="Supports Expo Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
  <a aria-label="Circle CI" href="https://circleci.com/gh/expo/expo/tree/master">
    <img alt="Circle CI" src="https://flat.badgen.net/circleci/github/expo/expo?label=Circle%20CI&labelColor=555555&icon=circleci">
  </a>
</p>

Simple, light-weight, and well tested, universal semantic HTML elements as React components for iOS, Android, web, and desktop apps!

We at Expo recommend using platform agnostic primitives like `View`, `Image`, and `Text` whenever possible but sometimes that's not easy. Some primitives like Tables, and Footers are native to web only and currently have no way of easily accessing. This package aims to solve that while still being an optimal UI package for iOS, and Android.

### What you get

- Using `@expo/html-elements` will optimize your website for SEO and accessibility. Meaning your websites are indexed more accurately and your native apps better accommodate physically impaired users.
  - This package takes full advantage of [`react-native-web` a11y rules](https://github.com/necolas/react-native-web/blob/master/packages/docs/src/guides/accessibility.stories.mdx) whenever possible.
  - For example, the `H1` component will render an `<h1 />` on web, a `UILabel` on iOS, and a `TextView` on Android.
- Every component can accept styles from the `StyleSheet` API.
- TypeScript works for iOS, Android, and web, no more having to create monkey patches to use `href` on a `Text` element.
- Every component is tested render **tested universally** for iOS, Android, and Web using the package [`jest-expo-enzyme`](https://www.npmjs.com/package/jest-expo-enzyme). Each element is also **E2E tested** on iOS with Detox, and web with [`jest-expo-puppeteer`](https://www.npmjs.com/package/jest-expo-puppeteer).
- This package is completely side-effect free!

## Setup

Install:

```sh
yarn add @expo/html-elements
```

Import and use the package:

```tsx
import { H1 } from '@expo/html-elements';
```

# Components

Here is a list of all the currently supported elements and the web feature they map to. Not all HTML elements are supported. There are some HTML elements that mostly overlap with some universal modules, you should always try to use the universal modules whenever possible. All supported components are a capitalized variation of the semantic HTML they implement/emulate.

| HTML                                |      `@expo/html-elements`      |
| ----------------------------------- | :-----------------------------: |
| [`<a />`][html-a]                   |          [`<A />`](#a)          |
| [`<article />`][html-article]       |    [`<Article />`](#article)    |
| [`<aside />`][html-aside]           |      [`<Aside />`](#aside)      |
| [`<b />`][html-b]                   |          [`<B />`](#b)          |
| [`<blockquote />`][html-blockquote] | [`<BlockQuote />`](#blockquote) |
| [`<br />`][html-br]                 |         [`<BR />`](#br)         |
| [`<caption />`][html-caption]       |    [`<Caption />`](#caption)    |
| [`<code />`][html-code]             |       [`<Code />`](#code)       |
| [`<del />`][html-del]               |        [`<Del />`](#del)        |
| [`<em />`][html-em]                 |         [`<EM />`](#em)         |
| [`<footer />`][html-footer]         |     [`<Footer />`](#footer)     |
| [`<h1 />`][html-h1]                 |         [`<H1 />`](#h1)         |
| [`<h2 />`][html-h2]                 |         [`<H2 />`](#h2)         |
| [`<h3 />`][html-h3]                 |         [`<H3 />`](#h3)         |
| [`<h4 />`][html-h4]                 |         [`<H4 />`](#h4)         |
| [`<h5 />`][html-h5]                 |         [`<H5 />`](#h5)         |
| [`<h6 />`][html-h6]                 |         [`<H6 />`](#h6)         |
| [`<header />`][html-header]         |     [`<Header />`](#header)     |
| [`<hr />`][html-hr]                 |         [`<HR />`](#hr)         |
| [`<i />`][html-i]                   |          [`<I />`](#i)          |
| [`<main />`][html-main]             |       [`<Main />`](#main)       |
| [`<mark />`][html-mark]             |       [`<Mark />`](#mark)       |
| [`<nav />`][html-nav]               |        [`<Nav />`](#nav)        |
| [`<p />`][html-p]                   |          [`<P />`](#p)          |
| [`<pre />`][html-pre]               |        [`<Pre />`](#pre)        |
| [`<q />`][html-q]                   |          [`<Q />`](#q)          |
| [`<s />`][html-s]                   |          [`<S />`](#s)          |
| [`<section />`][html-section]       |    [`<Section />`](#section)    |
| [`<strong />`][html-strong]         |     [`<Strong />`](#strong)     |
| [`<table />`][html-table]           |      [`<Table />`](#table)      |
| [`<tbody />`][html-tbody]           |      [`<TBody />`](#tbody)      |
| [`<td />`][html-td]                 |         [`<TD />`](#td)         |
| [`<tfoot />`][html-tfoot]           |      [`<TFoot />`](#tfoot)      |
| [`<th />`][html-th]                 |         [`<TH />`](#th)         |
| [`<thead />`][html-thead]           |      [`<THead />`](#thead)      |
| [`<time />`][html-time]             |       [`<Time />`](#time)       |
| [`<tr />`][html-tr]                 |         [`<TR />`](#tr)         |
| [`<ul />`][html-ul]                 |         [`<UL />`](#ul)         |
| [`<li />`][html-li]                 |         [`<LI />`](#li)         |
| [`<details />`][html-details]       |            ⏱ Pending            |
| [`<summary />`][html-summary]       |            ⏱ Pending            |
| [`<progress />`][html-progress]     |            ⏱ Pending            |
| [`<select />`][html-select]         |            ⏱ Pending            |
| [`<picture />`][html-picture]       |            ⏱ Pending            |
| [`<figure />`][html-figure]         |            ⏱ Pending            |
| [`<figcaption />`][html-figcaption] |            ⏱ Pending            |
| [`<form />`][html-form]             |            ⏱ Pending            |
| [`<label />`][html-label]           |            ⏱ Pending            |

## External

Other features not implemented in this package can be found in different parts of the Expo ecosystem.

| HTML                            |      Universal       |                                                        Package                                                         |
| ------------------------------- | :------------------: | :--------------------------------------------------------------------------------------------------------------------: |
| `<audio />`                     |       `Audio`        |                                                 [`expo-av`][ex-audio]                                                  |
| `<button />`                    |     `<Button />`     |                                                     `react-native`                                                     |
| `<input type="text" />`         |    `<TextInput />`    |                                                     `react-native`                                                     |
| `<input type="file" />`         |    `ImagePicker`     |                                            [`expo-image-picker`][ex-ipick]                                             |
| `<input type="file" />`         |   `DocumentPicker`   |                                           [`expo-document-picker`][ex-dpick]                                           |
| `<canvas />`                    |     `<GLView />`     |                                     [`expo-gl`][ex-gl] & [Expo Canvas][ex-canvas]                                      |
| `<iframe />`                    |    `<WebView />`     | [`<WebView />`][ex-webview]. `@react-native-community/web-view` is not maintained by Expo and doesn't have web support |
| [`<link />`][html-link]         |         None         |              Eject the `index.html` with `expo customize:web` and link resources directly with `<link />`              |
| [`<noscript />`][html-noscript] |         None         |                Eject the `index.html` with `expo customize:web` and use `<noscript />` directly as HTML                |
| `<div />`                       |      `<View />`      |                                                     `react-native`                                                     |
| `<img />`                       |     `<Image />`      |                                                     `react-native`                                                     |
| `<span />`                      |      `<Text />`      |                                                     `react-native`                                                     |
| `<video />`                     |     `<Video />`      |                                                  [`expo-av`][ex-vid]                                                   |
| `style="backdrop-filter"`       |    `<BlurView />`    |                                                 [`expo-blur`][ex-blur]                                                 |
| `style="linear-gradient()"`     | `<LinearGradient />` |                                         [`expo-linear-gradient`][ex-gradient]                                          |

[ex-gradient]: https://docs.expo.io/versions/latest/sdk/linear-gradient/
[ex-webview]: https://docs.expo.io/versions/latest/sdk/webview/
[ex-audio]: https://docs.expo.io/versions/latest/sdk/audio
[ex-gl]: https://docs.expo.io/versions/latest/sdk/gl-view
[ex-canvas]: https://github.com/expo/expo-2d-context
[html-noscript]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript
[html-link]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[ex-blur]: https://docs.expo.io/versions/latest/sdk/blur-view/
[ex-vid]: https://docs.expo.io/versions/latest/sdk/video/
[ex-ipick]: https://docs.expo.io/versions/latest/sdk/imagepicker/
[ex-dpick]: https://docs.expo.io/versions/latest/sdk/document-picker/

## Headings

Header elements will use the expected [font size and margins from web](http://trac.webkit.org/browser/trunk/Source/WebCore/css/html.css) universally. You can see how the native CSS units (rem, and em) are transformed in [css/units](src/css/units.ts).

```tsx
import { H1, H2, H3, H4, H5, H6 } from '@expo/html-elements';
```

### `<H1/>`

```tsx
import { H1 } from '@expo/html-elements';
export default () => <H1>Example<H1/>
```

| Platform | Output                                                 |
| -------- | ------------------------------------------------------ |
| Web      | `<h1 aria-level="1" dir="auto" role="heading" />`      |
| Native   | `<Text accessibilityRole="header" style={[Custom]} />` |

### `<H2/>`

```tsx
import { H2 } from '@expo/html-elements';
export default () => <H2>Example<H2/>
```

| Platform | Output                                                 |
| -------- | ------------------------------------------------------ |
| Web      | `<h2 aria-level="2" dir="auto" role="heading" />`      |
| Native   | `<Text accessibilityRole="header" style={[Custom]} />` |

### `<H3/>`

```tsx
import { H3 } from '@expo/html-elements';
export default () => <H3>Example<H3/>
```

| Platform | Output                                                 |
| -------- | ------------------------------------------------------ |
| Web      | `<h3 aria-level="3" dir="auto" role="heading" />`      |
| Native   | `<Text accessibilityRole="header" style={[Custom]} />` |

### `<H4/>`

```tsx
import { H4 } from '@expo/html-elements';
export default () => <H4>Example<H4/>
```

| Platform | Output                                                 |
| -------- | ------------------------------------------------------ |
| Web      | `<h4 aria-level="4" dir="auto" role="heading" />`      |
| Native   | `<Text accessibilityRole="header" style={[Custom]} />` |

### `<H5/>`

```tsx
import { H5 } from '@expo/html-elements';
export default () => <H5>Example<H5/>
```

| Platform | Output                                                 |
| -------- | ------------------------------------------------------ |
| Web      | `<h5 aria-level="5" dir="auto" role="heading" />`      |
| Native   | `<Text accessibilityRole="header" style={[Custom]} />` |

### `<H6/>`

```tsx
import { H6 } from '@expo/html-elements';
export default () => <H6>Example<H6/>
```

| Platform | Output                                                 |
| -------- | ------------------------------------------------------ |
| Web      | `<h6 aria-level="6" dir="auto" role="heading" />`      |
| Native   | `<Text accessibilityRole="header" style={[Custom]} />` |

## Link

### `<A/>`

You can use the anchor element with href prop to open links. On native this will attempt to use the `Linking` API to open the `href`.

- The CSS style is fully normalized to match `<Text />`
- For pseudo-class effects like hover and focus states check out the package [`react-native-web-hooks`](https://www.npmjs.com/package/react-native-web-hooks) | [tutorial](https://blog.expo.io/css-pseudo-class-effects-in-expo-for-web-56649f88eb6b)

```tsx
import { A } from '@expo/html-elements';

export default () => <A href="#" target="_blank" />;
}
```

| Platform | Output                                                                          |
| -------- | ------------------------------------------------------------------------------- |
| Web      | `<a data-focusable="{true}" dir="auto" href="#" role="link" target="_blank" />` |
| Native   | `<Text accessibilityRole="link" onPress={[Function]} />`                        |

## Layout

You can use layout elements like Header, Main, Footer, Section, Nav, etc. as a drop-in replacement for `View`s in your existing app.

#### Default Layout style

All layout HTML elements inherit the shared style of `<View />` to accommodate the [Yoga layout engine][yoga] which we use on native for iOS, and Android.

- `display` is always `flex`. This is because [Yoga][yoga] only implements `display: flex`.
- `flex-direction` is always `column` instead of `row`.

#### Why use Layout elements

Consider the following: in your app you have a basic element at the top which wraps the buttons and title. A screen reader doesn't understand that this is a header, and mostly neither does a web crawler. But if you replace the encasing view with a `<Header />` the following happens:

- **iOS**: `UIView` uses [`UIAccessibilityTraitHeader`](https://developer.apple.com/documentation/uikit/uiaccessibilitytraitheader?language=objc).
- **Android**: `View` will use the proper [`AccessibilityNodeInfoCompat.CollectionItemInfoCompat`](https://github.com/facebook/react-native/blob/7428271995adf21b2b31b188ed83b785ce1e9189/ReactAndroid/src/main/java/com/facebook/react/uimanager/ReactAccessibilityDelegate.java#L370-L372) | [docs](https://developer.android.com/reference/android/support/v4/view/accessibility/AccessibilityNodeInfoCompat.CollectionItemInfoCompat).
- **web**: render an HTML 5 [`<header />`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header) with the ARIA `role` set to [`"banner"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Banner_role).

Some elements like `Footer` and `Main` have no iOS, or Android enhancements, but they'll still improve web. Using the proper HTML 5 elements will make your layout compliant with the [HTML5 outline algorithm](https://html.spec.whatwg.org/multipage/sections.html#outlines).

### `<Nav/>`

```tsx
import { Nav } from '@expo/html-elements';

export default () => <Nav />;
```

| Platform | Output                         |
| -------- | ------------------------------ |
| Web      | `<nav style="display:flex" />` |
| Native   | `<View />`                     |

### `<Header/>`

Renders a `<header />` on web with ARIA set to [`banner`][aria-banner] and a `View` with ARIA set to `header` on mobile.

```tsx
import { Header } from '@expo/html-elements';

export default () => <Header />;
```

| Platform | Output                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Web      | [`<header role="banner" />`][html-header]                                                                           |
| Native   | `<View />`                                                                                                          |
| iOS      | `UIView` uses [`UIAccessibilityTraitHeader`][uiatheader].                                                           |
| Android  | `View` will use the proper [`AccessibilityNodeInfoCompat.CollectionItemInfoCompat`][anicompat] [docs][anicompatdoc] |

[uiatheader]: https://developer.apple.com/documentation/uikit/uiaccessibilitytraitheader?language=objc
[anicompat]: https://github.com/facebook/react-native/blob/7428271995adf21b2b31b188ed83b785ce1e9189/ReactAndroid/src/main/java/com/facebook/react/uimanager/ReactAccessibilityDelegate.java#L370-L372
[anicompatdoc]: https://developer.android.com/reference/android/support/v4/view/accessibility/AccessibilityNodeInfoCompat.CollectionItemInfoCompat

### `<Main/>`

Renders a `<main />` on web with ARIA `role` set to `main` and a `View` with no ARIA set on mobile.

```tsx
import { Main } from '@expo/html-elements';

export default () => (
    <Main>
      <P>Some content in the main element</P>
    </Main>
  );
)
```

| Platform | Output                                      |
| -------- | ------------------------------------------- |
| Web      | `<main role="main" style="display:flex" />` |
| Native   | `<View />`                                  |

### `<Section/>`

Renders a `<section />` on web with ARIA set to `region` and a `View` with ARIA set to `summary` on mobile.

```tsx
import { Section } from '@expo/html-elements';

export default () => <Section />;
```

| Platform | Output                                           |
| -------- | ------------------------------------------------ |
| Web      | `<section role="region" style="display:flex" />` |
| Native   | `<View accessibilityRole="summary" />`           |

### `<Article/>`

Renders an `<article />` on web and a `View` everywhere else.

```tsx
import { Article } from '@expo/html-elements';

export default () => <Article />;
```

| Platform | Output                       |
| -------- | ---------------------------- |
| Web      | `<article role="article" />` |
| Native   | `<View />`                   |

### `<Aside/>`

```tsx
import { Aside } from '@expo/html-elements';

export default () => <Aside />;
```

| Platform | Output                           |
| -------- | -------------------------------- |
| Web      | `<aside role="complementary" />` |
| Native   | `<View />`                       |

### `<Footer/>`

Renders an `<footer />` on web and a `View` everywhere else.

```tsx
import { Footer } from '@expo/html-elements';

export default () => <Footer />;
```

| Platform | Output                          |
| -------- | ------------------------------- |
| Web      | `<footer role="contentinfo" />` |
| Native   | `<View />`                      |

## Text

Text elements currently use `Text` universally rendering either a `div` or `span` to emulate Yoga style properly.

- Style is modified to match web.
- All font styles are reset (minus `Code`, and `Pre`).
- All elements accept styles from `StyleSheet` API.

```tsx
import { P, B, S, I, BR, Code } from '@expo/html-elements';

export default () => (
  <>
    <P>
      Hello<B>World (in bold)</B>
    </P>
    <S>strike text</S>
    <BR />
    <I>Italic</I>
    <Code>const foo = true</Code>
  </>
);
```

### `<P/>`

Standard paragraph element.

| Platform  | Output                                                        |
| --------- | ------------------------------------------------------------- |
| Universal | `<Text style={{ fontSize: 14, marginVertical: '1em' }} />` |

### `<B/>`

Bold text text.

| Platform  | Output                                    |
| --------- | ----------------------------------------- |
| Universal | `<Text style={{ fontWeight: 'bold' }} />` |

### `<Strong/>`

Alternate bold text.

| Platform  | Output                                    |
| --------- | ----------------------------------------- |
| Universal | `<Text style={{ fontWeight: 'bold' }} />` |

### `<S/>`

Strike through text.

| Platform  | Output                                                    |
| --------- | --------------------------------------------------------- |
| Universal | `<Text style={{ textDecorationLine: 'line-through' }} />` |

### `<Del/>`

Alternate strike through text.

| Platform  | Output                                                    |
| --------- | --------------------------------------------------------- |
| Universal | `<Text style={{ textDecorationLine: 'line-through' }} />` |

### `<I/>`

Italic text.

| Platform  | Output                                     |
| --------- | ------------------------------------------ |
| Universal | `<Text style={{ fontStyle: 'italic' }} />` |

### `<EM/>`

Alternate italic text.

| Platform  | Output                                     |
| --------- | ------------------------------------------ |
| Universal | `<Text style={{ fontStyle: 'italic' }} />` |

### `<Code/>`

Inline code block with `fontFamily: 'Courier'` on iOS and Web, `fontFamily: 'monospace'` on Android.

| Platform  | Output                      |
| --------- | --------------------------- |
| Universal | `<Text style={[Custom]} />` |

### `<Pre/>`

Render a preformatted code block with `fontFamily: 'Courier'` on iOS and Web, `fontFamily: 'monospace'` on Android.

```jsx
<Pre>{`
body {
  color: red;
}
`}</Pre>

// Or pass views

<Pre>
  <Code>{`const val = true`}</Code>
</Pre>
```

| Platform  | Output                                    |
| --------- | ----------------------------------------- |
| Universal | `<Text style={[Custom]} />` \| `<View />` |

### `<Mark/>`

Highlight text.

| Platform  | Output                                                           |
| --------- | ---------------------------------------------------------------- |
| Universal | `<Text style={{ backgroundColor: 'yellow', color: 'black' }} />` |

### `<Q/>`

Quoted text.

| Platform  | Output                                             |
| --------- | -------------------------------------------------- |
| Universal | `<Text style={[Custom]}>"{props.children}"</Text>` |

### `<BlockQuote/>`

| Platform  | Output                      |
| --------- | --------------------------- |
| Universal | `<View style={[Custom]} />` |

### `<Time/>`

- `dateTime` prop is supported on web and stripped on native.

| Platform  | Output                      |
| --------- | --------------------------- |
| Universal | `<Text style={[Custom]} />` |

## Lists

Lists can be used to create basic bulleted or numbered lists. You should try and use universal `FlatList` or `SectionList` components for long scrolling lists instead of these.

### `<UL/>`

Create an unordered (bulleted) list `<ul />` on web, and emulates the style with a `<View />` on native.

- [x] Resets font styles everywhere.
- [ ] Supports i18n by reversing format on iOS and Android
- [ ] Supports custom bullets

```tsx
import { UL, LI } from '@expo/html-elements';

export default () => (
  <UL>
    <LI>oranges</LI>
    <LI>apples</LI>
    <UL>
      <LI>green</LI>
      <LI>red</LI>
    </UL>
  </UL>
);
```

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<ul />`                    |
| Native   | `<View style={[Custom]} />` |

### `<LI/>`

Create a standard list item `<li />` on web and a native view on mobile which can render text or views inside it.

| Platform | Output                                                     |
| -------- | ---------------------------------------------------------- |
| Web      | `<li />`                                                   |
| Native   | `<Text style={[Custom]} />` \| `<View style={[Custom]} />` |

## Rules

### `<HR/>`

Renders a `<View>` everywhere. Style is modified to match web.

```tsx
import { HR } from '@expo/html-elements';

export default () => <HR />;
```

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<hr />`                    |
| Native   | `<View style={[Custom]} />` |

### `<BR/>`

Create a line break.

| Platform | Output                                   |
| -------- | ---------------------------------------- |
| Web      | `<br />`                                 |
| Native   | `<View style={{height: 8, width: 0}} />` |

## Tables

Create tables universally.

- Each element renders to the expected type on web.
- `padding` is removed from all table elements.
- Text **can only** be rendered in `TH` and `TD` on mobile.
- `colSpan` and `rowSpan` are currently web-only (PRs welcome).

```tsx
import { Table, THead, TH, TBody, TFoot, TR, TD, Caption } from '@expo/html-elements';
import { Text } from 'react-native';

export default () => (
  <Table>
    <Caption>Caption</Caption>
    <THead>
      <TR>
        <TH colSpan="2">The table header</TH>
      </TR>
    </THead>
    <TBody>
      <TR>
        <TD>The table body</TD>
        <TD>with two columns</TD>
      </TR>
    </TBody>
    <TFoot>
      <TR>
        <TD>
          <Text>This is the table footer</Text>
        </TD>
      </TR>
    </TFoot>
  </Table>
);
```

#### Table example output web

```html
<table>
  <caption>
    Caption
  </caption>
  <thead>
    <tr>
      <th colspan="2">The table header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>The table body</td>
      <td>with two columns</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td><div>The table body</div></td>
    </tr>
  </tfoot>
</table>
```

### `<Table/>`

Base element for creating a Table.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<table />`                 |
| Native   | `<View style={[Custom]} />` |

### `<THead/>`

Header element in a Table.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<thead />`                 |
| Native   | `<View style={[Custom]} />` |

### `<TBody/>`

Body element in a Table.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<tbody />`                 |
| Native   | `<View style={[Custom]} />` |

### `<TFoot/>`

Footer element in a Table.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<tfoot />`                 |
| Native   | `<View style={[Custom]} />` |

### `<TH/>`

Used to display text in the Header.

- `colSpan` and `rowSpan` are currently web-only.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<th />`                    |
| Native   | `<Text style={[Custom]} />` |

### `<TR/>`

Used to create a Row in a Table.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<tr />`                    |
| Native   | `<View style={[Custom]} />` |

### `<TD/>`

Create a cell in a Table.

- `colSpan` and `rowSpan` are currently web-only.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<td />`                    |
| Native   | `<View style={[Custom]} />` |

### `<Caption/>`

Used to caption your table. Excepts text as a child.

| Platform | Output                      |
| -------- | --------------------------- |
| Web      | `<caption />`               |
| Native   | `<Text style={[Custom]} />` |

## TODO

- Improve relative imports for better tree-shaking.

## Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).

[yoga]: https://yogalayout.com/

<!-- HTML element links -->

[html-a]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
[html-article]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article
[html-aside]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside
[html-b]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/b
[html-blockquote]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blockquote
[html-br]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br
[html-caption]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption
[html-code]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code
[html-del]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/del
[html-em]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em
[html-footer]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer
[html-form]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[html-h1]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/h1
[html-h2]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/h2
[html-h3]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/h3
[html-h4]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/h4
[html-h5]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/h5
[html-h6]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/h6
[html-header]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header
[html-hr]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr
[html-i]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i
[html-main]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main
[html-mark]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark
[html-nav]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav
[html-ol]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol
[html-p]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p
[html-pre]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre
[html-q]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q
[html-s]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/s
[html-section]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section
[html-small]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/small
[html-strong]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong
[html-table]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table
[html-tbody]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody
[html-td]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td
[html-tfoot]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot
[html-th]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th
[html-thead]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead
[html-time]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
[html-tr]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr
[html-ul]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul
[html-li]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li
[html-label]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
[html-details]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
[html-summary]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary
[html-progress]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress
[html-select]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
[html-picture]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture
[html-figure]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure
[html-figcaption]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption
[aria-banner]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Banner_role
