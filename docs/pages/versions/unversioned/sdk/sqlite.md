---
title: SQLite
sourceCodeUrl: 'https://github.com/expo/expo/tree/master/packages/expo-sqlite'
---

import InstallSection from '~/components/plugins/InstallSection';
import PlatformsSection from '~/components/plugins/PlatformsSection';

**`expo-sqlite`** gives your app access to a database that can be queried through a [WebSQL](https://www.w3.org/TR/webdatabase/)-like API. The database is persisted across restarts of your app.

An [example to do list app](https://github.com/expo/examples/tree/master/with-sqlite) is available that uses this module for storage.

<PlatformsSection android emulator ios simulator />

## Installation

<InstallSection packageName="expo-sqlite" />

## API

```js
import * as SQLite from 'expo-sqlite';
```

### `SQLite.openDatabase(name, version, description, size)`

Open a database, creating it if it doesn't exist, and return a `Database` object. On disk, the database will be created under the app's [documents directory](filesystem.md), i.e. `${FileSystem.documentDirectory}/SQLite/${name}`.

#### Arguments

- **name (_string_)** -- Name of the database file to open.

The `version`, `description` and `size` arguments are ignored, but are accepted by the function for compatibility with the WebSQL specification.

#### Returns

Returns a `Database` object, described below.

### `Database` objects

`Database` objects are returned by calls to `SQLite.openDatabase()`. Such an object represents a connection to a database on your device. They support one method:

- `db.transaction(callback, error, success)`

  Execute a database transaction.

  #### Parameters

  - **callback (_function_)** -- A function representing the transaction to perform. Takes a `Transaction` (see below) as its only parameter, on which it can add SQL statements to execute.
  - **error (_function_)** -- Called if an error occured processing this transaction. Takes a single parameter describing the error.
  - **success (_function_)** -- Called when the transaction has completed executing on the database.

### `Transaction` objects

A `Transaction` object is passed in as a parameter to the `callback` parameter for the `db.transaction()` method on a `Database` (see above). It allows enqueuing SQL statements to perform in a database transaction. It supports one method:

- `tx.executeSql(sqlStatement, arguments, success, error)`

  Enqueue a SQL statement to execute in the transaction. Authors are strongly recommended to make use of the `?` placeholder feature of the method to avoid against SQL injection attacks, and to never construct SQL statements on the fly.

  #### Parameters

  - **sqlStatement (_string_)** -- A string containing a database query to execute expressed as SQL. The string may contain `?` placeholders, with values to be substituted listed in the `arguments` parameter.
  - **arguments (_array_)** -- An array of values (numbers or strings) to substitute for `?` placeholders in the SQL statement.
  - **success (_function_)** -- Called when the query is successfully completed during the transaction. Takes two parameters: the transaction itself, and a `ResultSet` object (see below) with the results of the query.
  - **error (_function_)** -- Called if an error occured executing this particular query in the transaction. Takes two parameters: the transaction itself, and the error object.

### `ResultSet` objects

`ResultSet` objects are returned through second parameter of the `success` callback for the `tx.executeSql()` method on a `Transaction` (see above). They have the following form:

```
{
  insertId,
  rowsAffected,
  rows: {
    length,
    item(),
    _array,
  },
}
```

- **insertId (_number_)** -- The row ID of the row that the SQL statement inserted into the database, if a row was inserted.

- **rowsAffected (_number_)** -- The number of rows that were changed by the SQL statement.

- **rows.length (_number_)** -- The number of rows returned by the query.

- **rows.item (_function_)** -- `rows.item(index)` returns the row with the given `index`. If there is no such row, returns `null`.

- **rows._array (\_number_)** -- The actual array of rows returned by the query. Can be used directly instead of getting rows through `rows.item()`.

## Guides

### Importing an existing database

In order to open a new SQLite database using an existing `.db` file you already have, you need to do three things:

- `expo install expo-file-system expo-asset @expo/metro-config`
- create a `metro.config.js` file in the root of your project with the following contents ([curious why? read here](../../../guides/customizing-metro.md#adding-more-file-extensions-to-assetexts)):

```ts
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'db'],
  },
};
```

- Use the following function (or similar) to open your database:

```ts
async function openDatabase(pathToDatabaseFile: string): SQLite.WebSQLDatabase {
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
  await FileSystem.downloadAsync(
    Asset.fromModule(require(pathToDatabaseFile)).uri,
    FileSystem.documentDirectory + 'SQLite/myDatabaseName.db'
  );
  return SQLite.openDatabase('myDatabaseName.db');
}
```

### Executing statements outside of a transaction

> Please note that you should use this kind of execution only when it is necessary. For instance, when code is a no-op within transactions (like eg. `PRAGMA foreign_keys = ON;`).

```js
const db = SQLite.openDatabase('dbName', version);

db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
  console.log('Foreign keys turned on')
);
```
