import { ConfigPlugin } from '@expo/config-plugins';
export declare const withUserTrackingPermission: ConfigPlugin<{
    /**
     * Sets the iOS `NSUserTrackingUsageDescription` permission message in the `Info.plist`.
     * Passing `false` will skip adding the permission.
     * @default 'This identifier will be used to deliver personalized ads to you.'
     */
    userTrackingPermission?: string | false;
} | void>;
