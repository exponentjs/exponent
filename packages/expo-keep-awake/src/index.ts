import { useEffect } from 'react';

import ExpoKeepAwake from './ExpoKeepAwake';
import { KeepAwakeEventType } from './ExpoKeepAwake.types';

const ExpoKeepAwakeTag = 'ExpoKeepAwakeDefaultTag';

export async function isAvailableAsync(): Promise<boolean> {
  if (ExpoKeepAwake.isAvailableAsync) {
    return await ExpoKeepAwake.isAvailableAsync();
  }
  return false;
}

export function useKeepAwake(tag: string = ExpoKeepAwakeTag): void {
  useEffect(() => {
    activateKeepAwake(tag);
    return () => {
      deactivateKeepAwake(tag);
    };
  }, [tag]);
}

export async function activateKeepAwake(tag: string = ExpoKeepAwakeTag): Promise<void> {
  if (!(await isAvailableAsync())) {
    if (__DEV__) {
      console.warn(
        `KeepAwake.activateKeepAwake() was invoked on a device that doesn't support the KeepAwake API.`
      );
    }
    return;
  }
  if (ExpoKeepAwake.activate) {
    await ExpoKeepAwake.activate(tag);
  }
}

export async function deactivateKeepAwake(tag: string = ExpoKeepAwakeTag): Promise<void> {
  if (!(await isAvailableAsync())) {
    if (__DEV__) {
      console.warn(
        `KeepAwake.activateKeepAwake() was invoked on a device that doesn't support the KeepAwake API.`
      );
    }
    return;
  }
  if (ExpoKeepAwake.deactivate) {
    await ExpoKeepAwake.deactivate(tag);
  }
}

export function addEventListener(tag: string, listener: (eventType: KeepAwakeEventType) => void) {
  if (ExpoKeepAwake.addListener) {
    ExpoKeepAwake.addListener(tag, listener);
  }
}

export { KeepAwakeEventType };
