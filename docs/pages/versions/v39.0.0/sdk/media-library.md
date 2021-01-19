---
title: MediaLibrary
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-39/packages/expo-media-library'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-media-library`** provides access to the user's media library, allowing them to access their existing images and videos from your app, as well as save new ones. You can also subscribe to any updates made to the user's media library.

<PlatformsSection android emulator ios simulator />

## Installation

<InstallSection packageName="expo-media-library" />

## Configuration

In managed apps, the permission to access images or videos ([`Permissions.CAMERA_ROLL`](permissions.md#permissionscamera_roll)) is added automatically.

## API

```js
import * as MediaLibrary from 'expo-media-library';
```

## Methods

### `MediaLibrary.requestPermissionsAsync()`

Asks the user to grant permissions for accessing media in user's media library. Alias for `Permissions.askAsync(Permissions.CAMERA_ROLL)`.

#### Returns

A promise that resolves to an object of type [CameraRollPermissionResponse](#medialibrarycamerarollpermissionresponse).

### `MediaLibrary.getPermissionsAsync()`

Checks user's permissions for accessing media library. Alias for `Permissions.getAsync(Permissions.CAMERA_ROLL)`.

#### Returns

A promise that resolves to an object of type [CameraRollPermissionResponse](#medialibrarycamerarollpermissionresponse).

### `MediaLibrary.createAssetAsync(localUri)`

Creates an asset from existing file. The most common use case is to save a picture taken by [Camera](camera.md). This method requires `CAMERA_ROLL` permission.

```js
const { uri } = await Camera.takePictureAsync();
const asset = await MediaLibrary.createAssetAsync(uri);
```

#### Arguments

- **localUri (_string_)** -- A URI to the image or video file. It must contain an extension. On Android it must be a local path, so it must start with `file:///`.

#### Returns

An object representing an [asset](#asset).

### `MediaLibrary.saveToLibraryAsync(localUri)`

Saves the file at given `localUri` to the user's media library. Unlike [`createAssetAsync()`](#medialibrarycreateassetasynclocaluri), this method doesn't return created asset.

On **iOS 11+**, it's possible to use this method without asking for `CAMERA_ROLL` permission, however then yours `Info.plist` should have `NSPhotoLibraryAddUsageDescription` key.

#### Arguments

- **localUri (_string_)** -- A URI to the image or video file. It must contain an extension. On Android it must be a local path, so it must start with `file:///`.

### `MediaLibrary.getAssetsAsync(options)`

Fetches a page of assets matching the provided criteria.

#### Arguments

- **options (_object_)**

  - **first (_number_)** -- The maximum number of items on a single page. Defaults to 20.
  - **after (_string_)** -- Asset ID of the last item returned on the previous page.
  - **album (_string_ | _Album_)** -- [Album](#album) or its ID to get assets from specific album.
  - **sortBy (_array_)** -- An array of [SortBy](#medialibrarysortby) keys. By default, all keys are sorted in descending order, however you can also pass a pair `[key, ascending]` where the second item is a `boolean` value that means whether to use ascending order. Note that if the `SortBy.default` key is used, then `ascending` argument will not matter.
    Earlier items have higher priority when sorting out the results.
    If empty, this method will use the default sorting that is provided by the platform.
  - **mediaType (_array_)** -- An array of [MediaType](#medialibrarymediatype) types. By default `MediaType.photo` is set.
  - **createdAfter (_Date_ | _number_)** -- Date object or Unix timestamp in milliseconds limiting returned assets only to those that were created after this date.
  - **createdBefore (_Date_ | _number_)** -- Similarly as `createdAfter`, but limits assets only to those that were created before specified date.

#### Returns

A promise that resolves to an object that contains following keys:

- **assets (_array_)** -- A page of [assets](#asset) fetched by the query.
- **endCursor (_string_)** -- ID of the last fetched asset. It should be passed as `after` option in order to get the next page.
- **hasNextPage (_boolean_)** -- Whether there are more assets to fetch.
- **totalCount (_number_)** -- Estimated total number of assets that match the query.

### `MediaLibrary.getAssetInfoAsync(asset, options)`

Provides more informations about an asset, including GPS location, local URI and EXIF metadata.

#### Arguments

- **asset (_string_ | _Asset_)** -- [Asset](#asset) or its ID.
- **options (_object_)**
  - **shouldDownloadFromNetwork (_boolean_)** -- Whether allow the asset to be downloaded from network. Only available in iOS with iCloud assets. Defaults to `true`.

#### Returns

Asset object extended by additional fields listed [in the table](#asset).

### `MediaLibrary.deleteAssetsAsync(assets)`

Deletes assets from the library.
On iOS it deletes assets from all albums they belong to, while on Android it keeps all copies of them (album is strictly connected to the asset).
Also, there is additional dialog on iOS that requires user to confirm this action.

#### Arguments

- **assets (_array_)** -- An array of [assets](#asset) or their IDs.

#### Returns

Returns `true` if the assets were successfully deleted.

### `MediaLibrary.getAlbumsAsync()`

Queries for user-created albums in media gallery.

#### Returns

An array of [albums](#album). Depending on Android version, root directory of your storage may be listed as album titled _"0"_ or unlisted at all.

### `MediaLibrary.getAlbumAsync(albumName)`

Queries for an album with a specific name.

#### Arguments

- **albumName (_string_)** -- Name of the album to look for.

#### Returns

An object representing an [album](#album) if album with given name exists, otherwise returns `null`.

### `MediaLibrary.createAlbumAsync(albumName, asset, copyAsset)`

Creates an album with given name and initial asset.
The asset parameter is required on Android, since it's not possible to create empty album on this platform.
On Android, by default it copies given asset from the current album to the new one, however it's also possible to move it by passing `false` as `copyAsset` argument.
In case it's copied you should keep in mind that `getAssetsAsync` will return duplicated asset.

#### Arguments

- **albumName (_string_)** -- Name of the album to create.
- **asset (_string_ | _Asset_)** -- [Asset](#asset) or its ID. Required on Android.
- **copyAsset (_boolean_)** -- Whether to copy asset to the new album instead of move it. Defaults to `true`. (**Android only**)

#### Returns

Newly created [album](#album).

### `MediaLibrary.deleteAlbumsAsync(albums, deleteAssets)`

Deletes given albums from the library.

On Android by default it deletes assets belonging to given albums from the library. On iOS it doesn't delete these assets, however it's possible to do by passing `true` as `deleteAssets`.

#### Arguments

- **albums (_array_)** -- Array of [albums](#album) or their IDs, that will be removed from the library.
- **deleteAssets (_boolean_)** -- Whether to also delete assets belonging to given albums. Defaults to `false`. (**iOS only**)

#### Returns

Returns a promise resolving to `true` if the albums were successfully deleted from the library.

### `MediaLibrary.addAssetsToAlbumAsync(assets, album, copyAssets)`

Adds array of assets to the album.

On Android, by default it copies assets from the current album to provided one, however it's also possible to move them by passing `false` as `copyAssets` argument.
In case they're copied you should keep in mind that `getAssetsAsync` will return duplicated assets.

#### Arguments

- **assets (_array_)** -- Array of [assets](#asset) to add.
- **album (_string_ | _Album_)** -- [Album](#album) or its ID, to which the assets will be added.
- **copyAssets (_boolean_)** -- Whether to copy assets to the new album instead of move them. Defaults to `true`. (**Android only**)

#### Returns

Resolves to `true` if the assets were successfully added to the album.

### `MediaLibrary.removeAssetsFromAlbumAsync(assets, album)`

Removes given assets from album.

On Android, album will be automatically deleted if there are no more assets inside.

#### Arguments

- **assets (_array_)** -- Array of [assets](#asset) to remove from album.
- **album (_string_ | _Album_)** -- [Album](#album) or its ID, from which the assets will be removed.

#### Returns

Returns `true` if the assets were successfully removed from the album.

### `MediaLibrary.getMomentsAsync()`

**Available on iOS only.** Fetches a list of moments, which is a group of assets taken around the same place and time.

#### Returns

An array of [albums](#album) whose type is `moment`.

### `MediaLibrary.addListener(listener)`

Subscribes for updates in user's media library.

#### Arguments

- **listener (_function_)** -- A callback that is called when any assets have been inserted or deleted from the library. **On Android** it's invoked with an empty object. **On iOS** it's invoked with an object that contains following keys:
  - **insertedAssets (_array_)** -- Array of [assets](#asset) that have been inserted to the library.
  - **deletedAssets (_array_)** -- Array of [assets](#asset) that have been deleted from the library.
  - **updatedAssets (_array_)** -- Array of [assets](#asset) that have been updated or completed downloading from network storage (iCloud in iOS).

#### Returns

An EventSubscription object that you can call `remove()` on when you would like to unsubscribe the listener.

### `MediaLibrary.removeAllListeners()`

Removes all listeners.

## Types

### `MediaLibrary.CameraRollPermissionResponse`

`MediaLibrary.CameraRollPermissionResponse` extends [PermissionResponse](permissions.md#permissionresponse) type exported by `unimodules-permission-interface` and contains additional iOS-specific field:

- `accessPrivileges` **(string)** - Indicates if your app has access to the whole or only part of the photo library. Possible values are:
  - `all` if the user granted your app access to the whole photo library
  - `limited` if the user granted your app access only to selected photos (only available on **iOS 14.0+**)
  - `none` if user denied or hasn't yet granted the permission

### `Asset`

| Field name          | Type      | Platforms | Description                                                                                                   | Possible values                                                                                      |
| ------------------- | --------- | --------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| id                  | _string_  | both      | Internal ID that represents an asset                                                                          |                                                                                                      |
| filename            | _string_  | both      | Filename of the asset                                                                                         |                                                                                                      |
| uri                 | _string_  | both      | URI that points to the asset                                                                                  | `assets://*` (iOS), `file://*` (Android)                                                             |
| mediaType           | _string_  | both      | Media type                                                                                                    | `MediaType.audio`, `MediaType.photo`, `MediaType.video`, `MediaType.unknown`                         |
| width               | _number_  | both      | Width of the image or video                                                                                   |                                                                                                      |
| height              | _number_  | both      | Height of the image or video                                                                                  |                                                                                                      |
| creationTime        | _number_  | both      | File creation timestamp                                                                                       |                                                                                                      |
| modificationTime    | _number_  | both      | Last modification timestamp                                                                                   |                                                                                                      |
| duration            | _number_  | both      | Duration of the video or audio asset in seconds                                                               |                                                                                                      |
| mediaSubtypes       | _array_   | iOS       | An array of media subtypes                                                                                    | `hdr`, `panorama`, `stream`, `timelapse`, `screenshot`, `highFrameRate`, `livePhoto`, `depthEffect`  |
| albumId             | _string_  | Android   | Album ID that the asset belongs to                                                                            |                                                                                                      |
| localUri \*         | _string_  | both      | Local URI for the asset                                                                                       |                                                                                                      |
| location \*         | _object_  | both      | GPS location if available                                                                                     | `latitude: number, longitude: number` or `null`                                                      |
| exif \*             | _object_  | both      | EXIF metadata associated with the image                                                                       |                                                                                                      |
| orientation \*      | _number_  | iOS       | Display orientation of the image. Orientation is available only for assets whose mediaType is MediaType.photo | Numbers 1-8, see [EXIF orientation specification](http://sylvana.net/jpegcrop/exif_orientation.html) |
| isFavorite \*       | _boolean_ | iOS       | Whether the asset is marked as favorite                                                                       | `true`, `false`                                                                                      |
| isNetworkAsset \*\* | _boolean_ | iOS       | Whether the asset is stored on the network (iCloud on iOS)                                                    | `true`, `false`                                                                                      |

> \* These fields can be obtained only by calling `getAssetInfoAsync` method

> \*\* This field is available only if flag `shouldDownloadFromNetwork` is set to `false`

### `Album`

| Field name             | Type     | Platforms | Description                                                                                 | Possible values                                 |
| ---------------------- | -------- | --------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| id                     | _string_ | both      |                                                                                             |                                                 |
| title                  | _string_ | both      |                                                                                             |                                                 |
| assetCount             | _number_ | both      | Estimated number of assets in the album                                                     |                                                 |
| folderName             | _string_ | iOS       | Name of folder that the album belongs to. Can be null if the album is in the root directory |                                                 |
| type                   | _string_ | iOS       | The type of the assets album                                                                | `album`, `moment`, `smartAlbum`                 |
| startTime \*           | _number_ | iOS       | Earliest creation timestamp of all assets in the moment                                     |                                                 |
| endTime \*             | _number_ | iOS       | Latest creation timestamp of all assets in the moment                                       |                                                 |
| approximateLocation \* | _object_ | iOS       | Approximated location of all assets in the moment                                           | `latitude: number, longitude: number` or `null` |
| locationNames \*       | _array_  | iOS       | Names of locations grouped in the moment                                                    |                                                 |

> \* These fields apply only to albums whose type is `moment`

## Constants

### `MediaLibrary.MediaType`

Possible media types:

- `MediaType.photo`
- `MediaType.video`
- `MediaType.audio`
- `MediaType.unknown`

### `MediaLibrary.SortBy`

Supported keys that can be used to sort `getAssetsAsync` results:

- `SortBy.default`
- `SortBy.creationTime`
- `SortBy.modificationTime`
- `SortBy.mediaType`
- `SortBy.width`
- `SortBy.height`
- `SortBy.duration`
