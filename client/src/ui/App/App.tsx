import React, { useEffect, useState } from 'react';
import { Database, Table } from "datagraph-shared";

import './App.css';
import { TableEditor } from "./TableEditor";
import { getDatabaseTableByName } from '../../core/Database';
import { initToDosDatabase, toDosApiClient } from '../../ToDoApp';

function App() {
  const [database, setDatabase] = useState<Database | undefined>(undefined);
  const [table, setTable] = useState<Table | undefined>(undefined);

  useEffect(() => {
    initToDosDatabase()
      .then(db => {
        setDatabase(db);

        const table = getDatabaseTableByName(db, "To-Dos");
        setTable(table);
      });
  }); // TODO: only on init

  return (
    <div className="App">
      {(database && table) ? <TableEditor apiClient={toDosApiClient} table={table} /> : null}
    </div>
  );
}

export default App;
