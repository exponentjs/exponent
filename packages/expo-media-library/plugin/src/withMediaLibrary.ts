import {
  ConfigPlugin,
  withAndroidManifest,
  AndroidConfig,
  createRunOncePlugin,
} from '@expo/config-plugins';

const pkg = require('expo-media-library/package.json');

const READ_PHOTOS_USAGE = 'Allow $(PRODUCT_NAME) to access your photos';
const WRITE_PHOTOS_USAGE = 'Allow $(PRODUCT_NAME) to save photos';

export function modifyAndroidManifest(
  manifest: AndroidConfig.Manifest.AndroidManifest
): AndroidConfig.Manifest.AndroidManifest {
  // Starting with Android 10, the concept of scoped storage is introduced.
  // Currently, to make expo-media-library working with that change, you have to add
  // android:requestLegacyExternalStorage="true" to AndroidManifest.xml:
  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  app.$['android:requestLegacyExternalStorage'] = 'true';
  return manifest;
}

const withMediaLibraryExternalStorage: ConfigPlugin = config => {
  return withAndroidManifest(config, async config => {
    config.modResults = modifyAndroidManifest(config.modResults);
    return config;
  });
};

const withMediaLibrary: ConfigPlugin<{
  photosPermission?: string | false;
  savePhotosPermission?: string | false;
} | void> = (config, { photosPermission, savePhotosPermission } = {}) => {
  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
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

  config = AndroidConfig.Permissions.withPermissions(
    config,
    [
      photosPermission !== false && 'android.permission.READ_EXTERNAL_STORAGE',
      savePhotosPermission !== false && 'android.permission.WRITE_EXTERNAL_STORAGE',
    ].filter(Boolean) as string[]
  );

  config = withMediaLibraryExternalStorage(config);

  return config;
};

export default createRunOncePlugin(withMediaLibrary, pkg.name, pkg.version);
