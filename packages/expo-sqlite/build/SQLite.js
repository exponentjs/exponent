import './polyfillNextTick';
import customOpenDatabase from '@expo/websql/custom';
import { NativeModulesProxy, Platform } from '@unimodules/core';
const { ExponentSQLite } = NativeModulesProxy;
function zipObject(keys, values) {
    const output = {};
    for (const index in keys) {
        const key = keys[index];
        output[key] = values[index];
    }
    return output;
}
class SQLiteDatabase {
    constructor(name) {
        this._closed = false;
        this._name = name;
    }
    exec(queries, readOnly, callback) {
        if (this._closed) {
            throw new Error(`The SQLite database is closed`);
        }
        ExponentSQLite.exec(this._name, queries.map(_serializeQuery), readOnly).then(nativeResultSets => {
            callback(null, nativeResultSets.map(_deserializeResultSet));
        }, error => {
            // TODO: make the native API consistently reject with an error, not a string or other type
            callback(error instanceof Error ? error : new Error(error));
        });
    }
    close() {
        this._closed = true;
        ExponentSQLite.close(this._name);
    }
}
function _serializeQuery(query) {
    return [query.sql, Platform.OS === 'android' ? query.args.map(_escapeBlob) : query.args];
}
function _deserializeResultSet(nativeResult) {
    const [errorMessage, insertId, rowsAffected, columns, rows] = nativeResult;
    // TODO: send more structured error information from the native module so we can better construct
    // a SQLException object
    if (errorMessage !== null) {
        return { error: new Error(errorMessage) };
    }
    return {
        insertId,
        rowsAffected,
        rows: rows.map(row => zipObject(columns, row)),
    };
}
function _escapeBlob(data) {
    if (typeof data === 'string') {
        /* eslint-disable no-control-regex */
        return data
            .replace(/\u0002/g, '\u0002\u0002')
            .replace(/\u0001/g, '\u0001\u0002')
            .replace(/\u0000/g, '\u0001\u0001');
        /* eslint-enable no-control-regex */
    }
    else {
        return data;
    }
}
const _openExpoSQLiteDatabase = customOpenDatabase(SQLiteDatabase);
function addExecMethod(db) {
    db.exec = (queries, readOnly, callback) => {
        db._db.exec(queries, readOnly, callback);
    };
    return db;
}
export function openDatabase(name, version = '1.0', description = name, size = 1, callback) {
    if (name === undefined) {
        throw new TypeError(`The database name must not be undefined`);
    }
    const db = _openExpoSQLiteDatabase(name, version, description, size, callback);
    const dbWithExec = addExecMethod(db);
    return dbWithExec;
}
//# sourceMappingURL=SQLite.js.map