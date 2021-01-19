---
title: ImagePicker
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-image-picker'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import Video from '~/components/plugins/Video';
import SnackInline from '~/components/plugins/SnackInline';

**`expo-image-picker`** provides access to the system's UI for selecting images and videos from the phone's library or taking a photo with the camera.

<Video file={"sdk/imagepicker.mp4"} loop={false} />

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-image-picker" />

## Configuration

In managed apps, the permissions to pick images, from camera ([`Permissions.CAMERA`](permissions.md#permissionscamera)) or camera roll ([`Permissions.MEDIA_LIBRARY`](permissions.md#permissionsmedia_library)), are added automatically.

## Usage

<SnackInline label='Image Picker' dependencies={['expo-constants', 'expo-permissions', 'expo-image-picker']}>

```js
import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
```

</SnackInline>

When you run this example and pick an image, you will see the image that you picked show up in your app, and something similar to the following logged to your console:

```javascript
{
  "cancelled":false,
  "height":1611,
  "width":2148,
  "uri":"file:///data/user/0/host.exp.exponent/cache/cropped1814158652.jpg"
}
```

## API

```js
import * as ImagePicker from 'expo-image-picker';
```

### `ImagePicker.requestCameraPermissionsAsync()`

Asks the user to grant permissions for accessing camera. Alias for `Permissions.askAsync(Permissions.CAMERA)`. This does nothing on web because the browser camera is not used.

#### Returns

A promise that resolves to an object of type [CameraPermissionResponse](#imagepickercamerapermissionresponse).

### `ImagePicker.requestMediaLibraryPermissionsAsync(writeOnly)`

Asks the user to grant permissions for accessing user's photo. Alias for `Permissions.askAsync(Permissions.MEDIA_LIBRARY)`. This does nothing on web.

#### Arguments

- **writeOnly** (_boolean_) - whether to request write or read and write permissions. Defaults to `false`.

#### Returns

A promise that resolves to an object of type [MediaLibraryPermissionResponse](#imagepickermedialibrarypermissionresponse).

### `ImagePicker.getCameraPermissionsAsync()`

Checks user's permissions for accessing camera. Alias for `Permissions.getAsync(Permissions.CAMERA)`.

#### Returns

A promise that resolves to an object of type [CameraPermissionResponse](#imagepickercamerapermissionresponse).

### `ImagePicker.getMediaLibraryPermissionsAsync()`

Checks user's permissions for accessing photos. Alias for `Permissions.getAsync(Permissions.MEDIA_LIBRARY)`.

#### Arguments

- **writeOnly** (_boolean_) - whether to get write or read and write permissions. Defaults to `false`.

#### Returns

A promise that resolves to an object of type [MediaLibraryPermissionResponse](#imagepickermedialibrarypermissionresponse).

### `ImagePicker.launchImageLibraryAsync(options)`

Display the system UI for choosing an image or a video from the phone's library. Requires `Permissions.MEDIA_LIBRARY` on iOS 10 only. On mobile web, this must be called immediately in a user interaction like a button press, otherwise the browser will block the request without a warning.

#### Arguments

- **options (_object_)** --

  A map of options for both:

  - **mediaTypes (_[ImagePicker.MediaTypeOptions](#imagepickermediatypeoptions)_)** -- Choose what type of media to pick. Defaults to `ImagePicker.MediaTypeOptions.Images`.
  - **allowsEditing (_boolean_)** -- Whether to show a UI to edit the image/video after it is picked. Images: On Android the user can crop and rotate the image and on iOS simply crop it. Videos: On iOS user can trim the video. Defaults to `false`.
  - **allowsMultipleSelection (_boolean_)** -- (Web only) Whether or not to allow selecting multiple media files at once.

  A map of options for images:

  - **aspect (_array_)** -- An array with two entries `[x, y]` specifying the aspect ratio to maintain if the user is allowed to edit the image (by passing `allowsEditing: true`). This is only applicable on Android, since on iOS the crop rectangle is always a square.
  - **quality (_number_)** -- Specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality.
    > **Note:** If the selected image has been compressed before, the size of the output file may be bigger than the size of the original image.
  - **base64 (_boolean_)** -- Whether to also include the image data in Base64 format.
  - **exif (_boolean_)** -- Whether to also include the EXIF data for the image.

  Option for videos:

  - **videoExportPreset (_[ImagePicker.VideoExportPreset](#imagepickervideoexportpreset)_)** -- **Available on iOS 11+ only.** Specify preset which will be used to compress selected video. Defaults to `ImagePicker.VideoExportPreset.Passthrough`.

**Animated GIFs support** If the selected image is an animated GIF, the result image will be an animated GIF too if and only if `quality` is set to `undefined` and `allowsEditing` is set to `false`. Otherwise compression and/or cropper will pick the first frame of the GIF and return it as the result (on Android the result will be a PNG, on iOS — GIF).

#### Returns

If the user cancelled the picking, returns `{ cancelled: true }`.

Otherwise, this method returns information about the selected media item. When the chosen item is an image, this method returns `{ cancelled: false, type: 'image', uri, width, height, exif, base64 }`; when the item is a video, this method returns `{ cancelled: false, type: 'video', uri, width, height, duration }`.

- The `uri` property is a URI to the local image or video file (usable as the source of an `Image` element, in the case of an image) and `width` and `height` specify the dimensions of the media.
- The `exif` field is included if the `exif` option is truthy, and is an object containing the image's EXIF data. The names of this object's properties are EXIF tags and the values are the respective EXIF values for those tags.
- The `base64` property is included if the `base64` option is truthy, and is a Base64-encoded string of the selected image's JPEG data. If you prepend this with `'data:image/jpeg;base64,'` to create a data URI, you can use it as the source of an `Image` element; for example: `<Image source={{uri: 'data:image/jpeg;base64,' + launchCameraResult.base64}} style={{width: 200, height: 200}} />`.
- The `duration` property is the length of the video in milliseconds.

> **Note:** Make sure that you handle `MainActivity` destruction on **Android**. See [ImagePicker.getPendingResultAsync](#imagepickergetpendingresultasync).

### `ImagePicker.launchCameraAsync(options)`

Display the system UI for taking a photo with the camera. Requires `Permissions.CAMERA`. On Android and iOS 10 `Permissions.CAMERA_ROLL` is also required. On mobile web, this must be called immediately in a user interaction like a button press, otherwise the browser will block the request without a warning.

#### Arguments

- **options (_object_)** --

  A map of options:

  - **mediaTypes (_[ImagePicker.MediaTypeOptions](#imagepickermediatypeoptions)_)** -- Choose what type of media to pick. Defaults to `ImagePicker.MediaTypeOptions.Images`.
  - **allowsEditing (_boolean_)** -- Whether to show a UI to edit the image after it is picked. On Android the user can crop and rotate the image and on iOS simply crop it. Defaults to `false`.

  A map of options for images:

  - **aspect (_array_)** -- An array with two entries `[x, y]` specifying the aspect ratio to maintain if the user is allowed to edit the image (by passing `allowsEditing: true`). This is only applicable on Android, since on iOS the crop rectangle is always a square.
  - **quality (_number_)** -- Specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality.
  - **base64 (_boolean_)** -- Whether to also include the image data in Base64 format.
  - **exif (_boolean_)** -- Whether to also include the EXIF data for the image. On iOS the EXIF data does not include GPS tags in the camera case.

  Option for videos:

  - **videoMaxDuration (_number_)** -- Maximum duration, in seconds, for video recording. Setting this to `0` disables the limit. Defaults to 0 (no limit).
    - **On iOS**, when `allowsEditing` is set to `true`, maximum duration is limited to 10 minutes. This limit is applied automatically, if `0` or no value is specified.
    - **On Android**, effect of this option depends on support of installed camera app.
    - **On Web** this option has no effect - the limit is browser-dependant.
  - **videoExportPreset (_[ImagePicker.VideoExportPreset](#imagepickervideoexportpreset)_)** -- **Available on iOS 11+ only, but Deprecated.** Specify preset which will be used to compress selected video. Defaults to `ImagePicker.VideoExportPreset.Passthrough`.
  - **videoQuality (\_[ImagePicker.UIImagePickerControllerQualityType](#imagepickeruiimagepickercontrollertype)\_)** -- **iOS only**. Specify the quality of recorded videos. Defaults to `ImagePicker.UIImagePickerControllerQualityType.High`, which is the highest available for the device.

#### Returns

If the user cancelled the action, the method returns `{ cancelled: true }`.

Otherwise, this method returns information about the selected media item. When the chosen item is an image, this method returns `{ cancelled: false, type: 'image', uri, width, height, exif, base64 }`; when the item is a video, this method returns `{ cancelled: false, type: 'video', uri, width, height, duration }`.

- The `uri` property is a URI to the local image or video file (usable as the source of an `Image` element, in the case of an image) and `width` and `height` specify the dimensions of the media.
- The `exif` field is included if the `exif` option is truthy, and is an object containing the image's EXIF data. The names of this object's properties are EXIF tags and the values are the respective EXIF values for those tags.
- The `base64` property is included if the `base64` option is truthy, and is a Base64-encoded string of the selected image's JPEG data. If you prepend this with `'data:image/jpeg;base64,'` to create a data URI, you can use it as the source of an `Image` element; for example: `<Image source={{uri: 'data:image/jpeg;base64,' + launchCameraResult.base64}} style={{width: 200, height: 200}} />`.
- The `duration` property is the length of the video in milliseconds.

> **Note:** Make sure that you handle `MainActivity` destruction on **Android**. See [ImagePicker.getPendingResultAsync](#imagepickergetpendingresultasync).

### `ImagePicker.getPendingResultAsync()`

Android system sometimes kills the `MainActivity` after the `ImagePicker` finishes. When this happens, we lost the data selected from the `ImagePicker`. However, you can retrieve the lost data by calling `getPendingResultAsync`. You can test this functionality by turning on `Don't keep activities` in the developer options.

#### Returns

**On Android:** a promise that resolves to an array of objects of exactly same type as in `ImagePicker.launchImageLibraryAsync` or `ImagePicker.launchCameraAsync` if the `ImagePicker` finished successfully. Otherwise to the array of [ImagePicker.ImagePickerErrorResult](#imagepickerimagepickererrorresult).

**On other platforms:** an empty array.

## Enums

### `ImagePicker.MediaTypeOptions`

| Media type                | Accept asset types | Platforms |
| ------------------------- | ------------------ | --------- |
| `MediaTypeOptions.All`    | Images and videos  | iOS       |
| `MediaTypeOptions.Images` | Only images        | both      |
| `MediaTypeOptions.Videos` | Only videos        | both      |

### `ImagePicker.VideoExportPreset`

| Preset                             | Value | Resolution            | Video compression algorithm | Audio compression algorithm |
| ---------------------------------- | ----- | --------------------- | --------------------------- | --------------------------- |
| `VideoExportPreset.Passthrough`    | 0     | Unchanged             | None                        | None                        |
| `VideoExportPreset.LowQuality`     | 1     | Depends on the device | H.264                       | AAC                         |
| `VideoExportPreset.MediumQuality`  | 2     | Depends on the device | H.264                       | AAC                         |
| `VideoExportPreset.HighestQuality` | 3     | Depends on the device | H.264                       | AAC                         |
| `VideoExportPreset.H264_640x480`   | 4     | 640 x 480             | H.264                       | AAC                         |
| `VideoExportPreset.H264_960x540`   | 5     | 960 x 540             | H.264                       | AAC                         |
| `VideoExportPreset.H264_1280x720`  | 6     | 1280 x 720            | H.264                       | AAC                         |
| `VideoExportPreset.H264_1920x1080` | 7     | 1920 x 1080           | H.264                       | AAC                         |
| `VideoExportPreset.H264_3840x2160` | 8     | 3840 x 2160           | H.264                       | AAC                         |
| `VideoExportPreset.HEVC_1920x1080` | 9     | 1920 x 1080           | HEVC                        | AAC                         |
| `VideoExportPreset.HEVC_3840x2160` | 10    | 3840 x 2160           | HEVC                        | AAC                         |

### `ImagePicker.UIImagePickerControllerType`

| Preset                                       | Value | Resolution            |
| -------------------------------------------- | ----- | --------------------- |
| `UIImagePickerControllerType.High`           | 0     | Highest available     |
| `UIImagePickerControllerType.Medium`         | 1     | Depends on the device |
| `UIImagePickerControllerType.Low`            | 2     | Depends on the device |
| `UIImagePickerControllerType.VGA640x480`     | 3     | 640 x 480             |
| `UIImagePickerControllerType.IFrame1280x720` | 4     | 1280 x 720            |
| `UIImagePickerControllerType.IFrame960x540`  | 5     | 960 x 540             |

## Types

### `ImagePicker.MediaLibraryPermissionResponse`

`ImagePicker.MediaLibraryPermissionResponse` extends [PermissionResponse](permissions.md#permissionresponse) type exported by `unimodules-permission-interface` and contains additional iOS-specific field:

- `accessPrivileges` **(string)** - Indicates if your app has access to the whole or only part of the photo library. Possible values are:
  - `all` if the user granted your app access to the whole photo library
  - `limited` if the user granted your app access only to selected photos (only available on **iOS 14.0+**)
  - `none` if user denied or hasn't yet granted the permission

### `ImagePicker.CameraPermissionResponse`

`ImagePicker.CameraPermissionResponse` alias for [PermissionResponse](permissions.md#permissionresponse) type exported by `unimodules-permission-interface`.

### `ImagePicker.ImagePickerErrorResult`

Object of type `ImagePickerErrorResult` contains following keys:

- **code (_string_)** - The error code.
- **message (_string_)** - The error message.
- **exception (_string | undefined_)** - The exception which caused the error.
