import MaterialCommunityIcons from '@expo/vector-icons/build/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';

import Colors from './constants/Colors';
import SelectScreen from './screens/SelectScreen';
import RunTests from './screens/TestScreen';

// @tsapeta: This navigator is also being used by `bare-expo` app,
// so make sure it still works there once you change something here.

const Stack = createStackNavigator();

const spec = {
  animation: 'timing',
  config: {
    duration: 0,
  },
};

const shouldDisableTransition = !!global.DETOX;

// Disable transition animations in E2E tests
const transitionSpec = shouldDisableTransition ? { open: spec, close: spec } : undefined;

export default function AppNavigator(props) {

  React.useLayoutEffect(() => {
    SplashScreen.hideAsync();
    if (props.navigation) {
      props.navigation.setOptions({
        title: 'Tests',
        tabBarLabel: 'Tests',
        tabBarIcon: ({ focused }) => {
          const color = focused ? Colors.activeTintColor : Colors.inactiveTintColor;
          return <MaterialCommunityIcons name="format-list-checks" size={27} color={color} />;
        },
      })
    }
  }, [props.navigation]);

  return (
    <Stack.Navigator
      {...props}
      screenOptions={{
        title: 'Tests',
        transitionSpec,
        headerBackTitle: 'Select',
        headerTitleStyle: {
          color: 'black',
        },
        headerTintColor: Colors.tintColor,
        headerStyle: {
          borderBottomWidth: 0.5,
          borderBottomColor: 'rgba(0,0,0,0.1)',
          boxShadow: '',
        },
      }}>
      <Stack.Screen name="select" component={SelectScreen} options={{ title: 'Expo Test Suite' }} />
      <Stack.Screen name="run" component={RunTests} options={{ title: 'Test Runner' }} />
    </Stack.Navigator>
  );
}
