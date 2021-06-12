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
  
  /**
   * A boolean indicating whether the status bar changes its appearance when 
   * location services are used in the background. Defaults to `false`. 
   * (**Takes effect only on iOS 11.0 and later**)
   */
  showsBackgroundLocationIndicator?: boolean; 
  
  /**
   * The distance in meters that must occur between last reported location 
   * and the current location before deferred locations are reported. Defaults to `0`.
   */
  deferredUpdatesDistance?: number;
  
  /**
   * Minimum time interval in milliseconds that must pass since last reported location 
   * before all later locations are reported in a batched update. Defaults to `0`.
   */
  deferredUpdatesInterval?: number;
  
  /**
   * The type of user activity associated with the location updates. 
   * See [Apple docs](https://developer.apple.com/documentation/corelocation/cllocationmanager/1620567-activitytype) 
   * for more details. Defaults to `LocationActivityType.Other`. (**iOS only**)
   */
  activityType?: LocationActivityType;
  
  /** A boolean value indicating whether the location manager can pause location updates
   * to improve battery life without sacrificing location data. When this option is set to true,
   * the location manager pauses updates (and powers down the appropriate hardware) at times 
   * when the location data is unlikely to change. 
   * You can help the determination of when to pause location updates by assigning a value
   * to the activityType property. Defaults to `false`. (**iOS only**)
   */
  pausesUpdatesAutomatically?: boolean;
  
  /**
   * Use this option to put the location service into a foreground state, which will make
   * location updates in the background as frequent as in the foreground state.
   * As a downside, it requires a sticky notification, so the user will be aware that your app
   * is running and consumes more resources even if backgrounded. (**Available since Android 8.0**)
   */
  foregroundService?: {
    /**
     * Title of the foreground service notification.
     */
    notificationTitle: string;
    
    /**
     * Subtitle of the foreground service notification.
     */
    notificationBody: string;
    
    /**
     * Color of the foreground service notification. 
     * Accepts `#RRGGBB` and `#AARRGGBB` hex formats.
     */
    notificationColor?: string;
  };
};

/**
 * Type representing geofencing region object.
 */
export type LocationRegion = {
  /**
   * The identifier of the region object passed to `startGeofencingAsync` or auto-generated.
   */
  identifier?: string;
  
  /**
   * The latitude in degress of region's center point.
   */
  latitude: number;
  
  /**
   * The longitude in degress of region's center point.
   */
  longitude: number;
  
  /**
   * The radius measured in meters that defines the region's outer boundary.
   */
  radius: number;
  
  /**
   * Boolean value whether to call the task if the device enters the region.
   * Defaults to `true`.
   */
  notifyOnEnter?: boolean;
  
  /**
   * Boolean value whether to call the task if the device exits the region.
   * Defaults to `true`.
   */
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
  
  /**
   * Whether location services are enabled. 
   * See Location.hasServicesEnabledAsync for a more convenient solution to get this value.
   */
  locationServicesEnabled: boolean;
  
  /**
   * Whether background mode is enabled. 
   * See Location.isBackgroundLocationAvailableAsync for a more convenient solution to get this value.
   */
  backgroundModeEnabled: boolean;
  
  /**
   * (Android only) Whether the GPS provider is available. 
   * If `true` the location data will come from GPS, especially for requests with high accuracy.
   */
  gpsAvailable?: boolean;
  
  /**
   * (Android only) Whether the network provider is available. 
   * If `true` the location data will come from cellular network, especially for requests 
   * with low accuracy.
   */
  networkAvailable?: boolean;
  
  /**
   * (Android only) Whether the passive provider is available. 
   *  If `true` the location data will be determined passively.
   */
  passiveAvailable?: boolean;
};

/**
 * Type of the object containing heading details and provided by `watchHeadingAsync` callback.
 */
export type LocationHeadingObject = {
  
  /**
   * Measure of true north in degrees (needs location permissions, will return -1 if not given).
   */
  trueHeading: number;
  
  /**
   * Measure of magnetic north in degrees.
   */
  magHeading: number;
  
  /**
   * Level of calibration of compass.
   * 3: high accuracy, 2: medium accuracy, 1: low accuracy, 0: none
   * Reference for iOS: 
   * 3: < 20 degrees uncertainty, 2: < 35 degrees, 1: < 50 degrees, 0: > 50 degrees
   */
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
