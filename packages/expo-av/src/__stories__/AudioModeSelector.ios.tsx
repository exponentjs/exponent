import React from 'react';
import { PixelRatio, Switch, Text, View, Button as RNButton } from 'react-native';

import { Audio } from '../';

const Button = props => <RNButton {...props} />;
const ListButton = props => <RNButton {...props} />;

interface Mode {
  interruptionModeIOS: number;
  playsInSilentModeIOS: boolean;
  allowsRecordingIOS: boolean;
  staysActiveInBackground: boolean;
}

interface State {
  modeToSet: Mode;
  setMode: Mode;
}

// See: https://github.com/expo/expo/pull/10229#discussion_r490961694
// eslint-disable-next-line @typescript-eslint/ban-types
export default class AudioModeSelector extends React.Component<{}, State> {
  readonly state: State = {
    modeToSet: {
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    },
    setMode: {
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    },
  };

  _applyMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        ...this.state.modeToSet,
        // Android values don't matter, this is iOS-only selector
        shouldDuckAndroid: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
      const { modeToSet } = this.state;
      this.setState({ setMode: modeToSet });
    } catch (error) {
      alert(error.message);
    }
  };

  _modesEqual = (modeA: Mode, modeB: Mode) =>
    modeA.interruptionModeIOS === modeB.interruptionModeIOS &&
    modeA.playsInSilentModeIOS === modeB.playsInSilentModeIOS &&
    modeA.allowsRecordingIOS === modeB.allowsRecordingIOS &&
    modeA.staysActiveInBackground === modeB.staysActiveInBackground;

  _setMode = (interruptionModeIOS: number) => () =>
    this.setState(state => ({ modeToSet: { ...state.modeToSet, interruptionModeIOS } }));

  _renderToggle = ({
    title,
    disabled,
    valueName,
    value,
  }: {
    title: string;
    disabled?: boolean;
    valueName:
      | 'interruptionModeIOS'
      | 'playsInSilentModeIOS'
      | 'allowsRecordingIOS'
      | 'staysActiveInBackground';
    value?: boolean;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1.0 / PixelRatio.get(),
        borderBottomColor: '#cccccc',
      }}>
      <Text style={{ flex: 1, fontSize: 16 }}>{title}</Text>
      <Switch
        disabled={disabled}
        value={value !== undefined ? value : Boolean(this.state.modeToSet[valueName])}
        onValueChange={() =>
          this.setState(state => ({
            modeToSet: { ...state.modeToSet, [valueName]: !state.modeToSet[valueName] },
          }))
        }
      />
    </View>
  );

  _renderModeSelector = ({
    title,
    disabled,
    value,
  }: {
    title: string;
    disabled?: boolean;
    value: number;
  }) => (
    <ListButton
      disabled={disabled}
      title={`${this.state.modeToSet.interruptionModeIOS === value ? '✓ ' : ''}${title}`}
      onPress={this._setMode(value)}
    />
  );

  render() {
    return (
      <View style={{ marginTop: 5 }}>
        {this._renderToggle({
          title: 'Plays in silent mode',
          valueName: 'playsInSilentModeIOS',
        })}
        {this._renderToggle({
          title: 'Allows recording',
          valueName: 'allowsRecordingIOS',
          disabled: !this.state.modeToSet.playsInSilentModeIOS,
          value: !this.state.modeToSet.playsInSilentModeIOS ? false : undefined,
        })}
        {this._renderToggle({
          title: 'Stay active in background',
          valueName: 'staysActiveInBackground',
          disabled: !this.state.modeToSet.playsInSilentModeIOS,
          value: !this.state.modeToSet.playsInSilentModeIOS ? false : undefined,
        })}
        {this._renderModeSelector({
          title: 'Mix with others',
          value: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        })}
        {this._renderModeSelector({
          title: 'Do not mix',
          value: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        })}
        {this._renderModeSelector({
          disabled: this.state.modeToSet.playsInSilentModeIOS === false,
          title: 'Duck others',
          value: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        })}
        <Button
          title="Apply changes"
          onPress={this._applyMode}
          style={{ marginTop: 10 }}
          disabled={this._modesEqual(this.state.modeToSet, this.state.setMode)}
        />
      </View>
    );
  }
}
