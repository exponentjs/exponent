import { AndroidConfig, ConfigPlugin } from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';
export declare const withFacebookAppIdString: ConfigPlugin;
export declare const withFacebookManifest: ConfigPlugin;
declare type ExpoConfigFacebook = Pick<ExpoConfig, 'facebookScheme' | 'facebookAdvertiserIDCollectionEnabled' | 'facebookAppId' | 'facebookAutoInitEnabled' | 'facebookAutoLogAppEventsEnabled' | 'facebookDisplayName'>;
export declare function getFacebookScheme(config: ExpoConfigFacebook): string | null;
export declare function getFacebookAppId(config: ExpoConfigFacebook): string | null;
export declare function getFacebookDisplayName(config: ExpoConfigFacebook): string | null;
export declare function getFacebookAutoInitEnabled(config: ExpoConfigFacebook): boolean | null;
export declare function getFacebookAutoLogAppEvents(config: ExpoConfigFacebook): boolean | null;
export declare function getFacebookAdvertiserIDCollection(config: ExpoConfigFacebook): boolean | null;
export declare function setFacebookAppIdString(config: ExpoConfigFacebook, projectRoot: string): Promise<boolean>;
export declare function setFacebookConfig(config: ExpoConfigFacebook, androidManifest: AndroidConfig.Manifest.AndroidManifest): AndroidConfig.Manifest.AndroidManifest;
export {};
