import React from 'react';
import { toDosTable } from '../../ToDoApp';

import './App.css';
import { TableEditor } from "./TableEditor";

function App() {
  return (
    <div className="App">
      <TableEditor table={toDosTable} />
    </div>
  );
}

export default App;
