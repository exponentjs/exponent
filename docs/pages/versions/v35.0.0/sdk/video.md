---
title: Video
sourceCodeUrl: "https://github.com/expo/expo/tree/sdk-35/packages/expo-av"
---

A component that displays a video inline with the other React Native UI elements in your app. The display dimensions and position of the video on screen can be set using usual React Native styling.

Much of Video and Audio have common APIs that are documented in [AV documentation](../av/). This page covers video-specific props and APIs. We encourage you to skim through this document to get basic video working, and then move on to [AV documentation](../av/) for more advanced functionality. The audio experience of video (such as whether to interrupt music already playing in another app, or whether to play sound while the phone is on silent mode) can be customized using the [Audio API](../audio/).

#### Platform Compatibility

| Android Device | Android Emulator | iOS Device | iOS Simulator |  Web  |
| ------ | ---------- | ------ | ------ | ------ |
| ✅     |  ✅     | ✅     | ✅     | ✅    |

## Installation

For [managed](../../introduction/managed-vs-bare/#managed-workflow) apps, you'll need to run `expo install expo-av`. To use it in a [bare](../../introduction/managed-vs-bare/#bare-workflow) React Native app, follow its [installation instructions](https://github.com/expo/expo/tree/master/packages/expo-av).

## Usage

Here's a simple example of a video that autoplays and loops.

```javascript
import { Video } from "expo-av";

<Video
  source={{ uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
  rate={1.0}
  volume={1.0}
  isMuted={false}
  resizeMode="cover"
  shouldPlay
  isLooping
  style={{ width: 300, height: 300 }}
/>
```

For more advanced examples, check out the [Playlist example](https://github.com/expo/playlist-example/blob/master/App.js), and the [custom videoplayer controls component](https://github.com/ihmpavel/expo-video-player/blob/master/lib/index.tsx) that wraps `<Video>`, adds custom controls and use the `<Video>` API extensively. The videoplayer controls is used in [this app](https://github.com/expo/harvard-cs50-app).

## API

```js
import { Video } from 'expo-av';
```

### props

The `source` and `posterSource` props customize the source of the video content.

- `source`

  The source of the video data to display. If this prop is `null`, or left blank, the video component will display nothing.

  Note that this can also be set on the `ref` via `loadAsync()`; see below or the [AV documentation](../av/) for further information.

  The following forms for the source are supported:

  - A dictionary of the form `{ uri: string, headers?: { [string]: string }, overrideFileExtensionAndroid?: string }` with a network URL pointing to a video file on the web, an optional headers object passed in a network request to the `uri` and an optional Android-specific `overrideFileExtensionAndroid` string overriding extension inferred from the URL.
    The `overrideFileExtensionAndroid` property may come in handy if the player receives an URL like `example.com/play` which redirects to `example.com/player.m3u8`. Setting this property to `m3u8` would allow the Android player to properly infer the content type of the media and use proper media file reader.
  - `require('path/to/file')` for a video file asset in the source code directory.
  - An [`Asset`](../asset/) object for a video file asset.

  The [iOS developer documentation](https://developer.apple.com/library/ios/documentation/Miscellaneous/Conceptual/iPhoneOSTechOverview/MediaLayer/MediaLayer.html) lists the video formats supported on iOS.

  The [Android developer documentation](https://developer.android.com/guide/appendix/media-formats.html#formats-table) lists the video formats supported on Android.

- `posterSource`

  The source of an optional image to display over the video while it is loading. The following forms are supported:

  - A dictionary of the form `{ uri: 'http://path/to/file' }` with a network URL pointing to a image file on the web.
  - `require('path/to/file')` for an image file asset in the source code directory.

- `posterStyle`

  An optional property to pass custom styles to the poster image.

The `useNativeControls`, `resizeMode`, and `usePoster` props customize the UI of the component.

- `useNativeControls`

  A boolean which, if set to `true`, will display native playback controls (such as play and pause) within the `Video` component. If you'd prefer to use custom controls, you can write them yourself, and/or check out the [Videoplayer component](https://github.com/ihmpavel/expo-video-player).

- `resizeMode`

  A string describing how the video should be scaled for display in the component view bounds. Must be one of the following values:

  - `Video.RESIZE_MODE_STRETCH` -- Stretch to fill component bounds.
  - `Video.RESIZE_MODE_CONTAIN` -- Fit within component bounds while preserving aspect ratio.
  - `Video.RESIZE_MODE_COVER` -- Fill component bounds while preserving aspect ratio.

- `usePoster`

  A boolean which, if set to `true`, will display an image (whose source is set via the prop `posterSource`) while the video is loading.

The `onPlaybackStatusUpdate`, `onReadyForDisplay`, and `onIOSFullscreenUpdate` props pass information of the state of the `Video` component. The `onLoadStart`, `onLoad`, and `onError` props are also provided for backwards compatibility with `Image` (but they are redundant with `onPlaybackStatusUpdate`).

- `onPlaybackStatusUpdate`

  A function to be called regularly with the `PlaybackStatus` of the video. You will likely be using this a lot. See the [AV documentation](../av/) for further information on `onPlaybackStatusUpdate`, and the interval at which it is called.

- `onReadyForDisplay`

  A function to be called when the video is ready for display. Note that this function gets called whenever the video's natural size changes.

  The function is passed a dictionary with the following key-value pairs:

  - `naturalSize`: a dictionary with the following key-value pairs:
    - `width`: a number describing the width in pixels of the video data
    - `height`: a number describing the height in pixels of the video data
    - `orientation`: a string describing the natural orientation of the video data, either `'portrait'` or `'landscape'`
  - `status`: the `PlaybackStatus` of the video; see the [AV documentation](../av/) for further information.

- `onFullscreenUpdate`

  A function to be called when the state of the native iOS fullscreen view changes (controlled via the `presentFullscreenPlayer()` and `dismissFullscreenPlayer()` methods on the `Video`'s `ref`).

  The function is passed a dictionary with the following key-value pairs:

  - `fullscreenUpdate`: a number taking one of the following values:
    - `Video.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT`: describing that the fullscreen player is about to present
    - `Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT`: describing that the fullscreen player just finished presenting
    - `Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS`: describing that the fullscreen player is about to dismiss
    - `Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS`: describing that the fullscreen player just finished dismissing
  - `status`: the `PlaybackStatus` of the video; see the [AV documentation](../av/) for further information.

- `onLoadStart`

  A function to be called when the video begins to be loaded into memory. Called without any arguments.

- `onLoad`

  A function to be called once the video has been loaded. The data is streamed so all of it may not have been fetched yet, just enough to render the first frame. The function is called with the `PlaybackStatus` of the video as its parameter; see the [AV documentation](../av/) for further information.

- `onError`

  A function to be called if load or playback have encountered a fatal error. The function is passed a single error message string as a parameter. Errors sent here are also set on `playbackStatus.error` that are passed into the `onPlaybackStatusUpdate` callback.

Finally, the following props are available to control the playback of the video, but we recommend that you use the methods available on the `ref` (described below and in the [AV documentation](../av/)) for finer control.

- `status`

  A dictionary setting a new `PlaybackStatusToSet` on the video. See the [AV documentation](../av/) for more information on `PlaybackStatusToSet`.

- `progressUpdateIntervalMillis`

  A number describing the new minimum interval in milliseconds between calls of `onPlaybackStatusUpdate`. See the [AV documentation](../av/) for more information.

- `positionMillis`

  The desired position of playback in milliseconds. See the [AV documentation](../av/) for more information.

- `shouldPlay`

  A boolean describing if the media is supposed to play. Playback may not start immediately after setting this value for reasons such as buffering. Make sure to update your UI based on the `isPlaying` and `isBuffering` properties of the `PlaybackStatus`. See the [AV documentation](../av/) for more information.

- `rate`

  The desired playback rate of the media. This value must be between `0.0` and `32.0`. Only available on Android API version 23 and later and iOS. See the [AV documentation](../av/) for more information.

- `shouldCorrectPitch`

  A boolean describing if we should correct the pitch for a changed rate. If set to `true`, the pitch of the audio will be corrected (so a rate different than `1.0` will timestretch the audio). See the [AV documentation](../av/) for more information.

- `volume`

  The desired volume of the audio for this media. This value must be between `0.0` (silence) and `1.0` (maximum volume). See the [AV documentation](../av/) for more information.

- `isMuted`

  A boolean describing if the audio of this media should be muted. See the [AV documentation](../av/) for more information.

- `isLooping`

  A boolean describing if the media should play once (`false`) or loop indefinitely (`true`). See the [AV documentation](../av/) for more information.

#### The following methods are available on the component's ref:

- `videoRef.presentFullscreenPlayer()`

  This presents a fullscreen view of your video component on top of your app's UI. Note that even if `useNativeControls` is set to `false`, native controls will be visible in fullscreen mode.

  #### Returns

  A `Promise` that is fulfilled with the `PlaybackStatus` of the video once the fullscreen player has finished presenting, or rejects if there was an error, or if this was called on an Android device.

- `videoRef.dismissFullscreenPlayer()`

This dismisses the fullscreen video view.

#### Returns

A `Promise` that is fulfilled with the `PlaybackStatus` of the video once the fullscreen player has finished dismissing, or rejects if there was an error, or if this was called on an Android device.

The rest of the API on the `Video` component ref is almost the same as the API for `Audio.Sound`. The only exception is the `setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)` method, which is not available for `videoRef` -- see the [AV documentation](../av/) for further information:

- `videoRef.loadAsync(source, initialStatus = {}, downloadFirst = true)`

- `videoRef.unloadAsync()`

- `videoRef.getStatusAsync()`

- `videoRef.setStatusAsync(statusToSet)`

- `videoRef.playAsync()`

- `videoRef.replayAsync()`

- `videoRef.pauseAsync()`

- `videoRef.stopAsync()`

- `videoRef.setPositionAsync(millis)`

- `videoRef.setRateAsync(value, shouldCorrectPitch, pitchCorrectionQuality)`

- `videoRef.setVolumeAsync(value)`

- `videoRef.setIsMutedAsync(value)`

- `videoRef.setIsLoopingAsync(value)`

- `videoRef.setProgressUpdateIntervalAsync(millis)`
