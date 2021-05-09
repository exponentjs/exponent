"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-location/package.json');
const LOCATION_USAGE = 'Allow $(PRODUCT_NAME) to access your location';
const withLocation = (config, { locationAlwaysAndWhenInUsePermission, locationAlwaysPermission, locationWhenInUsePermission, isAndroidBackgroundLocationEnabled, } = {}) => {
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    if (locationAlwaysAndWhenInUsePermission !== false) {
        config.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription =
            locationAlwaysAndWhenInUsePermission ||
                config.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription ||
                LOCATION_USAGE;
    }
    if (locationAlwaysPermission !== false) {
        config.ios.infoPlist.NSLocationAlwaysUsageDescription =
            locationAlwaysPermission ||
                config.ios.infoPlist.NSLocationAlwaysUsageDescription ||
                LOCATION_USAGE;
    }
    if (locationWhenInUsePermission !== false) {
        config.ios.infoPlist.NSLocationWhenInUseUsageDescription =
            locationWhenInUsePermission ||
                config.ios.infoPlist.NSLocationWhenInUseUsageDescription ||
                LOCATION_USAGE;
    }
    return config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        'android.permission.FOREGROUND_SERVICE',
        locationWhenInUsePermission !== false && 'android.permission.ACCESS_COARSE_LOCATION',
        locationWhenInUsePermission !== false && 'android.permission.ACCESS_FINE_LOCATION',
        // Optional
        isAndroidBackgroundLocationEnabled && 'android.permission.ACCESS_BACKGROUND_LOCATION',
    ].filter(Boolean));
};
exports.default = config_plugins_1.createRunOncePlugin(withLocation, pkg.name, pkg.version);
