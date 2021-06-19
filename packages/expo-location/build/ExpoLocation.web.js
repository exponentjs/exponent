import { PermissionStatus } from 'expo-modules-core';
import { LocationAccuracy, } from './Location.types';
import { LocationEventEmitter } from './LocationEventEmitter';
class GeocoderError extends Error {
    code;
    constructor() {
        super('Geocoder service is not available for this device.');
        this.code = 'E_NO_GEOCODER';
    }
}
/**
 * Converts `GeolocationPosition` to JavaScript object.
 */
function geolocationPositionToJSON(position) {
    const { coords, timestamp } = position;
    return {
        coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            altitude: coords.altitude,
            accuracy: coords.accuracy,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
        },
        timestamp,
    };
}
/**
 * Checks whether given location didn't exceed given `maxAge` and fits in the required accuracy.
 */
function isLocationValid(location, options) {
    const maxAge = typeof options.maxAge === 'number' ? options.maxAge : Infinity;
    const requiredAccuracy = typeof options.requiredAccuracy === 'number' ? options.requiredAccuracy : Infinity;
    const locationAccuracy = location.coords.accuracy ?? Infinity;
    return Date.now() - location.timestamp <= maxAge && locationAccuracy <= requiredAccuracy;
}
/**
 * Gets the permission details. The implementation is not very good as it actually requests
 * for the current location, but there is no better way on web so far :(
 */
async function getPermissionsAsync() {
    return new Promise(resolve => {
        const resolveWithStatus = status => resolve({
            status,
            granted: status === PermissionStatus.GRANTED,
            canAskAgain: true,
            expires: 0,
        });
        navigator.geolocation.getCurrentPosition(() => resolveWithStatus(PermissionStatus.GRANTED), ({ code }) => {
            if (code === 1 /* PERMISSION_DENIED */) {
                resolveWithStatus(PermissionStatus.DENIED);
            }
            else {
                resolveWithStatus(PermissionStatus.UNDETERMINED);
            }
        }, { enableHighAccuracy: false, maximumAge: Infinity });
    });
}
let lastKnownPosition = null;
export default {
    get name() {
        return 'ExpoLocation';
    },
    async getProviderStatusAsync() {
        return {
            locationServicesEnabled: 'geolocation' in navigator,
        };
    },
    async getLastKnownPositionAsync(options = {}) {
        if (lastKnownPosition && isLocationValid(lastKnownPosition, options)) {
            return lastKnownPosition;
        }
        return null;
    },
    async getCurrentPositionAsync(options) {
        return new Promise((resolve, reject) => {
            const resolver = position => {
                lastKnownPosition = geolocationPositionToJSON(position);
                resolve(lastKnownPosition);
            };
            navigator.geolocation.getCurrentPosition(resolver, reject, {
                maximumAge: Infinity,
                enableHighAccuracy: (options.accuracy ?? 0) > LocationAccuracy.Balanced,
                ...options,
            });
        });
    },
    async removeWatchAsync(watchId) {
        navigator.geolocation.clearWatch(watchId);
    },
    async watchDeviceHeading(headingId) {
        console.warn('Location.watchDeviceHeading: is not supported on web');
    },
    async hasServicesEnabledAsync() {
        return 'geolocation' in navigator;
    },
    async geocodeAsync() {
        throw new GeocoderError();
    },
    async reverseGeocodeAsync() {
        throw new GeocoderError();
    },
    async watchPositionImplAsync(watchId, options) {
        return new Promise(resolve => {
            // @ts-ignore: the types here need to be fixed
            watchId = global.navigator.geolocation.watchPosition(position => {
                lastKnownPosition = geolocationPositionToJSON(position);
                LocationEventEmitter.emit('Expo.locationChanged', {
                    watchId,
                    location: lastKnownPosition,
                });
            }, undefined, 
            // @ts-ignore: the options object needs to be fixed
            options);
            resolve(watchId);
        });
    },
    getPermissionsAsync,
    async requestPermissionsAsync() {
        return getPermissionsAsync();
    },
    async requestForegroundPermissionsAsync() {
        return getPermissionsAsync();
    },
    async requestBackgroundPermissionsAsync() {
        return getPermissionsAsync();
    },
    async getForegroundPermissionsAsync() {
        return getPermissionsAsync();
    },
    async getBackgroundPermissionsAsync() {
        return getPermissionsAsync();
    },
    // no-op
    startObserving() { },
    stopObserving() { },
};
//# sourceMappingURL=ExpoLocation.web.js.map