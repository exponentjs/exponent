import { CodedError } from '@unimodules/core';
import { KeepAwakeEventType } from './ExpoKeepAwake.types';
const wakeLockMap = {};
export default {
    async isAvailableAsync() {
        return 'wakeLock' in navigator;
    },
    async activate(tag) {
        if (wakeLockMap[tag]) {
            throw new CodedError('ERR_KEEP_AWAKE_TAG_INVALID', `The wake lock with tag ${tag} has not activated yet`);
        }
        const wakeLock = await navigator.wakeLock.request('screen');
        wakeLockMap[tag] = wakeLock;
    },
    async deactivate(tag) {
        if (wakeLockMap[tag]) {
            wakeLockMap[tag].release();
            wakeLockMap[tag] = null;
        }
        else {
            throw new CodedError('ERR_KEEP_AWAKE_TAG_INVALID', `The wake lock with tag ${tag} has not activated yet`);
        }
    },
    addListener(tag, listener) {
        if (wakeLockMap[tag]) {
            wakeLockMap[tag].addEventListener('release', () => {
                listener(KeepAwakeEventType.RELEASE);
            });
        }
    },
};
//# sourceMappingURL=ExpoKeepAwake.web.js.map