import { ConfigPlugin } from '@expo/config-plugins';
export declare function setGradleMaven(buildGradle: string): string;
declare const _default: ConfigPlugin<void | {
    cameraPermission?: string | false | undefined;
    microphonePermission?: string | false | undefined;
}>;
export default _default;
