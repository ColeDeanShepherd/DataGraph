import { BooleanDataType, StringDataType, Database } from "datagraph-shared";
import { getOrCreateDatabaseTableByNameAsync, MockApiClient } from './core/ApiClient';

export const toDosApiClient = new MockApiClient();

export async function initToDosDatabase(): Promise<Database> {
  await getOrCreateDatabaseTableByNameAsync(
    toDosApiClient,
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

  const database = await toDosApiClient.getDatabaseAsync();
  return database;
}