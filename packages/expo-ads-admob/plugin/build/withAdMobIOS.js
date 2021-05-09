"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUserTrackingPermission = exports.setGoogleMobileAdsAppId = exports.getGoogleMobileAdsAppId = exports.withAdMobIOS = void 0;
const config_plugins_1 = require("@expo/config-plugins");
exports.withAdMobIOS = config => {
    return config_plugins_1.withInfoPlist(config, config => {
        config.modResults = setAdMobConfig(config, config.modResults);
        return config;
    });
};
// NOTE(brentvatne): if the developer has installed the google ads sdk and does
// not provide an app id their app will crash. Standalone apps get around this by
// providing some default value, we will instead here assume that the user can
// do the right thing if they have installed the package. This is a slight discrepancy
// that arises in ejecting because it's possible for the package to be installed and
// not crashing in the managed workflow, then you eject and the app crashes because
// you don't have an id to fall back to.
function getGoogleMobileAdsAppId(config) {
    var _a, _b, _c;
    return (_c = (_b = (_a = config.ios) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.googleMobileAdsAppId) !== null && _c !== void 0 ? _c : null;
}
exports.getGoogleMobileAdsAppId = getGoogleMobileAdsAppId;
function setGoogleMobileAdsAppId(config, { GADApplicationIdentifier, ...infoPlist }) {
    const appId = getGoogleMobileAdsAppId(config);
    if (appId === null) {
        return infoPlist;
    }
    return {
        ...infoPlist,
        GADApplicationIdentifier: appId,
    };
}
exports.setGoogleMobileAdsAppId = setGoogleMobileAdsAppId;
function setAdMobConfig(config, infoPlist) {
    infoPlist = setGoogleMobileAdsAppId(config, infoPlist);
    return infoPlist;
}
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
