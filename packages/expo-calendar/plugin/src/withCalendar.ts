import { AndroidConfig, ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

const pkg = require('expo-calendar/package.json');

const CALENDARS_USAGE = 'Allow $(PRODUCT_NAME) to access your calendars';
const REMINDERS_USAGE = 'Allow $(PRODUCT_NAME) to access your reminders';

const withCalendar: ConfigPlugin<{
  calendarPermission?: string | false;
  remindersPermission?: string | false;
} | void> = (config, { calendarPermission, remindersPermission } = {}) => {
  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  if (calendarPermission !== false) {
    config.ios.infoPlist.NSCalendarsUsageDescription =
      calendarPermission || config.ios.infoPlist.NSCalendarsUsageDescription || CALENDARS_USAGE;
  }
  if (remindersPermission !== false) {
    config.ios.infoPlist.NSRemindersUsageDescription =
      remindersPermission || config.ios.infoPlist.NSRemindersUsageDescription || REMINDERS_USAGE;
  }

  return AndroidConfig.Permissions.withPermissions(
    config,
    [
      calendarPermission !== false && 'android.permission.READ_CALENDAR',
      calendarPermission !== false && 'android.permission.WRITE_CALENDAR',
    ].filter(Boolean) as string[]
  );
};

export default createRunOncePlugin(withCalendar, pkg.name, pkg.version);
