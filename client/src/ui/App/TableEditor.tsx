import React from 'react';

import { Table, createDefaultRow } from '../../core/Table';
import { DataTypeKind } from "../../core/DataType";
import { StringEditor } from "./StringEditor";
import { useForceUpdate } from "./Util";
import { BooleanEditor } from "./BooleanEditor";

export function TableEditor(props: { table: Table }) {
  const { table } = props;
  
  const forceUpdate = useForceUpdate();

  const onAddRow = () => {
    table.rows.push(createDefaultRow(table));
    forceUpdate();
  };

  return (
    <table>
      <thead>
        <tr>
          {table.columnDefinitions.map(cd => <th>{cd.name}</th>)}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, rowIndex) => {
          const onRemove = () => {
            table.rows.splice(rowIndex, /*deleteCount*/ 1);
            forceUpdate();
          };

          return (
            <tr>
              {row.map((cellValue, colIndex) => {
                const columnDefinition = table.columnDefinitions[colIndex];
                
                const onValueChange = (newValue: any) => {
                  table.rows[rowIndex][colIndex] = newValue;
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
          {table.columnDefinitions.map(cd => <td></td>)}
          <td><button onClick={onAddRow}>+</button></td>
        </tr>
      </tbody>
    </table>
  );
}