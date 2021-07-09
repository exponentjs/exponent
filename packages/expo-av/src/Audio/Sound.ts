import { EventEmitter, Platform } from '@unimodules/core';

import {
  Playback,
  PlaybackMixin,
  AVPlaybackSource,
  AVPlaybackStatus,
  AVPlaybackStatusToSet,
  assertStatusValuesInBounds,
  getNativeSourceAndFullInitialStatusForLoadAsync,
  getUnloadedStatus,
} from '../AV';
import { PitchCorrectionQuality } from '../Audio';
import ExponentAV from '../ExponentAV';
import { throwIfAudioIsDisabled } from './AudioAvailability';

export interface AudioChannel {
  frames: number[];
}
export interface AudioSample {
  channels: AudioChannel[];
}

type TAudioSampleCallback = ((sample: AudioSample) => void) | null;

type AudioInstance = number | HTMLMediaElement | null;
export class Sound implements Playback {
  _loaded: boolean = false;
  _loading: boolean = false;
  _key: AudioInstance = null;
  _lastStatusUpdate: string | null = null;
  _lastStatusUpdateTime: Date | null = null;
  _subscriptions: { remove: () => void }[] = [];
  _eventEmitter: EventEmitter = new EventEmitter(ExponentAV);
  _coalesceStatusUpdatesInMillis: number = 100;
  _onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;
  _onAudioSampleReceived: TAudioSampleCallback = null;

