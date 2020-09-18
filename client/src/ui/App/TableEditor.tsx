import React from 'react';

import { Table, createDefaultRow } from '../../core/Table';
import { DataTypeKind } from "../../core/DataType";
import { StringEditor } from "./StringEditor";
import { useForceUpdate } from "./Util";
import { BooleanEditor } from "./BooleanEditor";
import {
  DatabaseActionKind,
  AddTableRowAction,
  applyDatabaseAction,
  RemoveTableRowAction,
  ChangeTableCellAction,
  DatabaseServer
} from '../../core/Database';

export function TableEditor(props: { database: DatabaseServer, table: Table }) {
  const { database, table } = props;
  
  const forceUpdate = useForceUpdate();

  const onAddRow = () => {
    applyDatabaseAction(database, {
      kind: DatabaseActionKind.AddTableRow,
      tableId: table.id,
      row: createDefaultRow(table)
    } as AddTableRowAction);
    forceUpdate();
  };

  return (
    <div>
      <p>{table.name}</p>
      <table>
        <thead>
          <tr>
            {table.columnDefinitions.map(cd => <th key={cd.name}>{cd.name}</th>)}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => {
            const onRemove = () => {
              applyDatabaseAction(database, {
                kind: DatabaseActionKind.RemoveTableRow,
                tableId: table.id,
                rowIndex: rowIndex
              } as RemoveTableRowAction);
              forceUpdate();
            };

            return (
              <tr>
                {row.map((cellValue, colIndex) => {
                  const columnDefinition = table.columnDefinitions[colIndex];
                  
                  const onValueChange = (newValue: any) => {
                    applyDatabaseAction(database, {
                      kind: DatabaseActionKind.ChangeTableCell,
                      tableId: table.id,
                      rowIndex: rowIndex,
                      columnIndex: colIndex,
                      value: newValue
                    } as ChangeTableCellAction);
                    forceUpdate();
                  };

                  switch (columnDefinition.type.kind) {
                    case DataTypeKind.Boolean:
                      return <td><BooleanEditor value={cellValue} onChange={onValueChange} /></td>;
                    case DataTypeKind.String:
                      return <td><StringEditor value={cellValue} onChange={onValueChange} /></td>;
                    default:
                      return null;
                  }
                })}
                <td><button onClick={onRemove}>x</button></td>
              </tr>
            );
          })}
          <tr>
            {table.columnDefinitions.map(cd => <td key={cd.name}></td>)}
            <td><button onClick={onAddRow}>+</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}