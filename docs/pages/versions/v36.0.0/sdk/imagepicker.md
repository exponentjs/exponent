---
title: ImagePicker
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-36/packages/expo-image-picker'
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

For standalone iOS apps, you'll need to [customize the permission dialog](../../distribution/app-stores/#system-permissions-dialogs-on-ios) by adding the `NSCamerasUsageDescription` and `NSPhotoLibraryUsageDescription` keys under the `ios.infoPlist` key in your `app.json` or `app.config.js`. Failing to do so may result in Apple rejecting your app.

```
  "infoPlist": {
    "NSCameraUsageDescription": "your-custom-message-here.",
    "NSPhotoLibraryUsageDescription": "another-custom-message-here"
  }
```

## Example Usage

<SnackInline label='Image Picker' dependencies={['expo-constants', 'expo-permissions', 'expo-image-picker']}>

```js
import * as React from 'react';
import { Button, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export default class ImagePickerExample extends React.Component {
  state = {
    image: null,
  };

  render() {
    let { image } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button title="Pick an image from camera roll" onPress={this._pickImage} />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
    );
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };

  _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        this.setState({ image: result.uri });
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };
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

Asks the user to grant permissions for accessing camera. Alias for `Permissions.askAsync(Permissions.CAMERA)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `ImagePicker.requestCameraRollPermissionsAsync()`

Asks the user to grant permissions for accessing user's photo. Alias for `Permissions.askAsync(Permissions.CAMERA_ROLL)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `ImagePicker.getCameraPermissionsAsync()`

Checks user's permissions for accessing camera. Alias for `Permissions.getAsync(Permissions.CAMERA)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `ImagePicker.getCameraRollPermissionsAsync()`

Checks user's permissions for accessing photos. Alias for `Permissions.getAsync(Permissions.CAMERA_ROLL)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `ImagePicker.launchImageLibraryAsync(options)`

Display the system UI for choosing an image or a video from the phone's library. Requires `Permissions.CAMERA_ROLL` on iOS 10 only.

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

Otherwise, returns `{ cancelled: false, uri, width, height, type }` where `uri` is a URI to the local media file (useable as the source for an `Image`/`Video` element), `width, height` specify the dimensions of the media and `type` is one of `image` or `video` telling what kind of media has been chosen. Images can contain also `base64` and `exif` keys. `base64` is included if the `base64` option was truthy, and is a string containing the JPEG data of the image in Base64--prepend that with `'data:image/jpeg;base64,'` to get a data URI, which you can use as the source for an `Image` element for example. `exif` is included if the `exif` option was truthy, and is an object containing EXIF data for the image--the names of its properties are EXIF tags and their values are the values for those tags. If a video has been picked the return object contains an additional key `duration` specifying the video's duration in miliseconds.

### `ImagePicker.launchCameraAsync(options)`

Display the system UI for taking a photo with the camera. Requires `Permissions.CAMERA`. On Android and iOS 10 `Permissions.CAMERA_ROLL` is also required.

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

  - **videoExportPreset (_[ImagePicker.VideoExportPreset](#imagepickervideoexportpreset)_)** -- **Available on iOS 11+ only.** Specify preset which will be used to compress selected video. Defaults to `ImagePicker.VideoExportPreset.Passthrough`.

#### Returns

If the user cancelled the action, the method returns `{ cancelled: true }`.

Otherwise, this method returns information about the selected media item. When the chosen item is an image, this method returns `{ cancelled: false, type: 'image', uri, width, height, exif, base64 }`; when the item is a video, this method returns `{ cancelled: false, type: 'video', uri, width, height, duration }`.
The `uri` property is a URI to the local image or video file (usable as the source of an `Image` element, in the case of an image) and `width` and `height` specify the dimensions of the media.
The `base64` property is included if the `base64` option is truthy, and is a Base64-encoded string of the selected image's JPEG data; prepared it with `data:image/jpeg;base64,` to create a data URI, which you can use as the source of an `Image` element, for example.
The `exif` field is included if the `exif` option is truthy, and is an object containing the image's EXIF data. The names of this object's properties are EXIF tags and the values are the respective EXIF values for those tags.

## Enums

### `ImagePicker.MediaTypeOptions`

| Media type                | Accept asset types | Platforms |
| ------------------------- | ------------------ | --------- |
| `MediaTypeOptions.All`    | Images and videos  | iOS       |
| `MediaTypeOptions.Images` | Only images        | both      |
| `MediaTypeOptions.Videos` | Only videos        | both      |

### `ImagePicker.VideoExportPreset`

| Preset                              | Value | Resolution            | Video compression algorithm | Audio compression algorithm |
| ----------------------------------- | ----- | --------------------- | --------------------------- | --------------------------- |
| `VideoExportPreset.Passthrough`     | 0     | Unchanged             | None                        | None                        |
| `VideoExportPreset.LowQuality`      | 1     | Depends on the device | H.264                       | AAC                         |
| `VideoExportPreset.MediumQuality`   | 2     | Depends on the device | H.264                       | AAC                         |
| `VideoExportPreset.HighestQuality`  | 3     | Depends on the device | H.264                       | AAC                         |
| `VideoExportPreset.H264_640x480`    | 4     | 640 x 480             | H.264                       | AAC                         |
| `VideoExportPreset.H264_960x540`    | 5     | 960 x 540             | H.264                       | AAC                         |
| `VideoExportPreset.H264_1280x720`   | 6     | 1280 x 720            | H.264                       | AAC                         |
| `VideoExportPreset.H264_1920x1080`  | 7     | 1920 x 1080           | H.264                       | AAC                         |
| `VideoExportPreset.H264_3840x2160`  | 8     | 3840 x 2160           | H.264                       | AAC                         |
| `VideoExportPreset.HEVC_1920x1080`  | 9     | 1920 x 1080           | HEVC                        | AAC                         |
| `VideoExportPreset.HEVC_3840x2160`  | 10    | 3840 x 2160           | HEVC                        | AAC                         |
