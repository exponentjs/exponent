"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-av/package.json');
const MICROPHONE_USAGE = 'Allow $(PRODUCT_NAME) to access your microphone';
const withAV = (config, { microphonePermission } = {}) => {
    if (microphonePermission === false) {
        return config;
    }
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    config.ios.infoPlist.NSMicrophoneUsageDescription =
        microphonePermission || config.ios.infoPlist.NSMicrophoneUsageDescription || MICROPHONE_USAGE;
    return config_plugins_1.AndroidConfig.Permissions.withPermissions(config, ['android.permission.RECORD_AUDIO']);
};
exports.default = config_plugins_1.createRunOncePlugin(withAV, pkg.name, pkg.version);
