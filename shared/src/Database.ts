import { DataType, getDefaultValue } from "./DataType";

export interface Database {
  id: number;

  changeHistory: Array<DatabaseChange>;

  tables: Array<Table>;
  nextTableId: number;
}

export interface DatabaseChange {
  action: DatabaseAction;
  dateTime: Date;
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

export interface Table {
  id: number;
  name: string;
  columnDefinitions: Array<ColumnDefinition>;
  rows: Array<Array<any>>;
}

export interface ColumnDefinition {
  name: string;
  type: DataType
}

export function createDefaultRow(table: Table): Array<any> {
  const row = new Array<any>(table.columnDefinitions.length);

  for (let i = 0; i < table.columnDefinitions.length; i++) {
    row[i] = getDefaultValue(table.columnDefinitions[i].type);
  }

  return row;
}