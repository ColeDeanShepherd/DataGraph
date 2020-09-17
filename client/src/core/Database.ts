import * as _ from "lodash";

import { panic } from "./Error";
import { ColumnDefinition } from "./ColumnDefinition";
import { Table } from "./Table";
import { isIndexValid, removeElementWithCheckedIndex } from './Array';

export interface Database {
  tables: Array<Table>;
  nextTableId: number;
}

export function createDatabase(): Database {
  return {
    tables: [],
    nextTableId: 1
  };
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

export interface AddTableAction extends DatabaseAction {
  name: string;
  columnDefinitions: Array<ColumnDefinition>;
}

export interface AddTableRowAction extends DatabaseAction {
  tableId: number;
  row: Array<any>;
}

export interface RemoveTableRowAction extends DatabaseAction {
  tableId: number;
  rowIndex: number;
}

export interface ChangeTableCellAction extends DatabaseAction {
  tableId: number;
  rowIndex: number;
  columnIndex: number;
  value: any;
}

export function applyDatabaseAction(database: Database, action: DatabaseAction) {
  switch (action.kind) {
    case DatabaseActionKind.AddTable:
      applyAddTableAction(database, action as AddTableAction);
      break;
    case DatabaseActionKind.AddTableRow:
      applyAddTableRowAction(database, action as AddTableRowAction);
      break;
    case DatabaseActionKind.RemoveTableRow:
      applyRemoveTableRowAction(database, action as RemoveTableRowAction);
      break;
    case DatabaseActionKind.ChangeTableCell:
      applyChangeTableCellAction(database, action as ChangeTableCellAction);
      break;
    default:
      panic(`Unknown DatabaseActionKind: ${action.kind}`);
  }
}

export function applyAddTableAction(database: Database, action: AddTableAction): Table {
  // create table
  const table: Table = {
    id: database.nextTableId,
    name: action.name,
    columnDefinitions: _.cloneDeep(action.columnDefinitions),
    rows: []
  };

  // add row to table
  database.tables.push(table);

  // increment next table's ID
  database.nextTableId++;

  // return the table
  return table;
}

export function applyAddTableRowAction(database: Database, action: AddTableRowAction): Array<any> {
  // find table
  const table = database.tables.find(t => t.id === action.tableId);
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

export function applyRemoveTableRowAction(database: Database, action: RemoveTableRowAction) {
  // find table
  const table = database.tables.find(t => t.id === action.tableId);
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

export function applyChangeTableCellAction(database: Database, action: ChangeTableCellAction) {
  // find table
  const table = database.tables.find(t => t.id === action.tableId);
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