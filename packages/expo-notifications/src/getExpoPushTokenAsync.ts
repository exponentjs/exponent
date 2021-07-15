import { Platform, CodedError, UnavailabilityError } from '@unimodules/core';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import { setAutoServerRegistrationEnabledAsync } from './DevicePushTokenAutoRegistration.fx';
import ServerRegistrationModule from './ServerRegistrationModule';
import { DevicePushToken, ExpoPushToken } from './Tokens.types';
import getDevicePushTokenAsync from './getDevicePushTokenAsync';

const productionBaseUrl = 'https://exp.host/--/api/v2/';

interface Options {
  // Endpoint URL override
  baseUrl?: string;

  // Request URL override
  url?: string;

  // Request body overrides
  type?: string;
  deviceId?: string;
  development?: boolean;
  experienceId?: string;
  applicationId?: string;
  devicePushToken?: DevicePushToken;
}

export default async function getExpoPushTokenAsync(options: Options = {}): Promise<ExpoPushToken> {
  const devicePushToken = options.devicePushToken || (await getDevicePushTokenAsync());

  const deviceId = options.deviceId || (await getDeviceIdAsync());

  const experienceId =
    options.experienceId ||
    Constants.manifest?.originalFullName ||
    Constants.manifest2?.extra?.expoClient?.originalFullName ||
    Constants.manifest?.id;

  if (!experienceId) {
    throw new CodedError(
      'ERR_NOTIFICATIONS_NO_EXPERIENCE_ID',
      "No experienceId found. If it can't be inferred from the manifest (eg. in bare workflow), you have to pass it in yourself."
    );
  }

  const applicationId = options.applicationId || Application.applicationId;
  if (!applicationId) {
    throw new CodedError(
      'ERR_NOTIFICATIONS_NO_APPLICATION_ID',
      "No applicationId found. If it can't be inferred from native configuration by expo-application, you have to pass it in yourself."
    );
  }
  const type = options.type || getTypeOfToken(devicePushToken);
  const development = options.development || (await shouldUseDevelopmentNotificationService());

  const baseUrl = options.baseUrl ?? productionBaseUrl;
  const url = options.url ?? `${baseUrl}push/getExpoPushToken`;

  const body = {
    type,
    deviceId: deviceId.toLowerCase(),
    development,
    experienceId,
    appId: applicationId,
    deviceToken: getDeviceToken(devicePushToken),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).catch(error => {
    throw new CodedError(
      'ERR_NOTIFICATIONS_NETWORK_ERROR',
      `Error encountered while fetching Expo token: ${error}.`
    );
  });

  if (!response.ok) {
    const statusInfo = response.statusText || response.status;
    let body: string | undefined = undefined;
    try {
      body = await response.text();
    } catch (error) {
      // do nothing
    }
    throw new CodedError(
      'ERR_NOTIFICATIONS_SERVER_ERROR',
      `Error encountered while fetching Expo token, expected an OK response, received: ${statusInfo} (body: "${body}").`
    );
  }

  const expoPushToken = getExpoPushToken(await parseResponse(response));

  try {
    if (options.url || options.baseUrl) {
      console.debug(
        `[expo-notifications] Since the URL endpoint to register in has been customized in the options, expo-notifications won't try to auto-update the device push token on the server.`
      );
    } else {
      await setAutoServerRegistrationEnabledAsync(true);
    }
  } catch (e) {
    console.warn(
      '[expo-notifications] Could not enable automatically registering new device tokens with the Expo notification service',
      e
    );
  }

  return {
    type: 'expo',
    data: expoPushToken,
  };
}

async function parseResponse(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    try {
      throw new CodedError(
        'ERR_NOTIFICATIONS_SERVER_ERROR',
        `Expected a JSON response from server when fetching Expo token, received body: ${JSON.stringify(
          await response.text()
        )}.`
      );
    } catch (innerError) {
      throw new CodedError(
        'ERR_NOTIFICATIONS_SERVER_ERROR',
        `Expected a JSON response from server when fetching Expo token, received response: ${JSON.stringify(
          response
        )}.`
      );
    }
  }
}

function getExpoPushToken(data: any) {
  if (
    !data ||
    !(typeof data === 'object') ||
    !data.data ||
    !(typeof data.data === 'object') ||
    !data.data.expoPushToken ||
    !(typeof data.data.expoPushToken === 'string')
  ) {
    throw new CodedError(
      'ERR_NOTIFICATIONS_SERVER_ERROR',
      `Malformed response from server, expected "{ data: { expoPushToken: string } }", received: ${JSON.stringify(
        data,
        null,
        2
      )}.`
    );
  }

  return data.data.expoPushToken as string;
}

// Same as in DevicePushTokenAutoRegistration
async function getDeviceIdAsync() {
  try {
    if (!ServerRegistrationModule.getInstallationIdAsync) {
      throw new UnavailabilityError('ExpoServerRegistrationModule', 'getInstallationIdAsync');
    }

    return await ServerRegistrationModule.getInstallationIdAsync();
  } catch (e) {
    throw new CodedError(
      'ERR_NOTIF_DEVICE_ID',
      `Could not have fetched installation ID of the application: ${e}.`
    );
  }
}

function getDeviceToken(devicePushToken: DevicePushToken) {
  if (typeof devicePushToken.data === 'string') {
    return devicePushToken.data;
  }

  return JSON.stringify(devicePushToken.data);
}

// Same as in DevicePushTokenAutoRegistration
async function shouldUseDevelopmentNotificationService() {
  if (Platform.OS === 'ios') {
    try {
      const notificationServiceEnvironment = await Application.getIosPushNotificationServiceEnvironmentAsync();
      if (notificationServiceEnvironment === 'development') {
        return true;
      }
    } catch (e) {
      // We can't do anything here, we'll fallback to false then.
    }
  }

  return false;
}

// Same as in DevicePushTokenAutoRegistration
function getTypeOfToken(devicePushToken: DevicePushToken) {
  switch (devicePushToken.type) {
    case 'ios':
      return 'apns';
    case 'android':
      return 'fcm';
    // This probably will error on server, but let's make this function future-safe.
    default:
      return devicePushToken.type;
  }
}
