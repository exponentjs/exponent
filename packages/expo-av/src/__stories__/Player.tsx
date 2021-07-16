import Ionicons from '@expo/vector-icons/build/Ionicons';
import Slider from '@react-native-community/slider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import React from 'react';
import {
  GestureResponderEvent,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const Colors = {
  tintColor: 'blue',
  errorBackground: 'red',
  errorText: 'red',
};

interface Props {
  header?: JSX.Element;
  extraButtons?: (
    | {
        iconName: string;
        title: string;
        onPress: (event: GestureResponderEvent) => void;
        active: boolean;
        disable?: boolean;
      }
    | (() => React.ReactNode)
  )[];
  style?: StyleProp<ViewStyle>;

  // Functions
  playAsync: () => void;
  pauseAsync: () => void;
  replayAsync: () => void;
  nextAsync?: () => void;
  setRateAsync: (rate: number, shouldCorrectPitch: boolean) => void;
  setIsMutedAsync: (isMuted: boolean) => void;
  setPositionAsync: (position: number) => Promise<any>;
  setIsLoopingAsync: (isLooping: boolean) => void;
  setVolume: (volume: number) => void;

  // Status
  isLoaded: boolean;
  isLooping: boolean;
  volume: number;
  rate: number;
  positionMillis: number;
  durationMillis: number;
  shouldCorrectPitch: boolean;
  isPlaying: boolean;
  isMuted: boolean;

  // Error
  errorMessage?: string;
}

export default function Player(props: Props) {
  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const [initialScrubbingMillis, setInitialScrubbingMillis] = React.useState<undefined | number>();

  const _play = () => props.playAsync();

  const _pause = () => props.pauseAsync();

  const _playFromPosition = (position: number) =>
    props.setPositionAsync(position).then(() => setIsScrubbing(false));

  const _toggleLooping = () => props.setIsLoopingAsync(!props.isLooping);

  const _toggleShouldCorrectPitch = () => props.setRateAsync(props.rate, !props.shouldCorrectPitch);

  const _seekForward = () => props.setPositionAsync(props.positionMillis + 5000);

  const _seekBackward = () => props.setPositionAsync(Math.max(0, props.positionMillis - 5000));

  const _renderReplayButton = () => {
    return (
      <TouchableOpacity onPress={_toggleLooping} disabled={!props.isLoaded}>
        <Ionicons
          name="repeat"
          size={34}
          style={[styles.icon, !props.isLooping && { color: '#C1C1C1' }]}
        />
      </TouchableOpacity>
    );
  };

  const _renderPlayPauseButton = () => {
    let onPress = _pause;
    let iconName = 'ios-pause';

    if (!props.isPlaying) {
      onPress = _play;
      iconName = 'ios-play';
    }

    return (
      <TouchableOpacity onPress={onPress} disabled={!props.isLoaded}>
        <Ionicons
          name={iconName as 'ios-pause' | 'ios-play'}
          style={[styles.icon, styles.playPauseIcon]}
        />
      </TouchableOpacity>
    );
  };

  const _maybeRenderErrorOverlay = () => {
    if (props.errorMessage) {
      return (
        <ScrollView style={styles.errorMessage}>
          <Text style={styles.errorText}>{props.errorMessage}</Text>
        </ScrollView>
      );
    }
    return null;
  };

  const _renderAuxiliaryButton = ({
    disable,
    iconName,
    title,
    onPress,
    active,
  }: {
    disable?: boolean;
    iconName: string;
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    active?: boolean;
  }) => {
    if (disable) {
      return null;
    }
    return (
      <TouchableOpacity
        key={title}
        style={[styles.button, active && styles.activeButton]}
        disabled={!props.isLoaded}
        onPress={onPress}>
        <Ionicons
          name={`ios-${iconName}` as any}
          size={iconName === 'refresh' ? 20 : 24}
          style={[styles.icon, styles.buttonIcon, active && styles.activeButtonText]}
        />
        <Text style={[styles.buttonText, active && styles.activeButtonText]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={props.style}>
      <View style={{ opacity: isScrubbing ? 0.8 : 1, backgroundColor: 'black' }}>
        {props.header}
      </View>
      <View style={styles.container}>
        {_renderPlayPauseButton()}
        <Slider
          style={styles.slider}
          thumbTintColor={Colors.tintColor}
          value={isScrubbing ? initialScrubbingMillis : props.positionMillis}
          maximumValue={props.durationMillis}
          disabled={!props.isLoaded}
          minimumTrackTintColor={Colors.tintColor}
          onSlidingComplete={_playFromPosition}
          onResponderGrant={() => {
            setIsScrubbing(true);
            setInitialScrubbingMillis(props.positionMillis);
          }}
        />
        <Text style={{ width: 100, textAlign: 'right' }} adjustsFontSizeToFit numberOfLines={1}>
          {_formatTime(props.positionMillis / 1000)} / {_formatTime(props.durationMillis / 1000)}
        </Text>
        {_renderReplayButton()}
      </View>

      <View style={styles.container}>
        <VolumeSlider
          isMuted={props.isMuted}
          disabled={!props.isLoaded}
          style={{ width: undefined, flex: 1 }}
          volume={props.volume}
          onValueChanged={({ isMuted, volume }) => {
            props.setIsMutedAsync(isMuted);
            props.setVolume(volume);
          }}
        />
      </View>

      <View style={[styles.container, styles.buttonsContainer]}>
        {(props.extraButtons ?? []).map(button => {
          if (typeof button === 'function') return button();
          return _renderAuxiliaryButton(button);
        })}
      </View>

      <View
        style={[
          styles.container,
          { flexDirection: 'row', flex: 1, justifyContent: 'space-between' },
        ]}>
        <PitchControl
          disabled={Platform.OS === 'web'}
          value={props.shouldCorrectPitch}
          onPress={_toggleShouldCorrectPitch}
        />
        <SpeedSegmentedControl
          onValueChange={rate => {
            props.setRateAsync(rate, props.shouldCorrectPitch);
          }}
        />
      </View>

      <View style={[styles.container, styles.buttonsContainer]}>
        {_renderAuxiliaryButton({
          iconName: 'play-skip-back',
          title: 'Replay',
          onPress: props.replayAsync,
          active: false,
        })}

        {_renderAuxiliaryButton({
          iconName: 'play-back',
          title: 'Seek Backward',
          onPress: _seekBackward,
        })}
        {_renderAuxiliaryButton({
          iconName: 'play-forward',
          title: 'Seek Forward',
          onPress: _seekForward,
        })}
        {props.nextAsync &&
          _renderAuxiliaryButton({
            iconName: 'play-skip-forward',
            title: 'Next',
            onPress: props.nextAsync,
            active: false,
          })}
      </View>
      {_maybeRenderErrorOverlay()}
    </View>
  );
}

function PitchControl({
  value,
  disabled,
  onPress,
}: {
  disabled: boolean;
  value: boolean;
  onPress: (value: boolean) => void;
}) {
  const height = 36;

  const color = value ? Colors.tintColor : '#C1C1C1';
  return (
    <TouchableOpacity
      disabled={disabled}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 4,
        height,
        justifyContent: 'center',
      }}
      onPress={() => {
        onPress(!value);
      }}>
      <Ionicons name="ios-stats-chart" size={24} color={color} style={{}} />
      <Text
        style={{
          textDecorationLine: disabled ? 'line-through' : 'none',
          textAlign: 'center',
          fontWeight: 'bold',
          color,
          marginLeft: 8,
          fontSize: 12,
        }}>
        Correct Pitch
      </Text>
    </TouchableOpacity>
  );
}

function SpeedSegmentedControl({ onValueChange }: { onValueChange: (value: number) => void }) {
  const data = ['0.5', '1.0', '1.5', '2.0'];
  const [index, setIndex] = React.useState(1);

  const renderIcon = (name: string) => (
    <Ionicons
      name={`ios-${name}` as 'ios-hourglass' | 'ios-speedometer'}
      size={24}
      style={{ color: Colors.tintColor, paddingHorizontal: 8 }}
    />
  );
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 6,
        margin: 10,
        marginTop: 5,
        flexDirection: 'row',
      }}>
      {renderIcon('hourglass')}

      <SegmentedControl
        style={{ width: '50%', minWidth: 260 }}
        values={data.map(i => i + 'x')}
        fontStyle={{ color: Colors.tintColor }}
        selectedIndex={index}
        tintColor="white"
        onChange={event => {
          setIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        onValueChange={value => onValueChange(parseFloat(value))}
      />
      {renderIcon('speedometer')}
    </View>
  );
}

