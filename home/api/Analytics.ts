import * as Amplitude from 'expo-analytics-amplitude';
import Constants from 'expo-constants';

import Environment from '../utils/Environment';
import { TrackingOptions, normalizeTrackingOptions } from './AnalyticsUtils';

let isInitialized = false;
const apiKey = Constants.manifest?.extra?.amplitudeApiKey;

export const events = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  USER_CREATED_ACCOUNT: 'USER_CREATED_ACCOUNT',
};

const canUseAmplitude = Environment.isProduction && apiKey;

export function initialize(): void {
  if (isInitialized || !canUseAmplitude) {
    return;
  }

  Amplitude.initializeAsync(apiKey);
  isInitialized = true;
}

export function identify(id: string | null, options?: TrackingOptions) {
  initialize();
  const properties = normalizeTrackingOptions(options);

  if (!canUseAmplitude) return;
  if (id) {
    Amplitude.setUserId(id);
    if (properties) {
      Amplitude.setUserProperties(properties);
    }
  } else {
    Amplitude.clearUserProperties();
  }
}

export function track(event: string, options?: TrackingOptions): void {
  initialize();
  const properties = normalizeTrackingOptions(options);

  if (!canUseAmplitude) return;

  if (properties) {
    Amplitude.logEventWithPropertiesAsync(event, properties);
  } else {
    Amplitude.logEventAsync(event);
  }
}

export default {
  events,
  initialize,
  identify,
  track,
};
