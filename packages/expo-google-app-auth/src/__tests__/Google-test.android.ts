import fetchMock from 'fetch-mock-jest';

// clientIds must be  defined this way (digitdigit-digitdigit)
// or else Google.isValidGUID will fail
const CONFIG = {
  androidClientId: `ANDROID_CLIENT_ID.22-22`,
  androidStandaloneAppClientId: `ANDROID_STANDALONE_ID.44-44`,
};

const RESULTING_CLIENT_IDS = {
  androidClientId: `22-22.apps.googleusercontent.com`,
  androidStandaloneAppClientId: `44-44.apps.googleusercontent.com`,
};

function mockConstants(constants: { [key: string]: any } = {}): void {
  jest.doMock('expo-constants', () => {
    const Constants = jest.requireActual('expo-constants').default;
    return {
      ...Constants,
      ...constants,
    };
  });
}

describe('Android, managed workflow', () => {
  afterEach(() => {
    jest.resetModules();
    fetchMock.mockReset();
  });

  it(`client id used in Expo Client development app`, () => {
    mockConstants({
      appOwnership: 'expo',
    });
    const AppAuth = require('expo-app-auth');
    jest.spyOn(AppAuth, 'authAsync');
    const { logInAsync } = require('../Google');

    logInAsync(CONFIG);
    expect(AppAuth.authAsync).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: RESULTING_CLIENT_IDS.androidClientId })
    );
  });
  it(`standalone id used in standalone app`, () => {
    mockConstants({
      appOwnership: 'standalone',
    });
    const AppAuth = require('expo-app-auth');
    jest.spyOn(AppAuth, 'authAsync');
    const { logInAsync } = require('../Google');

    logInAsync(CONFIG);
    expect(AppAuth.authAsync).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: RESULTING_CLIENT_IDS.androidStandaloneAppClientId })
    );
  });

  it(`Google.logInAsync's returned LogInResult should use AppAuth's accessTokenExpirationDate`, async () => {
    const AppAuth = require('expo-app-auth');
    const { logInAsync } = require('../Google');
    fetchMock.get('*', {});
    jest
      .spyOn(AppAuth, 'authAsync')
      .mockResolvedValueOnce({ accessTokenExpirationDate: '2021-06-18T16:10:26.653Z' });
    const actual = await logInAsync(CONFIG);
    expect(actual.accessTokenExpirationDate).toEqual('2021-06-18T16:10:26.653Z');
  });
});

describe('Android Bare', () => {
  afterEach(() => {
    jest.resetModules();
    fetchMock.mockReset();
  });

  it(`standalone id used in bare app`, () => {
    const AppAuth = require('expo-app-auth');
    jest.spyOn(AppAuth, 'authAsync');
    const { logInAsync } = require('../Google');

    logInAsync(CONFIG);
    expect(AppAuth.authAsync).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: RESULTING_CLIENT_IDS.androidStandaloneAppClientId })
    );
  });

  it(`Google.logInAsync's returned LogInResult should use AppAuth's accessTokenExpirationDate`, async () => {
    const AppAuth = require('expo-app-auth');
    const { logInAsync } = require('../Google');
    fetchMock.get('*', {});
    jest
      .spyOn(AppAuth, 'authAsync')
      .mockResolvedValueOnce({ accessTokenExpirationDate: '2021-06-18T16:10:26.653Z' });
    const actual = await logInAsync(CONFIG);
    expect(actual.accessTokenExpirationDate).toEqual('2021-06-18T16:10:26.653Z');
  });
});
