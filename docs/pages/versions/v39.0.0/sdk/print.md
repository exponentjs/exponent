---
title: Print
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-39/packages/expo-print'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-print`** provides an API for iOS (AirPrint) and Android printing functionality.

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-print" />

## API

```js
import * as Print from 'expo-print';
```

### `Print.printAsync(options)`

Prints a document or HTML, on web this prints the HTML from the page.

> **Note**: On iOS, printing from HTML source **doesn't** support local asset URLs (due to `WKWebView` limitations). As a workaround you can use inlined base64-encoded strings. See [this comment](https://github.com/expo/expo/issues/7940#issuecomment-657111033) for more details.

#### Arguments

- **options (_object_)** -- A map defining what should be printed:
  - **uri (_string_)** -- URI of a PDF file to print. Remote, local (ex. selected via `DocumentPicker`) or base64 data URI starting with `data:application/pdf;base64,`. This only supports PDF, not other types of document (e.g. images). **Available on Android and iOS only.**
  - **html (_string_)** -- HTML string to print. **Available on Android and iOS only.**
  - **width (_number_)** -- Width of the single page in pixels. Defaults to `612` which is a width of US Letter paper format with 72 PPI. **Available only with `html` option.**
  - **height (_number_)** -- Height of the single page in pixels. Defaults to `792` which is a height of US Letter paper format with 72 PPI. **Available only with `html` option.**
  - **markupFormatterIOS (_string_)** -- **Available on iOS only.** Alternative to `html` option that uses [UIMarkupTextPrintFormatter](https://developer.apple.com/documentation/uikit/uimarkuptextprintformatter) instead of WebView. Might be removed in the future releases.
  - **printerUrl (_string_)** -- **Available on iOS only.** URL of the printer to use. Returned from `selectPrinterAsync`.
  - **orientation (_string_)** -- **Available on iOS only.** The orientation of the printed content, `Print.Orientation.portrait` or `Print.Orientation.landscape`.

#### Returns

- Resolves to an empty promise if printing started.

### `Print.printToFileAsync(options)`

Prints HTML to PDF file and saves it to [app's cache directory](filesystem.md#filesystemcachedirectory). On web this method opens the print dialog.

#### Arguments

- **options (_object_)** -- A map of options:
  - **html (_string_)** -- HTML string to print into PDF file.
  - **width (_number_)** -- Width of the single page in pixels. Defaults to `612` which is a width of US Letter paper format with 72 PPI.
  - **height (_number_)** -- Height of the single page in pixels. Defaults to `792` which is a height of US Letter paper format with 72 PPI.
  - **base64 (_boolean_)** -- Whether to include base64 encoded string of the file in the returned object.

#### Returns

- Resolves to an object with following keys:
  - **uri (_string_)** -- A URI to the printed PDF file.
  - **numberOfPages (_number_)** -- Number of pages that were needed to render given content.
  - **base64 (_string_)** -- Base64 encoded string containing the data of the PDF file. **Available only if `base64` option is truthy.** It doesn't include data URI prefix `data:application/pdf;base64,`.

### `Print.selectPrinterAsync()`

**Available on iOS only.** Chooses a printer that can be later used in `printAsync`.

#### Returns

- Resolves to an object containing `name` and `url` of the selected printer.

## Page margins

If you're using `html` option in `printAsync` or `printToFileAsync`, the resulting print might contain page margins (it depends on WebView engine).
They are set by `@page` style block and you can override them in your HTML code:

```html
<style>
  @page {
    margin: 20px;
  }
</style>
```

See [@page docs on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@page) for more details.
