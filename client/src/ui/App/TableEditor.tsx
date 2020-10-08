import React from 'react';

import { Table, createDefaultRow, DatabaseActionKind } from 'datagraph-shared';
import { DataTypeKind } from "datagraph-shared";
import { StringEditor } from "./StringEditor";
import { useForceUpdate } from "./Util";
import { BooleanEditor } from "./BooleanEditor";
import { MockApiClient } from '../../core/ApiClient';
import {
  AddTableRowAction,
  RemoveTableRowAction,
  ChangeTableCellAction,
} from '../../core/Database';

export function TableEditor(props: { apiClient: MockApiClient, table: Table }) {
  const { apiClient, table } = props;
  
  const forceUpdate = useForceUpdate();

  const onAddRow = () => {
    apiClient.applyActionAsync({
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
              apiClient.applyActionAsync({
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
                    apiClient.applyActionAsync({
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