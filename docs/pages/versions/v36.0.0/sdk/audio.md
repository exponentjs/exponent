---
title: Audio
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-36/packages/expo-av'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-av`** allows you to implement audio playback and recording in your app.

Note that audio automatically stops if headphones / bluetooth audio devices are disconnected.

Try the [playlist example app](https://expo.io/@documentation/playlist-example) (source code is [on GitHub](https://github.com/expo/playlist-example)) to see an example usage of the media playback API, and the [recording example app](https://expo.io/@documentation/record) (source code is [on GitHub](https://github.com/expo/audio-recording-example)) to see an example usage of the recording API.

<PlatformsSection android emulator ios simulator web />

## Installation

<InstallSection packageName="expo-av" />

## API

```js
import { Audio } from 'expo-av';
```

## Request recording permissions

### `Audio.requestPermissionsAsync()`

Asks the user to grant permissions for audio recording. Alias for `Permissions.askAsync(Permissions.AUDIO_RECORDING)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `Audio.getPermissionsAsync()`

Checks user's permissions for audio recording. Alias for `Permissions.getAsync(Permissions.AUDIO_RECORDING)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

## Enabling Audio and customizing Audio Mode

### `Audio.setIsEnabledAsync(value)`

Audio is enabled by default, but if you want to write your own Audio API in an ExpoKit app, you might want to disable the Audio API.

#### Arguments

- **value (_boolean_)** -- `true` enables Audio, and `false` disables it.

#### Returns

A `Promise` that will reject if audio playback could not be enabled for the device.

### `Audio.setAudioModeAsync(mode)`

We provide this API to customize the audio experience on iOS and Android.

#### Arguments

- **mode (_object_)** --

  A dictionary with the following key-value pairs:

  - `playsInSilentModeIOS` : a boolean selecting if your experience's audio should play in silent mode on iOS. This value defaults to `false`.
  - `allowsRecordingIOS` : a boolean selecting if recording is enabled on iOS. This value defaults to `false`. NOTE: when this flag is set to `true`, playback may be routed to the phone receiver instead of to the speaker.
  - `staysActiveInBackground` : a boolean selecting if the audio session (playback or recording) should stay active even when the app goes into background. This value defaults to `false`. NOTE: For this option to work properly in standalone iOS apps you'll need to add a `UIBackgroundMode` to your app configuration (see [information below](#playing-or-recording-audio-in-background-ios)).
  - `interruptionModeIOS` : an enum selecting how your experience's audio should interact with the audio from other apps on iOS:
    - `INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS` : This is the default option. If this option is set, your experience's audio is mixed with audio playing in background apps.
    - `INTERRUPTION_MODE_IOS_DO_NOT_MIX` : If this option is set, your experience's audio interrupts audio from other apps.
    - `INTERRUPTION_MODE_IOS_DUCK_OTHERS` : If this option is set, your experience's audio lowers the volume ("ducks") of audio from other apps while your audio plays.
  - `shouldDuckAndroid` : a boolean selecting if your experience's audio should automatically be lowered in volume ("duck") if audio from another app interrupts your experience. This value defaults to `true`. If `false`, audio from other apps will pause your audio.
  - `interruptionModeAndroid` : an enum selecting how your experience's audio should interact with the audio from other apps on Android:
    - `INTERRUPTION_MODE_ANDROID_DO_NOT_MIX` : If this option is set, your experience's audio interrupts audio from other apps.
    - `INTERRUPTION_MODE_ANDROID_DUCK_OTHERS` : This is the default option. If this option is set, your experience's audio lowers the volume ("ducks") of audio from other apps while your audio plays.
  - `playThroughEarpieceAndroid` : set to true to route audio to earpiece (on Android).

#### Returns

A `Promise` that will reject if the audio mode could not be enabled for the device. Note that these are the only legal AudioMode combinations of (`playsInSilentModeIOS`, `allowsRecordingIOS`, `staysActiveInBackground`, `interruptionModeIOS`), and any other will result in promise rejection:

- `false, false, false, INTERRUPTION_MODE_IOS_DO_NOT_MIX`
- `false, false, false, INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS`
- `true, true, true, INTERRUPTION_MODE_IOS_DO_NOT_MIX`
- `true, true, true, INTERRUPTION_MODE_IOS_DUCK_OTHERS`
- `true, true, true, INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS`
- `true, true, false, INTERRUPTION_MODE_IOS_DO_NOT_MIX`
- `true, true, false, INTERRUPTION_MODE_IOS_DUCK_OTHERS`
- `true, true, false, INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS`
- `true, false, true, INTERRUPTION_MODE_IOS_DO_NOT_MIX`
- `true, false, true, INTERRUPTION_MODE_IOS_DUCK_OTHERS`
- `true, false, true, INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS`
- `true, false, false, INTERRUPTION_MODE_IOS_DO_NOT_MIX`
- `true, false, false, INTERRUPTION_MODE_IOS_DUCK_OTHERS`
- `true, false, false, INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS`

#### Playing or recording audio in background (iOS)

Playing or recording audio in background works out of the box in Expo client, but some extra configuration is needed for standalone apps. On iOS, each background feature requires a special key in `UIBackgroundModes` array in your `Info.plist` file. In standalone apps this array is empty by default, so in order to use background features you will need to add appropriate keys to your `app.json` configuration.

See an example of `app.json` that enables audio playback in background:

```json
{
  "expo": {
    ...
    "ios": {
      ...
      "infoPlist": {
        ...
        "UIBackgroundModes": [
          "audio"
        ]
      }
    }
  }
}
```

## Playing sounds

### `Audio.Sound`

This class represents a sound corresponding to an Asset or URL.

#### Returns

A newly constructed instance of `Audio.Sound`.

#### Example

```javascript
const soundObject = new Audio.Sound();
try {
  await soundObject.loadAsync(require('./assets/sounds/hello.mp3'));
  await soundObject.playAsync();
  // Your sound is playing!
} catch (error) {
  // An error occurred!
}
```

A static convenience method to construct and load a sound is also provided:

- `Audio.Sound.createAsync(source, initialStatus = {}, onPlaybackStatusUpdate = null, downloadFirst = true)`

  Creates and loads a sound from source, with optional `initialStatus`, `onPlaybackStatusUpdate`, and `downloadFirst`.

  This is equivalent to the following:

  ```javascript
  const soundObject = new Audio.Sound();
  soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
  await soundObject.loadAsync(source, initialStatus, downloadFirst);
  ```

  #### Parameters

  - **source (_object_ / _number_ / _Asset_)** -- The source of the sound. The following forms are supported:

    - A dictionary of the form `{ uri: string, headers?: { [string]: string }, overrideFileExtensionAndroid?: string }` with a network URL pointing to a media file on the web, an optional headers object passed in a network request to the `uri` and an optional Android-specific `overrideFileExtensionAndroid` string overriding extension inferred from the URL.
      The `overrideFileExtensionAndroid` property may come in handy if the player receives an URL like `example.com/play` which redirects to `example.com/player.m3u8`. Setting this property to `m3u8` would allow the Android player to properly infer the content type of the media and use proper media file reader.
    - `require('path/to/file')` for an audio file asset in the source code directory.
    - An [`Asset`](../asset/) object for an audio file asset.

  - **initialStatus (_PlaybackStatusToSet_)** -- The initial intended `PlaybackStatusToSet` of the sound, whose values will override the default initial playback status. This value defaults to `{}` if no parameter is passed. See the [AV documentation](../av/) for details on `PlaybackStatusToSet` and the default initial playback status.

  - **onPlaybackStatusUpdate (_function_)** -- A function taking a single parameter `PlaybackStatus`. This value defaults to `null` if no parameter is passed. See the [AV documentation](../av/) for details on the functionality provided by `onPlaybackStatusUpdate`

  - **downloadFirst (_boolean_)** -- If set to true, the system will attempt to download the resource to the device before loading. This value defaults to `true`. Note that at the moment, this will only work for `source`s of the form `require('path/to/file')` or `Asset` objects.

  #### Returns

  A `Promise` that is rejected if creation failed, or fulfilled with the following dictionary if creation succeeded:

  - `sound` : the newly created and loaded `Sound` object.
  - `status` : the `PlaybackStatus` of the `Sound` object. See the [AV documentation](../av/) for further information.

  #### Example

  ```javascript
  try {
    const { sound: soundObject, status } = await Audio.Sound.createAsync(
      require('./assets/sounds/hello.mp3'),
      { shouldPlay: true }
    );
    // Your sound is playing!
  } catch (error) {
    // An error occurred!
  }
  ```

The rest of the API for `Audio.Sound` is the same as the imperative playback API for `Video`-- see the [AV documentation](../av/) for further information:

- `soundObject.loadAsync(source, initialStatus = {}, downloadFirst = true)`

- `soundObject.unloadAsync()`

- `soundObject.getStatusAsync()`

- `soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)`

- `soundObject.setStatusAsync(statusToSet)`

- `soundObject.playAsync()`

- `soundObject.replayAsync()`

- `soundObject.pauseAsync()`

- `soundObject.stopAsync()`

- `soundObject.setPositionAsync(millis)`

- `soundObject.setRateAsync(value, shouldCorrectPitch, pitchCorrectionQuality)`

- `soundObject.setVolumeAsync(value)`

- `soundObject.setIsMutedAsync(value)`

- `soundObject.setIsLoopingAsync(value)`

- `soundObject.setProgressUpdateIntervalAsync(millis)`

## Recording sounds

### `Audio.Recording`

This class represents an audio recording. After creating an instance of this class, `prepareToRecordAsync` must be called in order to record audio. Once recording is finished, call `stopAndUnloadAsync`. Note that only one recorder is allowed to exist in the state between `prepareToRecordAsync` and `stopAndUnloadAsync` at any given time.

Note that your experience must request audio recording permissions in order for recording to function. See the [`Permissions` module](../permissions/) for more details. Additionally, audio recording is [not supported in the iOS Simulator](../../workflow/ios-simulator/#limitations).

For standalone iOS apps, you'll need to [customize the permission dialog](../../distribution/app-stores/#system-permissions-dialogs-on-ios) by adding the `NSContactsUsageDescription` key under the `ios.infoPlist` key in your `app.json` or `app.config.js`. Failing to do so may result in Apple rejecting your app.

```
  "infoPlist": {
    "NSContactsUsageDescription": "your-custom-message-here."
  }
```

#### Returns

A newly constructed instance of `Audio.Recording`.

#### Example

```javascript
const recording = new Audio.Recording();
try {
  await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
  await recording.startAsync();
  // You are now recording!
} catch (error) {
  // An error occurred!
}
```

- `recordingInstance.getStatusAsync()`

  Gets the `status` of the `Recording`.

  #### Returns

  A `Promise` that is resolved with the `status` of the `Recording`: a dictionary with the following key-value pairs.

  Before `prepareToRecordAsync` is called, the `status` will be as follows:

  - `canRecord` : a boolean set to `false`.
  - `isDoneRecording` : a boolean set to `false`.

  After `prepareToRecordAsync()` is called, but before `stopAndUnloadAsync()` is called, the `status` will be as follows:

  - `canRecord` : a boolean set to `true`.
  - `isRecording` : a boolean describing if the `Recording` is currently recording.
  - `durationMillis` : the current duration of the recorded audio.

  After `stopAndUnloadAsync()` is called, the `status` will be as follows:

  - `canRecord` : a boolean set to `false`.
  - `isDoneRecording` : a boolean set to `true`.
  - `durationMillis` : the final duration of the recorded audio.

- `recordingInstance.setOnRecordingStatusUpdate(onRecordingStatusUpdate)`

  Sets a function to be called regularly with the `status` of the `Recording`. See `getStatusAsync()` for details on `status`.

  `onRecordingStatusUpdate` will be called when another call to the API for this recording completes (such as `prepareToRecordAsync()`, `startAsync()`, `getStatusAsync()`, or `stopAndUnloadAsync()`), and will also be called at regular intervals while the recording can record. Call `setProgressUpdateInterval()` to modify the interval with which `onRecordingStatusUpdate` is called while the recording can record.

  #### Parameters

  - **onRecordingStatusUpdate (_function_)** -- A function taking a single parameter `status` (a dictionary, described in `getStatusAsync`).

- `recordingInstance.setProgressUpdateInterval(millis)`

  Sets the interval with which `onRecordingStatusUpdate` is called while the recording can record. See `setOnRecordingStatusUpdate` for details. This value defaults to 500 milliseconds.

  #### Parameters

  - **millis (_number_)** -- The new interval between calls of `onRecordingStatusUpdate`.

- `recordingInstance.prepareToRecordAsync(options)`

  Loads the recorder into memory and prepares it for recording. This must be called before calling `startAsync()`. This method can only be called if the `Recording` instance has never yet been prepared.

  #### Parameters

  - **options (_RecordingOptions_)** -- Options for the recording, including sample rate, bitrate, channels, format, encoder, and extension. If no options are passed to `prepareToRecordAsync()`, the recorder will be created with options `Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY`. See below for details on `RecordingOptions`.

  #### Returns

  A `Promise` that is fulfilled when the recorder is loaded and prepared, or rejects if this failed. If another `Recording` exists in your experience that is currently prepared to record, the `Promise` will reject. If the `RecordingOptions` provided are invalid, the `Promise` will also reject. The promise is resolved with the `status` of the recording (see `getStatusAsync()` for details).

- `recordingInstance.isPreparedToRecord()`

  #### Returns

  A `boolean` that is true if and only if the `Recording` is prepared to record.

- `recordingInstance.startAsync()`

  Begins recording. This method can only be called if the `Recording` has been prepared.

  #### Returns

  A `Promise` that is fulfilled when recording has begun, or rejects if recording could not start. The promise is resolved with the `status` of the recording (see `getStatusAsync()` for details).

- `recordingInstance.pauseAsync()`

  Pauses recording. This method can only be called if the `Recording` has been prepared.

  NOTE: This is only available on Android API version 24 and later.

  #### Returns

  A `Promise` that is fulfilled when recording has paused, or rejects if recording could not be paused. If the Android API version is less than 24, the `Promise` will reject. The promise is resolved with the `status` of the recording (see `getStatusAsync()` for details).

- `recordingInstance.stopAndUnloadAsync()`

  Stops the recording and deallocates the recorder from memory. This reverts the `Recording` instance to an unprepared state, and another `Recording` instance must be created in order to record again. This method can only be called if the `Recording` has been prepared.

  #### Returns

  A `Promise` that is fulfilled when recording has stopped, or rejects if recording could not be stopped. The promise is resolved with the `status` of the recording (see `getStatusAsync()` for details).

- `recordingInstance.getURI()`

  Gets the local URI of the `Recording`. Note that this will only succeed once the `Recording` is prepared to record.

  #### Returns

  A `string` with the local URI of the `Recording`, or `null` if the `Recording` is not prepared to record.

- `recordingInstance.createNewLoadedSoundAsync()`

  Creates and loads a new `Sound` object to play back the `Recording`. Note that this will only succeed once the `Recording` is done recording (once `stopAndUnloadAsync()` has been called).

  #### Parameters

  - **initialStatus (_PlaybackStatusToSet_)** -- The initial intended `PlaybackStatusToSet` of the sound, whose values will override the default initial playback status. This value defaults to `{}` if no parameter is passed. See the [AV documentation](../av/) for details on `PlaybackStatusToSet` and the default initial playback status.

  - **onPlaybackStatusUpdate (_function_)** -- A function taking a single parameter `PlaybackStatus`. This value defaults to `null` if no parameter is passed. See the [AV documentation](../av/) for details on the functionality provided by `onPlaybackStatusUpdate`

  #### Returns

  A `Promise` that is rejected if creation failed, or fulfilled with the following dictionary if creation succeeded:

  - `sound` : the newly created and loaded `Sound` object.
  - `status` : the `PlaybackStatus` of the `Sound` object. See the [AV documentation](../av/) for further information.

### `RecordingOptions`

The recording extension, sample rate, bitrate, channels, format, encoder, etc can be customized by passing a dictionary of options to `prepareToRecordAsync()`.

We provide the following preset options for convenience, as used in the example above. See below for the definitions of these presets.

- `Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY`

- `Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY`

We also provide the ability to define your own custom recording options, but **we recommend you use the presets, as not all combinations of options will allow you to successfully `prepareToRecordAsync()`.** You will have to test your custom options on iOS and Android to make sure it's working. In the future, we will enumerate all possible valid combinations, but at this time, our goal is to make the basic use-case easy (with presets) and the advanced use-case possible (by exposing all the functionality available in native). As always, feel free to ping us on the forums or Slack with any questions.

In order to define your own custom recording options, you must provide a dictionary of the following key value pairs.

- `android` : a dictionary of key-value pairs for the Android platform. This key is required.

  - `extension` : the desired file extension. This key is required. Example valid values are `.3gp` and `.m4a`. For more information, see the [Android docs for supported output formats](https://developer.android.com/guide/topics/media/media-formats.html).

  - `outputFormat` : the desired file format. This key is required. See the next section for an enumeration of all valid values of `outputFormat`.

  - `audioEncoder` : the desired audio encoder. This key is required. See the next section for an enumeration of all valid values of `audioEncoder`.

  - `sampleRate` : the desired sample rate. This key is optional. An example valid value is `44100`.

    Note that the sampling rate depends on the format for the audio recording, as well as the capabilities of the platform. For instance, the sampling rate supported by AAC audio coding standard ranges from 8 to 96 kHz, the sampling rate supported by AMRNB is 8kHz, and the sampling rate supported by AMRWB is 16kHz. Please consult with the related audio coding standard for the supported audio sampling rate.

  - `numberOfChannels` : the desired number of channels. This key is optional. Example valid values are `1` and `2`.

    Note that `prepareToRecordAsync()` may perform additional checks on the parameter to make sure whether the specified number of audio channels are applicable.

  - `bitRate` : the desired bit rate. This key is optional. An example valid value is `128000`.

    Note that `prepareToRecordAsync()` may perform additional checks on the parameter to make sure whether the specified bit rate is applicable, and sometimes the passed bitRate will be clipped internally to ensure the audio recording can proceed smoothly based on the capabilities of the platform.

  - `maxFileSize` : the desired maximum file size in bytes, after which the recording will stop (but `stopAndUnloadAsync()` must still be called after this point). This key is optional. An example valid value is `65536`.

- `ios` : a dictionary of key-value pairs for the iOS platform

  - `extension` : the desired file extension. This key is required. An example valid value is `.caf`.

  - `outputFormat` : the desired file format. This key is optional. See the next section for an enumeration of all valid values of `outputFormat`.

  - `audioQuality` : the desired audio quality. This key is required. See the next section for an enumeration of all valid values of `audioQuality`.

  - `sampleRate` : the desired sample rate. This key is required. An example valid value is `44100`.

  - `numberOfChannels` : the desired number of channels. This key is required. Example valid values are `1` and `2`.

  - `bitRate` : the desired bit rate. This key is required. An example valid value is `128000`.

  - `bitRateStrategy` : the desired bit rate strategy. This key is optional. See the next section for an enumeration of all valid values of `bitRateStrategy`.

  - `bitDepthHint` : the desired bit depth hint. This key is optional. An example valid value is `16`.

  - `linearPCMBitDepth` : the desired PCM bit depth. This key is optional. An example valid value is `16`.

  - `linearPCMIsBigEndian` : a boolean describing if the PCM data should be formatted in big endian. This key is optional.

  - `linearPCMIsFloat` : a boolean describing if the PCM data should be encoded in floating point or integral values. This key is optional.

Following is an enumeration of all of the valid values for certain `RecordingOptions` keys.

> **Note** Not all of the iOS formats included in this list of constants are currently supported by iOS, in spite of appearing in the Apple source code. For an accurate list of formats supported by iOS, see [Core Audio Codecs](https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/CoreAudioEssentials/CoreAudioEssentials.html#//apple_ref/doc/uid/TP40003577-CH10-SW26) and [iPhone Audio File Formats](https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/CoreAudioEssentials/CoreAudioEssentials.html#//apple_ref/doc/uid/TP40003577-CH10-SW57).

- `android` :

  - `outputFormat` :

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AMR_NB`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AMR_WB`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADIF`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_RTP_AVP`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG2TS`

    - `Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WEBM`

  - `audioEncoder` :

    - `Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT`

    - `Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB`

    - `Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_WB`

    - `Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC`

    - `Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_HE_AAC`

    - `Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC_ELD`

- `ios` :

  - `outputFormat` :

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_AC3`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_60958AC3`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_APPLEIMA4`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4CELP`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4HVXC`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4TWINVQ`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MACE3`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MACE6`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_ULAW`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_ALAW`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_QDESIGN`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_QDESIGN2`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_QUALCOMM`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEGLAYER1`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEGLAYER2`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEGLAYER3`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_APPLELOSSLESS`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_HE`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_LD`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_ELD`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_ELD_SBR`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_ELD_V2`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_HE_V2`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_SPATIAL`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_AMR`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_AMR_WB`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_AUDIBLE`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_ILBC`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_DVIINTELIMA`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MICROSOFTGSM`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_AES3`

    - `Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_ENHANCEDAC3`

  - `audioQuality` :

    - `Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN`

    - `Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW`

    - `Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM`

    - `Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH`

    - `Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX`

  - `bitRateStrategy` :

    - `Audio.RECORDING_OPTION_IOS_BIT_RATE_STRATEGY_CONSTANT`

    - `Audio.RECORDING_OPTION_IOS_BIT_RATE_STRATEGY_LONG_TERM_AVERAGE`

    - `Audio.RECORDING_OPTION_IOS_BIT_RATE_STRATEGY_VARIABLE_CONSTRAINED`

    - `Audio.RECORDING_OPTION_IOS_BIT_RATE_STRATEGY_VARIABLE`

For reference, following are the definitions of the two preset examples of `RecordingOptions`, as implemented in the Audio SDK:

```javascript
export const RECORDING_OPTIONS_PRESET_HIGH_QUALITY: RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.caf',
    audioQuality: RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export const RECORDING_OPTIONS_PRESET_LOW_QUALITY: RecordingOptions = {
  android: {
    extension: '.3gp',
    outputFormat: RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP,
    audioEncoder: RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.caf',
    audioQuality: RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
```
