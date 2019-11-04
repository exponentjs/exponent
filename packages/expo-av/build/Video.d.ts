import PropTypes from 'prop-types';
import * as React from 'react';
import { Playback, PlaybackSource, PlaybackStatus, PlaybackStatusToSet } from './AV';
import { ExponentVideoComponent, FullscreenUpdateEvent, NativeProps, NaturalSize, VideoProps, ReadyForDisplayEvent, ResizeMode, VideoState } from './Video.types';
export { ExponentVideoComponent, FullscreenUpdateEvent, NativeProps, NaturalSize, VideoProps, ReadyForDisplayEvent, ResizeMode, VideoState, };
export declare const FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT = 0;
export declare const FULLSCREEN_UPDATE_PLAYER_DID_PRESENT = 1;
export declare const FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS = 2;
export declare const FULLSCREEN_UPDATE_PLAYER_DID_DISMISS = 3;
export declare const IOS_FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT = 0;
export declare const IOS_FULLSCREEN_UPDATE_PLAYER_DID_PRESENT = 1;
export declare const IOS_FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS = 2;
export declare const IOS_FULLSCREEN_UPDATE_PLAYER_DID_DISMISS = 3;
export default class Video extends React.Component<VideoProps, VideoState> implements Playback {
    static RESIZE_MODE_CONTAIN: ResizeMode;
    static RESIZE_MODE_COVER: ResizeMode;
    static RESIZE_MODE_STRETCH: ResizeMode;
    static IOS_FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT: number;
    static IOS_FULLSCREEN_UPDATE_PLAYER_DID_PRESENT: number;
    static IOS_FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS: number;
    static IOS_FULLSCREEN_UPDATE_PLAYER_DID_DISMISS: number;
    static FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT: number;
    static FULLSCREEN_UPDATE_PLAYER_DID_PRESENT: number;
    static FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS: number;
    static FULLSCREEN_UPDATE_PLAYER_DID_DISMISS: number;
    static propTypes: {
        hitSlop?: PropTypes.Validator<import("react-native").Insets | undefined> | undefined;
        onLayout?: PropTypes.Validator<((event: import("react-native").LayoutChangeEvent) => void) | undefined> | undefined;
        pointerEvents?: PropTypes.Validator<"none" | "box-none" | "box-only" | "auto" | undefined> | undefined;
        removeClippedSubviews?: PropTypes.Validator<boolean | undefined> | undefined;
        style?: PropTypes.Validator<import("react-native").StyleProp<import("react-native").ViewStyle>> | undefined;
        testID?: PropTypes.Validator<string | undefined> | undefined;
        nativeID?: PropTypes.Validator<string | undefined> | undefined;
        collapsable?: PropTypes.Validator<boolean | undefined> | undefined;
        needsOffscreenAlphaCompositing?: PropTypes.Validator<boolean | undefined> | undefined;
        renderToHardwareTextureAndroid?: PropTypes.Validator<boolean | undefined> | undefined;
        shouldRasterizeIOS?: PropTypes.Validator<boolean | undefined> | undefined;
        isTVSelectable?: PropTypes.Validator<boolean | undefined> | undefined;
        hasTVPreferredFocus?: PropTypes.Validator<boolean | undefined> | undefined;
        tvParallaxProperties?: PropTypes.Validator<import("react-native").TVParallaxProperties | undefined> | undefined;
        tvParallaxShiftDistanceX?: PropTypes.Validator<number | undefined> | undefined;
        tvParallaxShiftDistanceY?: PropTypes.Validator<number | undefined> | undefined;
        tvParallaxTiltAngle?: PropTypes.Validator<number | undefined> | undefined;
        tvParallaxMagnification?: PropTypes.Validator<number | undefined> | undefined;
        onStartShouldSetResponder?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined> | undefined;
        onMoveShouldSetResponder?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined> | undefined;
        onResponderEnd?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onResponderGrant?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onResponderReject?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onResponderMove?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onResponderRelease?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onResponderStart?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onResponderTerminationRequest?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined> | undefined;
        onResponderTerminate?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onStartShouldSetResponderCapture?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined> | undefined;
        onMoveShouldSetResponderCapture?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => boolean) | undefined> | undefined;
        onTouchStart?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onTouchMove?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onTouchEnd?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onTouchCancel?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        onTouchEndCapture?: PropTypes.Validator<((event: import("react-native").GestureResponderEvent) => void) | undefined> | undefined;
        accessible?: PropTypes.Validator<boolean | undefined> | undefined;
        accessibilityActions?: PropTypes.Validator<readonly Readonly<{
            name: import("react-native").AccessibilityActionName;
            label?: string | undefined;
        }>[] | undefined> | undefined;
        accessibilityLabel?: PropTypes.Validator<string | undefined> | undefined;
        accessibilityRole?: PropTypes.Validator<"none" | "button" | "header" | "link" | "menu" | "menuitem" | "summary" | "image" | "switch" | "text" | "search" | "keyboardkey" | "adjustable" | "imagebutton" | "alert" | "checkbox" | "combobox" | "menubar" | "progressbar" | "radio" | "radiogroup" | "scrollbar" | "spinbutton" | "tab" | "tablist" | "timer" | "toolbar" | undefined> | undefined;
        accessibilityStates?: PropTypes.Validator<import("react-native").AccessibilityStates[] | undefined> | undefined;
        accessibilityState?: PropTypes.Validator<import("react-native").AccessibilityState | undefined> | undefined;
        accessibilityHint?: PropTypes.Validator<string | undefined> | undefined;
        onAccessibilityAction?: PropTypes.Validator<((event: import("react-native").NativeSyntheticEvent<Readonly<{
            actionName: string;
        }>>) => void) | undefined> | undefined;
        accessibilityComponentType?: PropTypes.Validator<"none" | "button" | "radiobutton_checked" | "radiobutton_unchecked" | undefined> | undefined;
        accessibilityLiveRegion?: PropTypes.Validator<"none" | "polite" | "assertive" | undefined> | undefined;
        importantForAccessibility?: PropTypes.Validator<"auto" | "yes" | "no" | "no-hide-descendants" | undefined> | undefined;
        accessibilityElementsHidden?: PropTypes.Validator<boolean | undefined> | undefined;
        accessibilityTraits?: PropTypes.Validator<"key" | "none" | "button" | "header" | "link" | "summary" | "image" | "text" | "search" | "adjustable" | "disabled" | "selected" | "plays" | "frequentUpdates" | "startsMedia" | "allowsDirectInteraction" | "pageTurn" | import("react-native").AccessibilityTrait[] | undefined> | undefined;
        accessibilityViewIsModal?: PropTypes.Validator<boolean | undefined> | undefined;
        onAccessibilityTap?: PropTypes.Validator<(() => void) | undefined> | undefined;
        onMagicTap?: PropTypes.Validator<(() => void) | undefined> | undefined;
        accessibilityIgnoresInvertColors?: PropTypes.Validator<boolean | undefined> | undefined;
        source: PropTypes.Requireable<number | PropTypes.InferProps<{
            uri: PropTypes.Requireable<string>;
            overrideFileExtensionAndroid: PropTypes.Requireable<string>;
        }>>;
        posterSource: PropTypes.Requireable<number | PropTypes.InferProps<{
            uri: PropTypes.Requireable<string>;
        }>>;
        posterStyle: PropTypes.Validator<import("react-native").StyleProp<import("react-native").ViewStyle>> | undefined;
        onPlaybackStatusUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        onLoadStart: PropTypes.Requireable<(...args: any[]) => any>;
        onLoad: PropTypes.Requireable<(...args: any[]) => any>;
        onError: PropTypes.Requireable<(...args: any[]) => any>;
        onIOSFullscreenUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        onFullscreenUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        onReadyForDisplay: PropTypes.Requireable<(...args: any[]) => any>;
        useNativeControls: PropTypes.Requireable<boolean>;
        resizeMode: PropTypes.Requireable<string>;
        usePoster: PropTypes.Requireable<boolean>;
        status: PropTypes.Requireable<PropTypes.InferProps<{
            progressUpdateIntervalMillis: PropTypes.Requireable<number>;
            positionMillis: PropTypes.Requireable<number>;
            shouldPlay: PropTypes.Requireable<boolean>;
            rate: PropTypes.Requireable<number>;
            shouldCorrectPitch: PropTypes.Requireable<boolean>;
            volume: PropTypes.Requireable<number>;
            isMuted: PropTypes.Requireable<boolean>;
            isLooping: PropTypes.Requireable<boolean>;
        }>>;
        progressUpdateIntervalMillis: PropTypes.Requireable<number>;
        positionMillis: PropTypes.Requireable<number>;
        shouldPlay: PropTypes.Requireable<boolean>;
        rate: PropTypes.Requireable<number>;
        shouldCorrectPitch: PropTypes.Requireable<boolean>;
        volume: PropTypes.Requireable<number>;
        isMuted: PropTypes.Requireable<boolean>;
        isLooping: PropTypes.Requireable<boolean>;
        scaleX: PropTypes.Requireable<number>;
        scaleY: PropTypes.Requireable<number>;
        translateX: PropTypes.Requireable<number>;
        translateY: PropTypes.Requireable<number>;
        rotation: PropTypes.Requireable<number>;
    };
    _nativeRef: React.RefObject<React.Component<NativeProps, any, any> & import("react-native").NativeMethodsMixinStatic>;
    constructor(props: VideoProps);
    setNativeProps(nativeProps: NativeProps): void;
    _handleNewStatus: (status: PlaybackStatus) => void;
    _performOperationAndHandleStatusAsync: (operation: (tag: number) => Promise<PlaybackStatus>) => Promise<PlaybackStatus>;
    _setFullscreen: (value: boolean) => Promise<PlaybackStatus>;
    presentFullscreenPlayer: () => Promise<PlaybackStatus>;
    presentIOSFullscreenPlayer: () => Promise<PlaybackStatus>;
    presentFullscreenPlayerAsync: () => Promise<PlaybackStatus>;
    dismissFullscreenPlayer: () => Promise<PlaybackStatus>;
    dismissIOSFullscreenPlayer: () => void;
    getStatusAsync: () => Promise<PlaybackStatus>;
    loadAsync: (source: PlaybackSource, initialStatus?: PlaybackStatusToSet, downloadFirst?: boolean) => Promise<PlaybackStatus>;
    unloadAsync: () => Promise<PlaybackStatus>;
    setStatusAsync: (status: PlaybackStatusToSet) => Promise<PlaybackStatus>;
    replayAsync: (status?: PlaybackStatusToSet) => Promise<PlaybackStatus>;
    playAsync: () => Promise<PlaybackStatus>;
    playFromPositionAsync: (positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number;
        toleranceMillisAfter?: number;
    }) => Promise<PlaybackStatus>;
    pauseAsync: () => Promise<PlaybackStatus>;
    stopAsync: () => Promise<PlaybackStatus>;
    setPositionAsync: (positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number;
        toleranceMillisAfter?: number;
    }) => Promise<PlaybackStatus>;
    setRateAsync: (rate: number, shouldCorrectPitch: boolean) => Promise<PlaybackStatus>;
    setVolumeAsync: (volume: number) => Promise<PlaybackStatus>;
    setIsMutedAsync: (isMuted: boolean) => Promise<PlaybackStatus>;
    setIsLoopingAsync: (isLooping: boolean) => Promise<PlaybackStatus>;
    setProgressUpdateIntervalAsync: (progressUpdateIntervalMillis: number) => Promise<PlaybackStatus>;
    _nativeOnPlaybackStatusUpdate: (event: {
        nativeEvent: PlaybackStatus;
    }) => void;
    _nativeOnLoadStart: () => void;
    _nativeOnLoad: (event: {
        nativeEvent: PlaybackStatus;
    }) => void;
    _nativeOnError: (event: {
        nativeEvent: {
            error: string;
        };
    }) => void;
    _nativeOnReadyForDisplay: (event: {
        nativeEvent: ReadyForDisplayEvent;
    }) => void;
    _nativeOnFullscreenUpdate: (event: {
        nativeEvent: FullscreenUpdateEvent;
    }) => void;
    _renderPoster: () => JSX.Element | null;
    render(): JSX.Element;
}
