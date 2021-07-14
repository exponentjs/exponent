// This hook can be optionally imported because __DEV__ never changes during runtime.
// Using __DEV__ like this enables tree shaking to remove the hook in production.
export let useDevKeepAwake: (tag?: string) => void;

if (__DEV__) {
  try {
    // Optionally import expo-keep-awake
    const { useKeepAwake } = require('expo-keep-awake');
    useDevKeepAwake = useKeepAwake;
  } catch {}
}
