import { PermissionResponse as UMPermissionResponse } from 'expo-modules-core';

/**
 * Enum with available location accuracies.
 */
export enum LocationAccuracy {
  Lowest = 1,
  Low = 2,
  Balanced = 3,
  High = 4,
  Highest = 5,
  BestForNavigation = 6,
}

/**
 * Enum with available activity types of background location tracking.
 */
export enum LocationActivityType {
  Other = 1,
  AutomotiveNavigation = 2,
  Fitness = 3,
  OtherNavigation = 4,
  Airborne = 5,
}

/**
 * A type of the event that geofencing task can receive.
 */
export enum LocationGeofencingEventType {
  Enter = 1,
  Exit = 2,
}

/**
 * State of the geofencing region that you receive through the geofencing task.
 */
export enum LocationGeofencingRegionState {
  Unknown = 0,
  Inside = 1,
  Outside = 2,
}

/**
 * Type representing options argument in `getCurrentPositionAsync`.
 */
export type LocationOptions = {
  /**
   * Location manager accuracy. Pass one of `LocationAccuracy` enum values.
   * For low-accuracies the implementation can avoid geolocation providers
   * that consume a significant amount of power (such as GPS).
   */
  accuracy?: LocationAccuracy;

  /**
   * (Android only) Specifies whether to ask the user to turn on improved accuracy location mode
   * which uses Wi-Fi, cell networks and GPS sensor. Defaults to `true`.
   */
  mayShowUserSettingsDialog?: boolean;

  /**
   * (Android only) Minimum time to wait between each update in milliseconds.
   * Default value may depend on `accuracy` option.
   */
  timeInterval?: number;

  /**
   * Receive updates only when the location has changed by at least this distance in meters.
   * Default value may depend on `accuracy` option.
   */
  distanceInterval?: number;
};

/**
 * Type representing options object that can be passed to `getLastKnownPositionAsync`.
 */
export type LocationLastKnownOptions = {
  /**
   * Maximum age of the location in miliseconds.
   */
  maxAge?: number;

  /**
   * Maximum radius of horizontal accuracy in meters.
   */
  requiredAccuracy?: number;
};

/**
 * Type representing background location task options.
 */
export type LocationTaskOptions = LocationOptions & {
  showsBackgroundLocationIndicator?: boolean; // iOS only
  deferredUpdatesDistance?: number;
  deferredUpdatesTimeout?: number;
  deferredUpdatesInterval?: number;

  // iOS only
  activityType?: LocationActivityType;
  pausesUpdatesAutomatically?: boolean;

  foregroundService?: {
    notificationTitle: string;
    notificationBody: string;
    notificationColor?: string;
  };
};

/**
 * Type representing geofencing region object.
 */
export type LocationRegion = {
  identifier?: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEnter?: boolean;
  notifyOnExit?: boolean;
};

/**
 * Type representing the location object.
 */
export type LocationObject = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

/**
 * Represents `watchPositionAsync` callback.
 */
export type LocationCallback = (location: LocationObject) => any;

/**
 * Represents the object containing details about location provider.
 */
export type LocationProviderStatus = {
  locationServicesEnabled: boolean;
  backgroundModeEnabled: boolean;
  gpsAvailable?: boolean;
  networkAvailable?: boolean;
  passiveAvailable?: boolean;
};

/**
 * Type of the object containing heading details and provided by `watchHeadingAsync` callback.
 */
export type LocationHeadingObject = {
  trueHeading: number;
  magHeading: number;
  accuracy: number;
};

/**
 * Represents `watchHeadingAsync` callback.
 */
export type LocationHeadingCallback = (location: LocationHeadingObject) => any;

/**
 * An object of options for forward and reverse geocoding.
 */
export type LocationGeocodingOptions = {
  /**
   * Whether to force using Google Maps API instead of the native implementation.
   * Used by default only on Web platform. Requires providing an API key by `setGoogleApiKey`.
   */
  useGoogleMaps?: boolean;
};

/**
 * Type representing a result of `geocodeAsync`.
 */
export type LocationGeocodedLocation = {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
};

/**
 * Type representing a result of `reverseGeocodeAsync`.
 */
export type LocationGeocodedAddress = {
  city: string | null;
  district: string | null;
  streetNumber: string | null;
  street: string | null;
  region: string | null;
  subregion: string | null;
  country: string | null;
  postalCode: string | null;
  name: string | null;
  isoCountryCode: string | null;
  timezone: string | null;
};

/**
 * Represents subscription object returned by methods watching for new locations or headings.
 */
export type LocationSubscription = {
  remove: () => void;
};

export type PermissionDetailsLocationIOS = {
  scope: 'whenInUse' | 'always' | 'none';
};

export type PermissionDetailsLocationAndroid = {
  /**
   * @deprecated use `accuracy` instead
   */
  scope: 'fine' | 'coarse' | 'none';

  accuracy: 'fine' | 'coarse' | 'none';
};

export interface LocationPermissionResponse extends UMPermissionResponse {
  ios?: PermissionDetailsLocationIOS;
  android?: PermissionDetailsLocationAndroid;
}
