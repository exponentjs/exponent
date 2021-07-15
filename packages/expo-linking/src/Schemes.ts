import { Platform } from '@unimodules/core';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const LINKING_GUIDE_URL = `https://docs.expo.io/guides/linking/`;

export function hasCustomScheme(): boolean {
  if (Constants.executionEnvironment === ExecutionEnvironment.Bare) {
    // Bare always uses a custom scheme.
    return true;
  } else if (Constants.executionEnvironment === ExecutionEnvironment.Standalone) {
    // Standalone uses a custom scheme when one is defined.
    const manifestSchemes = collectManifestSchemes();
    return !!manifestSchemes.length;
  }
  // Store client uses the default scheme.
  return false;
}

type SchemeConfig = {
  scheme?: string | string[];
};

function getSchemes(config: SchemeConfig | null | undefined): string[] {
  if (config) {
    if (Array.isArray(config.scheme)) {
      const validate = (value: any): value is string => {
        return typeof value === 'string';
      };
      return config.scheme.filter<string>(validate);
    } else if (typeof config.scheme === 'string') {
      return [config.scheme];
    }
  }
  return [];
}

// Valid schemes for the Expo client.
const EXPO_CLIENT_SCHEMES = Platform.select({
  // Results from `npx uri-scheme list --info-path ios/Exponent/Supporting/Info.plist`
  ios: [
    'exp',
    'exps',
    'fb1696089354000816',
    'host.exp.exponent',
    'com.googleusercontent.apps.603386649315-vp4revvrcgrcjme51ebuhbkbspl048l9',
  ],
  // Collected manually
  android: ['exp', 'exps'],
});

/**
 * Collect a list of platform schemes from the manifest.
 *
 * This method is based on the `Scheme` modules from `@expo/config-plugins`
 * which are used for collecting the schemes before prebuilding a native app.
 *
 * - iOS: scheme -> ios.scheme -> ios.bundleIdentifier
 * - Android: scheme -> android.scheme -> android.package
 */
export function collectManifestSchemes(): string[] {
  // ios.scheme, android.scheme, and scheme as an array are not yet added to the
  // Expo config spec, but there's no harm in adding them early.
  // They'll be added when we drop support for `expo build` or decide
  // to have them only work with `eas build`.
  const platformManifest =
    (Platform.select<any>({
      ios: Constants.manifest?.ios ?? Constants.manifest2?.extra?.expoClient?.ios,
      android: Constants.manifest?.android ?? Constants.manifest2?.extra?.expoClient?.android,
      web: {},
    }) as SchemeConfig) ?? {};

  const schemes = getSchemes(Constants.manifest ?? Constants.manifest2?.extra?.expoClient);

  // Add the detached scheme after the manifest scheme for legacy ExpoKit support.
  if (Constants.manifest?.detach?.scheme) {
    schemes.push(Constants.manifest.detach.scheme);
  }
  if (Constants.manifest2?.extra?.expoClient?.detach?.scheme) {
    schemes.push(Constants.manifest2.extra.expoClient.detach.scheme);
  }

  // Add the unimplemented platform schemes last.
  schemes.push(...getSchemes(platformManifest));

  return schemes;
}

function getNativeAppIdScheme(): string | null {
  // Add the native application identifier to the list of schemes for parity with `expo build`.
  // The native app id has been added to builds for a long time to support Google Sign-In.
  return (
    Platform.select({
      ios:
        Constants.manifest?.ios?.bundleIdentifier ??
        Constants.manifest2?.extra?.expoClient?.ios?.bundleIdentifier,
      // TODO: This may change to android.applicationId in the future.
      android:
        Constants.manifest?.android?.package ??
        Constants.manifest2?.extra?.expoClient?.android?.package,
    }) ?? null
  );
}

export function hasConstantsManifest(): boolean {
  // Ensure the user has linked the expo-constants manifest in bare workflow.
  return (
    !!Object.keys(Constants.manifest ?? {}).length ||
    !!Object.keys(Constants.manifest2 ?? {}).length
  );
}

