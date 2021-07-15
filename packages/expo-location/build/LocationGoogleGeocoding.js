import { CodedError } from '@unimodules/core';
const GOOGLE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
let googleApiKey;
export function setGoogleApiKey(apiKey) {
    googleApiKey = apiKey;
}
export async function googleGeocodeAsync(address) {
    assertGoogleApiKey();
    const result = await requestGoogleApiAsync({ address });
    if (result.status === 'ZERO_RESULTS') {
        return [];
    }
    assertGeocodeResults(result);
    return result.results.map(geocodingResultToLocation);
}
export async function googleReverseGeocodeAsync(options) {
    assertGoogleApiKey();
    const result = await requestGoogleApiAsync({
        latlng: `${options.latitude},${options.longitude}`,
    });
    if (result.status === 'ZERO_RESULTS') {
        return [];
    }
    assertGeocodeResults(result);
    return result.results.map(reverseGeocodingResultToAddress);
}
// https://developers.google.com/maps/documentation/geocoding/intro
function assertGeocodeResults(resultObject) {
    const { status, error_message } = resultObject;
    if (status !== 'ZERO_RESULTS' && status !== 'OK') {
        if (error_message) {
            throw new CodedError(status, error_message);
        }
        else if (status === 'UNKNOWN_ERROR') {
            throw new CodedError(status, 'the request could not be processed due to a server error. The request may succeed if you try again.');
        }
        throw new CodedError(status, `An error occurred during geocoding.`);
    }
}
/**
 * Makes sure the Google API key is set.
 */
function assertGoogleApiKey() {
    if (!googleApiKey) {
        throw new Error('Google API key is required to use geocoding. Please set it using `setGoogleApiKey` method.');
    }
}
/**
 * Generic and handy method for sending requests to Google Maps API endpoint.
 */
async function requestGoogleApiAsync(params) {
    const query = Object.entries(params)
        .map(entry => `${entry[0]}=${encodeURI(entry[1])}`)
        .join('&');
    const result = await fetch(`${GOOGLE_API_URL}?key=${googleApiKey}&${query}`);
    return await result.json();
}
/**
 * Converts Google's result to the location object.
 */
function geocodingResultToLocation(result) {
    const { location } = result.geometry;
    return {
        latitude: location.lat,
        longitude: location.lng,
    };
}
/**
 * Converts Google's result to address object.
 */
function reverseGeocodingResultToAddress(result) {
    const address = {};
    for (const { long_name, short_name, types } of result.address_components) {
        if (types.includes('locality')) {
            address.city = long_name;
            continue;
        }
        if (types.includes('sublocality')) {
            address.district = long_name;
            continue;
        }
        if (types.includes('street_number')) {
            address.streetNumber = long_name;
            continue;
        }
        if (types.includes('street_address') || types.includes('route')) {
            address.street = long_name;
            continue;
        }
        if (types.includes('administrative_area_level_1')) {
            address.region = long_name;
            continue;
        }
        if (types.includes('administrative_area_level_2')) {
            address.subregion = long_name;
            continue;
        }
        if (types.includes('country')) {
            address.country = long_name;
            address.isoCountryCode = short_name;
            continue;
        }
        if (types.includes('postal_code')) {
            address.postalCode = long_name;
            continue;
        }
        if (types.includes('point_of_interest')) {
            address.name = long_name;
            continue;
        }
    }
    if (!address.name) {
        address.name = result.formatted_address.replace(/,.*$/, '');
    }
    return address;
}
//# sourceMappingURL=LocationGoogleGeocoding.js.map