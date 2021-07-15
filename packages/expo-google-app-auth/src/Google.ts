import { CodedError } from '@unimodules/core';
import * as AppAuth from 'expo-app-auth';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isInExpo = Constants.appOwnership === 'expo';
export type GoogleLogInConfig = {
  /**
   * Used in the Expo Play Store client app on Android (development only).
   *
   * - Create an Android OAuth Client ID from the [Credentials Page](https://console.developers.google.com/apis/credentials).
   * - Run `openssl rand -base64 32 | openssl sha1 -c` in your terminal, it will output a string that looks like A1:B2:C3 but longer.
   * - Paste the output from the previous step into the "Signing-certificate fingerprint" text field.
   * - Use `host.exp.exponent` as the "Package name".
   */
  androidClientId?: string;
  /**
   * Used in the Expo App Store client app on iOS (development only).
   *
   * - Select "iOS Application" as the Application Type from the [Credentials Page](https://console.developers.google.com/apis/credentials).
   * - Use `host.exp.exponent` as the bundle identifier.
   */
  iosClientId?: string;
  /**
   * Used in your custom Android app (production).
   * Visit the docs page [Deploying to a standalone app on Android](https://docs.expo.io/versions/latest/sdk/google/#deploying-to-a-standalone-app-on-android) for more info.
   */
  androidStandaloneAppClientId?: string;
  /**
   * Used in your custom iOS app (production).
   * Visit the docs page [Deploying to a standalone app on iOS](https://docs.expo.io/versions/latest/sdk/google/#deploying-to-a-standalone-app-on-ios) for more info.
   */
  iosStandaloneAppClientId?: string;
  /**
   * @deprecated [learn more here](https://docs.expo.io/versions/latest/sdk/google/#server-side-apis).
   */
  webClientId?: string;
  /**
   * System authentication is very different from web auth.
   * All system functionality has been moved to expo-google-sign-in
   */
  behavior?: 'system' | 'web';
  scopes?: string[];
  /**
   * Optionally you can define your own redirect URL.
   * If this isn't defined then it will be infered from the correct client ID.
   */
  redirectUrl?: string;
  /**
   * Language for the sign in UI, in the form of ISO 639-1 language code optionally followed by a dash
   * and ISO 3166-1 alpha-2 region code, such as 'it' or 'pt-PT'.
   * Only set this value if it's different from the system default (which you can access via expo-localization).
   */
  language?: string;
  /**
   * If the user's email address is known ahead of time, it can be supplied to be the default option.
   * If the user has approved access for this app in the past then auth may return without any further interaction.
   */
  loginHint?: string;
  /**
   * If no other client IDs are defined this will be used.
   */
  clientId?: string;
};

export type GoogleUser = {
  id?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  photoUrl?: string;
  email?: string;
};

export type LogInResult =
  | {
      type: 'cancel';
    }
  | {
      type: 'success';
      accessToken: string | null;
      accessTokenExpirationDate: string | null;
      idToken: string | null;
      refreshToken: string | null;
      user: GoogleUser;
    };

export function getPlatformGUID(config: GoogleLogInConfig) {
  const { clientId } = config;

  const iosClientId = isInExpo ? config.iosClientId : config.iosStandaloneAppClientId;
  const androidClientId = isInExpo ? config.androidClientId : config.androidStandaloneAppClientId;

  const platformClientId =
    Platform.select({
      ios: iosClientId,
      android: androidClientId,
      default: config.clientId,
    }) || clientId;

  if (
    typeof iosClientId === 'string' &&
    typeof androidClientId === 'string' &&
    iosClientId === androidClientId
  ) {
    throw new CodedError(
      'ERR_GOOGLE_CONFIG',
      'Keys for Android and iOS cannot be the same value. Ensure you are linking the client IDs matching the given platforms in the Google APIs console: https://console.developers.google.com/apis/credentials'
    );
  }

  if (!platformClientId) {
    throw new CodedError(
      'ERR_GOOGLE_CONFIG',
      'Please provide the appropriate client ID. See the documentation for more details https://docs.expo.io/versions/latest/sdk/google/#loginasync'
    );
  }

  const guid = guidFromClientId(platformClientId);
  return guid;
}

const PROJECT_ID_LENGTH = 32;

