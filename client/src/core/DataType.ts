export enum DataTypeKind {
  Boolean,
  String
}

export interface DataType {
  kind: DataTypeKind;
}