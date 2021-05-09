import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

import { withAdMobAndroid } from './withAdMobAndroid';
import { withAdMobIOS, withUserTrackingPermission } from './withAdMobIOS';
import { withSKAdNetworkIdentifiers } from './withSKAdNetworkIdentifiers';

const pkg = require('expo-ads-admob/package.json');

const withAdMob: ConfigPlugin<{
  /**
   * Sets the iOS `NSUserTrackingUsageDescription` permission message in the `Info.plist`.
   * Passing `false` will skip adding the permission.
   * @default 'This identifier will be used to deliver personalized ads to you.'
   */
  userTrackingPermission?: string | false;
} | void> = (config, props) => {
  config = withAdMobAndroid(config);
  config = withAdMobIOS(config);
  config = withUserTrackingPermission(config, props);
  // https://developers.google.com/admob/ios/ios14
  config = withSKAdNetworkIdentifiers(config, ['cstr6suwn9.skadnetwork']);
  return config;
};

export default createRunOncePlugin(withAdMob, pkg.name, pkg.version);
