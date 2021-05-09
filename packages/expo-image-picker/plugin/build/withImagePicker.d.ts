import { ConfigPlugin, AndroidConfig } from '@expo/config-plugins';
export declare function setImagePickerManifestActivity(androidManifest: AndroidConfig.Manifest.AndroidManifest): AndroidConfig.Manifest.AndroidManifest;
declare const _default: ConfigPlugin<void | {
    photosPermission?: string | false | undefined;
    cameraPermission?: string | false | undefined;
    microphonePermission?: string | false | undefined;
}>;
export default _default;
