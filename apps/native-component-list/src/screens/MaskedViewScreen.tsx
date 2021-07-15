import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import { Animated, Easing, Image, View } from 'react-native';

const AnimatedMaskView = Animated.createAnimatedComponent(MaskedView);

interface State {
  text: string;
}

// See: https://github.com/expo/expo/pull/10229#discussion_r490961694
// eslint-disable-next-line @typescript-eslint/ban-types
export default class MaskedViewScreen extends React.Component<{}, State> {
  static navigationOptions = {
    title: 'Basic Mask Example',
  };

  readonly state: State = {
    text: '100',
  };

  _animatedTextValue: Animated.Value = new Animated.Value(0);
  _animatedScaleValue: Animated.Value = new Animated.Value(0);

  _interval: any;

  componentDidMount() {
    Animated.loop(
      Animated.timing(this._animatedTextValue, {
        useNativeDriver: false,
        toValue: 360,
        duration: 100,
        easing: Easing.linear,
      })
    ).start();

    this._animatedScaleValue = new Animated.Value(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(this._animatedScaleValue, {
          duration: 1000,
          toValue: 1.5,
          useNativeDriver: true,
        }),
        Animated.timing(this._animatedScaleValue, {
          duration: 1000,
          toValue: 1,
          useNativeDriver: true,
        }),
      ])
    ).start();

    let counter = 100;
    this._interval = setInterval(() => {
      counter++;
      this.setState({
        text: `${counter}`,
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }

  // NOTE(brentvatne): this doesn't work properly on Android yet
  render() {
    const width = 240;
    const height = 200;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <AnimatedMaskView
          style={{
            width,
            height,
            transform: [{ scale: this._animatedScaleValue }],
          }}
          maskElement={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}>
              <Image
                style={{ width }}
                resizeMode="contain"
                source={require('../../assets/images/exponent-wordmark.png')}
              />
              <Animated.Text
                key={this.state.text}
                style={{
                  backgroundColor: 'transparent',
                  fontWeight: 'bold',
                  fontSize: 40,
                  transform: [
                    {
                      rotate: this._animatedTextValue!.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}>
                {this.state.text}
              </Animated.Text>
            </View>
          }>
          <Image style={{ width, height }} source={require('../../assets/images/example3.jpg')} />
        </AnimatedMaskView>
      </View>
    );
  }
}
