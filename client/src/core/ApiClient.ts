import { ColumnDefinition } from "datagraph-shared/src/ColumnDefinition";
import { Database, DatabaseAction, applyDatabaseAction, DatabaseServer, getDatabaseTableByName, DatabaseActionKind, AddTableAction } from './Database';
import { LocalStorage } from "./LocalStorage";
import { Table } from "./Table";
import { unwrap } from "datagraph-shared/src/Util";

export interface IApiClient {
  getDatabaseAsync(): Promise<Database>;
  applyActionAsync(action: DatabaseAction): Promise<void>;
}

export class MockApiClient {
  public constructor() {
    const database: Database = {
      id: 1,
    
      changeHistory: [],
    
      tables: [],
      nextTableId: 1
    };

    this.databaseServer = {
      localStorage: LocalStorage, // TODO: refactor
      database: database
    };
  }

  public async getDatabaseAsync() {
    return this.databaseServer.database;
  }

  public async applyActionAsync(action: DatabaseAction) {
    applyDatabaseAction(this.databaseServer, action);
  }
  
  private databaseServer: DatabaseServer;
}

export async function getOrCreateDatabaseTableByNameAsync(
  apiClient: IApiClient,
  name: string,
  columnDefinitions: Array<ColumnDefinition>
): Promise<Table> {
  let database = await apiClient.getDatabaseAsync();

  let table = getDatabaseTableByName(database, name);
  if (table !== undefined) { return table; }

  await apiClient.applyActionAsync({
    kind: DatabaseActionKind.AddTable,
    name: name,
    columnDefinitions: columnDefinitions
  } as AddTableAction);
  
  database = await apiClient.getDatabaseAsync();
  table = unwrap(getDatabaseTableByName(database, name));
  
  return table;
}