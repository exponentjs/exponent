import * as React from 'react';
import createElement from 'react-native-web/dist/exports/createElement';
import ExponentAV from './ExponentAV';
import { addFullscreenListener } from './FullscreenUtils.web';
export const FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT = 0;
export const FULLSCREEN_UPDATE_PLAYER_DID_PRESENT = 1;
export const FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS = 2;
export const FULLSCREEN_UPDATE_PLAYER_DID_DISMISS = 3;
export const IOS_FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT = FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT;
export const IOS_FULLSCREEN_UPDATE_PLAYER_DID_PRESENT = FULLSCREEN_UPDATE_PLAYER_DID_PRESENT;
export const IOS_FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS = FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS;
export const IOS_FULLSCREEN_UPDATE_PLAYER_DID_DISMISS = FULLSCREEN_UPDATE_PLAYER_DID_DISMISS;
const Video = React.forwardRef((props, ref) => createElement('video', { ...props, ref }));
export default class ExponentVideo extends React.Component {
    constructor() {
        super(...arguments);
        this.onFullscreenChange = (isFullscreen) => {
            if (!this.props.onFullscreenUpdate)
                return;
            if (isFullscreen) {
                this.props.onFullscreenUpdate({
                    nativeEvent: { fullscreenUpdate: FULLSCREEN_UPDATE_PLAYER_DID_PRESENT },
                });
            }
            else {
                this.props.onFullscreenUpdate({
                    nativeEvent: { fullscreenUpdate: FULLSCREEN_UPDATE_PLAYER_DID_DISMISS },
                });
            }
        };
        this.onStatusUpdate = async () => {
            if (!this.props.onStatusUpdate) {
                return;
            }
            const nativeEvent = await ExponentAV.getStatusForVideo(this._video);
            this.props.onStatusUpdate({ nativeEvent });
        };
        this.onLoadStart = () => {
            if (!this.props.onLoadStart) {
                return;
            }
            this.props.onLoadStart();
            this.onStatusUpdate();
        };
        this.onLoadedData = event => {
            if (!this.props.onLoad) {
                return;
            }
            this.props.onLoad(event);
            this.onStatusUpdate();
        };
        this.onError = event => {
            if (!this.props.onError) {
                return;
            }
            this.props.onError(event);
            this.onStatusUpdate();
        };
        this.onProgress = () => {
            this.onStatusUpdate();
        };
        this.onSeeking = () => {
            this.onStatusUpdate();
        };
        this.onEnded = () => {
            this.onStatusUpdate();
        };
        this.onLoadedMetadata = () => {
            this.onStatusUpdate();
        };
        this.onCanPlay = event => {
            if (!this.props.onReadyForDisplay) {
                return;
            }
            this.props.onReadyForDisplay(event);
            this.onStatusUpdate();
        };
        this.onStalled = () => {
            this.onStatusUpdate();
        };
        this.onRef = (ref) => {
            this._video = ref;
            this._removeFullscreenListener?.();
            this._removeFullscreenListener = addFullscreenListener(this._video, this.onFullscreenChange);
            this.onStatusUpdate();
        };
    }
    componentWillUnmount() {
        this._removeFullscreenListener?.();
    }
    render() {
        const { source, status = {}, resizeMode: objectFit, useNativeControls, style } = this.props;
        const customStyle = {
            position: undefined,
            objectFit,
            overflow: 'hidden',
        };
        return (React.createElement(Video, { ref: this.onRef, onLoadStart: this.onLoadStart, onLoadedData: this.onLoadedData, onError: this.onError, onTimeUpdate: this.onProgress, onSeeking: this.onSeeking, onEnded: this.onEnded, onLoadedMetadata: this.onLoadedMetadata, onCanPlay: this.onCanPlay, onStalled: this.onStalled, src: (source || { uri: undefined }).uri, muted: status.isMuted, loop: status.isLooping, autoPlay: status.shouldPlay, controls: useNativeControls, style: [style, customStyle], playsInline: true }));
    }
}
//# sourceMappingURL=ExponentVideo.web.js.map