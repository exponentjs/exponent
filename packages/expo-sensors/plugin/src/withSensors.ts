import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-sensors/package.json');
const MOTION_USAGE = 'Allow $(PRODUCT_NAME) to access your device motion';

const withSensors: ConfigPlugin<{ motionPermission?: string | boolean } | void> = (
  config,
  { motionPermission } = {}
) => {
  if (motionPermission === false) {
    return config;
  }
  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  config.ios.infoPlist.NSMotionUsageDescription =
    motionPermission || config.ios.infoPlist.NSMotionUsageDescription || MOTION_USAGE;

  return config;
};

export default createRunOncePlugin(withSensors, pkg.name, pkg.version);
