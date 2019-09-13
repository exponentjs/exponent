import { NativeModules } from 'react-native';

import * as ScreenOrientation from '../ScreenOrientation/ScreenOrientation';

it(`calls NativeModules.lockPlatformAsync with only Android properties`, async () => {
  const screenOrientationConstantAndroid = 1;
  const androidProperties = {
    screenOrientationConstantAndroid,
  };
  const iOSProperties = {
    screenOrientationArrayIOS: [],
  };
  const badProperties = {
    bad: 'shouldnt be here',
  };

  await ScreenOrientation.lockPlatformAsync({
    ...androidProperties,
    ...iOSProperties,
    ...badProperties,
  });

  expect(NativeModules.ExpoScreenOrientation.lockPlatformAsync).toBeCalledWith(
    screenOrientationConstantAndroid
  );
});

it(`throws when lockPlatformAsync is called with unsupported types in its Android properties`, async () => {
  await expect(
    ScreenOrientation.lockPlatformAsync({ screenOrientationConstantAndroid: NaN as any })
  ).rejects.toThrowError(TypeError);
  await expect(
    ScreenOrientation.lockPlatformAsync({ screenOrientationConstantAndroid: 'test' as any })
  ).rejects.toThrowError(TypeError);
});
