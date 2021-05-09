"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-brightness/package.json');
const withBrightness = config => {
    // TODO: Disable prop?
    return config_plugins_1.AndroidConfig.Permissions.withPermissions(config, ['android.permission.WRITE_SETTINGS']);
};
exports.default = config_plugins_1.createRunOncePlugin(withBrightness, pkg.name, pkg.version);
