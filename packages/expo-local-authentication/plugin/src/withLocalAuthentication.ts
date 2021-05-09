import { AndroidConfig, ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-local-authentication/package.json');
const FACE_ID_USAGE = 'Allow $(PRODUCT_NAME) to use Face ID';

const withLocalAuthentication: ConfigPlugin<{ faceIDPermission?: string | false } | void> = (
  config,
  { faceIDPermission } = {}
) => {
  if (faceIDPermission === false) {
    return config;
  }

  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  config.ios.infoPlist.NSFaceIDUsageDescription =
    faceIDPermission || config.ios.infoPlist.NSFaceIDUsageDescription || FACE_ID_USAGE;

  return AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.USE_BIOMETRIC',
    'android.permission.USE_FINGERPRINT',
  ]);
};

export default createRunOncePlugin(withLocalAuthentication, pkg.name, pkg.version);
