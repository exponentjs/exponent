import { PermissionResponse as UMPermissionResponse } from 'expo-modules-core';

// @needsAudit
/**
 * Enum with available location accuracies.
 */
export enum LocationAccuracy {
  /**
   * Accurate to the nearest three kilometers.
   */
  Lowest = 1,

  /**
   * Accurate to the nearest kilometer.
   */
  Low = 2,

  /**
   * Accurate to within one hundred meters.
   */
  Balanced = 3,

  /**
   * Accurate to within ten meters of the desired target.
   */
  High = 4,

  /**
   * The best level of accuracy available.
   */
  Highest = 5,

  /**
   * The highest possible accuracy that uses additional sensor data
   * to facilitate navigation apps.
   */
  BestForNavigation = 6,
}

// @needsAudit
/**
 * Enum with available activity types of background location tracking.
 */
export enum LocationActivityType {
  /**
   * Default activity type.
   * Use it if there is no other type that matches the activity you track.
   */
  Other = 1,

  /**
   * Location updates are being used specifically during vehicular navigation
   *  to track location changes to the automobile.
   */
  AutomotiveNavigation = 2,

  /**
   * Use this activity type if you track fitness activities
   * such as walking, running, cycling, and so on.
   */
  Fitness = 3,

  /**
   * Activity type for movements for other types of vehicular navigation
   * that are not automobile related.
   */
  OtherNavigation = 4,

  /**
   * Intended for airborne activities.
   * Available since iOS 12.0, fall backs to ActivityType.Other otherwise.
   */
  Airborne = 5,
}

// @needsAudit
/**
 * A type of the event that geofencing task can receive.
 */
export enum LocationGeofencingEventType {
  /**
   * Emitted when the device entered observed region.
   */
  Enter = 1,

  /**
   * Occurs as soon as the device left observed region.
   */
  Exit = 2,
}

// @needsAudit
/**
 * State of the geofencing region that you receive through the geofencing task.
 */
export enum LocationGeofencingRegionState {
  /**
   * The device state is unknown
   */
  Unknown = 0,

  /**
   * Indicates that the device is inside the region.
   */
  Inside = 1,

  /**
   * Inverse of inside state.
   */
  Outside = 2,
}

// @needsAudit
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
   * (**Android only**) Specifies whether to ask the user to turn on improved accuracy location mode
   * which uses Wi-Fi, cell networks and GPS sensor. Defaults to `true`.
   */
  mayShowUserSettingsDialog?: boolean;

  /**
   * (**Android only**) Minimum time to wait between each update in milliseconds.
   * Default value may depend on `accuracy` option.
   */
  timeInterval?: number;

  /**
   * Receive updates only when the location has changed by at least this distance in meters.
   * Default value may depend on `accuracy` option.
   */
  distanceInterval?: number;
};

// @needsAudit
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

// @needsAudit
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
   * > Deferred updates provide a way to report locations in a batch when the app is
   * in the background state. Location updates aren't being deferred in the foreground.
   */
  deferredUpdatesDistance?: number;

  /**
   * Minimum time interval in milliseconds that must pass since last reported location
   * before all later locations are reported in a batched update. Defaults to `0`.
   * > Deferred updates provide a way to report locations in a batch when the app is
   * in the background state. Location updates aren't being deferred in the foreground.
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

// @needsAudit
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

// @needsAudit
/**
 * Type representing the location object.
 */
