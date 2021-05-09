import { ConfigPlugin, withInfoPlist } from '@expo/config-plugins';
// TODO: export from config-plugins proper
import { InfoPlist } from '@expo/config-plugins/build/ios/IosConfig.types';
import { ExpoConfig } from '@expo/config-types';

export const withAdMobIOS: ConfigPlugin = config => {
  return withInfoPlist(config, config => {
    config.modResults = setAdMobConfig(config, config.modResults);
    return config;
  });
};

// NOTE(brentvatne): if the developer has installed the google ads sdk and does
// not provide an app id their app will crash. Standalone apps get around this by
// providing some default value, we will instead here assume that the user can
// do the right thing if they have installed the package. This is a slight discrepancy
// that arises in ejecting because it's possible for the package to be installed and
// not crashing in the managed workflow, then you eject and the app crashes because
// you don't have an id to fall back to.
export function getGoogleMobileAdsAppId(config: Pick<ExpoConfig, 'ios'>) {
  return config.ios?.config?.googleMobileAdsAppId ?? null;
}

export function setGoogleMobileAdsAppId(
  config: Pick<ExpoConfig, 'ios'>,
  { GADApplicationIdentifier, ...infoPlist }: InfoPlist
): InfoPlist {
  const appId = getGoogleMobileAdsAppId(config);

  if (appId === null) {
    return infoPlist;
  }

  return {
    ...infoPlist,
    GADApplicationIdentifier: appId,
  };
}

function setAdMobConfig(config: Pick<ExpoConfig, 'ios'>, infoPlist: InfoPlist): InfoPlist {
  infoPlist = setGoogleMobileAdsAppId(config, infoPlist);
  return infoPlist;
}

const USER_TRACKING = 'This identifier will be used to deliver personalized ads to you.';

export const withUserTrackingPermission: ConfigPlugin<{
  userTrackingPermission?: string | false;
} | void> = (config, { userTrackingPermission } = {}) => {
  if (userTrackingPermission === false) {
    return config;
  }

  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  config.ios.infoPlist.NSUserTrackingUsageDescription =
    userTrackingPermission || config.ios.infoPlist.NSUserTrackingUsageDescription || USER_TRACKING;

  return config;
};
