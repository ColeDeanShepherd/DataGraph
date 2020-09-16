import { panic } from './Error';
export enum DataTypeKind {
  Boolean,
  String
}

export interface DataType {
  kind: DataTypeKind;
}

export function getDefaultValue(dataType: DataType): any {
  switch (dataType.kind) {
    case DataTypeKind.Boolean:
      return false;
    case DataTypeKind.String:
      return "";
    default:
      panic(`Unknown DataTypeKind: ${dataType}`);
  }
}