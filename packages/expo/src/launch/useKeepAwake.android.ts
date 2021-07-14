import { useEffect } from 'react';

// This hook can be optionally imported because __DEV__ never changes during runtime.
// Using __DEV__ like this enables tree shaking to remove the hook in production.
export let useDevKeepAwake: (tag?: string) => void;

if (__DEV__) {
  try {
    // Optionally import expo-keep-awake
    const { activateKeepAwake } = require('expo-keep-awake');
    // Using `useKeepAwake` throws an exception when the app is closed on Android.
    // On app close, the `currentActivity` is null and deactivating will always throw.
    // With the `FLAG_KEEP_SCREEN_ON` we also don't need to release the lock.
    useDevKeepAwake = (tag?: string) => {
      useEffect(() => activateKeepAwake(tag), [tag]);
    };
  } catch {}
}
