"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyAndroidManifest = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-media-library/package.json');
const READ_PHOTOS_USAGE = 'Allow $(PRODUCT_NAME) to access your photos';
const WRITE_PHOTOS_USAGE = 'Allow $(PRODUCT_NAME) to save photos';
function modifyAndroidManifest(manifest) {
    // Starting with Android 10, the concept of scoped storage is introduced.
    // Currently, to make expo-media-library working with that change, you have to add
    // android:requestLegacyExternalStorage="true" to AndroidManifest.xml:
    const app = config_plugins_1.AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.$['android:requestLegacyExternalStorage'] = 'true';
    return manifest;
}
exports.modifyAndroidManifest = modifyAndroidManifest;
const withMediaLibraryExternalStorage = config => {
    return config_plugins_1.withAndroidManifest(config, async (config) => {
        config.modResults = modifyAndroidManifest(config.modResults);
        return config;
    });
};
const withMediaLibrary = (config, { photosPermission, savePhotosPermission } = {}) => {
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    if (photosPermission !== false) {
        config.ios.infoPlist.NSPhotoLibraryUsageDescription =
            photosPermission || config.ios.infoPlist.NSPhotoLibraryUsageDescription || READ_PHOTOS_USAGE;
    }
    if (savePhotosPermission !== false) {
        config.ios.infoPlist.NSPhotoLibraryAddUsageDescription =
            savePhotosPermission ||
                config.ios.infoPlist.NSPhotoLibraryAddUsageDescription ||
                WRITE_PHOTOS_USAGE;
    }
    config = config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        photosPermission !== false && 'android.permission.READ_EXTERNAL_STORAGE',
        savePhotosPermission !== false && 'android.permission.WRITE_EXTERNAL_STORAGE',
    ].filter(Boolean));
    config = withMediaLibraryExternalStorage(config);
    return config;
};
exports.default = config_plugins_1.createRunOncePlugin(withMediaLibrary, pkg.name, pkg.version);
