---
title: DocumentPicker
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-37/packages/expo-document-picker'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import Video from '~/components/plugins/Video'

Provides access to the system's UI for selecting documents from the available providers on the user's device.

<Video file={"sdk/documentpicker.mp4"} loop={false} />

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-document-picker" />

## Configuration

### Managed workflow

For iOS, outside of the Expo client, the DocumentPicker module requires the iCloud entitlement to work properly. You need to set the `usesIcloudStorage` key to `true` in your `app.json` file as specified [here](../../../workflow/configuration.md#ios).

In addition, you'll also need to enable the iCloud Application Service in your App identifier. This can be done in the detail of your [App ID in the Apple developer interface](https://developer.apple.com/account/ios/identifier/bundle).

Enable iCloud service with CloudKit support, create one iCloud Container, and name it `iCloud.<your_bundle_identifier>`.

And finally, to apply those changes, you'll need to revoke your existing provisioning profile and run `expo build:ios -c`

### Bare workflow

For iOS bare projects, the `DocumentPicker` module requires the iCloud entitlement to work properly. If your app doesn't have it already, you can add it by opening the project in Xcode and following these steps:

- In the project, go to the `Capabilities` tab
- Set the iCloud switch to `on`
- Check the `iCloud Documents` checkbox

## API

```js
import * as DocumentPicker from 'expo-document-picker';
```

### `DocumentPicker.getDocumentAsync(options)`

Display the system UI for choosing a document. By default, the chosen file is copied to [the app's internal cache directory](filesystem.md#filesystemcachedirectory).

> **Note for Web:** The system UI can only be shown after user activation (e.g. a `Button` press). Therefore, calling `getDocumentAsync` in `componentDidMount`, for example, will **not** work as intended.

#### Arguments

- **options (_object_)** --

  A map of options:

  - **type (_string_)** -- The [MIME type](https://en.wikipedia.org/wiki/Media_type) of the documents that are available to be picked. Is also supports wildcards like `image/*` to choose any image. To allow any type of document you can use `*/*`. Defaults to `*/*`.
  - **copyToCacheDirectory (_boolean_)** -- If `true`, the picked file is copied to [`FileSystem.CacheDirectory`](filesystem.md#filesystemcachedirectory), which allows other Expo APIs to read the file immediately. Defaults to `true`. This may impact performance for large files, so you should consider setting this to `false` if you expect users to pick particularly large files and your app does not need immediate read access.
  - **multiple (_boolean_)** -- (Web Only) Allows multiple files to be selected from the system UI. Defaults to `false`.

#### Returns

On success returns a promise that resolves to an object containing `{ type: 'success', uri, name, size }` where `uri` is a URI to the local document file, `name` is its original name and `size` is its size in bytes.
If the user cancelled the document picking, the promise resolves to `{ type: 'cancel' }`.