function isValidGUID(guid: string) {
  const components = guid.split('-');
  if (components.length !== 2) {
    return {
      isValid: false,
      reason: `\`${guid}\` must be a string of numbers and an alphanumeric string ${PROJECT_ID_LENGTH} characters long, joined with a hyphen.`,
    };
  }
  const projectNumber = components[0];
  const projectId = components[1];
  if (isNaN(+projectNumber)) {
    const hashedProjectId = Array(PROJECT_ID_LENGTH).fill('x');
    return {
      isValid: false,
      reason: `\`${projectNumber}-${hashedProjectId}\` project number must be a string of numbers.`,
    };
  }
  if (!projectId.match('^[a-zA-Z0-9]+$')) {
    const hashedProjectNumber = Array(projectNumber.length).fill('x');
    return {
      isValid: false,
      reason: `\`${hashedProjectNumber}-${projectId}\` project ID must be an alphanumeric string ${PROJECT_ID_LENGTH} characters long.`,
    };
  }

  return { isValid: true };
}

function guidFromClientId(clientId: string): string {
  const clientIdComponents = clientId.split('.').filter(component => component.includes('-'));

  const guid = clientIdComponents[0];
  const { isValid, reason } = isValidGUID(guid);
  if (!isValid) {
    throw new CodedError(
      'ERR_GOOGLE_GUID',
      reason + ' Please ensure you copied the client ID correctly.'
    );
  }

  return guid;
}

/**
 * Prompts the user to log into Google and grants your app permission to access some of their Google data, as specified by the scopes.
 *
 * Get started in:
 * - [**Expo Client**](https://docs.expo.io/versions/latest/sdk/google/#using-it-inside-of-the-expo-app)
 * - [**Standalone**](https://docs.expo.io/versions/latest/sdk/google/#deploying-to-a-standalone-app-on-ios)
 *
 * @param config
 */
export async function logInAsync(config: GoogleLogInConfig): Promise<LogInResult> {
  if (config.behavior !== undefined) {
    console.warn(
      "Deprecated: Native Google Sign-In has been moved to Expo.GoogleSignIn ('expo-google-sign-in') Falling back to `web` behavior. `behavior` deprecated in SDK 34"
    );
  }

  if (config.webClientId !== undefined) {
    console.warn(
      'Deprecated: You will need to use expo-google-sign-in to do server side authentication outside of the Expo client'
    );
  }

  const userDefinedScopes = config.scopes || [];
  /* Add the required scopes for returning profile data. */
  const requiredScopes = [...userDefinedScopes, 'profile', 'email', 'openid'];
  /* Remove duplicates */
  const scopes = [...new Set(requiredScopes)];

  const guid = getPlatformGUID(config);

  const clientId = `${guid}.apps.googleusercontent.com`;
  const redirectUrl = config.redirectUrl
    ? config.redirectUrl
    : `${AppAuth.OAuthRedirect}:/oauth2redirect/google`;

  const extras: Record<string, string> = {};
  if (config.language) {
    // The OpenID property `ui_locales` doesn't seem to work as expected,
    // but `hl` will work to change the UI language.
    // Reference: https://github.com/googleapis/google-api-nodejs-client/blob/9d0dd2b6fa03c5e32efb0e39daac6291ebad2c3d/src/apis/customsearch/v1.ts#L230
    extras.hl = config.language;
  }
  if (config.loginHint) {
    // Reference https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
    extras.login_hint = config.loginHint;
  }

  try {
    const logInResult = await AppAuth.authAsync({
      issuer: 'https://accounts.google.com',
      scopes,
      redirectUrl,
      clientId,
      additionalParameters: extras,
    });

    // Web login only returns an accessToken so use it to fetch the same info as the native login
    // does.
    const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${logInResult.accessToken}` },
    });
    const userInfo = await userInfoResponse.json();

    return {
      type: 'success',
      accessToken: logInResult.accessToken,
      accessTokenExpirationDate: logInResult.accessTokenExpirationDate,
      idToken: logInResult.idToken,
      refreshToken: logInResult.refreshToken,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
        photoUrl: userInfo.picture,
        email: userInfo.email,
      },
    };
  } catch (error) {
    const message = (error.message as string).toLowerCase();
    // Error code -3 is the native error code for user cancel on iOS
    if (message.includes('user cancelled') || message.includes('error -3')) {
      return { type: 'cancel' };
    }
    throw error;
  }
}

export async function logOutAsync({
  accessToken,
  ...inputConfig
}: GoogleLogInConfig & { accessToken: string }): Promise<any> {
  const guid = getPlatformGUID(inputConfig);

  const clientId = `${guid}.apps.googleusercontent.com`;

  const config = {
    issuer: 'https://accounts.google.com',
    clientId,
  };

  return await AppAuth.revokeAsync(config, {
    token: accessToken,
    isClientIdProvided: !!clientId,
  });
}
