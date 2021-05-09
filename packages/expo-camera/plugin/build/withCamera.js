"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGradleMaven = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-camera/package.json');
const CAMERA_USAGE = 'Allow $(PRODUCT_NAME) to access your camera';
const MICROPHONE_USAGE = 'Allow $(PRODUCT_NAME) to access your microphone';
// Because we need the package to be added AFTER the React and Google maven packages, we create a new allprojects.
// It's ok to have multiple allprojects.repositories, so we create a new one since it's cheaper than tokenizing
// the existing block to find the correct place to insert our camera maven.
const gradleMaven = 'allprojects { repositories { maven { url "$rootDir/../node_modules/expo-camera/android/maven" } } }';
const withAndroidCameraGradle = config => {
    return config_plugins_1.withProjectBuildGradle(config, config => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = setGradleMaven(config.modResults.contents);
        }
        else {
            throw new Error('Cannot add camera maven gradle because the build.gradle is not groovy');
        }
        return config;
    });
};
function setGradleMaven(buildGradle) {
    // If this specific line is present, skip.
    // This also enables users in bare workflow to comment out the line to prevent expo-camera from adding it back.
    if (buildGradle.includes('expo-camera/android/maven')) {
        return buildGradle;
    }
    return buildGradle + `\n${gradleMaven}\n`;
}
exports.setGradleMaven = setGradleMaven;
const withCamera = (config, { cameraPermission, microphonePermission } = {}) => {
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    if (cameraPermission !== false) {
        config.ios.infoPlist.NSCameraUsageDescription =
            cameraPermission || config.ios.infoPlist.NSCameraUsageDescription || CAMERA_USAGE;
    }
    if (microphonePermission !== false) {
        config.ios.infoPlist.NSMicrophoneUsageDescription =
            microphonePermission || config.ios.infoPlist.NSMicrophoneUsageDescription || MICROPHONE_USAGE;
    }
    return config_plugins_1.withPlugins(config, [
        [
            config_plugins_1.AndroidConfig.Permissions.withPermissions,
            [
                cameraPermission !== false && 'android.permission.CAMERA',
                // Optional
                microphonePermission !== false && 'android.permission.RECORD_AUDIO',
            ].filter(Boolean),
        ],
        withAndroidCameraGradle,
    ]);
};
exports.default = config_plugins_1.createRunOncePlugin(withCamera, pkg.name, pkg.version);
