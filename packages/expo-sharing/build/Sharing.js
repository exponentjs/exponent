import { UnavailabilityError } from '@unimodules/core';
import Sharing from './ExpoSharing';
/**
 * Determine if the sharing API can be used in this app.
 * @return A promise that resolves to `true` if the sharing API can be used, and `false` otherwise.
 */
export async function isAvailableAsync() {
    if (Sharing) {
        if (Sharing.isAvailableAsync) {
            return await Sharing.isAvailableAsync();
        }
        return true;
    }
    return false;
}
/**
 * Opens action sheet to share file to different applications which can handle this type of file.
 * @param url Local file URL to share.
 * @param options A map of share options.
 */
export async function shareAsync(url, options = {}) {
    if (!Sharing || !Sharing.shareAsync) {
        throw new UnavailabilityError('Sharing', 'shareAsync');
    }
    return await Sharing.shareAsync(url, options);
}
//# sourceMappingURL=Sharing.js.map