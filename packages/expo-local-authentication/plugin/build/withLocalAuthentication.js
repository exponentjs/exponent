"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-local-authentication/package.json');
const FACE_ID_USAGE = 'Allow $(PRODUCT_NAME) to use Face ID';
const withLocalAuthentication = (config, { faceIDPermission } = {}) => {
    if (faceIDPermission === false) {
        return config;
    }
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    config.ios.infoPlist.NSFaceIDUsageDescription =
        faceIDPermission || config.ios.infoPlist.NSFaceIDUsageDescription || FACE_ID_USAGE;
    return config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        'android.permission.USE_BIOMETRIC',
        'android.permission.USE_FINGERPRINT',
    ]);
};
exports.default = config_plugins_1.createRunOncePlugin(withLocalAuthentication, pkg.name, pkg.version);
