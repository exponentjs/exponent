---
title: Contacts
sourceCodeUrl: 'https://github.com/expo/expo/tree/sdk-37/packages/expo-contacts'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';
import SnackInline from '~/components/plugins/SnackInline';
import TableOfContentSection from '~/components/plugins/TableOfContentSection';

**`expo-contacts`** provides access to the device's system contacts, allowing you to get contact information as well as adding, editing, or removing contacts.

<PlatformsSection android emulator ios simulator />

## Installation

<InstallSection packageName="expo-contacts" />

## Configuration

In Managed apps, `Contacts` requires `Permissions.CONTACTS`.

For standalone iOS apps, you'll need to [customize the permission dialog](../../distribution/app-stores/#system-permissions-dialogs-on-ios) by adding the `NSContactsUsageDescription` key under the `ios.infoPlist` key in your `app.json` or `app.config.js`. Failing to do so may result in Apple rejecting your app.

```
  "infoPlist": {
    "NSContactsUsageDescription": "your-custom-message-here."
  }
```

## Example Usage

<SnackInline label='Basic Contacts Usage' templateId='contacts' dependencies={['expo-contacts']}>

```js
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Contacts from 'expo-contacts';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          const contact = data[0];
          console.log(contact);
        }
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text>Contacts Module Example</Text>
    </View>
  );
}
```

</SnackInline>

## API

```js
import * as Contacts from 'expo-contacts';
```

<TableOfContentSection title='Methods' contents={['Contacts.requestPermissionsAsync', 'Contacts.getPermissionsAsync', 'Contacts.getContactsAsync(contactQuery)', 'Contacts.getContactByIdAsync(contactId, fields)', 'Contacts.addContactAsync(contact, containerId)', 'Contacts.updateContactAsync(contact)', 'Contacts.presentFormAsync(contactId, contact, formOptions)', 'Contacts.removeContactAsync(contactId)', 'Contacts.writeContactToFileAsync(contactQuery)']} />

<TableOfContentSection title='iOS-only Methods' contents={['Contacts.addExistingGroupToContainerAsync(groupId, containerId)', 'Contacts.createGroupAsync(groupName, containerId?)', 'Contacts.updateGroupNameAsync(groupName, groupId)', 'Contacts.removeGroupAsync(groupId)', 'Contacts.addExistingContactToGroupAsync(contactId, groupId)', 'Contacts.removeContactFromGroupAsync(contactId, groupId)', 'Contacts.getGroupsAsync(query)', 'Contacts.getDefaultContainerIdAsync()', 'Contacts.getContainersAsync(containerQuery)']} />

<TableOfContentSection title='Types' contents={['Contact', 'Group', 'Container', 'Date', 'Relationship', 'Email', 'PhoneNumber', 'Address', 'SocialProfile', 'InstantMessageAddress', 'UrlAddress', 'Image', 'FormOptions', 'ContactQuery', 'GroupQuery', 'ContainerQuery', 'ContactResponse']} />

<TableOfContentSection title='Constants' contents={['Field', 'FormType', 'ContactType', 'SortType', 'ContainerType', 'CalendarFormat']} />

## Methods

### `Contacts.requestPermissionsAsync()`

Asks the user to grant permissions for accessing contacts data. Alias for `Permissions.askAsync(Permissions.CONTACTS)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `Contacts.getPermissionsAsync()`

Checks user's permissions for accessing contacts data. Alias for `Permissions.getAsync(Permissions.CONTACTS)`.

#### Returns

A promise that resolves to an object of type [PermissionResponse](../permissions/#permissionresponse).

### `Contacts.getContactsAsync(contactQuery)`

```js
Contacts.getContactsAsync(contactQuery: ContactQuery): Promise<ContactResponse>
```

Return a list of contacts that fit a given criteria.
You can get all of the contacts by passing no criteria.

**Parameters**

| Name         | Type           | Description             |
| ------------ | -------------- | ----------------------- |
| contactQuery | `ContactQuery` | Used to query contacts. |

**Returns**

| Name            | Type              | Description                       |
| --------------- | ----------------- | --------------------------------- |
| contactResponse | `ContactResponse` | Contacts returned from the query. |

**Example**

```js
const { data } = await Contacts.getContactsAsync({
  fields: [Contacts.Fields.Emails],
});

