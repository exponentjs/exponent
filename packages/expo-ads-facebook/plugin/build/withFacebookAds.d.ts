import { ConfigPlugin } from '@expo/config-plugins';
declare const _default: ConfigPlugin<void | {
    /**
     * Sets the iOS `NSUserTrackingUsageDescription` permission message in the `Info.plist`.
     * Passing `false` will skip adding the permission.
     * @default 'This identifier will be used to deliver personalized ads to you.'
     */
    userTrackingPermission?: string | false | undefined;
}>;
export default _default;