export function resolveScheme(props: { scheme?: string; isSilent?: boolean }): string {
  if (
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
    !hasConstantsManifest()
  ) {
    throw new Error(
      `expo-linking needs access to the expo-constants manifest (app.json or app.config.js) to determine what URI scheme to use. Setup the manifest and rebuild: https://github.com/expo/expo/blob/master/packages/expo-constants/README.md`
    );
  }

  const manifestSchemes = collectManifestSchemes();
  const nativeAppId = getNativeAppIdScheme();

  if (!manifestSchemes.length) {
    if (__DEV__ && !props.isSilent) {
      // Assert a config warning if no scheme is setup yet. `isSilent` is used for warnings, but we'll ignore it for exceptions.
      console.warn(
        `Linking requires a build-time setting \`scheme\` in the project's Expo config (app.config.js or app.json) for production apps, if it's left blank, your app may crash. The scheme does not apply to development in the Expo client but you should add it as soon as you start working with Linking to avoid creating a broken build. Learn more: ${LINKING_GUIDE_URL}`
      );
    } else if (!__DEV__ || Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
      // Throw in production or when not in store client. Use the __DEV__ flag so users can test this functionality with `expo start --no-dev`,
      throw new Error(
        'Cannot make a deep link into a standalone app with no custom scheme defined'
      );
    }
  }

  // In the Expo client...
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    if (props.scheme) {
      // This enables users to use the fb or google redirects on iOS in the Expo client.
      if (EXPO_CLIENT_SCHEMES.includes(props.scheme)) {
        return props.scheme;
      }
      // Silently ignore to make bare workflow development easier.
    }
    // Fallback to the default client scheme.
    return 'exp';
  }

  const schemes = [...manifestSchemes, nativeAppId].filter(Boolean);

  if (props.scheme) {
    if (__DEV__) {
      // Bare workflow development assertion about the provided scheme matching the Expo config.
      if (!schemes.includes(props.scheme) && !props.isSilent) {
        // TODO: Will this cause issues for things like Facebook or Google that use `reversed-client-id://` or `fb<FBID>:/`?
        // Traditionally these APIs don't use the Linking API directly.
        console.warn(
          `The provided Linking scheme '${
            props.scheme
          }' does not appear in the list of possible URI schemes in your Expo config. Expected one of: ${schemes
            .map(scheme => `'${scheme}'`)
            .join(', ')}`
        );
      }
    }
    // Return the user provided value.
    return props.scheme;
  }
  // If no scheme is provided, we'll guess what the scheme is based on the manifest.
  // This is to attempt to keep managed apps working across expo build and EAS build.
  // EAS build ejects the app before building it so we can assume that the user will
  // be using one of defined schemes.

  // If the native app id is the only scheme,
  if (!!nativeAppId && !manifestSchemes.length && !props.isSilent) {
    // Assert a config warning if no scheme is setup yet.
    // This warning only applies to managed workflow EAS apps, as bare workflow
    console.warn(
      `Linking requires a build-time setting \`scheme\` in the project's Expo config (app.config.js or app.json) for bare or production apps. Manually providing a \`scheme\` property can circumvent this warning. Using native app identifier as the scheme '${nativeAppId}'. Learn more: ${LINKING_GUIDE_URL}`
    );
    return nativeAppId;
  }
  // When the native app id is defined, it'll be added to the list of schemes, for most
  // users this will be unexpected behavior and cause all apps to warn when the Linking API
  // is used without a predefined scheme. For now, if the native app id is defined, require
  // at least one more scheme to be added before throwing a warning.
  // i.e. `scheme: ['foo', 'bar']` (unimplemented functionality).
  const [scheme, ...extraSchemes] = manifestSchemes;

  if (!scheme) {
    const errorMessage = `Linking requires a build-time setting \`scheme\` in the project's Expo config (app.config.js or app.json) for bare or production apps. Manually providing a \`scheme\` property can circumvent this error. Learn more: ${LINKING_GUIDE_URL}`;
    // Throw in production, use the __DEV__ flag so users can test this functionality with `expo start --no-dev`
    throw new Error(errorMessage);
  }
  if (extraSchemes.length && !props.isSilent) {
    console.warn(
      `Linking found multiple possible URI schemes in your Expo config.\nUsing '${scheme}'. Ignoring: ${[
        ...extraSchemes,
        nativeAppId,
      ]
        .filter(Boolean)
        .join(', ')}.\nPlease supply the preferred URI scheme to the Linking API.`
    );
  }
  return scheme;
}
