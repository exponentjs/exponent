import { EventEmitter } from '@unimodules/core';
import { Playback, AVPlaybackSource, AVPlaybackStatus, AVPlaybackStatusToSet } from '../AV';
import { PitchCorrectionQuality } from '../Audio';
export interface AudioChannel {
    frames: number[];
}
export interface AudioSample {
    channels: AudioChannel[];
}
declare type AudioInstance = number | HTMLMediaElement | null;
export declare class Sound implements Playback {
    _loaded: boolean;
    _loading: boolean;
    _key: AudioInstance;
    _lastStatusUpdate: string | null;
    _lastStatusUpdateTime: Date | null;
    _subscriptions: {
        remove: () => void;
    }[];
    _eventEmitter: EventEmitter;
    _coalesceStatusUpdatesInMillis: number;
    _onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null;
    /** @deprecated Use `Sound.createAsync()` instead */
    static create: (source: AVPlaybackSource, initialStatus?: AVPlaybackStatusToSet, onPlaybackStatusUpdate?: ((status: AVPlaybackStatus) => void) | null, downloadFirst?: boolean) => Promise<{
        sound: Sound;
        status: AVPlaybackStatus;
    }>;
    static createAsync: (source: AVPlaybackSource, initialStatus?: AVPlaybackStatusToSet, onPlaybackStatusUpdate?: ((status: AVPlaybackStatus) => void) | null, downloadFirst?: boolean) => Promise<{
        sound: Sound;
        status: AVPlaybackStatus;
    }>;
    /**
     * Returns the average loudness of all audio sample frames in the given `AudioChannel`.
     *
     * The resulting "loudness" value ranges from `0` to `1`, where `0` is "silent" (-160dB) and `1` is "loud" (0dB)
     * @param channel The `AudioChannel` to calculate average "loudness" from.
     */
    static getAverageLoudness(channel: AudioChannel): number;
    /**
     * Returns the average loudness of all audio sample frames in every `AudioChannel` of the given `AudioSample`.
     *
     * The resulting "loudness" value ranges from `0` to `1`, where `0` is "silent" (-160dB) and `1` is "loud" (0dB)
     * @param sample The `AudioSample` to calculate average "loudness" from.
     */
    static getAverageLoudness(sample: AudioSample): number;
    _callOnPlaybackStatusUpdateForNewStatus(status: AVPlaybackStatus): void;
    _performOperationAndHandleStatusAsync(operation: () => Promise<AVPlaybackStatus>): Promise<AVPlaybackStatus>;
    _internalStatusUpdateCallback: ({ key, status, }: {
        key: AudioInstance;
        status: AVPlaybackStatus;
    }) => void;
    _internalErrorCallback: ({ key, error }: {
        key: AudioInstance;
        error: string;
    }) => void;
    _subscribeToNativeEvents(): void;
    _clearSubscriptions(): void;
    _errorCallback: (error: string) => void;
    getStatusAsync: () => Promise<AVPlaybackStatus>;
    setOnPlaybackStatusUpdate(onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null): void;
    loadAsync(source: AVPlaybackSource, initialStatus?: AVPlaybackStatusToSet, downloadFirst?: boolean): Promise<AVPlaybackStatus>;
    unloadAsync(): Promise<AVPlaybackStatus>;
    setStatusAsync(status: AVPlaybackStatusToSet): Promise<AVPlaybackStatus>;
    replayAsync(status?: AVPlaybackStatusToSet): Promise<AVPlaybackStatus>;
    playAsync: () => Promise<AVPlaybackStatus>;
    playFromPositionAsync: (positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number;
        toleranceMillisAfter?: number;
    }) => Promise<AVPlaybackStatus>;
    pauseAsync: () => Promise<AVPlaybackStatus>;
    stopAsync: () => Promise<AVPlaybackStatus>;
    setPositionAsync: (positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number;
        toleranceMillisAfter?: number;
    }) => Promise<AVPlaybackStatus>;
    setRateAsync: (rate: number, shouldCorrectPitch: boolean, pitchCorrectionQuality?: PitchCorrectionQuality) => Promise<AVPlaybackStatus>;
    setVolumeAsync: (volume: number) => Promise<AVPlaybackStatus>;
    setIsMutedAsync: (isMuted: boolean) => Promise<AVPlaybackStatus>;
    setIsLoopingAsync: (isLooping: boolean) => Promise<AVPlaybackStatus>;
    setProgressUpdateIntervalAsync: (progressUpdateIntervalMillis: number) => Promise<AVPlaybackStatus>;
}
export {};
