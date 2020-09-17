import { ColumnDefinition } from "./ColumnDefinition";
import { getDefaultValue } from './DataType';

export interface Table {
  id: number;
  name: string;
  columnDefinitions: Array<ColumnDefinition>;
  rows: Array<Array<any>>;
}

export function createDefaultRow(table: Table): Array<any> {
  const row = new Array<any>(table.columnDefinitions.length);

  for (let i = 0; i < table.columnDefinitions.length; i++) {
    row[i] = getDefaultValue(table.columnDefinitions[i].type);
  }

  return row;
}