  get onAudioSampleReceived(): TAudioSampleCallback {
    return this._onAudioSampleReceived;
  }
  set onAudioSampleReceived(callback: TAudioSampleCallback) {
    // @ts-expect-error
    if (global.__av_sound_setOnAudioSampleReceivedCallback == null) {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        throw new Error(
          'Failed to set Audio Sample Buffer callback! The JSI function seems to not be installed correctly.'
        );
      } else {
        throw new Error(`'onAudioSampleReceived' is not supported on ${Platform.OS}!`);
      }
    }
    if (this._key == null) {
      throw new Error(
        'Cannot set Audio Sample Buffer callback when the Sound instance has not been successfully loaded/initialized!'
      );
    }
    if (typeof this._key !== 'number') {
      throw new Error(
        `Cannot set Audio Sample Buffer callback when Sound instance key is of type ${typeof this
          ._key}! (expected: number)`
      );
    }
    this._onAudioSampleReceived = callback;
    // @ts-expect-error
    global.__av_sound_setOnAudioSampleReceivedCallback(this._key, callback);
  }

  /** @deprecated Use `Sound.createAsync()` instead */
  static create = async (
    source: AVPlaybackSource,
    initialStatus: AVPlaybackStatusToSet = {},
    onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null,
    downloadFirst: boolean = true
  ): Promise<{ sound: Sound; status: AVPlaybackStatus }> => {
    console.warn(
      `Sound.create is deprecated in favor of Sound.createAsync with the same API except for the new method name`
    );
    return Sound.createAsync(source, initialStatus, onPlaybackStatusUpdate, downloadFirst);
  };

  static createAsync = async (
    source: AVPlaybackSource,
    initialStatus: AVPlaybackStatusToSet = {},
    onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null,
    downloadFirst: boolean = true
  ): Promise<{ sound: Sound; status: AVPlaybackStatus }> => {
    const sound: Sound = new Sound();
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    const status: AVPlaybackStatus = await sound.loadAsync(source, initialStatus, downloadFirst);
    return { sound, status };
  };

  /**
   * Returns the average loudness of all audio sample frames in the given `AudioChannel`.
   *
   * The resulting "loudness" value ranges from `0` to `1`, where `0` is "silent" (-160dB) and `1` is "loud" (0dB)
   * @param channel The `AudioChannel` to calculate average "loudness" from.
   */
  public static getAverageLoudness(channel: AudioChannel): number;
  /**
   * Returns the average loudness of all audio sample frames in every `AudioChannel` of the given `AudioSample`.
   *
   * The resulting "loudness" value ranges from `0` to `1`, where `0` is "silent" (-160dB) and `1` is "loud" (0dB)
   * @param sample The `AudioSample` to calculate average "loudness" from.
   */
  public static getAverageLoudness(sample: AudioSample): number;
  public static getAverageLoudness(sampleOrChannel: AudioSample | AudioChannel): number {
    if ('frames' in sampleOrChannel) {
      // it's a single `AudioChannel`
      // https://developer.apple.com/documentation/accelerate/1450655-vdsp_rmsqv
      const frameSum = sampleOrChannel.frames.reduce((prev, curr) => {
        const x = curr ** 2;
        return prev + x;
      }, 0);
      const rmsValue = Math.sqrt(frameSum / sampleOrChannel.frames.length);
      const decibel = 10 * Math.log10(rmsValue); // ranges from -160dB to 0dB
      return (160 + decibel) / 160; // map 0...160 to 0...1
    } else {
      // it's a full `AudioSample`
      const sumOfAllChannels = sampleOrChannel.channels.reduce(
        (prev, curr) => prev + this.getAverageLoudness(curr),
        0
      );
      return sumOfAllChannels / sampleOrChannel.channels.length;
    }
  }

  // Internal methods

  _callOnPlaybackStatusUpdateForNewStatus(status: AVPlaybackStatus) {
    const shouldDismissBasedOnCoalescing =
      this._lastStatusUpdateTime &&
      JSON.stringify(status) === this._lastStatusUpdate &&
      Date.now() - this._lastStatusUpdateTime.getTime() < this._coalesceStatusUpdatesInMillis;

    if (this._onPlaybackStatusUpdate != null && !shouldDismissBasedOnCoalescing) {
      this._onPlaybackStatusUpdate(status);
      this._lastStatusUpdateTime = new Date();
      this._lastStatusUpdate = JSON.stringify(status);
    }
  }

  async _performOperationAndHandleStatusAsync(
    operation: () => Promise<AVPlaybackStatus>
  ): Promise<AVPlaybackStatus> {
    throwIfAudioIsDisabled();
    if (this._loaded) {
      const status = await operation();
      this._callOnPlaybackStatusUpdateForNewStatus(status);
      return status;
    } else {
      throw new Error('Cannot complete operation because sound is not loaded.');
    }
  }

  _internalStatusUpdateCallback = ({
    key,
    status,
  }: {
    key: AudioInstance;
    status: AVPlaybackStatus;
  }) => {
    if (this._key === key) {
      this._callOnPlaybackStatusUpdateForNewStatus(status);
    }
  };

  _internalErrorCallback = ({ key, error }: { key: AudioInstance; error: string }) => {
    if (this._key === key) {
      this._errorCallback(error);
    }
  };

  // TODO: We can optimize by only using time observer on native if (this._onPlaybackStatusUpdate).
  _subscribeToNativeEvents() {
    if (this._loaded) {
      this._subscriptions.push(
        this._eventEmitter.addListener(
          'didUpdatePlaybackStatus',
          this._internalStatusUpdateCallback
        )
      );

      this._subscriptions.push(
        this._eventEmitter.addListener('ExponentAV.onError', this._internalErrorCallback)
      );
    }
  }

  _clearSubscriptions() {
    this._subscriptions.forEach(e => e.remove());
    this._subscriptions = [];
  }

  _errorCallback = (error: string) => {
    this._clearSubscriptions();
    this._loaded = false;
    this._key = null;
    this._callOnPlaybackStatusUpdateForNewStatus(getUnloadedStatus(error));
  };

  // ### Unified playback API ### (consistent with Video.js)
  // All calls automatically call onPlaybackStatusUpdate as a side effect.

  // Get status API

  getStatusAsync = async (): Promise<AVPlaybackStatus> => {
    if (this._loaded) {
      return this._performOperationAndHandleStatusAsync(() =>
        ExponentAV.getStatusForSound(this._key)
      );
    }
    const status: AVPlaybackStatus = getUnloadedStatus();
    this._callOnPlaybackStatusUpdateForNewStatus(status);
    return status;
  };

  setOnPlaybackStatusUpdate(onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null) {
    this._onPlaybackStatusUpdate = onPlaybackStatusUpdate;
    this.getStatusAsync();
  }

  // Loading / unloading API

  async loadAsync(
    source: AVPlaybackSource,
    initialStatus: AVPlaybackStatusToSet = {},
    downloadFirst: boolean = true
  ): Promise<AVPlaybackStatus> {
    throwIfAudioIsDisabled();
    if (this._loading) {
      throw new Error('The Sound is already loading.');
    }
    if (!this._loaded) {
      this._loading = true;

      const {
        nativeSource,
        fullInitialStatus,
      } = await getNativeSourceAndFullInitialStatusForLoadAsync(
        source,
        initialStatus,
        downloadFirst
      );

      // This is a workaround, since using load with resolve / reject seems to not work.
      return new Promise<AVPlaybackStatus>((resolve, reject) => {
        const loadSuccess = (result: [AudioInstance, AVPlaybackStatus]) => {
          const [key, status] = result;
          this._key = key;
          this._loaded = true;
          this._loading = false;
          this._subscribeToNativeEvents();
          this._callOnPlaybackStatusUpdateForNewStatus(status);
          resolve(status);
        };

        const loadError = (error: Error) => {
          this._loading = false;
          reject(error);
        };

        ExponentAV.loadForSound(nativeSource, fullInitialStatus)
          .then(loadSuccess)
          .catch(loadError);
      });
    } else {
      throw new Error('The Sound is already loaded.');
    }
  }

  async unloadAsync(): Promise<AVPlaybackStatus> {
    if (this._loaded) {
      this._loaded = false;
      const key = this._key;
      this._key = null;
      const status = await ExponentAV.unloadForSound(key);
      this._callOnPlaybackStatusUpdateForNewStatus(status);
      this._clearSubscriptions();
      return status;
    } else {
      return this.getStatusAsync(); // Automatically calls onPlaybackStatusUpdate.
    }
  }

  // Set status API (only available while isLoaded = true)

  async setStatusAsync(status: AVPlaybackStatusToSet): Promise<AVPlaybackStatus> {
    assertStatusValuesInBounds(status);
    return this._performOperationAndHandleStatusAsync(() =>
      ExponentAV.setStatusForSound(this._key, status)
    );
  }

  async replayAsync(status: AVPlaybackStatusToSet = {}): Promise<AVPlaybackStatus> {
    if (status.positionMillis && status.positionMillis !== 0) {
      throw new Error('Requested position after replay has to be 0.');
    }

    return this._performOperationAndHandleStatusAsync(() =>
      ExponentAV.replaySound(this._key, {
        ...status,
        positionMillis: 0,
        shouldPlay: true,
      })
    );
  }

  // Methods of the Playback interface that are set via PlaybackMixin
  playAsync!: () => Promise<AVPlaybackStatus>;
  playFromPositionAsync!: (
    positionMillis: number,
    tolerances?: { toleranceMillisBefore?: number; toleranceMillisAfter?: number }
  ) => Promise<AVPlaybackStatus>;
  pauseAsync!: () => Promise<AVPlaybackStatus>;
  stopAsync!: () => Promise<AVPlaybackStatus>;
  setPositionAsync!: (
    positionMillis: number,
    tolerances?: { toleranceMillisBefore?: number; toleranceMillisAfter?: number }
  ) => Promise<AVPlaybackStatus>;
  setRateAsync!: (
    rate: number,
    shouldCorrectPitch: boolean,
    pitchCorrectionQuality?: PitchCorrectionQuality
  ) => Promise<AVPlaybackStatus>;
  setVolumeAsync!: (volume: number) => Promise<AVPlaybackStatus>;
  setIsMutedAsync!: (isMuted: boolean) => Promise<AVPlaybackStatus>;
  setIsLoopingAsync!: (isLooping: boolean) => Promise<AVPlaybackStatus>;
  setProgressUpdateIntervalAsync!: (
    progressUpdateIntervalMillis: number
  ) => Promise<AVPlaybackStatus>;
}

Object.assign(Sound.prototype, PlaybackMixin);
