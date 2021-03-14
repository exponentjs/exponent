import { NativeModulesProxy } from '@unimodules/core';
import computeMd5 from 'blueimp-md5';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { getManifestBaseUrl } from './AssetUris';
// Constants.appOwnership is only available in managed apps (Expo client and standalone)
export const IS_MANAGED_ENV = !!Constants.appOwnership;
// In the future (SDK38+) expo-updates is likely to be used in managed apps, so we decide
// that you are in a bare app with updates if you're not in a managed app and you have
// local assets available.
export const IS_BARE_ENV_WITH_UPDATES = !IS_MANAGED_ENV &&
    !!NativeModulesProxy.ExpoUpdates?.isEnabled &&
    // if expo-updates is installed but we're running directly from the embedded bundle, we don't want
    // to override the AssetSourceResolver
    !NativeModulesProxy.ExpoUpdates?.isUsingEmbeddedAssets;
export const IS_ENV_WITH_UPDATES_ENABLED = IS_MANAGED_ENV || IS_BARE_ENV_WITH_UPDATES;
// If it's not managed or bare w/ updates, then it must be bare w/o updates!
export const IS_BARE_ENV_WITHOUT_UPDATES = !IS_MANAGED_ENV && !IS_BARE_ENV_WITH_UPDATES;
// Get the localAssets property from the ExpoUpdates native module so that we do
// not need to include expo-updates as a dependency of expo-asset
export function getLocalAssets() {
    return NativeModulesProxy.ExpoUpdates?.localAssets ?? {};
}
export function getManifest() {
    return Constants.manifest ?? {};
}
// Compute manifest base URL if available
export const manifestBaseUrl = Constants.experienceUrl
    ? getManifestBaseUrl(Constants.experienceUrl)
    : null;
// TODO: how should this behave in bare app with updates? re: hashAssetFiles
export async function downloadAsync(uri, hash, type, name) {
    if (IS_MANAGED_ENV || hash !== null) {
        return _downloadAsyncWithIntegrityCheck(uri, hash, type, name);
    }
    return _downloadAsyncWithoutIntegrityCheck(uri, hash, type);
}
/**
 * Check if the file exists on disk already, perform integrity check if so.
 * Otherwise, download it.
 */
async function _downloadAsyncWithIntegrityCheck(uri, hash, type, name) {
    const cacheFileId = hash || computeMd5(uri);
    const localUri = `${FileSystem.cacheDirectory}ExponentAsset-${cacheFileId}.${type}`;
    let { exists, md5 } = await FileSystem.getInfoAsync(localUri, {
        md5: true,
    });
    if (!exists || (hash !== null && md5 !== hash)) {
        ({ md5 } = await FileSystem.downloadAsync(uri, localUri, {
            md5: true,
        }));
        if (hash !== null && md5 !== hash) {
            throw new Error(`Downloaded file for asset '${name}.${type}' ` +
                `Located at ${uri} ` +
                `failed MD5 integrity check`);
        }
    }
    return localUri;
}
/**
 * Just download the asset, don't perform integrity check because we don't have
 * the hash to compare it with (we don't have hashAssetFiles plugin). Hash is
 * only used for the file name.
 */
async function _downloadAsyncWithoutIntegrityCheck(uri, hash, type) {
    // TODO: does this make sense to bail out if it's already at a file URL
    // because it's already available locally?
    if (uri.startsWith('file://')) {
        return uri;
    }
    const cacheFileId = hash || computeMd5(uri);
    const localUri = `${FileSystem.cacheDirectory}ExponentAsset-${cacheFileId}.${type}`;
    // We don't check the FileSystem for an existing version of the asset and we
    // also don't perform an integrity check!
    await FileSystem.downloadAsync(uri, localUri);
    return localUri;
}
//# sourceMappingURL=PlatformUtils.js.map