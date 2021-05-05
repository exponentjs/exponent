import { Platform } from 'react-native';

import * as SplashScreen from '../';

// Test that nothing happens on web and SSR
// also ensure that no errors are thrown.
const works = Platform.OS !== 'web';

jest.mock('../ExpoSplashScreen');

it(`setSplashScreenAutoHideEnabled doesn't throw`, async () => {
  expect(await SplashScreen.setSplashScreenAutoHideEnabled(false)).toBe(works);
});

it(`preventAutoHideAsync doesn't throw`, async () => {
  expect(await SplashScreen.preventAutoHideAsync()).toBe(works);
});

it(`hideAsync doesn't throw`, async () => {
  expect(await SplashScreen.hideAsync()).toBe(works);
});
