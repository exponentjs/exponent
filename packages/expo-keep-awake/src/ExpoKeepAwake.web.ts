import { CodedError } from '@unimodules/core';

import { KeepAwakeEventType } from './ExpoKeepAwake.types';

const wakeLockMap: Record<string, any> = {};
export default {
  async isAvailableAsync() {
    return 'wakeLock' in navigator;
  },
  async activate(tag: string) {
    if (wakeLockMap[tag]) {
      throw new CodedError(
        'ERR_KEEP_AWAKE_TAG_INVALID',
        `The wake lock with tag ${tag} has not activated yet`
      );
    }

    const wakeLock = await (navigator as any).wakeLock.request('screen');
    wakeLockMap[tag] = wakeLock;
  },
  async deactivate(tag: string) {
    if (wakeLockMap[tag]) {
      wakeLockMap[tag].release();
      wakeLockMap[tag] = null;
    } else {
      throw new CodedError(
        'ERR_KEEP_AWAKE_TAG_INVALID',
        `The wake lock with tag ${tag} has not activated yet`
      );
    }
  },
  addListener(tag: string, listener: (eventType: KeepAwakeEventType) => void) {
    if (wakeLockMap[tag]) {
      wakeLockMap[tag].addEventListener('release', () => {
        listener(KeepAwakeEventType.RELEASE);
      });
    }
  },
};
