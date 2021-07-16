import * as React from 'react';
import { Animated, Platform, StyleSheet, View, ViewProps } from 'react-native';
import {
  ScreenStack as NativeScreenStack,
  Screen as NativeStackScreen,
  ScreenStackHeaderConfig,
  ScreenProps,
  ScreenStackHeaderConfigProps,
} from 'react-native-screens';

import { createAsyncStack, useStackItems } from './createAsyncStack';
import { IStack } from './types';

export interface IScreen {
  meta?: any;
  element?: React.ReactElement<any>;
  screenProps?: ScreenProps;
  headerProps?: ScreenStackHeaderConfigProps;
  href?: string;
}

interface IStackProps {
  stack: IStack<IScreen>;
  children?: React.ReactNode;
}

function WebStack({ stack, children }: IStackProps) {
  const screens = useStackItems(stack);

  return (
    <WebScreenStack style={{ ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
      {children}
      {screens.map(screen => {
        return (
          <WebScreen
            key={screen.key}
            status={screen.status}
            onPushEnd={() => stack.onPushEnd(screen.key)}
            onPopEnd={() => stack.onPopEnd(screen.key)}>
            {screen.element}
          </WebScreen>
        );
      })}
    </WebScreenStack>
  );
}

function WebScreenStack(props: any) {
  return <View {...props} />;
}

interface IWebScreen extends ViewProps {
  onPushEnd: () => void;
  onPopEnd: () => void;
  status: string;
  children: React.ReactNode;
}

function WebScreen({ children, onPushEnd, onPopEnd, status }: IWebScreen) {
  const animatedValue = React.useRef(new Animated.Value(status === 'settled' ? 1 : 0));

  React.useEffect(() => {
    if (status === 'pushing') {
      Animated.spring(animatedValue.current, {
        toValue: 1,
        useNativeDriver: true,
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
      }).start(onPushEnd);
    }

    if (status === 'popping') {
      Animated.spring(animatedValue.current, {
        toValue: 0,
        useNativeDriver: true,
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
      }).start(onPopEnd);
    }
  }, [status]);

  const translateX = animatedValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <Animated.View
      pointerEvents={status === 'popping' ? 'none' : 'auto'}
      style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
}

function NativeStack({ stack, children }: IStackProps) {
  const screens = useStackItems(stack);

  return (
    <NativeScreenStack style={StyleSheet.absoluteFill}>
      <NativeScreen status="settled">{children}</NativeScreen>
      {screens.map((screen, i) => {
        return (
          <NativeScreen
            index={i}
            key={screen.key}
            status={screen.status}
            onPushEnd={() => stack.onPushEnd(screen.key)}
            onPopEnd={() => stack.onPopEnd(screen.key)}
            {...(screen.screenProps || {})}>
            <ScreenStackHeaderConfig hidden={!screen.headerProps} {...screen.headerProps} />

            {screen.element || null}
          </NativeScreen>
        );
      })}
    </NativeScreenStack>
  );
}

function NativeScreen({ index, status, onPushEnd, onPopEnd, children, ...props }: any) {
  React.useEffect(() => {
    if (status === 'pushing') {
      onPushEnd();
    }

    if (status === 'popping') {
      onPopEnd();
    }
  }, [status, onPushEnd, onPopEnd]);

  return (
    <NativeStackScreen
      active={1}
      activityState={2}
      style={StyleSheet.absoluteFill}
      onDismissed={onPopEnd}
      gestureEnabled={index !== 0}
      {...props}>
      {children}
    </NativeStackScreen>
  );
}

const Stack = Platform.select({
  native: NativeStack,
  web: WebStack,
  default: WebStack,
});

WebStack.createStack = () => createAsyncStack<IScreen>();
NativeStack.createStack = () => createAsyncStack<IScreen>();

export { Stack };
