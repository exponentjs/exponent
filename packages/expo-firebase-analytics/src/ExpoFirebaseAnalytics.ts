import { NativeModulesProxy, UnavailabilityError, CodedError } from '@unimodules/core';
import Constants from 'expo-constants';
import { DEFAULT_APP_NAME, DEFAULT_APP_OPTIONS, DEFAULT_WEB_APP_OPTIONS } from 'expo-firebase-core';
import { Platform } from 'react-native';

import FirebaseAnalyticsJS from './FirebaseAnalyticsJS';
const { ExpoFirebaseAnalytics } = NativeModulesProxy;

if (!ExpoFirebaseAnalytics) {
  console.warn(
    "No native ExpoFirebaseAnalytics module found, are you sure the expo-firebase-analytics's module is linked properly?"
  );
}

let pureJSAnalyticsTracker: FirebaseAnalyticsJS | void;
let isUnavailabilityLoggingEnabled = true;
let isUnavailabilityWarningLogged = false;
let clientIdForJS: string;

function callAnalyticsModule(funcName: string, ...args) {
  if (!ExpoFirebaseAnalytics[funcName]) {
    if (funcName === 'setDebugModeEnabled') {
      // Debug-mode can only be enabled for the pure JS Analytics Tracker
      // For all other environments, the platform specific method must be used.
      // https://firebase.google.com/docs/analytics/debugview
      if (!(DEFAULT_APP_NAME !== '[DEFAULT]' && DEFAULT_WEB_APP_OPTIONS)) {
        throw new CodedError(
          'ERR_FIREBASE_NOTCONFIGURED',
          `setDebugModeEnabled is not available in this environment. See "https://firebase.google.com/docs/analytics/debugview" on how to enable debug mode.`
        );
      }
    } else {
      throw new UnavailabilityError('expo-firebase-analytics', funcName);
    }
  }
  if (!DEFAULT_APP_OPTIONS) {
    throw new CodedError(
      'ERR_FIREBASE_NOTCONFIGURED',
      `Firebase is not configured. Ensure that you have configured '${Platform.select({
        ios: 'GoogleService-Info.plist',
        android: 'google-services.json',
      })}' correctly.`
    );
  }

  // Analytics is only available for the [DEFAULT] app. On the Expo client
  // a sandboxed app is returned which does not support analytics.
  // In that case we show a warning and log the analytics events to the console.
  // The user can disable these by calling `setUnavailabilityLogging(false)`.
  if (DEFAULT_APP_NAME !== '[DEFAULT]') {
    if (DEFAULT_WEB_APP_OPTIONS && !pureJSAnalyticsTracker) {
      pureJSAnalyticsTracker = new FirebaseAnalyticsJS(DEFAULT_WEB_APP_OPTIONS, {
        clientId: clientIdForJS ?? Constants.installationId,
        sessionId: Constants.sessionId,
        strictNativeEmulation: true,
        appName:
          Constants.manifest?.name ||
          Constants.manifest2?.extra?.expoClient?.name ||
          'Unnamed Expo project',
        appVersion: Constants.nativeAppVersion || undefined,
        headers: {
          // Google Analaytics seems to ignore certain user-agents. (e.g. "okhttp/3.12.1")
          // Set a user-agent that clearly identifies the Expo client.
          'user-agent': `Expo/${Constants.nativeAppVersion}`,
        },
      });
    }
    if (pureJSAnalyticsTracker) {
      return pureJSAnalyticsTracker[funcName].call(pureJSAnalyticsTracker, ...args);
    }
    if (isUnavailabilityLoggingEnabled) {
      if (!isUnavailabilityWarningLogged) {
        console.warn(
          `Firebase Analytics is not available in the Expo client. See "https://docs.expo.io/versions/latest/sdk/firebase-analytics" on more information on setting up Firebase Analytics with the standard Expo client.`
        );
        isUnavailabilityWarningLogged = true;
      }
      console.info(`ExpoFirebaseAnalytics.${funcName}: ${JSON.stringify(args)}`);
    }
    return;
  }

  // Make the call
  return ExpoFirebaseAnalytics[funcName].call(ExpoFirebaseAnalytics, ...args);
}

export default {
  get name(): string {
    return 'ExpoFirebaseAnalytics';
  },
  async logEvent(name: string, properties?: { [key: string]: any }): Promise<void> {
    return callAnalyticsModule('logEvent', name, properties);
  },
  async setAnalyticsCollectionEnabled(isEnabled: boolean): Promise<void> {
    return callAnalyticsModule('setAnalyticsCollectionEnabled', isEnabled);
  },
  async setCurrentScreen(screenName?: string, screenClassOverride?: string): Promise<void> {
    return callAnalyticsModule('setCurrentScreen', screenName, screenClassOverride);
  },
  async setSessionTimeoutDuration(sessionTimeoutInterval: number): Promise<void> {
    return callAnalyticsModule('setSessionTimeoutDuration', sessionTimeoutInterval);
  },
  async setUserId(userId: string | null): Promise<void> {
    return callAnalyticsModule('setUserId', userId);
  },
  async setUserProperties(properties: { [key: string]: any }): Promise<void> {
    return callAnalyticsModule('setUserProperties', properties);
  },
  async resetAnalyticsData(): Promise<void> {
    return callAnalyticsModule('resetAnalyticsData');
  },
  setUnavailabilityLogging(isEnabled: boolean): void {
    isUnavailabilityLoggingEnabled = isEnabled;
  },
  async setDebugModeEnabled(isEnabled: boolean): Promise<void> {
    return callAnalyticsModule('setDebugModeEnabled', isEnabled);
  },
  setClientId(clientId: string): void {
    clientIdForJS = clientId;
    if (pureJSAnalyticsTracker) {
      pureJSAnalyticsTracker.setClientId(clientId);
    }
  },
};
