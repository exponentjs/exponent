import { LocationGeocodedAddress, LocationGeocodedLocation } from './Location.types';
/**
 * Sets a Google API Key for using Google Maps Geocoding API which
 * is used by default on Web platform and can be enabled through
 * `useGoogleMaps` option of `geocodeAsync` and `reverseGeocodeAsync` methods.
 * It might be useful for Android devices that do not have
 * Google Play Services, hence no Geocoder Service.
 * @param apiKey Google API key obtained from Google API Console.
 * This API key must have `Geocoding API` enabled, otherwise your geocoding
 * requests will be denied.
 */
export declare function setGoogleApiKey(apiKey: string): void;
export declare function googleGeocodeAsync(address: string): Promise<LocationGeocodedLocation[]>;
export declare function googleReverseGeocodeAsync(options: {
    latitude: number;
    longitude: number;
}): Promise<LocationGeocodedAddress[]>;
