import * as _ from "lodash";

import { panic } from "./Error";
import { ColumnDefinition } from "./ColumnDefinition";
import { Table } from "./Table";
import { isIndexValid, removeElementWithCheckedIndex } from './Array';
import { ILocalStorage, LocalStorage } from './LocalStorage';
import { unwrap } from "./Util";

export interface Database {
  id: number;
  tables: Array<Table>;
  nextTableId: number;
}

export interface DatabaseServer {
  localStorage: ILocalStorage;
  database: Database;
}

export function createDatabaseServer(id: number): DatabaseServer {
  // try to load the database
  const localStorage = LocalStorage;
  const database = loadDatabase(id, localStorage);

  return {
    localStorage: LocalStorage,
    database: (database !== undefined)
      ? database
      : {
        id: id,
        tables: [],
        nextTableId: 1
      }
  };
}

export function getDatabaseTableByName(databaseServer: DatabaseServer, tableName: string): Table | undefined {
  return databaseServer.database.tables.find(t => t.name === tableName);
}

export enum DatabaseActionKind {
  AddTable,
  AddTableRow,
  RemoveTableRow,
  ChangeTableCell
}

export interface DatabaseAction {
  kind: DatabaseActionKind;
}

export function applyDatabaseAction(databaseServer: DatabaseServer, action: DatabaseAction) {
  switch (action.kind) {
    case DatabaseActionKind.AddTable:
      applyAddTableAction(databaseServer, action as AddTableAction);
      break;
    case DatabaseActionKind.AddTableRow:
      applyAddTableRowAction(databaseServer, action as AddTableRowAction);
      break;
    case DatabaseActionKind.RemoveTableRow:
      applyRemoveTableRowAction(databaseServer, action as RemoveTableRowAction);
      break;
    case DatabaseActionKind.ChangeTableCell:
      applyChangeTableCellAction(databaseServer, action as ChangeTableCellAction);
      break;
    default:
      panic(`Unknown DatabaseActionKind: ${action.kind}`);
  }

  saveDatabase(databaseServer);
}

export interface AddTableAction extends DatabaseAction {
  name: string;
  columnDefinitions: Array<ColumnDefinition>;
}

function applyAddTableAction(databaseServer: DatabaseServer, action: AddTableAction): Table {
  // create table
  const table: Table = {
    id: databaseServer.database.nextTableId,
    name: action.name,
    columnDefinitions: _.cloneDeep(action.columnDefinitions),
    rows: []
  };

  // add row to table
  databaseServer.database.tables.push(table);

  // increment next table's ID
  databaseServer.database.nextTableId++;

  // return the table
  return table;
}

export interface AddTableRowAction extends DatabaseAction {
  tableId: number;
  row: Array<any>;
}

function applyAddTableRowAction(databaseServer: DatabaseServer, action: AddTableRowAction): Array<any> {
  // find table
  const table = databaseServer.database.tables.find(t => t.id === action.tableId);
  if (!table) {
    panic(`Couldn't find table with ID ${action.tableId}.`);
    return [];
  }

  // clone the row so callers can't change data through a reference they hold
  const row = _.cloneDeep(action.row);

  // add row to table
  table.rows.push(row);

  // return the row
  return row;
}

export interface RemoveTableRowAction extends DatabaseAction {
  tableId: number;
  rowIndex: number;
}

function applyRemoveTableRowAction(databaseServer: DatabaseServer, action: RemoveTableRowAction) {
  // find table
  const table = databaseServer.database.tables.find(t => t.id === action.tableId);
  if (!table) {
    panic(`Couldn't find table with ID ${action.tableId}.`);
    return;
  }

  // validate index of row
  if (!isIndexValid(table.rows, action.rowIndex)) {
    panic(`Couldn't find row with index ${action.rowIndex}.`);
    return;
  }

  // remove row
  removeElementWithCheckedIndex(table.rows, action.rowIndex);
}

export interface ChangeTableCellAction extends DatabaseAction {
  tableId: number;
  rowIndex: number;
  columnIndex: number;
  value: any;
}

function applyChangeTableCellAction(databaseServer: DatabaseServer, action: ChangeTableCellAction) {
  // find table
  const table = databaseServer.database.tables.find(t => t.id === action.tableId);
  if (!table) {
    panic(`Couldn't find table with ID ${action.tableId}.`);
    return;
  }

  // validate index of row
  if (!isIndexValid(table.rows, action.rowIndex)) {
    panic(`Couldn't find row with index ${action.rowIndex}.`);
    return;
  }

  // validate index of column
  if (!isIndexValid(table.columnDefinitions, action.columnIndex)) {
    panic(`Couldn't find column with index ${action.columnIndex}.`);
    return;
  }

  // Change value of cell. Copy value so caller can't change it through a reference.
  table.rows[action.rowIndex][action.columnIndex] = _.cloneDeep(action.value);
}

function databaseIdToLocalStorageKey(id: number): string {
  return `db.${id}`;
}

function saveDatabase(databaseServer: DatabaseServer) {
  const key = databaseIdToLocalStorageKey(databaseServer.database.id);
  const value = JSON.stringify(databaseServer.database);
  databaseServer.localStorage.setItem(key, value);
}

function loadDatabase(databaseId: number, localStorage: ILocalStorage): Database | undefined {
  const key = databaseIdToLocalStorageKey(databaseId);
  const value = localStorage.getItem(key);
  if (value !== null) {
    const database = JSON.parse(value);
    return database;
  } else {
    return undefined;
  }
}

export function getOrCreateDatabaseTableByName(
  databaseServer: DatabaseServer,
  name: string,
  columnDefinitions: Array<ColumnDefinition>
): Table {
  let table = getDatabaseTableByName(databaseServer, name);
  if (table !== undefined) { return table; }

  applyDatabaseAction(databaseServer, {
    kind: DatabaseActionKind.AddTable,
    name: name,
    columnDefinitions: columnDefinitions
  } as AddTableAction);
  
  table = unwrap(getDatabaseTableByName(databaseServer, name));
  return table;
}