function VolumeSlider({
  volume,
  isMuted,
  disabled,
  color = Colors.tintColor,
  onValueChanged,
  style,
}: {
  volume: number;
  isMuted: boolean;
  disabled?: boolean;
  color?: string;
  style?: any;
  onValueChanged: (data: { isMuted: boolean; volume: number }) => void;
}) {
  const [value, setValue] = React.useState(volume);
  const lastUserValue = React.useRef(volume);

  React.useEffect(() => {
    if (!isMuted && lastUserValue.current !== value) {
      const value = lastUserValue.current;
      setValue(value);
      onValueChanged({ isMuted, volume: value });
    }
  }, [isMuted]);

  const isMutedActive = React.useMemo(() => {
    return isMuted || value <= 0;
  }, [isMuted, value]);

  const iconName = React.useMemo(() => {
    if (isMutedActive) {
      return 'volume-off';
    }
    return value > 0.5 ? 'volume-high' : 'volume-low';
  }, [isMutedActive, value]);

  React.useEffect(() => {
    if (value !== volume) {
      onValueChanged({ volume, isMuted });
    }
  }, [volume]);

  const height = 36;
  return (
    <View
      style={[{ flexDirection: 'row', width: 100 }, disabled && { opacity: 0.7 }, style]}
      pointerEvents={disabled ? 'none' : 'auto'}>
      <TouchableOpacity
        style={{ alignItems: 'center', width: height, height, justifyContent: 'center' }}
        onPress={() => {
          onValueChanged({ isMuted: !isMuted, volume });
        }}>
        <Ionicons
          name={`ios-${iconName}` as 'ios-volume-high' | 'ios-volume-low' | 'ios-volume-off'}
          size={24}
          color={color}
          style={{}}
        />
      </TouchableOpacity>
      <Slider
        value={isMutedActive ? 0 : value}
        maximumValue={1}
        style={{ height, flex: 1 }}
        thumbTintColor={color}
        minimumTrackTintColor={color}
        onSlidingComplete={value => {
          onValueChanged({ isMuted: value <= 0, volume: value });

          if (value > 0) {
            lastUserValue.current = value;
          }
        }}
        onValueChange={value => {
          setValue(value);
        }}
      />
    </View>
  );
}

const _formatTime = (duration: number) => {
  const paddedSecs = _leftPad(`${Math.floor(duration % 60)}`, '0', 2);
  const paddedMins = _leftPad(`${Math.floor(duration / 60)}`, '0', 2);
  if (duration > 3600) {
    return `${Math.floor(duration / 3600)}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
};

const _leftPad = (s: string, padWith: string, expectedMinimumSize: number): string => {
  if (s.length >= expectedMinimumSize) {
    return s;
  }
  return _leftPad(`${padWith}${s}`, padWith, expectedMinimumSize);
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    padding: 8,
    color: Colors.tintColor,
  },
  playPauseIcon: {
    paddingTop: 11,
    fontSize: 34,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  errorMessage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.errorBackground,
  },
  errorText: {
    margin: 8,
    fontWeight: 'bold',
    color: Colors.errorText,
  },
  buttonsContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    paddingBottom: 6,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonText: {
    fontSize: 12,
    color: Colors.tintColor,
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonIcon: {
    flex: 1,
    height: 36,
  },
  activeButton: {
    backgroundColor: Colors.tintColor,
  },
  activeButtonText: {
    color: 'white',
  },
});
