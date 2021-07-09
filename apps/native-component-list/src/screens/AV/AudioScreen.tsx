import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import React, { useEffect } from 'react';
import { PixelRatio, ScrollView, StyleSheet, View } from 'react-native';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import HeadingText from '../../components/HeadingText';
import ListButton from '../../components/ListButton';
import AudioModeSelector from './AudioModeSelector';
import Player from './AudioPlayer';

interface Channel {
  frames: number[];
}

interface AudioSample {
  channels: Channel[];
}

const WaveForm = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = 1;
    let didThingy = false;

    const soundObject = new Audio.Sound();
    try {
      soundObject.loadAsync(Asset.fromModule(require('../../../assets/sounds/polonez.mp3')), {
        progressUpdateIntervalMillis: 150,
      });
    } catch (e) {
      console.error(`failed to load source:`, e);
    }

    const interval = setInterval(() => {
      console.log('1');
      if (didThingy) return;
      console.log('2');
      if (global.setAudioCallback == null) return;
      console.log('3');
      global.setAudioCallback((sample: AudioSample) => {
        const firstFrame = sample.channels[0].frames[0];
        console.log(
          `Received sample data! ${sample.channels.length} Channels; ${sample.channels[0].frames.length} Frames; ${firstFrame}`
        );

        const loudness = Audio.Sound.getAverageLoudness(sample);
        // 0.90 to 0.96 is the most interesting range, 0.96 to 0.99 is mostly bass in this song so emphasize it even more.
        scale.value = interpolate(loudness, [0.9, 0.96, 0.99], [0.2, 1, 1.5], Extrapolate.CLAMP);
      });
      didThingy = true;
      clearInterval(interval);
    }, 1000);
    return () => {
      console.log('clear');
      clearInterval(interval);
    };
  }, []);

  const style = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(scale.value, { mass: 1, damping: 500, stiffness: 1000 }),
        },
      ],
    }),
    [scale]
  );

  console.log('Rendering WaveForm');

  return (
    <Reanimated.View
      style={[{ width: 200, height: 200, borderRadius: 200, backgroundColor: 'black' }, style]}
    />
  );
};

export default class AudioScreen extends React.Component {
  static navigationOptions = {
    title: 'Audio',
  };

  _setAudioActive = (active: boolean) => () => Audio.setIsEnabledAsync(active);

  render() {
    console.log('Rendering AudioScreen');

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <WaveForm />
      </View>
    );

    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <HeadingText>Audio state</HeadingText>
        <ListButton title="Activate Audio" onPress={this._setAudioActive(true)} />
        <ListButton title="Deactivate Audio" onPress={this._setAudioActive(false)} />
        <HeadingText>Audio mode</HeadingText>
        <AudioModeSelector />
        <HeadingText>HTTP player</HeadingText>
        <Player
          source={{
            uri:
              // tslint:disable-next-line: max-line-length
              'https://p.scdn.co/mp3-preview/f7a8ab9c5768009b65a30e9162555e8f21046f46?cid=162b7dc01f3a4a2ca32ed3cec83d1e02',
          }}
          style={styles.player}
        />
        <HeadingText>Local asset player</HeadingText>
        <Player
          source={Asset.fromModule(require('../../../assets/sounds/polonez.mp3'))}
          style={styles.player}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
  },
  player: {
    borderBottomWidth: 1.0 / PixelRatio.get(),
    borderBottomColor: '#cccccc',
  },
});
