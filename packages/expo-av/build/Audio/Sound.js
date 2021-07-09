import { EventEmitter } from '@unimodules/core';
import { PlaybackMixin, assertStatusValuesInBounds, getNativeSourceAndFullInitialStatusForLoadAsync, getUnloadedStatus, } from '../AV';
import ExponentAV from '../ExponentAV';
import { throwIfAudioIsDisabled } from './AudioAvailability';
export class Sound {
    constructor() {
        this._loaded = false;
        this._loading = false;
        this._key = null;
        this._lastStatusUpdate = null;
        this._lastStatusUpdateTime = null;
        this._subscriptions = [];
        this._eventEmitter = new EventEmitter(ExponentAV);
        this._coalesceStatusUpdatesInMillis = 100;
        this._onPlaybackStatusUpdate = null;
        this._internalStatusUpdateCallback = ({ key, status, }) => {
            if (this._key === key) {
                this._callOnPlaybackStatusUpdateForNewStatus(status);
            }
        };
        this._internalErrorCallback = ({ key, error }) => {
            if (this._key === key) {
                this._errorCallback(error);
            }
        };
        this._errorCallback = (error) => {
            this._clearSubscriptions();
            this._loaded = false;
            this._key = null;
            this._callOnPlaybackStatusUpdateForNewStatus(getUnloadedStatus(error));
        };
        // ### Unified playback API ### (consistent with Video.js)
        // All calls automatically call onPlaybackStatusUpdate as a side effect.
        // Get status API
        this.getStatusAsync = async () => {
            if (this._loaded) {
                return this._performOperationAndHandleStatusAsync(() => ExponentAV.getStatusForSound(this._key));
            }
            const status = getUnloadedStatus();
            this._callOnPlaybackStatusUpdateForNewStatus(status);
            return status;
        };
    }
    static getAverageLoudness(sampleOrChannel) {
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
        }
        else {
            // it's a full `AudioSample`
            const sumOfAllChannels = sampleOrChannel.channels.reduce((prev, curr) => prev + this.getAverageLoudness(curr), 0);
            return sumOfAllChannels / sampleOrChannel.channels.length;
        }
    }
    // Internal methods
    _callOnPlaybackStatusUpdateForNewStatus(status) {
        const shouldDismissBasedOnCoalescing = this._lastStatusUpdateTime &&
            JSON.stringify(status) === this._lastStatusUpdate &&
            Date.now() - this._lastStatusUpdateTime.getTime() < this._coalesceStatusUpdatesInMillis;
        if (this._onPlaybackStatusUpdate != null && !shouldDismissBasedOnCoalescing) {
            this._onPlaybackStatusUpdate(status);
            this._lastStatusUpdateTime = new Date();
            this._lastStatusUpdate = JSON.stringify(status);
        }
    }
    async _performOperationAndHandleStatusAsync(operation) {
        throwIfAudioIsDisabled();
        if (this._loaded) {
            const status = await operation();
            this._callOnPlaybackStatusUpdateForNewStatus(status);
            return status;
        }
        else {
            throw new Error('Cannot complete operation because sound is not loaded.');
        }
    }
    // TODO: We can optimize by only using time observer on native if (this._onPlaybackStatusUpdate).
    _subscribeToNativeEvents() {
        if (this._loaded) {
            this._subscriptions.push(this._eventEmitter.addListener('didUpdatePlaybackStatus', this._internalStatusUpdateCallback));
            this._subscriptions.push(this._eventEmitter.addListener('ExponentAV.onError', this._internalErrorCallback));
        }
    }
    _clearSubscriptions() {
        this._subscriptions.forEach(e => e.remove());
        this._subscriptions = [];
    }
    setOnPlaybackStatusUpdate(onPlaybackStatusUpdate) {
        this._onPlaybackStatusUpdate = onPlaybackStatusUpdate;
        this.getStatusAsync();
    }
    // Loading / unloading API
    async loadAsync(source, initialStatus = {}, downloadFirst = true) {
        throwIfAudioIsDisabled();
        if (this._loading) {
            throw new Error('The Sound is already loading.');
        }
        if (!this._loaded) {
            this._loading = true;
            const { nativeSource, fullInitialStatus, } = await getNativeSourceAndFullInitialStatusForLoadAsync(source, initialStatus, downloadFirst);
            // This is a workaround, since using load with resolve / reject seems to not work.
            return new Promise((resolve, reject) => {
                const loadSuccess = (result) => {
                    const [key, status] = result;
                    this._key = key;
                    this._loaded = true;
                    this._loading = false;
                    this._subscribeToNativeEvents();
                    this._callOnPlaybackStatusUpdateForNewStatus(status);
                    resolve(status);
                };
                const loadError = (error) => {
                    this._loading = false;
                    reject(error);
                };
                ExponentAV.loadForSound(nativeSource, fullInitialStatus)
                    .then(loadSuccess)
                    .catch(loadError);
            });
        }
        else {
            throw new Error('The Sound is already loaded.');
        }
    }
    async unloadAsync() {
        if (this._loaded) {
            this._loaded = false;
            const key = this._key;
            this._key = null;
            const status = await ExponentAV.unloadForSound(key);
            this._callOnPlaybackStatusUpdateForNewStatus(status);
            this._clearSubscriptions();
            return status;
        }
        else {
            return this.getStatusAsync(); // Automatically calls onPlaybackStatusUpdate.
        }
    }
    // Set status API (only available while isLoaded = true)
    async setStatusAsync(status) {
        assertStatusValuesInBounds(status);
        return this._performOperationAndHandleStatusAsync(() => ExponentAV.setStatusForSound(this._key, status));
    }
    async replayAsync(status = {}) {
        if (status.positionMillis && status.positionMillis !== 0) {
            throw new Error('Requested position after replay has to be 0.');
        }
        return this._performOperationAndHandleStatusAsync(() => ExponentAV.replaySound(this._key, {
            ...status,
            positionMillis: 0,
            shouldPlay: true,
        }));
    }
}
/** @deprecated Use `Sound.createAsync()` instead */
Sound.create = async (source, initialStatus = {}, onPlaybackStatusUpdate = null, downloadFirst = true) => {
    console.warn(`Sound.create is deprecated in favor of Sound.createAsync with the same API except for the new method name`);
    return Sound.createAsync(source, initialStatus, onPlaybackStatusUpdate, downloadFirst);
};
Sound.createAsync = async (source, initialStatus = {}, onPlaybackStatusUpdate = null, downloadFirst = true) => {
    const sound = new Sound();
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    const status = await sound.loadAsync(source, initialStatus, downloadFirst);
    return { sound, status };
};
Object.assign(Sound.prototype, PlaybackMixin);
//# sourceMappingURL=Sound.js.map