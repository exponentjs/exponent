import { KeepAwakeEventType } from './ExpoKeepAwake.types';
declare const _default: {
    isAvailableAsync(): Promise<boolean>;
    activate(tag: string): Promise<void>;
    deactivate(tag: string): Promise<void>;
    addListener(tag: string, listener: (eventType: KeepAwakeEventType) => void): void;
};
export default _default;
