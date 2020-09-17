import { BooleanDataType, StringDataType } from "./core/DataType";
import { Table } from "./core/Table";
import { Database, createDatabase, applyAddTableAction, DatabaseActionKind } from './core/Database';

export const toDosDatabase: Database = createDatabase();

export const toDosTable: Table = applyAddTableAction(toDosDatabase, {
  kind: DatabaseActionKind.AddTable,
  name: "To-Dos",
  columnDefinitions: [
    {
      name: "description",
      type: StringDataType
    },
    {
      name: "isDone",
      type: BooleanDataType
    }
  ]
});