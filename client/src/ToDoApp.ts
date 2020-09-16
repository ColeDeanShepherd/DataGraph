import { DataTypeKind } from "./core/DataType";
import { Table } from "./core/Table";

export interface ToDoItem {
  id: number;
  description: string;
  isDone: boolean;
}

export const toDosTable: Table = {
  columnDefinitions: [
    {
      name: "description",
      type: {
        kind: DataTypeKind.String
      }
    },
    {
      name: "isDone",
      type: {
        kind: DataTypeKind.Boolean
      }
    }
  ],
  rows: []
};