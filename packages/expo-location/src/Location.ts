import { Platform } from '@unimodules/core';
import { PermissionStatus, PermissionResponse } from 'expo-modules-core';

import ExpoLocation from './ExpoLocation';
import {
  LocationAccuracy,
  LocationCallback,
  LocationGeocodedAddress,
  LocationGeocodedLocation,
  LocationHeadingCallback,
  LocationHeadingObject,
  LocationLastKnownOptions,
  LocationObject,
  LocationOptions,
  LocationPermissionResponse,
  LocationProviderStatus,
  LocationRegion,
  LocationSubscription,
  LocationTaskOptions,
  LocationActivityType,
  LocationGeofencingEventType,
  LocationGeofencingRegionState,
  LocationGeocodingOptions,
} from './Location.types';
import { LocationEventEmitter } from './LocationEventEmitter';
import {
  setGoogleApiKey,
  googleGeocodeAsync,
  googleReverseGeocodeAsync,
} from './LocationGoogleGeocoding';
import { LocationSubscriber, HeadingSubscriber, _getCurrentWatchId } from './LocationSubscribers';

export async function getProviderStatusAsync(): Promise<LocationProviderStatus> {
  return ExpoLocation.getProviderStatusAsync();
}

export async function enableNetworkProviderAsync(): Promise<void> {
  // If network provider is disabled (user's location mode is set to "Device only"),
  // Android's location provider may not give you any results. Use this method in order to ask the user
  // to change the location mode to "High accuracy" which uses Google Play services and enables network provider.
  // `getCurrentPositionAsync` and `watchPositionAsync` are doing it automatically anyway.

  if (Platform.OS === 'android') {
    return ExpoLocation.enableNetworkProviderAsync();
  }
}

/**
 * Requests for one-time delivery of the user's current location.
 * Depending on given `accuracy` option it may take some time to resolve,
 * especially when you're inside a building.
 */
export async function getCurrentPositionAsync(
  options: LocationOptions = {}
): Promise<LocationObject> {
  return ExpoLocation.getCurrentPositionAsync(options);
}

/**
 * Gets the last known position of the device or `null` if it's not available
 * or doesn't match given requirements such as maximum age or required accuracy.
 * It's considered to be faster than `getCurrentPositionAsync` as it doesn't request for the current location.
 */
export async function getLastKnownPositionAsync(
  options: LocationLastKnownOptions = {}
): Promise<LocationObject | null> {
  return ExpoLocation.getLastKnownPositionAsync(options);
}

/**
 * Starts watching for location changes.
 * Given callback will be called once the new location is available.
 */
export async function watchPositionAsync(options: LocationOptions, callback: LocationCallback) {
  const watchId = LocationSubscriber.registerCallback(callback);
  await ExpoLocation.watchPositionImplAsync(watchId, options);

  return {
    remove() {
      LocationSubscriber.unregisterCallback(watchId);
    },
  };
}

/**
 * Resolves to an object with current heading details.
 * To simplify, it calls `watchHeadingAsync` and waits for a couple of updates
 * and returns the one that is accurate enough.
 */
export async function getHeadingAsync(): Promise<LocationHeadingObject> {
  return new Promise<LocationHeadingObject>(async resolve => {
    let tries = 0;

    const subscription = await watchHeadingAsync(heading => {
      if (heading.accuracy > 1 || tries > 5) {
        subscription.remove();
        resolve(heading);
      } else {
        tries += 1;
      }
    });
  });
}

/**
 * Starts watching for heading changes.
 * Given callback will be called once the new heading is available.
 */
export async function watchHeadingAsync(
  callback: LocationHeadingCallback
): Promise<LocationSubscription> {
  const watchId = HeadingSubscriber.registerCallback(callback);
  await ExpoLocation.watchDeviceHeading(watchId);

  return {
    remove() {
      HeadingSubscriber.unregisterCallback(watchId);
    },
  };
}

/**
 * Geocodes given address to an array of latitude-longitude coordinates.
 */
export async function geocodeAsync(
  address: string,
  options?: LocationGeocodingOptions
): Promise<LocationGeocodedLocation[]> {
  if (typeof address !== 'string') {
    throw new TypeError(`Address to geocode must be a string. Got ${address} instead.`);
  }
  if (options?.useGoogleMaps || Platform.OS === 'web') {
    return await googleGeocodeAsync(address);
  }
  return await ExpoLocation.geocodeAsync(address);
}

/**
 * The opposite behavior of `geocodeAsync` — translates location coordinates to an array of addresses.
 */
export async function reverseGeocodeAsync(
  location: Pick<LocationGeocodedLocation, 'latitude' | 'longitude'>,
  options?: LocationGeocodingOptions
): Promise<LocationGeocodedAddress[]> {
  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    throw new TypeError(
      'Location to reverse-geocode must be an object with number properties `latitude` and `longitude`.'
    );
  }
  if (options?.useGoogleMaps || Platform.OS === 'web') {
    return await googleReverseGeocodeAsync(location);
  }
  return await ExpoLocation.reverseGeocodeAsync(location);
}

/**
 * Gets the current state of location permissions.
 * @deprecated Use `getForegroundPermissionsAsync()` or `getBackgroundPermissionsAsync()` instead.
 */
