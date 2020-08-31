import { NotificationFeedbackType, ImpactFeedbackStyle } from './Haptics.types';
/**
 * Returns whether the Haptics API is enabled on the current device.
 */
export declare function isAvailableAsync(): Promise<boolean>;
export declare function notification(type?: NotificationFeedbackType): Promise<void>;
export declare function impact(style?: ImpactFeedbackStyle): Promise<void>;
export declare function selection(): Promise<void>;
/**
 * Triggers notification feedback.
 */
export declare function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
/**
 * Triggers impact feedback.
 */
export declare function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
/**
 * Triggers selection feedback.
 */
export declare function selectionAsync(): Promise<void>;
export { NotificationFeedbackType, ImpactFeedbackStyle };
