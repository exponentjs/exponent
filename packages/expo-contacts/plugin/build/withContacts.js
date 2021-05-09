"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const pkg = require('expo-contacts/package.json');
const CONTACTS_USAGE = 'Allow $(PRODUCT_NAME) to access your contacts';
const withContacts = (config, { contactsPermission } = {}) => {
    if (contactsPermission === false) {
        return config;
    }
    if (!config.ios)
        config.ios = {};
    if (!config.ios.infoPlist)
        config.ios.infoPlist = {};
    config.ios.infoPlist.NSContactsUsageDescription =
        contactsPermission || config.ios.infoPlist.NSContactsUsageDescription || CONTACTS_USAGE;
    return config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        'android.permission.READ_CONTACTS',
        'android.permission.WRITE_CONTACTS',
    ]);
};
exports.default = config_plugins_1.createRunOncePlugin(withContacts, pkg.name, pkg.version);
