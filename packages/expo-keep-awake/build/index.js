import { useEffect } from 'react';
import ExpoKeepAwake from './ExpoKeepAwake';
import { KeepAwakeEventType } from './ExpoKeepAwake.types';
const ExpoKeepAwakeTag = 'ExpoKeepAwakeDefaultTag';
export async function isAvailableAsync() {
    if (ExpoKeepAwake.isAvailableAsync) {
        return await ExpoKeepAwake.isAvailableAsync();
    }
    return false;
}
export function useKeepAwake(tag = ExpoKeepAwakeTag) {
    useEffect(() => {
        activateKeepAwake(tag);
        return () => {
            deactivateKeepAwake(tag);
        };
    }, [tag]);
}
export async function activateKeepAwake(tag = ExpoKeepAwakeTag) {
    if (!(await isAvailableAsync())) {
        if (__DEV__) {
            console.warn(`KeepAwake.activateKeepAwake() was invoked on a device that doesn't support the KeepAwake API.`);
        }
        return;
    }
    if (ExpoKeepAwake.activate) {
        await ExpoKeepAwake.activate(tag);
    }
}
export async function deactivateKeepAwake(tag = ExpoKeepAwakeTag) {
    if (!(await isAvailableAsync())) {
        if (__DEV__) {
            console.warn(`KeepAwake.activateKeepAwake() was invoked on a device that doesn't support the KeepAwake API.`);
        }
        return;
    }
    if (ExpoKeepAwake.deactivate) {
        await ExpoKeepAwake.deactivate(tag);
    }
}
export function addEventListener(tag, listener) {
    if (ExpoKeepAwake.addListener) {
        ExpoKeepAwake.addListener(tag, listener);
    }
}
export { KeepAwakeEventType };
//# sourceMappingURL=index.js.map