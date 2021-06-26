import { UnavailabilityError } from '@unimodules/core';

import ExpoSplashScreen from './ExpoSplashScreen';

// @needsAudit
/**
 * Controls whether the native splash screen (configured in `app.json`), not yet shown, will remain visible until `hideAsync` is called.
 */
export async function setSplashScreenAutoHideEnabled(
  splashScreenAutoHideEnabled: boolean
): Promise<boolean> {
  if (!ExpoSplashScreen.setSplashScreenAutoHideEnabled) {
    throw new UnavailabilityError('expo-splash-screen', 'setSplashScreenAutoHideEnabled');
  }
  return await ExpoSplashScreen.setSplashScreenAutoHideEnabled(splashScreenAutoHideEnabled);
}

// @needsAudit
/**
 * Makes the native splash screen (configured in `app.json`) remain visible until `hideAsync` is called.
 */
export async function preventAutoHideAsync(): Promise<boolean> {
  if (!ExpoSplashScreen.preventAutoHideAsync) {
    throw new UnavailabilityError('expo-splash-screen', 'preventAutoHideAsync');
  }
  return await ExpoSplashScreen.preventAutoHideAsync();
}

// @needsAudit
/**
 * Hides the native splash screen immediately. Be careful to ensure that your app has content ready
 * to display when you hide the splash screen, or you may see a blank screen briefly. See the
 * ["Usage"](#usage) section for an example.
 */
export async function hideAsync(): Promise<boolean> {
  if (!ExpoSplashScreen.hideAsync) {
    throw new UnavailabilityError('expo-splash-screen', 'hideAsync');
  }
  return await ExpoSplashScreen.hideAsync();
}

/**
 * @deprecated Use `SplashScreen.hideAsync()` instead
 * @ignore
 */
export function hide(): void {
  console.warn('SplashScreen.hide() is deprecated in favour of SplashScreen.hideAsync()');
  hideAsync();
}

/**
 * @deprecated Use `SplashScreen.preventAutoHideAsync()` instead
 * @ignore
 */
export function preventAutoHide(): void {
  console.warn(
    'SplashScreen.preventAutoHide() is deprecated in favour of SplashScreen.preventAutoHideAsync()'
  );
  preventAutoHideAsync();
}
