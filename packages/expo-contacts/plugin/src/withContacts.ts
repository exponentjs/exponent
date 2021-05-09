import { AndroidConfig, ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-contacts/package.json');

const CONTACTS_USAGE = 'Allow $(PRODUCT_NAME) to access your contacts';

const withContacts: ConfigPlugin<{ contactsPermission?: string | false } | void> = (
  config,
  { contactsPermission } = {}
) => {
  if (contactsPermission === false) {
    return config;
  }

  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  config.ios.infoPlist.NSContactsUsageDescription =
    contactsPermission || config.ios.infoPlist.NSContactsUsageDescription || CONTACTS_USAGE;

  return AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.READ_CONTACTS',
    'android.permission.WRITE_CONTACTS',
  ]);
};

export default createRunOncePlugin(withContacts, pkg.name, pkg.version);
