---
title: Camera
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-39/packages/expo-camera'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';

**`expo-camera`** provides a React component that renders a preview for the device's front or back camera. The camera's parameters like zoom, auto focus, white balance and flash mode are adjustable. With the use of `Camera`, one can also take photos and record videos that are then saved to the app's cache. Morever, the component is also capable of detecting faces and bar codes appearing in the preview. Run the [example](#usage) on your device to see all these features working together!

<PlatformsSection android ios web />

> 💡 Android devices can use one of two available Camera APIs: you can opt-in to using [`Camera2`](https://developer.android.com/reference/android/hardware/camera2/package-summary) with the `useCamera2Api` prop.

## Installation

<InstallSection packageName="expo-camera" />

## Configuration

In managed apps, `Camera` requires `Permissions.CAMERA`. Video recording requires `Permissions.AUDIO_RECORDING`.

## Usage

> ⚠️ Only one Camera preview can be active at any given time. If you have multiple screens in your app, you should unmount `Camera` components whenever a screen is unfocused.

<SnackInline label='Basic Camera usage' templateId='camera' dependencies={['expo-camera']}>

```js
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}
```

</SnackInline>

## API

```js
import { Camera } from 'expo-camera';
```

## Static Methods

### `Camera.isAvailableAsync(): boolean`

_Web Only_

Check whether the current device has a camera. This is useful for web and simulators cases. This isn't influenced by the Permissions API (all platforms), or HTTP usage (in the browser). You will still need to check if the native permission has been accepted.

```js
import { Camera } from 'expo-camera';

if (await Camera.isAvailableAsync()) {
}
```

### `Camera.getAvailableCameraTypesAsync(): string[]`

_Web Only_

Returns a list of camera types `['front', 'back']`. This is useful for desktop browsers which only have front-facing cameras.

```js
import { Camera } from 'expo-camera';

const types = await Camera.getAvailableCameraTypesAsync();
```

## Props

### `type`

Camera facing. Use one of `Camera.Constants.Type`. When `Type.front`, use the front-facing camera. When `Type.back`, use the back-facing camera. Default: `Type.back`.

### `flashMode`

Camera flash mode. Use one of `Camera.Constants.FlashMode`. When `on`, the flash on your device will turn on when taking a picture, when `off`, it won't. Setting to `auto` will fire flash if required, `torch` turns on flash during the preview. Default: `off`.

### `autoFocus`

State of camera auto focus. Use one of `Camera.Constants.AutoFocus`. When `on`, auto focus will be enabled, when `off`, it wont't and focus will lock as it was in the moment of change but it can be adjusted on some devices via `focusDepth` prop.

### `zoom`

**(_float_)** A value between 0 and 1 being a percentage of device's max zoom. 0 - not zoomed, 1 - maximum zoom. Default: 0.

### `whiteBalance`

Camera white balance. Use one of `Camera.Constants.WhiteBalance`: `auto`, `sunny`, `cloudy`, `shadow`, `fluorescent`, `incandescent`. If a device does not support any of these values previous one is used.

### `focusDepth`

**(_float_)** Distance to plane of sharpest focus. A value between 0 and 1: 0 - infinity focus, 1 - focus as close as possible. Default: 0. For Android this is available only for some devices and when `useCamera2Api` is set to true.

### `ratio`

**(_string_)** Android only. A string representing aspect ratio of the preview, eg. `4:3`, `16:9`, `1:1`. To check if a ratio is supported by the device use [`getSupportedRatiosAsync`](#getsupportedratiosasync). Default: `4:3`.

### `pictureSize`

**(_string_)** A string representing the size of pictures [`takePictureAsync`](#takepictureasync) will take. Available sizes can be fetched with [`getAvailablePictureSizesAsync`](#getavailablepicturesizesasync).

### `onCameraReady`

**(_function_)** Callback invoked when camera preview has been set.

### `onFacesDetected`

**(_function_)** Callback invoked with results of face detection on the preview. See [FaceDetector documentation](facedetector.md#event-shape) for details.

### `faceDetectorSettings`

**(_Object_)** A settings object passed directly to an underlying module providing face detection features. See [FaceDetector documentation](facedetector.md#settings) for details.

### `onMountError`

**(_function_)** Callback invoked when camera preview could not been started. It is provided with an error object that contains a `message`.

### `onBarCodeRead`

**Deprecated**. Use **onBarCodeScanned** instead.

### `onBarCodeScanned`

**(_function_)** Callback that is invoked when a bar code has been successfully scanned. The callback is provided with an object of the shape `{ type: BarCodeScanner.Constants.BarCodeType, data: string }`, where the type refers to the bar code type that was scanned and the data is the information encoded in the bar code (in this case of QR codes, this is often a URL). See [`BarCodeScanner.Constants.BarCodeType`](bar-code-scanner.md#supported-formats) for supported values.

### `barCodeTypes`

**Deprecated**. Use **barCodeScannerSettings** instead.

### `barCodeScannerSettings`

**(_object_)** Settings exposed by [`BarCodeScanner`](bar-code-scanner.md) module. Supported settings: [**barCodeTypes**].

```javascript
<Camera
  barCodeScannerSettings={{
    barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
  }}
/>
```

### `useCamera2Api`

**Android only** **(_boolean_)** Whether to use Android's Camera2 API. See `Note` at the top of this page.

### `videoStabilizationMode`

**iOS only**. **(_Camera.Constants.VideoStabilization_)** The video stabilization mode used for a video recording. Use one of `Camera.Constants.VideoStabilization.{off, standard, cinematic, auto}`.

You can read more about each stabilization type [here](https://developer.apple.com/documentation/avfoundation/avcapturevideostabilizationmode).

## Methods

To use methods that Camera exposes one has to create a component `ref` and invoke them using it.

```javascript
// ...
<Camera
  ref={ref => {
    this.camera = ref;
  }}
/>;
// ...
snap = async () => {
  if (this.camera) {
    let photo = await this.camera.takePictureAsync();
  }
};
```

### `takePictureAsync()`

Takes a picture and saves it to app's cache directory. Photos are rotated to match device's orientation (if **options.skipProcessing** flag is not enabled) and scaled to match the preview. Anyway on Android it is essential to set `ratio` prop to get a picture with correct dimensions.

> **Note**: Make sure to wait for the [`onCameraReady`](./#oncameraready) callback before calling this method.

#### Arguments

- **options (_object_)** --

  A map of options:

  - **quality (_number_)** -- Specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality.
  - **base64 (_boolean_)** -- Whether to also include the image data in Base64 format.
  - **exif (_boolean_)** -- Whether to also include the EXIF data for the image.
  - **onPictureSaved (_function_)** -- A callback invoked when picture is saved. If set, the promise of this method will resolve immediately with no data after picture is captured. The data that it should contain will be passed to this callback. If displaying or processing a captured photo right after taking it is not your case, this callback lets you skip waiting for it to be saved.
  - **skipProcessing (_boolean_)** - Android only. If set to `true`, camera skips orientation adjustment and returns an image straight from the device's camera. If enabled, `quality` option is discarded (processing pipeline is skipped as a whole). Although enabling this option reduces image delivery time significantly, it may cause the image to appear in a wrong orientation in the `Image` component (at the time of writing, it does not respect EXIF orientation of the images).
    > **Note**: Enabling **skipProcessing** would cause orientation uncertainty. `Image` component does not respect EXIF stored orientation information, that means obtained image would be displayed wrongly (rotated by 90°, 180° or 270°). Different devices provide different orientations. For example some Sony Xperia or Samsung devices don't provide correctly oriented images by default. To always obtain correctly oriented image disable **skipProcessing** option.

#### Returns

Returns a Promise that resolves to an object: `{ uri, width, height, exif, base64 }` where `uri` is a URI to the local image file on iOS, Android, and a base64 string on web (useable as the source for an `Image` element). The `width, height` properties specify the dimensions of the image. `base64` is included if the `base64` option was truthy, and is a string containing the JPEG data of the image in Base64--prepend that with `'data:image/jpg;base64,'` to get a data URI, which you can use as the source for an `Image` element for example. `exif` is included if the `exif` option was truthy, and is an object containing EXIF data for the image--the names of its properties are EXIF tags and their values are the values for those tags.

On native platforms, the local image URI is temporary. Use [`FileSystem.copyAsync`](filesystem.md#filesystemcopyasyncoptions) to make a permanent copy of the image.

On web, the `uri` is a base64 representation of the image because file system URLs are not supported in the browser. The `exif` data returned on web is a partial representation of the [`MediaTrackSettings`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings), if available.

### `recordAsync()`

Starts recording a video that will be saved to cache directory. Videos are rotated to match device's orientation. Flipping camera during a recording results in stopping it. This is not available on web.

#### Arguments

- **options (_object_)** --

  A map of options:

  - **quality (_VideoQuality_)** -- Specify the quality of recorded video. Usage: `Camera.Constants.VideoQuality['<value>']`, possible values: for 16:9 resolution `2160p`, `1080p`, `720p`, `480p` : `Android only` and for 4:3 `4:3` (the size is 640x480). If the chosen quality is not available for a device, the highest available is chosen.
  - **maxDuration (_number_)** -- Maximum video duration in seconds.
  - **maxFileSize (_number_)** -- Maximum video file size in bytes.
  - **mute (_boolean_)** -- If present, video will be recorded with no sound.
  - **mirror (_boolean_)** -- (iOS only; on Android, this is handled in the user's device settings) If `true`, the recorded video will be flipped along the vertical axis. iOS flips videos recorded with the front camera by default, but you can reverse that back by setting this to `true`.

#### Returns

Returns a Promise that resolves to an object containing video file `uri` property. The Promise is returned if `stopRecording` was invoked, one of `maxDuration` and `maxFileSize` is reached or camera preview is stopped.

### `stopRecording()`

Stops recording if any is in progress.

### `getSupportedRatiosAsync()`

Android only. Get aspect ratios that are supported by the device and can be passed via `ratio` prop.

#### Returns

Returns a Promise that resolves to an array of strings representing ratios, eg. `['4:3', '1:1']`.

### `getAvailablePictureSizesAsync()`

Get picture sizes that are supported by the device for given `ratio`.

#### Arguments

- **ratio (_string_)** -- A string representing aspect ratio of sizes to be returned.

#### Returns

Returns a Promise that resolves to an array of strings representing picture sizes that can be passed to `pictureSize` prop. The list varies across Android devices but is the same for every iOS.

### `pausePreview()`

Pauses the camera preview. It is not recommended to use `takePictureAsync` when preview is paused.

### `resumePreview()`

Resumes the camera preview.

### `requestPermissionsAsync()`

Asks the user to grant permissions for accessing camera. Alias for `Permissions.askAsync(Permissions.CAMERA)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](permissions.md#permissionresponse).

### `getPermissionsAsync()`

Checks user's permissions for accessing camera. Alias for `Permissions.getAsync(Permissions.CAMERA)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](permissions.md#permissionresponse).

## Web Support

Luckily most browsers support at least some form of web camera functionality, you can check out the [web camera browser support here](https://caniuse.com/#feat=stream). Image URIs are always returned as base64 strings because local file system paths are not available in the browser.

### Chrome iframe usage

When using **Chrome versions 64+**, if you try to use a web camera in a cross-origin iframe nothing will render. To add support for cameras in your iframe simply add the attribute `allow="microphone; camera;"` to the iframe element:

```html
<iframe src="..." allow="microphone; camera;">
  <!-- <Camera /> -->
</iframe>
```
