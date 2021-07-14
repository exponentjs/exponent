// Definitions copied from `@types/websql` as we want
// to expose a custom version of the API that:
// - uses primitive `string` instead of `String`
// - excludes some methods that are not exposed by our API.
//
// Original definitions by: TeamworkGuy2 <https://github.com/TeamworkGuy2>

export interface Window {
  openDatabase?: (
    name: string,
    version: string,
    displayName: string,
    estimatedSize: number,
    creationCallback?: DatabaseCallback
  ) => Database;
}

export interface DatabaseCallback {
  (database: Database): void;
}

export interface Database {
  version: string;

  transaction(
    callback: SQLTransactionCallback,
    errorCallback?: SQLTransactionErrorCallback,
    successCallback?: SQLVoidCallback
  ): void;

  readTransaction(
    callback: SQLTransactionCallback,
    errorCallback?: SQLTransactionErrorCallback,
    successCallback?: SQLVoidCallback
  ): void;
}

export interface SQLVoidCallback {
  (): void;
}

export interface SQLTransactionCallback {
  (transaction: SQLTransaction): void;
}

export interface SQLTransactionErrorCallback {
  (error: SQLError): void;
}

export interface SQLTransaction {
  executeSql(
    sqlStatement: string,
    args?: any[],
    callback?: SQLStatementCallback,
    errorCallback?: SQLStatementErrorCallback
  ): void;
}

export interface SQLStatementCallback {
  (transaction: SQLTransaction, resultSet: SQLResultSet): void;
}

export interface SQLStatementErrorCallback {
  (transaction: SQLTransaction, error: SQLError): boolean;
}

export interface SQLResultSet {
  insertId: number;
  rowsAffected: number;
  rows: SQLResultSetRowList;
}

export interface SQLResultSetRowList {
  length: number;
  item(index: number): any;
  _array: number[];
}

export declare class SQLError {
  static UNKNOWN_ERR: number;
  static DATABASE_ERR: number;
  static VERSION_ERR: number;
  static TOO_LARGE_ERR: number;
  static QUOTA_ERR: number;
  static SYNTAX_ERR: number;
  static CONSTRAINT_ERR: number;
  static TIMEOUT_ERR: number;

  code: number;
  message: string;
}

export interface WebSQLDatabase extends Database {
  exec(queries: Query[], readOnly: boolean, callback: SQLiteCallback): void;
}

export type Query = { sql: string; args: unknown[] };

export interface ResultSetError {
  error: Error;
}
export interface ResultSet {
  insertId?: number;
  rowsAffected: number;
  rows: { [column: string]: any }[];
}

export type SQLiteCallback = (
  error?: Error | null,
  resultSet?: (ResultSetError | ResultSet)[]
) => void;
