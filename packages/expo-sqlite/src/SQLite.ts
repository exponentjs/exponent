import './polyfillNextTick';

import customOpenDatabase from '@expo/websql/custom';
import { NativeModulesProxy, Platform } from '@unimodules/core';

import { Query, ResultSet, ResultSetError, SQLiteCallback, WebSQLDatabase } from './SQLite.types';

const { ExponentSQLite } = NativeModulesProxy;

function zipObject(keys: string[], values: any[]): Record<string, any> {
  const output: Record<string, any> = {};

  for (const index in keys) {
    const key = keys[index];
    output[key] = values[index];
  }
  return output;
}

class SQLiteDatabase {
  _name: string;
  _closed: boolean = false;

  constructor(name: string) {
    this._name = name;
  }

  exec(queries: Query[], readOnly: boolean, callback: SQLiteCallback): void {
    if (this._closed) {
      throw new Error(`The SQLite database is closed`);
    }

    ExponentSQLite.exec(this._name, queries.map(_serializeQuery), readOnly).then(
      nativeResultSets => {
        callback(null, nativeResultSets.map(_deserializeResultSet));
      },
      error => {
        // TODO: make the native API consistently reject with an error, not a string or other type
        callback(error instanceof Error ? error : new Error(error));
      }
    );
  }

  close() {
    this._closed = true;
    ExponentSQLite.close(this._name);
  }
}

function _serializeQuery(query: Query): [string, unknown[]] {
  return [query.sql, Platform.OS === 'android' ? query.args.map(_escapeBlob) : query.args];
}

function _deserializeResultSet(nativeResult): ResultSet | ResultSetError {
  const [errorMessage, insertId, rowsAffected, columns, rows] = nativeResult;
  // TODO: send more structured error information from the native module so we can better construct
  // a SQLException object
  if (errorMessage !== null) {
    return { error: new Error(errorMessage) } as ResultSetError;
  }

  return {
    insertId,
    rowsAffected,
    rows: rows.map(row => zipObject(columns, row)),
  };
}

function _escapeBlob<T>(data: T): T {
  if (typeof data === 'string') {
    /* eslint-disable no-control-regex */
    return data
      .replace(/\u0002/g, '\u0002\u0002')
      .replace(/\u0001/g, '\u0001\u0002')
      .replace(/\u0000/g, '\u0001\u0001') as any;
    /* eslint-enable no-control-regex */
  } else {
    return data;
  }
}

const _openExpoSQLiteDatabase = customOpenDatabase(SQLiteDatabase);

function addExecMethod(db: any): WebSQLDatabase {
  db.exec = (queries: Query[], readOnly: boolean, callback: SQLiteCallback): void => {
    db._db.exec(queries, readOnly, callback);
  };
  return db;
}

export function openDatabase(
  name: string,
  version: string = '1.0',
  description: string = name,
  size: number = 1,
  callback?: (db: WebSQLDatabase) => void
): WebSQLDatabase {
  if (name === undefined) {
    throw new TypeError(`The database name must not be undefined`);
  }
  const db = _openExpoSQLiteDatabase(name, version, description, size, callback);
  const dbWithExec = addExecMethod(db);
  return dbWithExec;
}
