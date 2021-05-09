"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-sensors/package.json');
const MOTION_USAGE = 'Allow $(PRODUCT_NAME) to access your device motion';
const withSensors = (config, { motionPermission } = {}) => {
    if (motionPermission === false) {
        return config;
    }
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    config.ios.infoPlist.NSMotionUsageDescription =
        motionPermission || config.ios.infoPlist.NSMotionUsageDescription || MOTION_USAGE;
    return config;
};
exports.default = config_plugins_1.createRunOncePlugin(withSensors, pkg.name, pkg.version);