export async function getPermissionsAsync(): Promise<LocationPermissionResponse> {
  console.warn(
    `"getPermissionsAsync()" is now deprecated. Please use "getForegroundPermissionsAsync()" or "getBackgroundPermissionsAsync()" instead.`
  );
  return await ExpoLocation.getPermissionsAsync();
}

/**
 * Requests the user to grant location permissions.
 * @deprecated Use `requestForegroundPermissionsAsync()` or `requestBackgroundPermissionsAsync()` instead.
 */
export async function requestPermissionsAsync(): Promise<LocationPermissionResponse> {
  console.warn(
    `"requestPermissionsAsync()" is now deprecated. Please use "requestForegroundPermissionsAsync()" or "requestBackgroundPermissionsAsync()" instead.`
  );

  return await ExpoLocation.requestPermissionsAsync();
}

/**
 * Gets the current state of foreground location permissions.
 */
export async function getForegroundPermissionsAsync(): Promise<PermissionResponse> {
  return await ExpoLocation.getForegroundPermissionsAsync();
}

/**
 * Requests the user to grant foreground location permissions.
 */
export async function requestForegroundPermissionsAsync(): Promise<PermissionResponse> {
  return await ExpoLocation.requestForegroundPermissionsAsync();
}

/**
 * Gets the current state of background location permissions.
 */
export async function getBackgroundPermissionsAsync(): Promise<PermissionResponse> {
  return await ExpoLocation.getBackgroundPermissionsAsync();
}

/**
 * Requests the user to grant background location permissions.
 */
export async function requestBackgroundPermissionsAsync(): Promise<PermissionResponse> {
  return await ExpoLocation.requestBackgroundPermissionsAsync();
}

// --- Location service

/**
 * Returns `true` if the device has location services enabled or `false` otherwise.
 */
export async function hasServicesEnabledAsync(): Promise<boolean> {
  return await ExpoLocation.hasServicesEnabledAsync();
}

// --- Background location updates

function _validateTaskName(taskName: string) {
  if (!taskName || typeof taskName !== 'string') {
    throw new Error(`\`taskName\` must be a non-empty string. Got ${taskName} instead.`);
  }
}

export async function isBackgroundLocationAvailableAsync(): Promise<boolean> {
  const providerStatus = await getProviderStatusAsync();
  return providerStatus.backgroundModeEnabled;
}

export async function startLocationUpdatesAsync(
  taskName: string,
  options: LocationTaskOptions = { accuracy: LocationAccuracy.Balanced }
): Promise<void> {
  _validateTaskName(taskName);
  await ExpoLocation.startLocationUpdatesAsync(taskName, options);
}

export async function stopLocationUpdatesAsync(taskName: string): Promise<void> {
  _validateTaskName(taskName);
  await ExpoLocation.stopLocationUpdatesAsync(taskName);
}

export async function hasStartedLocationUpdatesAsync(taskName: string): Promise<boolean> {
  _validateTaskName(taskName);
  return ExpoLocation.hasStartedLocationUpdatesAsync(taskName);
}

// --- Geofencing

function _validateRegions(regions: LocationRegion[]) {
  if (!regions || regions.length === 0) {
    throw new Error(
      'Regions array cannot be empty. Use `stopGeofencingAsync` if you want to stop geofencing all regions'
    );
  }
  for (const region of regions) {
    if (typeof region.latitude !== 'number') {
      throw new TypeError(`Region's latitude must be a number. Got '${region.latitude}' instead.`);
    }
    if (typeof region.longitude !== 'number') {
      throw new TypeError(
        `Region's longitude must be a number. Got '${region.longitude}' instead.`
      );
    }
    if (typeof region.radius !== 'number') {
      throw new TypeError(`Region's radius must be a number. Got '${region.radius}' instead.`);
    }
  }
}

export async function startGeofencingAsync(
  taskName: string,
  regions: LocationRegion[] = []
): Promise<void> {
  _validateTaskName(taskName);
  _validateRegions(regions);
  await ExpoLocation.startGeofencingAsync(taskName, { regions });
}

export async function stopGeofencingAsync(taskName: string): Promise<void> {
  _validateTaskName(taskName);
  await ExpoLocation.stopGeofencingAsync(taskName);
}

export async function hasStartedGeofencingAsync(taskName: string): Promise<boolean> {
  _validateTaskName(taskName);
  return ExpoLocation.hasStartedGeofencingAsync(taskName);
}

/**
 * @deprecated
 * Deprecated as of SDK39 in favour of `setGoogleApiKey`.
 */
export function setApiKey(apiKey: string): void {
  console.warn("Location's method `setApiKey` is deprecated in favor of `setGoogleApiKey`.");
  setGoogleApiKey(apiKey);
}

// For internal purposes
export { LocationEventEmitter as EventEmitter, _getCurrentWatchId };

// Export as namespaced types.
export {
  LocationAccuracy as Accuracy,
  LocationActivityType as ActivityType,
  LocationGeofencingEventType as GeofencingEventType,
  LocationGeofencingRegionState as GeofencingRegionState,
  PermissionStatus,
  setGoogleApiKey,
};

export { installWebGeolocationPolyfill } from './GeolocationPolyfill';
export * from './Location.types';
