import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { diff } from 'deep-object-diff';
import { Asset } from 'expo-asset';
import React from 'react';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';

import { AVPlaybackStatus, ResizeMode, Video, VideoFullscreenUpdateEvent } from '../';
import Player from './Player';

type VideoPlayerSource =
  | number
  | {
      uri: string;
      overrideFileExtensionAndroid?: string;
      headers?: {
        [fieldName: string]: string;
      };
    }
  | Asset;

export default function VideoPlayer(props: {
  style?: StyleProp<ViewStyle>;
  sources: VideoPlayerSource[];
}) {
  const [sourceIndex, setIndex] = React.useState(0);
  const [errorMessage, setError] = React.useState<undefined | string>(undefined);
  const [useNativeControls, setUseNativeControls] = React.useState(false);
  const [resizeMode, setResizeMode] = React.useState<ResizeMode>(Video.RESIZE_MODE_CONTAIN);
  const prevStatus = React.useRef<AVPlaybackStatus | null>(null);

  const [status, setStatus] = React.useState<AVPlaybackStatus>({
    isLoaded: false,
  });

  const video = React.useRef<Video>(null);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    console.log('onPlaybackStatusUpdate: ', diff(prevStatus.current || {}, status));
    prevStatus.current = status;
    setStatus(status);
  };

  const handleFullScreenUpdate = (event: VideoFullscreenUpdateEvent) =>
    console.log('onFullscreenUpdate', event);

  const playAsync = async () => video.current?.playAsync();

  const pauseAsync = async () => video.current?.pauseAsync();

  const replayAsync = async () => video.current?.replayAsync();

  const setPositionAsync = async (position: number) => video.current?.setPositionAsync(position);

  const setIsLoopingAsync = async (isLooping: boolean) =>
    video.current?.setIsLoopingAsync(isLooping);

  const setIsMutedAsync = async (isMuted: boolean) => video.current?.setIsMutedAsync(isMuted);

  const setRateAsync = async (rate: number, shouldCorrectPitch: boolean) =>
    video.current?.setRateAsync(rate, shouldCorrectPitch);

  const toggleNativeControls = () => setUseNativeControls(useNativeControls => !useNativeControls);

  const openFullscreen = () => video.current?.presentFullscreenPlayer();

  const changeSource = () => {
    setIndex(index => (index + 1) % props.sources.length);
  };

  return (
    <Player
      style={props.style}
      errorMessage={errorMessage}
      isLoaded={status.isLoaded}
      isLooping={status.isLoaded ? status.isLooping : false}
      rate={status.isLoaded ? status.rate : 1}
      positionMillis={status.isLoaded ? status.positionMillis : 0}
      durationMillis={status.isLoaded ? status.durationMillis || 0 : 0}
      shouldCorrectPitch={status.isLoaded ? status.shouldCorrectPitch : false}
      isPlaying={status.isLoaded ? status.isPlaying : false}
      isMuted={status.isLoaded ? status.isMuted : false}
      volume={status.isLoaded ? status.volume : 1}
      playAsync={playAsync}
      pauseAsync={pauseAsync}
      replayAsync={replayAsync}
      nextAsync={changeSource}
      setPositionAsync={setPositionAsync}
      setIsLoopingAsync={setIsLoopingAsync}
      setIsMutedAsync={setIsMutedAsync}
      setRateAsync={setRateAsync}
      setVolume={volume => video.current?.setVolumeAsync(volume)}
      extraButtons={[
        () => <ResizeModeSegmentedControl key="resizeModeControl" onValueChange={setResizeMode} />,
        {
          iconName: 'options',
          title: 'Native controls',
          onPress: toggleNativeControls,
          active: useNativeControls,
        },
        {
          iconName: 'resize',
          title: 'Open full screen',
          onPress: openFullscreen,
          active: false,
        },
      ]}
      header={
        <Video
          useNativeControls={useNativeControls}
          ref={video}
          source={props.sources[sourceIndex]}
          resizeMode={resizeMode}
          onError={setError}
          style={{ height: 300 }}
          progressUpdateIntervalMillis={100}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onFullscreenUpdate={handleFullScreenUpdate}
        />
      }
    />
  );
}

function ResizeModeSegmentedControl({
  onValueChange,
}: {
  onValueChange: (value: ResizeMode) => void;
}) {
  const resizeMap: Record<string, undefined | ResizeMode> = {
    stretch: ResizeMode.STRETCH,
    contain: ResizeMode.CONTAIN,
    cover: ResizeMode.COVER,
  };
  const [index, setIndex] = React.useState(1);
  let control;
  if (Platform.OS === 'ios') {
    control = (
      <SegmentedControl
        values={Object.keys(resizeMap)}
        selectedIndex={index}
        tintColor="white"
        onChange={event => {
          setIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        onValueChange={value => {
          const mappedValue = resizeMap[value];
          if (mappedValue) {
            onValueChange(mappedValue);
          }
        }}
      />
    );
  } else {
    // Segmented control looks broken in this situation outside of iOS, so use text instead
    control = Object.keys(resizeMap).map((mode, i) => (
      <Text
        onPress={() => {
          setIndex(i);
          onValueChange(resizeMap[mode]!);
        }}
        key={mode}
        style={{
          textAlign: 'center',
          fontWeight: index === i ? 'bold' : 'normal',
          marginTop: i === 0 ? 0 : 8,
          fontSize: 12,
        }}>
        {mode}
      </Text>
    ));
    control = <View style={{ marginTop: -5 }}>{control}</View>;
  }
  return (
    <View
      style={{
        alignItems: 'stretch',
        paddingBottom: 6,
        margin: 10,
        justifyContent: 'flex-end',
        flex: 1,
      }}>
      {control}
      {Platform.OS === 'ios' ? (
        <Text
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginTop: 8,
            fontSize: 12,
          }}>
          Resize Mode
        </Text>
      ) : null}
    </View>
  );
}
