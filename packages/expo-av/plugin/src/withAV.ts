import { AndroidConfig, ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-av/package.json');

const MICROPHONE_USAGE = 'Allow $(PRODUCT_NAME) to access your microphone';

const withAV: ConfigPlugin<{ microphonePermission?: string | false } | void> = (
  config,
  { microphonePermission } = {}
) => {
  if (microphonePermission === false) {
    return config;
  }

  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  config.ios.infoPlist.NSMicrophoneUsageDescription =
    microphonePermission || config.ios.infoPlist.NSMicrophoneUsageDescription || MICROPHONE_USAGE;

  return AndroidConfig.Permissions.withPermissions(config, ['android.permission.RECORD_AUDIO']);
};

export default createRunOncePlugin(withAV, pkg.name, pkg.version);