if (data.length > 0) {
  const contact = data[0];
  console.log(contact);
}
```

### `Contacts.getContactByIdAsync(contactId, fields)`

```js
Contacts.getContactByIdAsync(contactId: string, fields: FieldType[]): Promise<Contact>
```

Returns a contact matching the input id. Used for gathering precise data about a contact.

**Parameters**

| Name      | Type          | Description                                                                                  |
| --------- | ------------- | -------------------------------------------------------------------------------------------- |
| contactId | `string`      | The ID of a system contact.                                                                  |
| fields    | `FieldType[]` | If available the fields defined will be returned. If `nil` then all fields will be returned. |

**Returns**

| Name    | Type      | Description                               |
| ------- | --------- | ----------------------------------------- |
| contact | `Contact` | Contact with an ID matching the input ID. |

**Example**

```js
const contact = await Contacts.getContactByIdAsync('161A368D-D614-4A15-8DC6-665FDBCFAE55');
if (contact) {
  console.log(contact);
}
```

### `Contacts.addContactAsync(contact, containerId)`

```js
Contacts.addContactAsync(contact: Contact, containerId: string): Promise<string>
```

Creates a new contact and adds it to the system.

> **Note**: For Android users, the Expo client App does not have the required `WRITE_CONTACTS` permission to write to Contacts. In order to do this, you must build a [standalone app](../../distribution/building-standalone-apps/) and add permission through there.

**Parameters**

| Name        | Type      | Description                                                                          |
| ----------- | --------- | ------------------------------------------------------------------------------------ |
| contact     | `Contact` | A contact with the changes you wish to persist. The `id` parameter will not be used. |
| containerId | `string`  | IOS ONLY: The container that will parent the contact                                 |

**Returns**

| Name      | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| contactId | `string` | ID of the new system contact. |

**Example**

```js
const contact = {
  [Contacts.Fields.FirstName]: 'Bird',
  [Contacts.Fields.LastName]: 'Man',
  [Contacts.Fields.Company]: 'Young Money',
};
const contactId = await Contacts.addContactAsync(contact);
```

### `Contacts.updateContactAsync(contact)`

> iOS Only - temporary

```js
Contacts.updateContactAsync(contact: Contact): Promise<string>
```

Mutate the information of an existing contact.

> On Android, you can use `presentFormAsync` to make edits to contacts.
> Due to an iOS bug, `nonGregorianBirthday` cannot be modified.

### `Contacts.presentFormAsync(contactId, contact, formOptions)`

```js
Contacts.presentFormAsync(contactId: string, contact: Contact, formOptions: FormOptions): Promise<any>
```

Present a native form for manipulating contacts

**Parameters**

| Name        | Type          | Description                                     |
| ----------- | ------------- | ----------------------------------------------- |
| contactId   | `string`      | The ID of a system contact.                     |
| contact     | `Contact`     | A contact with the changes you wish to persist. |
| formOptions | `FormOptions` | Options for the native editor                   |

**Example**

```js
// Edit contact
await Contacts.presentFormAsync('161A368D-D614-4A15-8DC6-665FDBCFAE55');
```

**Parameters**

| Name    | Type      | Description                                                                           |
| ------- | --------- | ------------------------------------------------------------------------------------- |
| contact | `Contact` | A contact with the changes you wish to persist. The contact must contain a vaild `id` |

**Returns**

| Name      | Type     | Description                 |
| --------- | -------- | --------------------------- |
| contactId | `string` | The ID of a system contact. |

**Example**

```js
const contact = {
  id: '161A368D-D614-4A15-8DC6-665FDBCFAE55',
  [Contacts.Fields.FirstName]: 'Drake',
  [Contacts.Fields.Company]: 'Young Money',
};
await Contacts.updateContactAsync(contact);
```

### `Contacts.removeContactAsync(contactId)`

> iOS Only - temporary

```js
Contacts.removeContactAsync(contactId: string): Promise<any>
```

Delete a contact from the system.

**Parameters**

| Name      | Type     | Description                           |
| --------- | -------- | ------------------------------------- |
| contactId | `string` | ID of the contact you want to delete. |

**Example**

```js
await Contacts.removeContactAsync('161A368D-D614-4A15-8DC6-665FDBCFAE55');
```

### `Contacts.writeContactToFileAsync(contactQuery)`

```js
Contacts.writeContactToFileAsync(contactQuery: ContactQuery): Promise<string>
```

Query a set of contacts and write them to a local uri that can be used for sharing with `ReactNative.Share`.

**Parameters**

| Name         | Type           | Description                               |
| ------------ | -------------- | ----------------------------------------- |
| contactQuery | `ContactQuery` | Used to query contacts you want to write. |

**Returns**

| Name     | Type     | Description         |
| -------- | -------- | ------------------- |
| localUri | `string` | Shareable local uri |

**Example**

```js
const localUri = await Contacts.writeContactToFileAsync({
  id: '161A368D-D614-4A15-8DC6-665FDBCFAE55',
});
Share.share({ url: localUri, message: 'Call me!' });
```

---

## IOS-Only Methods

iOS contacts have a multi-layered grouping system that you can access through this API.

### `Contacts.addExistingGroupToContainerAsync(groupId, containerId)`

```js
Contacts.addExistingGroupToContainerAsync(groupId: string, containerId: string): Promise<any>
```

Add a group to a container.

**Parameters**

| Name        | Type     | Description                             |
| ----------- | -------- | --------------------------------------- |
| groupId     | `string` | The group you wish to target.           |
| containerId | `string` | The container you to add membership to. |

**Example**

```js
await Contacts.addExistingGroupToContainerAsync(
  '161A368D-D614-4A15-8DC6-665FDBCFAE55',
  '665FDBCFAE55-D614-4A15-8DC6-161A368D'
);
```

### `Contacts.createGroupAsync(groupName, containerId?)`

```js
Contacts.createGroupAsync(groupName: string, containerId?: string): Promise<string>
```

Create a group with a name, and add it to a container. If the container is undefined, the default container will be targeted.

**Parameters**

| Name        | Type     | Description                             |
| ----------- | -------- | --------------------------------------- |
| name        | `string` | Name of the new group.                  |
| containerId | `string` | The container you to add membership to. |

**Returns**

| Name    | Type     | Description          |
| ------- | -------- | -------------------- |
| groupId | `string` | ID of the new group. |

**Example**

```js
const groupId = await Contacts.createGroupAsync('Sailor Moon');
```

### `Contacts.updateGroupNameAsync(groupName, groupId)`

```js
Contacts.updateGroupNameAsync(groupName: string, groupId: string): Promise<any>
```

Change the name of an existing group.

**Parameters**

| Name      | Type     | Description                        |
| --------- | -------- | ---------------------------------- |
| groupName | `string` | New name for an existing group.    |
| groupId   | `string` | ID for the group you want to edit. |

**Example**

```js
await Contacts.updateGroupName('Sailor Moon', '161A368D-D614-4A15-8DC6-665FDBCFAE55');
```

### `Contacts.removeGroupAsync(groupId)`

```js
Contacts.removeGroupAsync(groupId: string): Promise<any>
```

Delete a group from the device.

**Parameters**

| Name    | Type     | Description      |
| ------- | -------- | ---------------- |
| groupId | `string` | ID of the group. |

**Example**

```js
await Contacts.removeGroupAsync('161A368D-D614-4A15-8DC6-665FDBCFAE55');
```

### `Contacts.addExistingContactToGroupAsync(contactId, groupId)`

```js
Contacts.addExistingContactToGroupAsync(contactId: string, groupId: string): Promise<any>
```

Add a contact as a member to a group. A contact can be a member of multiple groups.

**Parameters**

| Name      | Type     | Description                                     |
| --------- | -------- | ----------------------------------------------- |
| contactId | `string` | ID of the contact you want to edit.             |
| groupId   | `string` | ID for the group you want to add membership to. |

**Example**

```js
await Contacts.addExistingContactToGroupAsync(
  '665FDBCFAE55-D614-4A15-8DC6-161A368D',
  '161A368D-D614-4A15-8DC6-665FDBCFAE55'
);
```

### `Contacts.removeContactFromGroupAsync(contactId, groupId)`

```js
Contacts.removeContactFromGroupAsync(contactId: string, groupId: string): Promise<any>
```

Remove a contact's membership from a given group. This will not delete the contact.

**Parameters**

| Name      | Type     | Description                                        |
| --------- | -------- | -------------------------------------------------- |
| contactId | `string` | ID of the contact you want to remove.              |
| groupId   | `string` | ID for the group you want to remove membership of. |

**Example**

```js
await Contacts.removeContactFromGroupAsync(
  '665FDBCFAE55-D614-4A15-8DC6-161A368D',
  '161A368D-D614-4A15-8DC6-665FDBCFAE55'
);
```

### `Contacts.getGroupsAsync(query)`

```js
Contacts.getGroupsAsync(query: GroupQuery): Promise<Group[]>
```

Query and return a list of system groups.

**Parameters**

| Name  | Type         | Description                                         |
| ----- | ------------ | --------------------------------------------------- |
| query | `GroupQuery` | Information regarding which groups you want to get. |

**Returns**

| Name   | Type      | Description                          |
| ------ | --------- | ------------------------------------ |
| groups | `Group[]` | Collection of groups that fit query. |

**Example**

```js
const groups = await Contacts.getGroupsAsync({ groupName: 'sailor moon' });
const allGroups = await Contacts.getGroupsAsync({});
```

### `Contacts.getDefaultContainerIdAsync()`

```js
Contacts.getDefaultContainerIdAsync(): Promise<string>
```

Get the default container's ID.

**Returns**

| Name        | Type     | Description           |
| ----------- | -------- | --------------------- |
| containerId | `string` | Default container ID. |

**Example**

```js
const containerId = await Contacts.getDefaultContainerIdAsync();
```

### `Contacts.getContainersAsync(containerQuery)`

```js
Contacts.getContainersAsync(containerQuery: ContainerQuery): Promise<Container[]>
```

Query a list of system containers.

**Parameters**

| Name           | Type             | Description                            |
| -------------- | ---------------- | -------------------------------------- |
| containerQuery | `ContainerQuery` | Information used to gather containers. |

**Returns**

| Name        | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| containerId | `string` | Collection of containers that fit query. |

**Example**

```js
const allContainers = await Contacts.getContainersAsync({
  contactId: '665FDBCFAE55-D614-4A15-8DC6-161A368D',
});
```

## Types

### Contact

A set of fields that define information about a single entity.

| Name                    | Type                      | Description                                                    | iOS | Android |
| ----------------------- | ------------------------- | -------------------------------------------------------------- | --- | ------- |
| id                      | `string`                  | Immutable identifier used for querying and indexing.           | ✅  | ✅      |
| name                    | `string`                  | Full name with proper format.                                  | ✅  | ✅      |
| firstName               | `string`                  | Given name.                                                    | ✅  | ✅      |
| middleName              | `string`                  | Middle name.                                                   | ✅  | ✅      |
| lastName                | `string`                  | Family name.                                                   | ✅  | ✅      |
| maidenName              | `string`                  | Maiden name.                                                   | ✅  | ✅      |
| namePrefix              | `string`                  | Dr. Mr. Mrs. Ect...                                            | ✅  | ✅      |
| nameSuffix              | `string`                  | Jr. Sr. Ect...                                                 | ✅  | ✅      |
| nickname                | `string`                  | An alias to the proper name.                                   | ✅  | ✅      |
| phoneticFirstName       | `string`                  | Pronunciation of the first name.                               | ✅  | ✅      |
| phoneticMiddleName      | `string`                  | Pronunciation of the middle name.                              | ✅  | ✅      |
| phoneticLastName        | `string`                  | Pronunciation of the last name.                                | ✅  | ✅      |
| company                 | `string`                  | Organization the entity belongs to.                            | ✅  | ✅      |
| jobTitle                | `string`                  | Job description.                                               | ✅  | ✅      |
| department              | `string`                  | Job department.                                                | ✅  | ✅      |
| note                    | `string`                  | Additional information.                                        | ✅  | ✅      |
| imageAvailable          | `boolean`                 | Used for efficient retrieval of images.                        | ✅  | ✅      |
| image                   | `Image`                   | Thumbnail image (ios: 320x320)                                 | ✅  | ✅      |
| rawImage                | `Image`                   | Raw image without cropping, usually large.                     | ✅  | ✅      |
| contactType             | `ContactType`             | Denoting a person or company.                                  | ✅  | ✅      |
| birthday                | `Date`                    | Birthday information in JS format.                             | ✅  | ✅      |
| dates                   | `Date[]`                  | A list of other relevant user dates.                           | ✅  | ✅      |
| relationships           | `Relationship[]`          | Names of other relevant user connections                       | ✅  | ✅      |
| emails                  | `Email[]`                 | Email addresses                                                | ✅  | ✅      |
| phoneNumbers            | `PhoneNumber[]`           | Phone numbers                                                  | ✅  | ✅      |
| addresses               | `Address[]`               | Locations                                                      | ✅  | ✅      |
| instantMessageAddresses | `InstantMessageAddress[]` | IM connections                                                 | ✅  | ✅      |
| urlAddresses            | `UrlAddress[]`            | Web Urls                                                       | ✅  | ✅      |
| nonGregorianBirthday    | `Date`                    | Birthday that doesn't conform to the Gregorian calendar format | ✅  | ❌      |
| socialProfiles          | `SocialProfile[]`         | Social networks                                                | ✅  | ❌      |
| thumbnail               | `Image`                   | Deprecated: Use `image`                                        | ❌  | ❌      |
| previousLastName        | `string`                  | Deprecated: Use `maidenName`                                   | ❌  | ❌      |

### Group

> iOS Only

A parent to contacts. A contact can belong to multiple groups.
To get a group's children you can query with `getContactsAsync({ groupId })`

Here are some different query operations:

- Child Contacts: `getContactsAsync({ groupId })`
- Groups From Container: `getGroupsAsync({ containerId })`
- Groups Named: `getContainersAsync({ groupName })`

| Name | Type     | Description                         |
| ---- | -------- | ----------------------------------- |
| id   | `string` | Immutable id representing the group |
| name | `string` | The editable name of a group        |

### Container

> iOS Only

A parent to contacts and groups. You can query the default container with `getDefaultContainerIdAsync()`.
Here are some different query operations:

- Child Contacts: `getContactsAsync({ containerId })`
- Child Groups: `getGroupsAsync({ containerId })`
- Container from Contact: `getContainersAsync({ contactId })`
- Container from Group: `getContainersAsync({ groupId })`
- Container from ID: `getContainersAsync({ containerId })`

| Name | Type     | Description                         |
| ---- | -------- | ----------------------------------- |
| id   | `string` | Immutable id representing the group |
| name | `string` | The editable name of a group        |

### Date

| Name   | Type                 | Description                                       |
| ------ | -------------------- | ------------------------------------------------- |
| day    | `number`             | Day.                                              |
| month  | `number`             | Month - adjusted for JS `Date` which starts at 0. |
| year   | `number`             | Year.                                             |
| format | `CalendarFormatType` | Format for input date.                            |
| id     | `string`             | Unique ID.                                        |
| label  | `string`             | Localized display name.                           |

### Relationship

| Name  | Type     | Description              |
| ----- | -------- | ------------------------ |
| name  | `string` | Name of related contact. |
| id    | `string` | Unique ID.               |
| label | `string` | Localized display name.  |

### Email

| Name      | Type      | Description             |
| --------- | --------- | ----------------------- |
| email     | `string`  | email address.          |
| isPrimary | `boolean` | Primary email address.  |
| id        | `string`  | Unique ID.              |
| label     | `string`  | Localized display name. |

### PhoneNumber

| Name        | Type      | Description                               |
| ----------- | --------- | ----------------------------------------- |
| number      | `string`  | Phone number.                             |
| isPrimary   | `boolean` | Primary phone number.                     |
| digits      | `string`  | Phone number without format, ex: 8674305. |
| countryCode | `string`  | Country code, ex: +1.                     |
| id          | `string`  | Unique ID.                                |
| label       | `string`  | Localized display name.                   |

### Address

| Name           | Type     | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| street         | `string` | Street name.                                                      |
| city           | `string` | City name.                                                        |
| country        | `string` | Country name.                                                     |
| region         | `string` | Region or state name.                                             |
| neighborhood   | `string` | Neighborhood name.                                                |
| postalCode     | `string` | Local post code.                                                  |
| poBox          | `string` | P.O. Box.                                                         |
| isoCountryCode | `string` | [Standard code](https://www.iso.org/iso-3166-country-codes.html). |
| id             | `string` | Unique ID.                                                        |
| label          | `string` | Localized display name.                                           |

### SocialProfile

> iOS Only

| Name             | Type     | Description             |
| ---------------- | -------- | ----------------------- |
| service          | `string` | Name of social app.     |
| username         | `string` | Username in social app. |
| localizedProfile | `string` | Localized name.         |
| url              | `string` | Web URL.                |
| userId           | `string` | UID for social app.     |
| id               | `string` | Unique ID.              |
| label            | `string` | Localized display name. |

### InstantMessageAddress

| Name             | Type     | Description             |
| ---------------- | -------- | ----------------------- |
| service          | `string` | Name of social app.     |
| username         | `string` | Username in IM app.     |
| localizedService | `string` | Localized name of app.  |
| id               | `string` | Unique ID.              |
| label            | `string` | Localized display name. |

### UrlAddress

| Name  | Type     | Description             |
| ----- | -------- | ----------------------- |
| url   | `string` | Web URL                 |
| id    | `string` | Unique ID.              |
| label | `string` | Localized display name. |

### Image

Information regarding thumbnail images.

| Name   | Type     | iOS | Android |
| ------ | -------- | --- | ------- |
| uri    | `string` | ✅  | ✅      |
| width  | `number` | ✅  | ❌      |
| height | `number` | ✅  | ❌      |
| base64 | `string` | ✅  | ❌      |

> Android: You can get dimensions using `ReactNative.Image.getSize`. Avoid using Base 64 in React Native

### FormOptions

Denotes the functionality of a native contact form.

| Name                     | Type          | Description                                                                         |
| ------------------------ | ------------- | ----------------------------------------------------------------------------------- |
| displayedPropertyKeys    | `FieldType[]` | The properties that will be displayed. iOS: Does nothing in editing mode.           |
| message                  | `string`      | Controller title.                                                                   |
| alternateName            | `string`      | Used if contact doesn't have a name defined.                                        |
| cancelButtonTitle        | `string`      | The name of the left bar button.                                                    |
| groupId                  | `string`      | The parent group for a new contact.                                                 |
| allowsEditing            | `boolean`     | Allows for contact mutation.                                                        |
| allowsActions            | `boolean`     | Actions like share, add, create.                                                    |
| shouldShowLinkedContacts | `boolean`     | Shows similar contacts.                                                             |
| isNew                    | `boolean`     | Present the new contact controller - if false the unknown controller will be shown. |
| preventAnimation         | `boolean`     | Prevents the controller from animating in.                                          |

### ContactQuery

Used to query contacts from the user's device.

| Name        | Type          | Description                                                                                  | iOS | Android |
| ----------- | ------------- | -------------------------------------------------------------------------------------------- | --- | ------- |
| fields      | `FieldType[]` | If available the fields defined will be returned. If `nil` then all fields will be returned. | ✅  | ✅      |
| pageSize    | `number`      | The max number of contacts to return. If `nil` or `0` then all contacts will be returned.    | ✅  | ✅      |
| pageOffset  | `number`      | The number of contacts to skip before gathering contacts.                                    | ✅  | ✅      |
| id          | `string`      | Get contacts with a matching ID .                                                            | ✅  | ✅      |
| sort        | `SortType`    | Sort method used when gathering contacts.                                                    | ❌  | ✅      |
| name        | `string`      | Query contacts matching this name.                                                           | ✅  | ❌      |
| groupId     | `string`      | Get all contacts that belong to the group matching this ID.                                  | ✅  | ❌      |
| containerId | `string`      | Get all contacts that belong to the container matching this ID.                              | ✅  | ❌      |
| rawContacts | `boolean`     | Prevent unification of contacts when gathering. Default: `false`.                            | ✅  | ❌      |

### GroupQuery

> iOS Only

Used to query native contact groups.

| Name        | Type     | Description                                          |
| ----------- | -------- | ---------------------------------------------------- |
| groupName   | `string` | Query all groups matching a name.                    |
| groupId     | `string` | Query the group with a matching ID.                  |
| containerId | `string` | Query all groups that belong to a certain container. |

### ContainerQuery

> iOS Only

Used to query native contact containers.

| Name        | Type     | Description                                     |
| ----------- | -------- | ----------------------------------------------- |
| contactId   | `string` | Query all the containers that parent a contact. |
| groupId     | `string` | Query all the containers that parent a group.   |
| containerId | `string` | Query a container from it's ID.                 |

### ContactResponse

The return value for queried contact operations like `getContactsAsync`.

| Name            | Type        | Description                                                                       |
| --------------- | ----------- | --------------------------------------------------------------------------------- |
| data            | `Contact[]` | An array of contacts that match a particular query.                               |
| hasNextPage     | `boolean`   | This will be true if there are more contacts to retrieve beyond what is returned. |
| hasPreviousPage | `boolean`   | true if there are previous contacts that weren't retrieved due to `pageOffset`.   |
| ~~total~~       | `number`    | **Deprecated:** use `data.length` to get the number of contacts returned.         |

## Constants

### Field

```js
const contactField = Contact.Fields.FirstName;
```

| Name                    | Value                        | iOS | Android |
| ----------------------- | ---------------------------- | --- | ------- |
| ID                      | `'id'`                       | ✅  | ✅      |
| Name                    | `'name'`                     | ✅  | ✅      |
| FirstName               | `'firstName'`                | ✅  | ✅      |
| MiddleName              | `'middleName'`               | ✅  | ✅      |
| LastName                | `'lastName'`                 | ✅  | ✅      |
| NamePrefix              | `'namePrefix'`               | ✅  | ✅      |
| NameSuffix              | `'nameSuffix'`               | ✅  | ✅      |
| PhoneticFirstName       | `'phoneticFirstName'`        | ✅  | ✅      |
| PhoneticMiddleName      | `'phoneticMiddleName'`       | ✅  | ✅      |
| PhoneticLastName        | `'phoneticLastName'`         | ✅  | ✅      |
| Birthday                | `'birthday'`                 | ✅  | ✅      |
| Emails                  | `'emails'`                   | ✅  | ✅      |
| PhoneNumbers            | `'phoneNumbers'`             | ✅  | ✅      |
| Addresses               | `'addresses'`                | ✅  | ✅      |
| InstantMessageAddresses | `'instantMessageAddresses'`  | ✅  | ✅      |
| UrlAddresses            | `'urlAddresses'`             | ✅  | ✅      |
| Company                 | `'company'`                  | ✅  | ✅      |
| JobTitle                | `'jobTitle'`                 | ✅  | ✅      |
| Department              | `'department'`               | ✅  | ✅      |
| ImageAvailable          | `'imageAvailable'`           | ✅  | ✅      |
| Image                   | `'image'`                    | ✅  | ✅      |
| Note                    | `'note'`                     | ✅  | ✅      |
| Dates                   | `'dates'`                    | ✅  | ✅      |
| Relationships           | `'relationships'`            | ✅  | ✅      |
| Nickname                | `'nickname'`                 | ✅  | ✅      |
| RawImage                | `'rawImage'`                 | ✅  | ✅      |
| MaidenName              | `'maidenName'`               | ✅  | ✅      |
| ContactType             | `'contactType'`              | ✅  | ✅      |
| SocialProfiles          | `'socialProfiles'`           | ✅  | ❌      |
| NonGregorianBirthday    | `'nonGregorianBirthday'`     | ✅  | ❌      |
| Thumbnail               | Deprecated: use `Image`      | ❌  | ❌      |
| PreviousLastName        | Deprecated: use `MaidenName` | ❌  | ❌      |

### FormType

```js
const formType = Contacts.FormTypes.New;
```

| Name    | Value       | Description                       |
| ------- | ----------- | --------------------------------- |
| New     | `'new'`     | Creating a contact                |
| Unknown | `'unknown'` | Displaying a contact with actions |
| Default | `'default'` | Information regarding a contact   |

### ContactType

> iOS Only

```js
const contactType = Contacts.ContactTypes.Person;
```

| Name    | Value       | Description                 |
| ------- | ----------- | --------------------------- |
| Person  | `'person'`  | Contact is a human          |
| Company | `'company'` | Contact is group or company |

### SortType

```js
const sortType = Contacts.SortTypes.FirstName;
```

| Name        | Value           | Description                           | iOS | Android |
| ----------- | --------------- | ------------------------------------- | --- | ------- |
| FirstName   | `'firstName'`   | Sort by first name in ascending order | ✅  | ✅      |
| LastName    | `'lastName'`    | Sort by last name in ascending order  | ✅  | ✅      |
| UserDefault | `'userDefault'` | The user default method of sorting    | ✅  | ❌      |

### ContainerType

> iOS Only

```js
const containerType = Contacts.ContainerTypes.CardDAV;
```

| Name       | Value          | Description                       |
| ---------- | -------------- | --------------------------------- |
| Local      | `'local'`      | A local non-iCloud container      |
| Exchange   | `'exchange'`   | In association with Email         |
| CardDAV    | `'cardDAV'`    | cardDAV protocol used for sharing |
| Unassigned | `'unassigned'` | Unknown                           |

### CalendarFormat

```js
const calendarFormat = Contacts.CalendarFormats.Coptic;
```

This format denotes the common calendar format used to specify how a date is calculated in `nonGregorianBirthday` fields.

| Constant  | value         | iOS | Android |
| --------- | ------------- | --- | ------- |
| Gregorian | `'gregorian'` | ✅  | ✅      |
| Chinese   | `'chinese'`   | ✅  | ❌      |
| Hebrew    | `'hebrew'`    | ✅  | ❌      |
| Islamic   | `'islamic'`   | ✅  | ❌      |

### Contact Fields

> Deprecated: Use Contacts.Fields

This table illustrates what fields will be added on demand to every contact.

| Constant               | value                       | iOS            | Android        |
| ---------------------- | --------------------------- | -------------- | -------------- |
| PHONE_NUMBERS          | `'phoneNumbers'`            | ✅             | ✅             |
| EMAILS                 | `'emails'`                  | ✅             | ✅             |
| ADDRESSES              | `'addresses'`               | ✅             | ✅             |
| IMAGE                  | `'image'`                   | ✅             | ✅             |
| NOTE                   | `'note'`                    | ✅             | ✅             |
| NAME_PREFIX            | `'namePrefix'`              | ✅             | ✅             |
| NAME_SUFFIX            | `'nameSuffix'`              | ✅             | ✅             |
| PHONETIC_FIRST_NAME    | `'phoneticFirstName'`       | ✅             | ✅             |
| PHONETIC_MIDDLE_NAME   | `'phoneticMiddleName'`      | ✅             | ✅             |
| PHONETIC_LAST_NAME     | `'phoneticLastName'`        | ✅             | ✅             |
| IM_ADDRESSES           | `'instantMessageAddresses'` | ✅             | ✅             |
| URLS                   | `'urlAddresses'`            | ✅             | ✅             |
| DATES                  | `'dates'`                   | ✅             | ✅             |
| NON_GREGORIAN_BIRTHDAY | `'nonGregorianBirthday'`    | ✅             | ❌             |
| SOCIAL_PROFILES        | `'socialProfiles'`          | ✅             | ❌             |
| RAW_IMAGE              | `'rawImage'`                | ✅             | ❌             |
| THUMBNAIL              | `'thumbnail'`               | **Deprecated** | **Deprecated** |
| PREVIOUS_LAST_NAME     | `'previousLastName'`        | **Deprecated** | **Deprecated** |

## Breaking Changes

### SDK 29

- The `thumbnail` field has been deprecated, use `image` on both platforms instead.
- On iOS `image` is now `rawImage`. There is no Android version of `rawImage`.
- Images now return a localUri instead of Base64 string.
- Base64 string is now returned in a encodable format.
- Empty contact fields will no longer be returned as empty strings on iOS.
- Passing no fields will now return all contact information.
