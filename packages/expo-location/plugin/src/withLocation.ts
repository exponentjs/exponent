import { AndroidConfig, ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-location/package.json');
const LOCATION_USAGE = 'Allow $(PRODUCT_NAME) to access your location';

const withLocation: ConfigPlugin<{
  locationAlwaysAndWhenInUsePermission?: string | false;
  locationAlwaysPermission?: string | false;
  locationWhenInUsePermission?: string | false;
  isAndroidBackgroundLocationEnabled?: boolean;
} | void> = (
  config,
  {
    locationAlwaysAndWhenInUsePermission,
    locationAlwaysPermission,
    locationWhenInUsePermission,
    isAndroidBackgroundLocationEnabled,
  } = {}
) => {
  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};

  if (locationAlwaysAndWhenInUsePermission !== false) {
    config.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription =
      locationAlwaysAndWhenInUsePermission ||
      config.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription ||
      LOCATION_USAGE;
  }
  if (locationAlwaysPermission !== false) {
    config.ios.infoPlist.NSLocationAlwaysUsageDescription =
      locationAlwaysPermission ||
      config.ios.infoPlist.NSLocationAlwaysUsageDescription ||
      LOCATION_USAGE;
  }
  if (locationWhenInUsePermission !== false) {
    config.ios.infoPlist.NSLocationWhenInUseUsageDescription =
      locationWhenInUsePermission ||
      config.ios.infoPlist.NSLocationWhenInUseUsageDescription ||
      LOCATION_USAGE;
  }

  return AndroidConfig.Permissions.withPermissions(
    config,
    [
      'android.permission.FOREGROUND_SERVICE',
      locationWhenInUsePermission !== false && 'android.permission.ACCESS_COARSE_LOCATION',
      locationWhenInUsePermission !== false && 'android.permission.ACCESS_FINE_LOCATION',
      // Optional
      isAndroidBackgroundLocationEnabled && 'android.permission.ACCESS_BACKGROUND_LOCATION',
    ].filter(Boolean) as string[]
  );
};

export default createRunOncePlugin(withLocation, pkg.name, pkg.version);
