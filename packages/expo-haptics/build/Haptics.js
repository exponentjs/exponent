import { UnavailabilityError } from '@unimodules/core';
import ExpoHaptics from './ExpoHaptics';
import { NotificationFeedbackType, ImpactFeedbackStyle } from './Haptics.types';
/**
 * Returns whether the Haptics API is enabled on the current device.
 */
export async function isAvailableAsync() {
    return (!!ExpoHaptics.notificationAsync && !!ExpoHaptics.impactAsync && !!ExpoHaptics.selectionAsync);
}
export async function notification(type = NotificationFeedbackType.Success) {
    console.warn('`Haptics.notification` is deprecated. Use `Haptics.notificationAsync` instead.');
    await notificationAsync(type);
}
export async function impact(style = ImpactFeedbackStyle.Medium) {
    console.warn('`Haptics.impact` is deprecated. Use `Haptics.impactAsync` instead.');
    await impactAsync(style);
}
export async function selection() {
    console.warn('`Haptics.selection` is deprecated. Use `Haptics.selectionAsync` instead.');
    await selectionAsync();
}
/**
 * Triggers notification feedback.
 */
export async function notificationAsync(type = NotificationFeedbackType.Success) {
    if (!ExpoHaptics.notificationAsync) {
        throw new UnavailabilityError('Haptics', 'notificationAsync');
    }
    await ExpoHaptics.notificationAsync(type);
}
/**
 * Triggers impact feedback.
 */
export async function impactAsync(style = ImpactFeedbackStyle.Medium) {
    if (!ExpoHaptics.impactAsync) {
        throw new UnavailabilityError('Haptic', 'impactAsync');
    }
    await ExpoHaptics.impactAsync(style);
}
/**
 * Triggers selection feedback.
 */
export async function selectionAsync() {
    if (!ExpoHaptics.selectionAsync) {
        throw new UnavailabilityError('Haptic', 'selectionAsync');
    }
    await ExpoHaptics.selectionAsync();
}
export { NotificationFeedbackType, ImpactFeedbackStyle };
//# sourceMappingURL=Haptics.js.map