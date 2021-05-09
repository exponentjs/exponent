import { ConfigPlugin } from '@expo/config-plugins';
import { InfoPlist } from '@expo/config-plugins/build/ios/IosConfig.types';
import { ExpoConfig } from '@expo/config-types';
export declare const withAdMobIOS: ConfigPlugin;
export declare function getGoogleMobileAdsAppId(config: Pick<ExpoConfig, 'ios'>): string | null;
export declare function setGoogleMobileAdsAppId(config: Pick<ExpoConfig, 'ios'>, { GADApplicationIdentifier, ...infoPlist }: InfoPlist): InfoPlist;
export declare const withUserTrackingPermission: ConfigPlugin<{
    userTrackingPermission?: string | false;
} | void>;
