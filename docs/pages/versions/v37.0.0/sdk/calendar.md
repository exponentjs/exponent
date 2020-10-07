---
title: Calendar
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-37/packages/expo-calendar'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';
import TableOfContentSection from '~/components/plugins/TableOfContentSection';

Provides an API for interacting with the device's system calendars, events, reminders, and associated records.

<PlatformsSection android emulator ios simulator />

## Installation

<InstallSection packageName="expo-calendar" />

## Configuration

In managed apps, `Calendar` requires `Permissions.CALENDAR`. Interacting with reminders on iOS requires `Permissions.REMINDERS`.

For standalone iOS apps, you'll need to [customize the permission dialog](../../distribution/app-stores/#system-permissions-dialogs-on-ios) by adding the `NSCalendarUsageDescription` key (and `NSRemindersUsageDescription` if you are utilizing reminders) under the `ios.infoPlist` key in your `app.json` or `app.config.js`. Failing to do so may result in Apple rejecting your app.

```
  "infoPlist": {
    "NSCalendarUsageDescription": "your-custom-message-here.",
    "NSRemindersUsageDescription": "another-custom-message-here"
  }
```

## Example Usage

<SnackInline label='Basic Calendar usage' templateId='calendar' dependencies={['expo-calendar']}>

```js
import React, { useEffect } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync();
        console.log('Here are all your calendars:');
        console.log({ calendars });
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Calendar Module Example</Text>
      <Button title="Create a new calendar" onPress={createCalendar} />
    </View>
  );
}

async function getDefaultCalendarSource() {
  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendars = calendars.filter(each => each.source.name === 'Default');
  return defaultCalendars[0].source;
}

async function createCalendar() {
  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? await getDefaultCalendarSource()
      : { isLocalAccount: true, name: 'Expo Calendar' };
  const newCalendarID = await Calendar.createCalendarAsync({
    title: 'Expo Calendar',
    color: 'blue',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: 'internalCalendarName',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  console.log(`Your new calendar ID is: ${newCalendarID}`);
}
```

</SnackInline>

## API

```js
import * as Calendar from 'expo-calendar';
```

<TableOfContentSection title='Methods' contents={['Calendar.getCalendarsAsync(entityType)', 'Calendar.getDefaultCalendarAsync()', 'Calendar.requestCalendarPermissionsAsync()', 'Calendar.requestRemindersPermissionsAsync()', 'Calendar.getCalendarPermissionsAsync()', 'Calendar.createCalendarAsync(details)', 'Calendar.updateCalendarAsync(id, details)', 'Calendar.deleteCalendarAsync(id)', 'Calendar.getEventsAsync(calendarIds, startDate, endDate)', 'Calendar.getEventAsync(id, recurringEventOptions)', 'Calendar.createEventAsync(calendarId, details)', 'Calendar.updateEventAsync(id, details, recurringEventOptions)', 'Calendar.deleteEventAsync(id, recurringEventOptions)', 'Calendar.getAttendeesForEventAsync(eventId, recurringEventOptions)', 'Calendar.createAttendeeAsync(eventId, details)', 'Calendar.updateAttendeeAsync(id, details)', 'Calendar.deleteAttendeeAsync(id)', 'Calendar.getRemindersAsync(calendarIds, status, startDate, endDate)', 'Calendar.getReminderAsync(id)', 'Calendar.createReminderAsync(calendarId, details)', 'Calendar.updateReminderAsync(id, details)', 'Calendar.deleteReminderAsync(id)', 'Calendar.getSourcesAsync()', 'Calendar.getSourceAsync(id)', 'Calendar.openEventInCalendar(id)']} />

<TableOfContentSection title='Object Types' contents={['Calendar', 'Event', 'Reminder', 'Attendee', 'RecurrenceRule', 'Alarm', 'Source']} />

<TableOfContentSection title='Enum Types' contents={['Calendar.DayOfTheWeek', 'Calendar.MonthOfTheYear']} />

## Methods

### `Calendar.getCalendarsAsync(entityType)`

Gets an array of calendar objects with details about the different calendars stored on the device.

#### Arguments

- **entityType (_string_)** -- (iOS only) Not required, but if defined, filters the returned calendars to a specific entity type. Possible values are `Calendar.EntityTypes.EVENT` (for calendars shown in the Calendar app) and `Calendar.EntityTypes.REMINDER` (for the Reminders app).

#### Returns

