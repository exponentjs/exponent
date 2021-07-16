import * as LocalAuthentication from 'expo-local-authentication';
import React from 'react';
import { Text, View } from 'react-native';

import Button from '../components/Button';
import MonoText from '../components/MonoText';

interface State {
  waiting: boolean;
  supportedAuthenticationTypes?: string[];
  hasHardware?: boolean;
  isEnrolled?: boolean;
}

// See: https://github.com/expo/expo/pull/10229#discussion_r490961694
// eslint-disable-next-line @typescript-eslint/ban-types
export default class LocalAuthenticationScreen extends React.Component<{}, State> {
  static navigationOptions = {
    title: 'LocalAuthentication',
  };

  readonly state: State = {
    waiting: false,
  };

  componentDidMount() {
    this.checkDevicePossibilities();
  }

  async checkDevicePossibilities() {
    const [hasHardware, isEnrolled, supportedAuthenticationTypes] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      this.getAuthenticationTypes(),
    ]);
    this.setState({ hasHardware, isEnrolled, supportedAuthenticationTypes });
  }

  async getAuthenticationTypes() {
    return (await LocalAuthentication.supportedAuthenticationTypesAsync()).map(
      type => LocalAuthentication.AuthenticationType[type]
    );
  }

  authenticateWithFallback = () => {
    this.authenticate(true);
  };

  authenticateWithoutFallback = () => {
    this.authenticate(false);
  };

  async authenticate(withFallback: boolean = true) {
    this.setState({ waiting: true });
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate',
        cancelLabel: 'Cancel label',
        disableDeviceFallback: !withFallback,
      });
      if (result.success) {
        alert('Authenticated!');
      } else {
        alert(`Failed to authenticate, reason: ${result.error}, message: ${result.message}`);
      }
    } finally {
      this.setState({ waiting: false });
    }
  }

  render() {
    const { waiting, ...capabilities } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ paddingBottom: 30 }}>
          <Text>Device capabilities:</Text>
          <MonoText textStyle={{ fontSize: 14 }}>{JSON.stringify(capabilities, null, 2)}</MonoText>
        </View>
        <View style={{ height: 200 }}>
          {waiting ? (
            <Text>Waiting for authentication...</Text>
          ) : (
            <View>
              <Button
                style={{ margin: 5 }}
                onPress={this.authenticateWithFallback}
                title="Authenticate with device fallback"
              />
              <Button
                style={{ margin: 5 }}
                onPress={this.authenticateWithoutFallback}
                title="Authenticate without device fallback"
              />
            </View>
          )}
        </View>
      </View>
    );
  }
}
