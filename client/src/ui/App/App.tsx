import React, { useState } from 'react';
import { ToDoAppState, changeToDoItemDescription, completeToDoItem, uncompleteToDoItem, removeToDoItem, addToDoItem, ToDoItemSchema } from '../../ToDoApp';

import './App.css';
import { BooleanEditor } from './BooleanEditor';
import { StringEditor } from './StringEditor';

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
            {ToDoItemSchema.map(cd => <th>{cd.name}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <StringEditor
                placeholder="Enter a to-do"
                value={newToDoItemDescription}
                onChange={newValue => setNewToDoItemDescription(newValue)} />
            </td>
            <td>
              <BooleanEditor
                value={false}
                disabled={true} />
            </td>
            <td><button onClick={onAddToDoItem} disabled={newToDoItemDescription.length === 0}>+</button></td>
          </tr>
          {appState.toDoItems.map(item => {
            const onDescriptionChange = (newDescription: string) => {
              changeToDoItemDescription(appState, item.id, newDescription);
              forceUpdate();
            };

            const onIsDoneChange = (newIsDone: boolean) => {
              if (newIsDone) {
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
                <td><StringEditor value={item.description} onChange={onDescriptionChange} /></td>
                <td><BooleanEditor value={item.isDone} onChange={onIsDoneChange} /></td>
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
