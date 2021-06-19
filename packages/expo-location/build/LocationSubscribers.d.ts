import { LocationCallback, LocationHeadingCallback } from './Location.types';
declare type EventObject = {
    watchId: number;
    [key: string]: any;
};
declare class Subscriber<CallbackType extends LocationCallback | LocationHeadingCallback> {
    private eventName;
    private eventDataField;
    private callbacks;
    private eventSubscription;
    constructor(eventName: string, eventDataField: string);
    maybeInitializeSubscription(): void;
    /**
     * Registers given callback under new id which is then returned.
     */
    registerCallback(callback: CallbackType): number;
    /**
     * Unregisters a callback with given id and revokes the subscription if possible.
     */
    unregisterCallback(id: number): void;
    trigger(event: EventObject): void;
}
export declare const LocationSubscriber: Subscriber<LocationCallback>;
export declare const HeadingSubscriber: Subscriber<LocationHeadingCallback>;
/**
 * Necessary for some unit tests.
 */
export declare function _getCurrentWatchId(): number;
export {};
