import { ConfigPlugin } from '@expo/config-plugins';
declare const _default: ConfigPlugin<void | {
    /**
     * The `NSContactsUsageDescription` contact permission message.
     *
     * @default 'Allow $(PRODUCT_NAME) to access your contacts'
     */
    contactsPermission?: string | undefined;
    /**
     * If true, the `com.apple.developer.contacts.notes` entitlement will be added to your iOS project.
     * This entitlement is _heavily_ restricted and requires prior permission from Apple via [this form](https://developer.apple.com/contact/request/contact-note-field).
     *
     * @default false
     */
    enableIosContactNotes?: boolean | undefined;
}>;
export default _default;
