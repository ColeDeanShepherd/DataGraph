import { BooleanDataType, StringDataType } from "./core/DataType";
import { Table } from "./core/Table";
import { getOrCreateDatabaseTableByName } from './core/Database';
import {
  createDatabaseServer,
  DatabaseServer,
} from './core/Database';

export const toDosDatabase: DatabaseServer = createDatabaseServer(/*id*/ 1);

export const toDosTable: Table = getOrCreateDatabaseTableByName(
  toDosDatabase,
  "To-Dos",
  [
    {
      name: "description",
      type: StringDataType
    },
    {
      name: "isDone",
      type: BooleanDataType
    }
  ]
);