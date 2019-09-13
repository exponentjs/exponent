import { NativeModules } from 'react-native';

import * as ScreenOrientation from '../ScreenOrientation/ScreenOrientation';

it(`throws when lockAsync is called with an unsupported type`, async () => {
  await expect(ScreenOrientation.lockAsync(NaN as any)).rejects.toThrowError(TypeError);
  await expect(ScreenOrientation.lockAsync('test' as any)).rejects.toThrowError(TypeError);
});

it(`NativeModules.lockAsync is not called with known unsupported locks`, async () => {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.OTHER);
  expect(NativeModules.ExpoScreenOrientation.lockAsync).not.toHaveBeenCalled();
});

it(`throws when supportsOrientationLockAsync is called with an unsupported type`, async () => {
  await expect(ScreenOrientation.supportsOrientationLockAsync(NaN as any)).rejects.toThrowError(
    TypeError
  );
  await expect(ScreenOrientation.supportsOrientationLockAsync('test' as any)).rejects.toThrowError(
    TypeError
  );
});

it(`throws when addOrientationChangeListener is called with an unsupported type`, async () => {
  expect(() => ScreenOrientation.addOrientationChangeListener(NaN as any)).toThrow(TypeError);
  expect(() => ScreenOrientation.addOrientationChangeListener('test' as any)).toThrow(TypeError);
});

it(`throws when removeOrientationChangeListener is called with an unsupported type`, async () => {
  expect(() => ScreenOrientation.removeOrientationChangeListener(NaN as any)).toThrow(TypeError);
  expect(() => ScreenOrientation.removeOrientationChangeListener('test' as any)).toThrow(TypeError);
  expect(() => ScreenOrientation.removeOrientationChangeListener({} as any)).toThrow(TypeError);
});
