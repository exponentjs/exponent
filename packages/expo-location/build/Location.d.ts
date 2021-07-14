import { PermissionStatus, PermissionResponse } from 'expo-modules-core';
import { LocationAccuracy, LocationCallback, LocationGeocodedAddress, LocationGeocodedLocation, LocationHeadingCallback, LocationHeadingObject, LocationLastKnownOptions, LocationObject, LocationOptions, LocationPermissionResponse, LocationProviderStatus, LocationRegion, LocationSubscription, LocationTaskOptions, LocationActivityType, LocationGeofencingEventType, LocationGeofencingRegionState, LocationGeocodingOptions } from './Location.types';
import { LocationEventEmitter } from './LocationEventEmitter';
import { setGoogleApiKey } from './LocationGoogleGeocoding';
import { _getCurrentWatchId } from './LocationSubscribers';
export declare function getProviderStatusAsync(): Promise<LocationProviderStatus>;
export declare function enableNetworkProviderAsync(): Promise<void>;
/**
 * Requests for one-time delivery of the user's current location.
 * Depending on given `accuracy` option it may take some time to resolve,
 * especially when you're inside a building.
 */
export declare function getCurrentPositionAsync(options?: LocationOptions): Promise<LocationObject>;
/**
 * Gets the last known position of the device or `null` if it's not available
 * or doesn't match given requirements such as maximum age or required accuracy.
 * It's considered to be faster than `getCurrentPositionAsync` as it doesn't request for the current location.
 */
export declare function getLastKnownPositionAsync(options?: LocationLastKnownOptions): Promise<LocationObject | null>;
/**
 * Starts watching for location changes.
 * Given callback will be called once the new location is available.
 */
export declare function watchPositionAsync(options: LocationOptions, callback: LocationCallback): Promise<{
    remove(): void;
}>;
/**
 * Resolves to an object with current heading details.
 * To simplify, it calls `watchHeadingAsync` and waits for a couple of updates
 * and returns the one that is accurate enough.
 */
export declare function getHeadingAsync(): Promise<LocationHeadingObject>;
/**
 * Starts watching for heading changes.
 * Given callback will be called once the new heading is available.
 */
export declare function watchHeadingAsync(callback: LocationHeadingCallback): Promise<LocationSubscription>;
/**
 * Geocodes given address to an array of latitude-longitude coordinates.
 */
export declare function geocodeAsync(address: string, options?: LocationGeocodingOptions): Promise<LocationGeocodedLocation[]>;
/**
 * The opposite behavior of `geocodeAsync` — translates location coordinates to an array of addresses.
 */
export declare function reverseGeocodeAsync(location: Pick<LocationGeocodedLocation, 'latitude' | 'longitude'>, options?: LocationGeocodingOptions): Promise<LocationGeocodedAddress[]>;
/**
 * Gets the current state of location permissions.
 * @deprecated Use `getForegroundPermissionsAsync()` or `getBackgroundPermissionsAsync()` instead.
 */
export declare function getPermissionsAsync(): Promise<LocationPermissionResponse>;
/**
 * Requests the user to grant location permissions.
 * @deprecated Use `requestForegroundPermissionsAsync()` or `requestBackgroundPermissionsAsync()` instead.
 */
export declare function requestPermissionsAsync(): Promise<LocationPermissionResponse>;
/**
 * Gets the current state of foreground location permissions.
 */
export declare function getForegroundPermissionsAsync(): Promise<PermissionResponse>;
/**
 * Requests the user to grant foreground location permissions.
 */
export declare function requestForegroundPermissionsAsync(): Promise<PermissionResponse>;
/**
 * Gets the current state of background location permissions.
 */
export declare function getBackgroundPermissionsAsync(): Promise<PermissionResponse>;
/**
 * Requests the user to grant background location permissions.
 */
export declare function requestBackgroundPermissionsAsync(): Promise<PermissionResponse>;
/**
 * Returns `true` if the device has location services enabled or `false` otherwise.
 */
export declare function hasServicesEnabledAsync(): Promise<boolean>;
export declare function isBackgroundLocationAvailableAsync(): Promise<boolean>;
export declare function startLocationUpdatesAsync(taskName: string, options?: LocationTaskOptions): Promise<void>;
export declare function stopLocationUpdatesAsync(taskName: string): Promise<void>;
export declare function hasStartedLocationUpdatesAsync(taskName: string): Promise<boolean>;
export declare function startGeofencingAsync(taskName: string, regions?: LocationRegion[]): Promise<void>;
export declare function stopGeofencingAsync(taskName: string): Promise<void>;
export declare function hasStartedGeofencingAsync(taskName: string): Promise<boolean>;
/**
 * @deprecated
 * Deprecated as of SDK39 in favour of `setGoogleApiKey`.
 */
export declare function setApiKey(apiKey: string): void;
export { LocationEventEmitter as EventEmitter, _getCurrentWatchId };
export { LocationAccuracy as Accuracy, LocationActivityType as ActivityType, LocationGeofencingEventType as GeofencingEventType, LocationGeofencingRegionState as GeofencingRegionState, PermissionStatus, setGoogleApiKey, };
export { installWebGeolocationPolyfill } from './GeolocationPolyfill';
export * from './Location.types';
