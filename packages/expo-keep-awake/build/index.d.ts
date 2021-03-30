import { KeepAwakeEventType } from './ExpoKeepAwake.types';
export declare function isAvailableAsync(): Promise<boolean>;
export declare function useKeepAwake(tag?: string): void;
export declare function activateKeepAwake(tag?: string): Promise<void>;
export declare function deactivateKeepAwake(tag?: string): Promise<void>;
export declare function addEventListener(tag: string, listener: (eventType: KeepAwakeEventType) => void): void;
export { KeepAwakeEventType };
