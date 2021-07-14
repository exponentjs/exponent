import {
  AndroidConfig,
  ConfigPlugin,
  createRunOncePlugin,
  withInfoPlist,
} from '@expo/config-plugins';

const pkg = require('expo-av/package.json');

const MICROPHONE_USAGE = 'Allow $(PRODUCT_NAME) to access your microphone';

const withAV: ConfigPlugin<{ microphonePermission?: string | false } | void> = (
  config,
  { microphonePermission } = {}
) => {
  if (microphonePermission !== false) {
    config = withInfoPlist(config, config => {
      config.modResults.NSMicrophoneUsageDescription =
        microphonePermission || config.modResults.NSMicrophoneUsageDescription || MICROPHONE_USAGE;
      return config;
    });
  }

  return AndroidConfig.Permissions.withPermissions(
    config,
    [
      microphonePermission !== false && 'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
    ].filter(Boolean) as string[]
  );
};

export default createRunOncePlugin(withAV, pkg.name, pkg.version);
