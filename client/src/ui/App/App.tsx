import React from 'react';
import { toDosTable, toDosDatabase } from '../../ToDoApp';

import './App.css';
import { TableEditor } from "./TableEditor";

function App() {
  return (
    <div className="App">
      <TableEditor database={toDosDatabase} table={toDosTable} />
    </div>
  );
}

export default App;
