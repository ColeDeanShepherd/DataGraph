import React, { useState } from 'react';
import { ToDoAppState, changeToDoItemDescription, completeToDoItem, uncompleteToDoItem, removeToDoItem, addToDoItem } from '../../ToDoApp';

import './App.css';

const appState: ToDoAppState = {
  toDoItems: []
};

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue(value => ++value);
}

function App() {
  const [newToDoItemDescription, setNewToDoItemDescription] = useState("");
  const forceUpdate = useForceUpdate();

  const onAddToDoItem = () => {
    addToDoItem(appState, newToDoItemDescription);
    setNewToDoItemDescription("");
  };

  return (
    <div className="App">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Done</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
              type="text"
              placeholder="Enter a to-do"
              value={newToDoItemDescription}
              onChange={event => setNewToDoItemDescription(event.target.value)} />
            </td>
            <td><input type="checkbox" disabled={true} /></td>
            <td><button onClick={onAddToDoItem} disabled={newToDoItemDescription.length === 0}>+</button></td>
          </tr>
          {appState.toDoItems.map(item => {
            const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
              const newDescription = event.target.value;

              changeToDoItemDescription(appState, item.id, newDescription);
              forceUpdate();
            };

            const onIsDoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
              const isDone = event.target.checked;

              if (isDone) {
                completeToDoItem(appState, item.id);
              } else {
                uncompleteToDoItem(appState, item.id);
              }

              forceUpdate();
            };

            const onRemove = () => {
              removeToDoItem(appState, item.id);
              forceUpdate();
            };

            return (
              <tr>
                <td><input type="text" value={item.description} onChange={onDescriptionChange} /></td>
                <td><input type="checkbox" checked={item.isDone} onChange={onIsDoneChange} /></td>
                <td><button onClick={onRemove}>x</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
