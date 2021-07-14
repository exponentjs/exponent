"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-av/package.json');
const MICROPHONE_USAGE = 'Allow $(PRODUCT_NAME) to access your microphone';
const withAV = (config, { microphonePermission } = {}) => {
    if (microphonePermission !== false) {
        config = config_plugins_1.withInfoPlist(config, config => {
            config.modResults.NSMicrophoneUsageDescription =
                microphonePermission || config.modResults.NSMicrophoneUsageDescription || MICROPHONE_USAGE;
            return config;
        });
    }
    return config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        microphonePermission !== false && 'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
    ].filter(Boolean));
};
exports.default = config_plugins_1.createRunOncePlugin(withAV, pkg.name, pkg.version);
