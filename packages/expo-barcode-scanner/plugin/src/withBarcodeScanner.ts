import { AndroidConfig, ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-barcode-scanner/package.json');

const CAMERA_USAGE = 'Allow $(PRODUCT_NAME) to access your camera';
const MICROPHONE_USAGE = 'Allow $(PRODUCT_NAME) to access your microphone';

const withBarcodeScanner: ConfigPlugin<{
  microphonePermission?: string | false;
  cameraPermission?: string | false;
} | void> = (config, { microphonePermission, cameraPermission } = {}) => {
  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  if (cameraPermission !== false) {
    config.ios.infoPlist.NSCameraUsageDescription =
      cameraPermission || config.ios.infoPlist.NSCameraUsageDescription || CAMERA_USAGE;
  }
  if (microphonePermission !== false) {
    config.ios.infoPlist.NSMicrophoneUsageDescription =
      microphonePermission || config.ios.infoPlist.NSMicrophoneUsageDescription || MICROPHONE_USAGE;
  }

  return AndroidConfig.Permissions.withPermissions(
    config,
    [
      cameraPermission !== false && 'android.permission.CAMERA',
      // TODO: Is microphone needed?
    ].filter(Boolean) as string[]
  );
};

export default createRunOncePlugin(withBarcodeScanner, pkg.name, pkg.version);
