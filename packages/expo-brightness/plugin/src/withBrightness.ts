import { ConfigPlugin, AndroidConfig, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-brightness/package.json');

const withBrightness: ConfigPlugin = config => {
  // TODO: Disable prop?
  return AndroidConfig.Permissions.withPermissions(config, ['android.permission.WRITE_SETTINGS']);
};

export default createRunOncePlugin(withBrightness, pkg.name, pkg.version);