An array of [calendar objects](#calendar 'Calendar') matching the provided entity type (if provided).

### `Calendar.getDefaultCalendarAsync()`

**iOS only**. Gets an instance of the default calendar object.

#### Returns

A promise resolving to [calendar object](#calendar) that is the user's default calendar.

### `Calendar.requestCalendarPermissionsAsync()`

Asks the user to grant permissions for accessing user's calendars. Alias for `Permissions.askAsync(Permissions.CALENDAR)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `Calendar.requestRemindersPermissionsAsync()`

**iOS only**. Asks the user to grant permissions for accessing user's reminders. Alias for `Permissions.askAsync(Permissions.REMINDERS)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `Calendar.getCalendarPermissionsAsync()`

Checks user's permissions for accessing user's calendars. Alias for `Permissions.getAsync(Permissions.CALENDAR)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `Calendar.getRemindersPermissionsAsync()`

**iOS only**. Checks user's permissions for accessing user's reminders. Alias for `Permissions.getAsync(Permissions.REMINDERS)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `Calendar.createCalendarAsync(details)`

Creates a new calendar on the device, allowing events to be added later and displayed in the OS Calendar app.

#### Arguments

- **details (_object_)** --

  A map of details for the calendar to be created (see below for a description of these fields):

  - **title (_string_)** -- Required
  - **color (_string_)** -- Required
  - **entityType (_string_)** -- Required (iOS only)
  - **sourceId (_string_)** -- Required (iOS only). ID of the source to be used for the calendar. Likely the same as the source for any other locally stored calendars.
  - **source (_object_)** -- Required (Android only). Object representing the source to be used for the calendar.

    - **isLocalAccount (_boolean_)** -- Whether this source is the local phone account. Must be `true` if `type` is undefined.
    - **name (_string_)** -- Required. Name for the account that owns this calendar and was used to sync the calendar to the device.
    - **type (_string_)** -- Type of the account that owns this calendar and was used to sync it to the device. If `isLocalAccount` is falsy then this must be defined, and must match an account on the device along with `name`, or the OS will delete the calendar.

  - **name (_string_)** -- Required (Android only)
  - **ownerAccount (_string_)** -- Required (Android only)
  - **timeZone (_string_)** -- (Android only)
  - **allowedAvailabilities (_array_)** -- (Android only)
  - **allowedReminders (_array_)** -- (Android only)
  - **allowedAttendeeTypes (_array_)** -- (Android only)
  - **isVisible (_boolean_)** -- (Android only)
  - **isSynced (_boolean_)** -- (Android only) Whether or not the calendar is synced from a remote source. Unexpected behavior may occur if this is not set to `true`.
  - **accessLevel (_string_)** -- (Android only)

#### Returns

A string representing the ID of the newly created calendar.

### `Calendar.updateCalendarAsync(id, details)`

Updates the provided details of an existing calendar stored on the device. To remove a property, explicitly set it to `null` in `details`.

#### Arguments

- **id (_string_)** -- ID of the calendar to update. Required.
- **details (_object_)** --

  A map of properties to be updated (see below for a description of these fields):

  - **title (_string_)**
  - **sourceId (_string_)** -- (iOS only)
  - **color (_string_)** -- (iOS only)
  - **name (_string_)** -- (Android only)
  - **isVisible (_boolean_)** -- (Android only)
  - **isSynced (_boolean_)** -- (Android only)

### `Calendar.deleteCalendarAsync(id)`

Deletes an existing calendar and all associated events/reminders/attendees from the device. Use with caution.

#### Arguments

- **id (_string_)** -- ID of the calendar to delete.

### `Calendar.getEventsAsync(calendarIds, startDate, endDate)`

Returns all events in a given set of calendars over a specified time period. The filtering has slightly different behavior per-platform -- on iOS, all events that overlap at all with the `[startDate, endDate]` interval are returned, whereas on Android, only events that begin on or after the `startDate` and end on or before the `endDate` will be returned.

#### Arguments

- **calendarIds (_array_)** -- Array of IDs of calendars to search for events in. Required.
- **startDate (_Date_)** -- Beginning of time period to search for events in. Required.
- **endDate (_Date_)** -- End of time period to search for events in. Required.

#### Returns

An array of [event objects](#event 'Event') matching the search criteria.

### `Calendar.getEventAsync(id, recurringEventOptions)`

Returns a specific event selected by ID. If a specific instance of a recurring event is desired, the start date of this instance must also be provided, as instances of recurring events do not have their own unique and stable IDs on either iOS or Android.

#### Arguments

- **id (_string_)** -- ID of the event to return. Required.
- **recurringEventOptions (_object_)** --

  A map of options for recurring events:

  - **instanceStartDate (_Date_)** -- Date object representing the start time of the desired instance, if looking for a single instance of a recurring event. If this is not provided and **id** represents a recurring event, the first instance of that event will be returned by default.

#### Returns

An [event object](#event 'Event') matching the provided criteria, if one exists.

### `Calendar.createEventAsync(calendarId, details)`

Creates a new event on the specified calendar.

#### Arguments

- **calendarId (_string_)** -- ID of the calendar to create this event in. Required.
- **details (_object_)** --

  A map of details for the event to be created (see below for a description of these fields):

  - **title (_string_)**
  - **startDate (_Date_)** -- Required.
  - **endDate (_Date_)** -- Required.
  - **allDay (_boolean_)**
  - **location (_string_)**
  - **notes (_string_)**
  - **alarms (_Array\<Alarm\>_)**
  - **recurrenceRule (_RecurrenceRule_)**
  - **availability (_string_)**
  - **timeZone (_string_)** -- Required on Android.
  - **endTimeZone (_string_)** -- (Android only)
  - **url (_string_)** -- (iOS only)
  - **organizerEmail (_string_)** -- (Android only)
  - **accessLevel (_string_)** -- (Android only)
  - **guestsCanModify (_boolean_)** -- (Android only)
  - **guestsCanInviteOthers (_boolean_)** -- (Android only)
  - **guestsCanSeeGuests (_boolean_)** -- (Android only)

#### Returns

A string representing the ID of the newly created event.

### `Calendar.updateEventAsync(id, details, recurringEventOptions)`

Updates the provided details of an existing calendar stored on the device. To remove a property, explicitly set it to `null` in `details`.

#### Arguments

- **id (_string_)** -- ID of the event to be updated. Required.
- **details (_object_)** --

  A map of properties to be updated (see below for a description of these fields):

  - **title (_string_)**
  - **startDate (_Date_)**
  - **endDate (_Date_)**
  - **allDay (_boolean_)**
  - **location (_string_)**
  - **notes (_string_)**
  - **alarms (_Array\<Alarm\>_)**
  - **recurrenceRule (_RecurrenceRule_)**
  - **availability (_string_)**
  - **timeZone (_string_)**
  - **endTimeZone (_string_)** -- (Android only)
  - **url (_string_)** -- (iOS only)
  - **organizerEmail (_string_)** -- (Android only)
  - **accessLevel (_string_)** -- (Android only)
  - **guestsCanModify (_boolean_)** -- (Android only)
  - **guestsCanInviteOthers (_boolean_)** -- (Android only)
  - **guestsCanSeeGuests (_boolean_)** -- (Android only)

- **recurringEventOptions (_object_)** --

  A map of options for recurring events:

  - **instanceStartDate (_Date_)** -- Date object representing the start time of the desired instance, if wanting to update a single instance of a recurring event. If this is not provided and **id** represents a recurring event, the first instance of that event will be updated by default.
  - **futureEvents (_boolean_)** -- Whether or not future events in the recurring series should also be updated. If `true`, will apply the given changes to the recurring instance specified by `instanceStartDate` and all future events in the series. If `false`, will only apply the given changes to the instance specified by `instanceStartDate`.

### `Calendar.deleteEventAsync(id, recurringEventOptions)`

Deletes an existing event from the device. Use with caution.

#### Arguments

- **id (_string_)** -- ID of the event to be deleted. Required.
- **recurringEventOptions (_object_)** --

  A map of options for recurring events:

  - **instanceStartDate (_Date_)** -- Date object representing the start time of the desired instance, if wanting to delete a single instance of a recurring event. If this is not provided and **id** represents a recurring event, the first instance of that event will be deleted by default.
  - **futureEvents (_boolean_)** -- Whether or not future events in the recurring series should also be deleted. If `true`, will delete the instance specified by `instanceStartDate` and all future events in the series. If `false`, will only delete the instance specified by `instanceStartDate`.

### `Calendar.getAttendeesForEventAsync(eventId, recurringEventOptions)`

Gets all attendees for a given event (or instance of a recurring event).

#### Arguments

- **eventId (_string_)** -- ID of the event to return attendees for. Required.
- **recurringEventOptions (_object_)** --

  A map of options for recurring events:

  - **instanceStartDate (_Date_)** -- Date object representing the start time of the desired instance, if looking for a single instance of a recurring event. If this is not provided and **eventId** represents a recurring event, the attendees of the first instance of that event will be returned by default.

#### Returns

An array of [attendee objects](#attendee 'Attendee') associated with the specified event.

### `Calendar.createAttendeeAsync(eventId, details)`

**Available on Android only.** Creates a new attendee record and adds it to the specified event. Note that if `eventId` specifies a recurring event, this will add the attendee to every instance of the event.

#### Arguments

- **eventId (_string_)** -- ID of the event to add this attendee to. Required.
- **details (_object_)** --

  A map of details for the attendee to be created (see below for a description of these fields):

  - **id (_string_)** Required.
  - **email (_string_)** Required.
  - **name (_string_)**
  - **role (_string_)** Required.
  - **status (_string_)** Required.
  - **type (_string_)** Required.

#### Returns

A string representing the ID of the newly created attendee record.

### `Calendar.updateAttendeeAsync(id, details)`

**Available on Android only.** Updates an existing attendee record. To remove a property, explicitly set it to `null` in `details`.

#### Arguments

- **id (_string_)** -- ID of the attendee record to be updated. Required.
- **details (_object_)** --

  A map of properties to be updated (see below for a description of these fields):

  - **id (_string_)**
  - **email (_string_)**
  - **name (_string_)**
  - **role (_string_)**
  - **status (_string_)**
  - **type (_string_)**

### `Calendar.deleteAttendeeAsync(id)`

**Available on Android only.** Deletes an existing attendee record from the device. Use with caution.

#### Arguments

- **id (_string_)** -- ID of the attendee to delete.

### `Calendar.getRemindersAsync(calendarIds, status, startDate, endDate)`

**Available on iOS only.** Returns a list of reminders matching the provided criteria. If `startDate` and `endDate` are defined, returns all reminders that overlap at all with the [startDate, endDate] interval -- i.e. all reminders that end after the `startDate` or begin before the `endDate`.

#### Arguments

- **calendarIds (_array_)** -- Array of IDs of calendars to search for reminders in. Required.
- **status (_string_)** -- One of `Calendar.ReminderStatus.COMPLETED` or `Calendar.ReminderStatus.INCOMPLETE`.
- **startDate (_Date_)** -- Beginning of time period to search for reminders in. Required if `status` is defined.
- **endDate (_Date_)** -- End of time period to search for reminders in. Required if `status` is defined.

#### Returns

An array of [reminder objects](#reminder 'Reminder') matching the search criteria.

### `Calendar.getReminderAsync(id)`

**Available on iOS only.** Returns a specific reminder selected by ID.

#### Arguments

- **id (_string_)** -- ID of the reminder to return. Required.

#### Returns

An [reminder object](#reminder 'Reminder') matching the provided ID, if one exists.

### `Calendar.createReminderAsync(calendarId, details)`

**Available on iOS only.** Creates a new reminder on the specified calendar.

#### Arguments

- **calendarId (_string_)** -- ID of the calendar to create this reminder in (or `null` to add the calendar to the OS-specified default calendar for reminders). Required.
- **details (_object_)** --

  A map of details for the reminder to be created: (see below for a description of these fields)

  - **title (_string_)**
  - **startDate (_Date_)**
  - **dueDate (_Date_)**
  - **completed (_boolean_)**
  - **completionDate (_Date_)**
  - **location (_string_)**
  - **notes (_string_)**
  - **alarms (_array_)**
  - **recurrenceRule (_RecurrenceRule_)**
  - **timeZone (_string_)**
  - **url (_string_)**

#### Returns

A string representing the ID of the newly created reminder.

### `Calendar.updateReminderAsync(id, details)`

**Available on iOS only.** Updates the provided details of an existing reminder stored on the device. To remove a property, explicitly set it to `null` in `details`.

#### Arguments

- **id (_string_)** -- ID of the reminder to be updated. Required.
- **details (_object_)** --

  A map of properties to be updated (see below for a description of these fields):

  - **title (_string_)**
  - **startDate (_Date_)**
  - **dueDate (_Date_)**
  - **completionDate (_Date_)** -- Setting this property of a nonnull Date will automatically set the reminder's `completed` value to `true`.
  - **location (_string_)**
  - **notes (_string_)**
  - **alarms (_array_)**
  - **recurrenceRule (_RecurrenceRule_)**
  - **timeZone (_string_)**
  - **url (_string_)**

### `Calendar.deleteReminderAsync(id)`

**Available on iOS only.** Deletes an existing reminder from the device. Use with caution.

#### Arguments

- **id (_string_)** -- ID of the reminder to be deleted. Required.

### `Calendar.getSourcesAsync()`

**Available on iOS only.**

#### Returns

An array of [source objects](#source 'Source') all sources for calendars stored on the device.

### `Calendar.getSourceAsync(id)`

**Available on iOS only.** Returns a specific source selected by ID.

#### Arguments

- **id (_string_)** -- ID of the source to return. Required.

#### Returns

A [source object](#source 'Source') matching the provided ID, if one exists.

### `Calendar.openEventInCalendar(id)`

**Available on Android only.** Sends an intent to open the specified event in the OS Calendar app.

#### Arguments

- **id (_string_)** -- ID of the event to open. Required.

## Object Types

### Calendar

A calendar record upon which events (or, on iOS, reminders) can be stored. Settings here apply to the calendar as a whole and how its events are displayed in the OS calendar app.

| Field name            | Type      | Platforms | Description                                                                   | Possible values                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | --------- | --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                    | _string_  | both      | Internal ID that represents this calendar on the device                       |                                                                                                                                                                                                                                                                                                                                                                    |
| title                 | _string_  | both      | Visible name of the calendar                                                  |                                                                                                                                                                                                                                                                                                                                                                    |
| entityType            | _string_  | iOS       | Whether the calendar is used in the Calendar or Reminders OS app              | `Calendar.EntityTypes.EVENT`, `Calendar.EntityTypes.REMINDER`                                                                                                                                                                                                                                                                                                      |
| source                | _Source_  | both      | Object representing the source to be used for the calendar                    |                                                                                                                                                                                                                                                                                                                                                                    |
| color                 | _string_  | both      | Color used to display this calendar's events                                  |                                                                                                                                                                                                                                                                                                                                                                    |
| allowsModifications   | _boolean_ | both      | Boolean value that determines whether this calendar can be modified           |                                                                                                                                                                                                                                                                                                                                                                    |
| type                  | _string_  | iOS       | Type of calendar this object represents                                       | `Calendar.CalendarType.LOCAL`, `Calendar.CalendarType.CALDAV`, `Calendar.CalendarType.EXCHANGE`, `Calendar.CalendarType.SUBSCRIBED`, `Calendar.CalendarType.BIRTHDAYS`, `Calendar.CalendarType.UNKNOWN`                                                                                                                                                            |
| isPrimary             | _boolean_ | Android   | Boolean value indicating whether this is the device's primary calendar        |                                                                                                                                                                                                                                                                                                                                                                    |
| name                  | _string | null_  | Android   | Internal system name of the calendar                                          |                                                                                                                                                                                                                                                                                                                                                                    |
| ownerAccount          | _string_  | Android   | Name for the account that owns this calendar                                  |                                                                                                                                                                                                                                                                                                                                                                    |
| timeZone              | _string_  | Android   | Time zone for the calendar                                                    |                                                                                                                                                                                                                                                                                                                                                                    |
| allowedAvailabilities | _array_   | both      | Availability types that this calendar supports                                | array of `Calendar.Availability.BUSY`, `Calendar.Availability.FREE`, `Calendar.Availability.TENTATIVE`, `Calendar.Availability.UNAVAILABLE` (iOS only), `Calendar.Availability.NOT_SUPPORTED` (iOS only)                                                                                                                                                           |
| allowedReminders      | _array_   | Android   | Alarm methods that this calendar supports                                     | array of `Calendar.AlarmMethod.ALARM`, `Calendar.AlarmMethod.ALERT`, `Calendar.AlarmMethod.EMAIL`, `Calendar.AlarmMethod.SMS`, `Calendar.AlarmMethod.DEFAULT`                                                                                                                                                                                                      |
| allowedAttendeeTypes  | _array_   | Android   | Attendee types that this calendar supports                                    | array of `Calendar.AttendeeType.UNKNOWN` (iOS only), `Calendar.AttendeeType.PERSON` (iOS only), `Calendar.AttendeeType.ROOM` (iOS only), `Calendar.AttendeeType.GROUP` (iOS only), `Calendar.AttendeeType.RESOURCE`, `Calendar.AttendeeType.OPTIONAL` (Android only), `Calendar.AttendeeType.REQUIRED` (Android only), `Calendar.AttendeeType.NONE` (Android only) |
| isVisible             | _boolean_ | Android   | Indicates whether the OS displays events on this calendar                     |                                                                                                                                                                                                                                                                                                                                                                    |
| isSynced              | _boolean_ | Android   | Indicates whether this calendar is synced and its events stored on the device |                                                                                                                                                                                                                                                                                                                                                                    |
| accessLevel           | _string_  | Android   | Level of access that the user has for the calendar                            | `Calendar.CalendarAccessLevel.CONTRIBUTOR`, `Calendar.CalendarAccessLevel.EDITOR`, `Calendar.CalendarAccessLevel.FREEBUSY`, `Calendar.CalendarAccessLevel.OVERRIDE`, `Calendar.CalendarAccessLevel.OWNER`, `Calendar.CalendarAccessLevel.READ`, `Calendar.CalendarAccessLevel.RESPOND`, `Calendar.CalendarAccessLevel.ROOT`, `Calendar.CalendarAccessLevel.NONE`   |

### Event

An event record, or a single instance of a recurring event. On iOS, used in the Calendar app.

| Field name            | Type             | Platforms | Description                                                                                                                    | Possible values                                                                                                                                                                                 |
| --------------------- | ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                    | _string_         | both      | Internal ID that represents this event on the device                                                                           |                                                                                                                                                                                                 |
| calendarId            | _string_         | both      | ID of the calendar that contains this event                                                                                    |                                                                                                                                                                                                 |
| title                 | _string_         | both      | Visible name of the event                                                                                                      |                                                                                                                                                                                                 |
| startDate             | _Date_           | both      | Date object or string representing the time when the event starts                                                              |                                                                                                                                                                                                 |
| endDate               | _Date_           | both      | Date object or string representing the time when the event ends                                                                |                                                                                                                                                                                                 |
| allDay                | _boolean_        | both      | Whether the event is displayed as an all-day event on the calendar                                                             |                                                                                                                                                                                                 |
| location              | _string_         | both      | Location field of the event                                                                                                    |                                                                                                                                                                                                 |
| notes                 | _string_         | both      | Description or notes saved with the event                                                                                      |                                                                                                                                                                                                 |
| alarms                | _array_          | both      | Array of Alarm objects which control automated reminders to the user                                                           |                                                                                                                                                                                                 |
| recurrenceRule        | _RecurrenceRule_ | both      | Object representing rules for recurring or repeating events. Null for one-time events.                                         |                                                                                                                                                                                                 |
| availability          | _string_         | both      | The availability setting for the event                                                                                         | `Calendar.Availability.BUSY`, `Calendar.Availability.FREE`, `Calendar.Availability.TENTATIVE`, `Calendar.Availability.UNAVAILABLE` (iOS only), `Calendar.Availability.NOT_SUPPORTED` (iOS only) |
| timeZone              | _string_         | both      | Time zone the event is scheduled in                                                                                            |                                                                                                                                                                                                 |
| endTimeZone           | _string_         | Android   | Time zone for the event end time                                                                                               |                                                                                                                                                                                                 |
| url                   | _string_         | iOS       | URL for the event                                                                                                              |                                                                                                                                                                                                 |
| creationDate          | _string_         | iOS       | Date when the event record was created                                                                                         |                                                                                                                                                                                                 |
| lastModifiedDate      | _string_         | iOS       | Date when the event record was last modified                                                                                   |                                                                                                                                                                                                 |
| originalStartDate     | _string_         | iOS       | For recurring events, the start date for the first (original) instance of the event                                            |                                                                                                                                                                                                 |
| isDetached            | _boolean_        | iOS       | Boolean value indicating whether or not the event is a detached (modified) instance of a recurring event                       |                                                                                                                                                                                                 |
| status                | _string_         | iOS       | Status of the event                                                                                                            | `Calendar.EventStatus.NONE`, `Calendar.EventStatus.CONFIRMED`, `Calendar.EventStatus.TENTATIVE`, `Calendar.EventStatus.CANCELED`                                                                |
| organizer             | _Attendee_       | iOS       | Organizer of the event, as an Attendee object                                                                                  |                                                                                                                                                                                                 |
| organizerEmail        | _string_         | Android   | Email address of the organizer of the event                                                                                    |                                                                                                                                                                                                 |
| accessLevel           | _string_         | Android   | User's access level for the event                                                                                              | `Calendar.EventAccessLevel.CONFIDENTIAL`, `Calendar.EventAccessLevel.PRIVATE`, `Calendar.EventAccessLevel.PUBLIC`, `Calendar.EventAccessLevel.DEFAULT`                                          |
| guestsCanModify       | _boolean_        | Android   | Whether invited guests can modify the details of the event                                                                     |                                                                                                                                                                                                 |
| guestsCanInviteOthers | _boolean_        | Android   | Whether invited guests can invite other guests                                                                                 |                                                                                                                                                                                                 |
| guestsCanSeeGuests    | _boolean_        | Android   | Whether invited guests can see other guests                                                                                    |                                                                                                                                                                                                 |
| originalId            | _string_         | Android   | For detached (modified) instances of recurring events, the ID of the original recurring event                                  |                                                                                                                                                                                                 |
| instanceId            | _string_         | Android   | For instances of recurring events, volatile ID representing this instance; not guaranteed to always refer to the same instance |                                                                                                                                                                                                 |

### Reminder

A reminder record, used in the iOS Reminders app. No direct analog on Android.

| Field name       | Type             | Description                                                                             |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------- |
| id               | _string_         | Internal ID that represents this reminder on the device                                 |
| calendarId       | _string_         | ID of the calendar that contains this reminder                                          |
| title            | _string_         | Visible name of the reminder                                                            |
| startDate        | _Date_           | Date object or string representing the start date of the reminder task                  |
| dueDate          | _Date_           | Date object or string representing the time when the reminder task is due               |
| completed        | _boolean_        | Indicates whether or not the task has been completed                                    |
| completionDate   | _Date_           | Date object or string representing the date of completion, if `completed` is `true`     |
| location         | _string_         | Location field of the reminder                                                          |
| notes            | _string_         | Description or notes saved with the reminder                                            |
| alarms           | _array_          | Array of Alarm objects which control automated alarms to the user about the task        |
| recurrenceRule   | _RecurrenceRule_ | Object representing rules for recurring or repeated reminders. Null for one-time tasks. |
| timeZone         | _string_         | Time zone the reminder is scheduled in                                                  |
| url              | _string_         | URL for the reminder                                                                    |
| creationDate     | _string_         | Date when the reminder record was created                                               |
| lastModifiedDate | _string_         | Date when the reminder record was last modified                                         |

### Attendee

A person or entity that is associated with an event by being invited or fulfilling some other role.

| Field name    | Type      | Platforms | Description                                                   | Possible values                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | --------- | --------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id            | _string_  | Android   | Internal ID that represents this attendee on the device       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| email         | _string_  | Android   | Email address of the attendee                                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| name          | _string_  | both      | Displayed name of the attendee                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| role          | _string_  | both      | Role of the attendee at the event                             | `Calendar.AttendeeRole.UNKNOWN` (iOS only), `Calendar.AttendeeRole.REQUIRED` (iOS only), `Calendar.AttendeeRole.OPTIONAL` (iOS only), `Calendar.AttendeeRole.CHAIR` (iOS only), `Calendar.AttendeeRole.NON_PARTICIPANT` (iOS only), `Calendar.AttendeeRole.ATTENDEE` (Android only), `Calendar.AttendeeRole.ORGANIZER` (Android only), `Calendar.AttendeeRole.PERFORMER` (Android only), `Calendar.AttendeeRole.SPEAKER` (Android only), `Calendar.AttendeeRole.NONE` (Android only) |
| status        | _string_  | both      | Status of the attendee in relation to the event               | `Calendar.AttendeeStatus.ACCEPTED`, `Calendar.AttendeeStatus.DECLINED`, `Calendar.AttendeeStatus.TENTATIVE`, `Calendar.AttendeeStatus.DELEGATED` (iOS only), `Calendar.AttendeeStatus.COMPLETED` (iOS only), `Calendar.AttendeeStatus.IN_PROCESS` (iOS only), `Calendar.AttendeeStatus.UNKNOWN` (iOS only), `Calendar.AttendeeStatus.PENDING` (iOS only), `Calendar.AttendeeStatus.INVITED` (Android only), `Calendar.AttendeeStatus.NONE` (Android only)                            |
| type          | _string_  | both      | Type of the attendee                                          | `Calendar.AttendeeType.UNKNOWN` (iOS only), `Calendar.AttendeeType.PERSON` (iOS only), `Calendar.AttendeeType.ROOM` (iOS only), `Calendar.AttendeeType.GROUP` (iOS only), `Calendar.AttendeeType.RESOURCE`, `Calendar.AttendeeType.OPTIONAL` (Android only), `Calendar.AttendeeType.REQUIRED` (Android only), `Calendar.AttendeeType.NONE` (Android only)                                                                                                                            |
| url           | _string_  | iOS       | URL for the attendee                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| isCurrentUser | _boolean_ | iOS       | Indicates whether or not this attendee is the current OS user |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### RecurrenceRule

A recurrence rule for events or reminders, allowing the same calendar item to recur multiple times. This interface is
based on [the iOS interface](https://developer.apple.com/documentation/eventkit/ekrecurrencerule/1507320-initrecurrencewithfrequency) which is in turn based on
[the iCal RFC](https://tools.ietf.org/html/rfc5545#section-3.8.5.3) so you can refer to those to learn more about this
potentially complex interface.

Not all of the combinations make sense. For example, when frequency is `DAILY`, setting `daysOfTheMonth` makes no sense.

| Field name      | Type               | Description                                                                                                                                                                                   | Possible values                                                                                                                                                       |
| --------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| frequency       | _string_           | How often the calendar item should recur                                                                                                                                                      | `Calendar.Frequency.DAILY`, `Calendar.Frequency.WEEKLY`, `Calendar.Frequency.MONTHLY`, `Calendar.Frequency.YEARLY`                                                    |
| interval        | _number_           | Interval at which the calendar item should recur. For example, an `interval: 2` with `frequency: DAILY` would yield an event that recurs every other day. Defaults to `1`.                    |                                                                                                                                                                       |
| endDate         | _Date_             | Date on which the calendar item should stop recurring; overrides `occurrence` if both are specified                                                                                           |                                                                                                                                                                       |
| occurrence      | _number_           | Number of times the calendar item should recur before stopping                                                                                                                                |                                                                                                                                                                       |
| daysOfTheWeek   | _array_            | (Optional, iOS only) the days of the week the event should recur on. An array of `{ dayOfTheWeek: DayOfTheWeek; weekNumber?: number }`                                                        | `dayOfTheWeek`: Sunday to Saturday (`enum DayOfTheWeek`), `weekNumber`: -53 to 53 (0 ignores this field, and a negative indicates a value from the end of the range). |
| daysOfTheMonth  | _number[]_         | (Optional, iOS only) They days of the month this event occurs on                                                                                                                              | -31 to 31 (not including 0). Negative indicates a value from the end of the range. This field is only valid for `Calendar.Frequency.Monthly`.                         |
| monthsOfTheYear | _MonthOfTheYear[]_ | (Optional, iOS only) The months this event occurs on.                                                                                                                                         | This field is only valid for `Calendar.Frequency.Yearly`.                                                                                                             |
| weeksOfTheYear  | _number[]_         | (Optional, iOS only) The weeks of the year this event occurs on.                                                                                                                              | -53 to 53 (not including 0). Negative indicates a value from the end of the range. This field is only valid for `Calendar.Frequency.Yearly`.                          |
| daysOfTheYear   | _number[]_         | (Optional, iOS only) The days of the year this event occurs on.                                                                                                                               | -366 to 366 (not including 0). Negative indicates a value from the end of the range. This field is only valid for `Calendar.Frequency.Yearly`.                        |
| setPositions    | _number[]_         | (Optional, iOS only) An array of numbers that filters which recurrences to include. For example, for an event that recurs every Monday, passing 2 here will make it recur every other Monday. | -366 to 366 (not including 0). Negative indicates a value from the end of the range. This field is only valid for `Calendar.Frequency.Yearly`.                        |

### Alarm

A method for having the OS automatically remind the user about an calendar item

| Field name     | Type     | Platforms | Description                                                                                                                                                   | Possible values                                                                                                                                      |
| -------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| absoluteDate   | _Date_   | iOS       | Date object or string representing an absolute time the alarm should occur; overrides `relativeOffset` and `structuredLocation` if specified alongside either |                                                                                                                                                      |
| relativeOffset | _number_ | both      | Number of minutes from the `startDate` of the calendar item that the alarm should occur; use negative values to have the alarm occur before the `startDate`   |                                                                                                                                                      |
| method         | _string_ | Android   | Method of alerting the user that this alarm should use; on iOS this is always a notification                                                                  | `Calendar.AlarmMethod.ALARM`, `Calendar.AlarmMethod.ALERT`, `Calendar.AlarmMethod.EMAIL`, `Calendar.AlarmMethod.SMS`, `Calendar.AlarmMethod.DEFAULT` |

### Source

A source account that owns a particular calendar. Expo apps will typically not need to interact with Source objects.

| Field name     | Type      | Platforms | Description                                           | Possible values                                                                                                                                                                                                |
| -------------- | --------- | --------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | _string_  | iOS       | Internal ID that represents this source on the device |                                                                                                                                                                                                                |
| name           | _string_  | both      | Name for the account that owns this calendar          |                                                                                                                                                                                                                |
| type           | _string_  | both      | Type of account that owns this calendar               | on iOS, one of `Calendar.SourceType.LOCAL`, `Calendar.SourceType.EXCHANGE`, `Calendar.SourceType.CALDAV`, `Calendar.SourceType.MOBILEME`, `Calendar.SourceType.SUBSCRIBED`, or `Calendar.SourceType.BIRTHDAYS` |
| isLocalAccount | _boolean_ | Android   | Whether this source is the local phone account        |                                                                                                                                                                                                                |

## Enum Types

### `Calendar.DayOfTheWeek`

| DayOfTheWeek             | Value |
| ------------------------ | ----- |
| `DayOfTheWeek.Sunday`    | 1     |
| `DayOfTheWeek.Monday`    | 2     |
| `DayOfTheWeek.Tuesday`   | 3     |
| `DayOfTheWeek.Wednesday` | 4     |
| `DayOfTheWeek.Thursday`  | 5     |
| `DayOfTheWeek.Friday`    | 6     |
| `DayOfTheWeek.Saturday`  | 7     |

### `Calendar.MonthOfTheYear`

| MonthOfTheYear             | Value |
| -------------------------- | ----- |
| `MonthOfTheYear.January`   | 1     |
| `MonthOfTheYear.February`  | 2     |
| `MonthOfTheYear.March`     | 3     |
| `MonthOfTheYear.April`     | 4     |
| `MonthOfTheYear.May`       | 5     |
| `MonthOfTheYear.June`      | 6     |
| `MonthOfTheYear.July`      | 7     |
| `MonthOfTheYear.August`    | 8     |
| `MonthOfTheYear.September` | 9     |
| `MonthOfTheYear.October`   | 10    |
| `MonthOfTheYear.November`  | 11    |
| `MonthOfTheYear.December`  | 12    |
