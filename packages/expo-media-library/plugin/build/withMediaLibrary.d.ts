import { ConfigPlugin, AndroidConfig } from '@expo/config-plugins';
export declare function modifyAndroidManifest(manifest: AndroidConfig.Manifest.AndroidManifest): AndroidConfig.Manifest.AndroidManifest;
declare const _default: ConfigPlugin<void | {
    photosPermission?: string | false | undefined;
    savePhotosPermission?: string | false | undefined;
}>;
export default _default;
