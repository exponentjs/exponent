---
title: FaceDetector
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-face-detector'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-face-detector`** lets you use the power of the [Google Mobile Vision](https://developers.google.com/vision/face-detection-concepts) framework to detect faces on images.

<PlatformsSection android ios web={{ pending: 'https://github.com/expo/expo/issues/6888' }} />

## Installation

<InstallSection packageName="expo-face-detector" />

## Usage

### Known issues

- Android does not recognize faces that aren't aligned with the interface (top of the interface matches top of the head).

### Comprehensive Example

Check out a full example at [expo/camerja](https://github.com/expo/camerja). You can try it with Expo at [@documentation/camerja](https://expo.io/@documentation/camerja).

`FaceDetector` is used in Gallery screen — it should detect faces on saved photos and show the probability that the face is smiling.

### Intermodule interface

Other modules, like eg. [Camera](camera.md) are able to use this `FaceDetector`.

## API

```js
import * as FaceDetector from 'expo-face-detector';
```

### Settings

In order to configure detector's behavior modules pass a settings object which is then interpreted by this module. The shape of the object should be as follows:

- **mode? (_FaceDetector.Constants.Mode_)** -- Whether to detect faces in fast or accurate mode. Use `FaceDetector.Constants.Mode.{fast, accurate}`.
- **detectLandmarks? (_FaceDetector.Constants.Landmarks_)** -- Whether to detect and return landmarks positions on the face (ears, eyes, mouth, cheeks, nose). Use `FaceDetector.Constants.Landmarks.{all, none}`.
- **runClassifications? (_FaceDetector.Constants.Classifications_)** -- Whether to run additional classifications on detected faces (smiling probability, open eye probabilities). Use `FaceDetector.Constants.Classifications.{all, none}`.
- **minDetectionInterval? (_long_)** -- Minimal interval in milliseconds between two face detection events being submitted to JS. Defaults to 0. Use, when you expect lots of faces for long time and are afraid of JS Bridge being overloaded.
- **tracking? (_boolean_)** - Flag to enable tracking of faces between frames. If true, each face will be returned with `faceID` attribute which should be consistent across frames. Defaults to `false`;

Eg. you could use the following snippet to detect faces in fast mode without detecting landmarks or whether face is smiling:

```js
import * as FaceDetector from 'expo-face-detector';

<Camera
  // ... other props
  onFacesDetected={this.handleFacesDetected}
  faceDetectorSettings={{
    mode: FaceDetector.Constants.Mode.fast,
    detectLandmarks: FaceDetector.Constants.Landmarks.none,
    runClassifications: FaceDetector.Constants.Classifications.none,
    minDetectionInterval: 100,
    tracking: true,
  }}
/>;
```

### Event shape

While detecting faces, `FaceDetector` will emit object events of the following shape:

- **faces** (_array_) - array of faces objects:
  - **faceID (_number_)** -- a face identifier (used for tracking, if the same face appears on consecutive frames it will have the same `faceID`).
  - **bounds (_object_)** -- an object containing:
    - **origin (`{ x: number, y: number }`)** -- position of the top left corner of a square containing the face in view coordinates,
    - **size (`{ width: number, height: number }`)** -- size of the square containing the face in view coordinates,
  - **rollAngle (_number_)** -- roll angle of the face (bank),
  - **yawAngle (_number_)** -- yaw angle of the face (heading, turning head left or right),
  - **smilingProbability (_number_)** -- probability that the face is smiling,
  - **leftEarPosition (`{ x: number, y: number}`)** -- position of the left ear in view coordinates,
  - **rightEarPosition (`{ x: number, y: number}`)** -- position of the right ear in view coordinates,
  - **leftEyePosition (`{ x: number, y: number}`)** -- position of the left eye in view coordinates,
  - **leftEyeOpenProbability (_number_)** -- probability that the left eye is open,
  - **rightEyePosition (`{ x: number, y: number}`)** -- position of the right eye in view coordinates,
  - **rightEyeOpenProbability (_number_)** -- probability that the right eye is open,
  - **leftCheekPosition (`{ x: number, y: number}`)** -- position of the left cheek in view coordinates,
  - **rightCheekPosition (`{ x: number, y: number}`)** -- position of the right cheek in view coordinates,
  - **mouthPosition (`{ x: number, y: number}`)** -- position of the center of the mouth in view coordinates,
  - **leftMouthPosition (`{ x: number, y: number}`)** -- position of the left edge of the mouth in view coordinates,
  - **rightMouthPosition (`{ x: number, y: number}`)** -- position of the right edge of the mouth in view coordinates,
  - **noseBasePosition (`{ x: number, y: number}`)** -- position of the nose base in view coordinates.

`smilingProbability`, `leftEyeOpenProbability` and `rightEyeOpenProbability` are returned only if `faceDetectionClassifications` property is set to `.all`.

Positions of face landmarks are returned only if `faceDetectionLandmarks` property is set to `.all`.

## Methods

To use methods that `FaceDetector` exposes one just has to import the module. (In ejected apps on iOS face detection will be supported only if you add the `FaceDetector` subspec to your project. Refer to [Adding the Payments Module on iOS](payments.md#adding-the-payments-module-on-ios) for an example of adding a subspec to your ejected project.)

```javascript
import * as FaceDetector from 'expo-face-detector';

// ...
detectFaces = async imageUri => {
  const options = { mode: FaceDetector.Constants.Mode.fast };
  return await FaceDetector.detectFacesAsync(imageUri, options);
};
// ...
```

### `FaceDetector.isAvailableAsync()`

Returns whether the Face Detection API is enabled on the current device.

#### Returns

Async `boolean`, indicating whether the Face Detection API is available on the current device. Currently this may resolve to `true` on iOS and Android only if the native code is linked properly.

### `FaceDetector.detectFacesAsync(uri, options)`

Detect faces on a picture.

#### Arguments

- **uri (_string_)** -- `file://` URI to the image.
- **options? (_object_)** -- A map of options:
  - **mode? (_FaceDetector.Constants.Mode_)** -- Whether to detect faces in fast or accurate mode. Use `FaceDetector.Constants.Mode.{fast, accurate}`.
  - **detectLandmarks? (_FaceDetector.Constants.Landmarks_)** -- Whether to detect and return landmarks positions on the face (ears, eyes, mouth, cheeks, nose). Use `FaceDetector.Constants.Landmarks.{all, none}`.
  - **runClassifications? (_FaceDetector.Constants.Classifications_)** -- Whether to run additional classifications on detected faces (smiling probability, open eye probabilities). Use `FaceDetector.Constants.Classifications.{all, none}`.

#### Returns

Returns a Promise that resolves to an object: `{ faces, image }` where `faces` is an array of the detected faces and `image` is an object containing `uri: string` of the image, `width: number` of the image in pixels, `height: number` of the image in pixels and `orientation: number` of the image (value conforms to the EXIF orientation tag standard).

#### Detected face schema

A detected face is an object containing at most following fields:

- **bounds (_object_)** -- an object containing:
  - **origin (`{ x: number, y: number }`)** -- position of the top left corner of a square containing the face in image coordinates,
  - **size (`{ width: number, height: number }`)** -- size of the square containing the face in image coordinates,
- **rollAngle (_number_)** -- roll angle of the face (bank),
- **yawAngle (_number_)** -- yaw angle of the face (heading, turning head left or right),
- **smilingProbability (_number_)** -- probability that the face is smiling,
- **leftEarPosition (`{ x: number, y: number}`)** -- position of the left ear in image coordinates,
- **rightEarPosition (`{ x: number, y: number}`)** -- position of the right ear in image coordinates,
- **leftEyePosition (`{ x: number, y: number}`)** -- position of the left eye in image coordinates,
- **leftEyeOpenProbability (_number_)** -- probability that the left eye is open,
- **rightEyePosition (`{ x: number, y: number}`)** -- position of the right eye in image coordinates,
- **rightEyeOpenProbability (_number_)** -- probability that the right eye is open,
- **leftCheekPosition (`{ x: number, y: number}`)** -- position of the left cheek in image coordinates,
- **rightCheekPosition (`{ x: number, y: number}`)** -- position of the right cheek in image coordinates,
- **mouthPosition (`{ x: number, y: number}`)** -- position of the center of the mouth in image coordinates,
- **leftMouthPosition (`{ x: number, y: number}`)** -- position of the left edge of the mouth in image coordinates,
- **rightMouthPosition (`{ x: number, y: number}`)** -- position of the right edge of the mouth in image coordinates,
- **noseBasePosition (`{ x: number, y: number}`)** -- position of the nose base in image coordinates.

`smilingProbability`, `leftEyeOpenProbability` and `rightEyeOpenProbability` are returned only if `runClassifications` option is set to `.all`.

Positions of face landmarks are returned only if `detectLandmarks` option is set to `.all`.

#
