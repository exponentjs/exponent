"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUserTrackingPermission = void 0;
const USER_TRACKING = 'This identifier will be used to deliver personalized ads to you.';
exports.withUserTrackingPermission = (config, { userTrackingPermission } = {}) => {
    if (userTrackingPermission === false) {
        return config;
    }
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    config.ios.infoPlist.NSUserTrackingUsageDescription =
        userTrackingPermission || config.ios.infoPlist.NSUserTrackingUsageDescription || USER_TRACKING;
    return config;
};
