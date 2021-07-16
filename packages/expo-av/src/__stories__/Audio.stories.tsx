import * as React from 'react';
import { PixelRatio, StyleSheet } from 'react-native';

import AudioModeSelector from './AudioModeSelector';
import AudioPlayer from './AudioPlayer';

export const AudioHttpPlayer = () => (
  <AudioPlayer
    source={{
      uri:
        // tslint:disable-next-line: max-line-length
        'https://p.scdn.co/mp3-preview/f7a8ab9c5768009b65a30e9162555e8f21046f46?cid=162b7dc01f3a4a2ca32ed3cec83d1e02',
    }}
    style={styles.player}
  />
);

export const ModeSelector = () => <AudioModeSelector />;

export default {
  title: 'Expo AV - Audio',
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
  },
  player: {
    borderBottomWidth: 1.0 / PixelRatio.get(),
    borderBottomColor: '#cccccc',
  },
});