export type LocationObject = {
  /**
   * The coordinates of the position.
   */
  coords: {
    /**
     * The latitude in degrees.
     */
    latitude: number;

    /**
     * The longitude in degrees.
     */
    longitude: number;

    /**
     * The altitude in meters above the WGS 84 reference ellipsoid.
     * Can be `null` on Web if it's not available.
     */
    altitude: number | null;

    /**
     * The radius of uncertainty for the location, measured in meters.
     * Can be `null` on Web if it's not available.
     */
    accuracy: number | null;

    /**
     * The accuracy of the altitude value, in meters.
     * Can be `null` on Web if it's not available.
     */
    altitudeAccuracy: number | null;

    /**
     * Horizontal direction of travel of this device, measured in degrees
     * starting at due north and continuing clockwise around the compass.
     * Thus, north is 0 degrees, east is 90 degrees, south is 180 degrees, and so on.
     * Can be `null` on Web if it's not available.
     */
    heading: number | null;

    /**
     * The instantaneous speed of the device in meters per second.
     * Can be `null` on Web if it's not available.
     */
    speed: number | null;
  };

  /**
   * The time at which this position information was obtained,
   * in milliseconds since epoch.
   */
  timestamp: number;
};

// @needsAudit
/**
 * Represents `watchPositionAsync` callback.
 */
export type LocationCallback = (location: LocationObject) => any;

// @needsAudit
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
   * (**Android only**) Whether the GPS provider is available.
   * If `true` the location data will come from GPS, especially for requests with high accuracy.
   */
  gpsAvailable?: boolean;

  /**
   * (**Android only**) Whether the network provider is available.
   * If `true` the location data will come from cellular network, especially for requests
   * with low accuracy.
   */
  networkAvailable?: boolean;

  /**
   * (**Android only**) Whether the passive provider is available.
   *  If `true` the location data will be determined passively.
   */
  passiveAvailable?: boolean;
};

// @needsAudit
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

// @needsAudit
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

// @needsAudit
/**
 * Type representing a result of `geocodeAsync`.
 */
export type LocationGeocodedLocation = {
  /**
   * The latitude in degrees.
   */
  latitude: number;

  /**
   * The longitude in degrees.
   */
  longitude: number;

  /**
   * The altitude in meters above the WGS 84 reference ellipsoid.
   */
  altitude?: number;

  /**
   * The radius of uncertainty for the location, measured in meters.
   */
  accuracy?: number;
};

// @needsAudit
/**
 * Type representing a result of `reverseGeocodeAsync`.
 */
export type LocationGeocodedAddress = {
  /**
   * City name of the address.
   */
  city: string | null;

  /**
   * Additional city-level information like district name.
   */
  district: string | null;

  /**
   * Street name of the address.
   */
  street: string | null;

  /**
   * The state or province associated with the address.
   */
  region: string | null;

  /**
   * Additional information about administrative area.
   */
  subregion: string | null;

  /**
   * Localized country name of the address.
   */
  country: string | null;

  /**
   *  Postal code of the address.
   */
  postalCode: string | null;

  /**
   * The name of the placemark, for example, "Tower Bridge".
   */
  name: string | null;

  /**
   * Localized (iso) country code of the address, if available.
   */
  isoCountryCode: string | null;

  /**
   * The timezone identifier associated with the address (**iOS only**)
   */
  timezone: string | null;
};

// @needsAudit
/**
 * Represents subscription object returned by methods watching for new locations or headings.
 */
export type LocationSubscription = {
  remove: () => void;
};

// @needsAudit @docsMissing
export type PermissionDetailsLocationIOS = {
  /**
   * The scope of granted permission.
   * Indicates when it's possible to use location, possible values are: whenInUse, always or none.
   */
  scope: 'whenInUse' | 'always' | 'none';
};

// @needsAudit @docsMissing
export type PermissionDetailsLocationAndroid = {
  /**
   * @deprecated use `accuracy` instead
   */
  scope: 'fine' | 'coarse' | 'none';

  /**
   * On Android it indicates the type of location provider with
   * possible values: fine, coarse, none.
   */
  accuracy: 'fine' | 'coarse' | 'none';
};

// @needsAudit
/**
 * `LocationPermissionResponse` extends `PermissionResponse` type exported
 * by unimodules-permission-interface and contains additional platform-specific fields.
 */
export interface LocationPermissionResponse extends UMPermissionResponse {
  ios?: PermissionDetailsLocationIOS;
  android?: PermissionDetailsLocationAndroid;
}
