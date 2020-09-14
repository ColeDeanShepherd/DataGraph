import { panic } from "./core/Error";

export interface ToDoItem {
  id: number;
  description: string;
  isDone: boolean;
}

export interface ToDoAppState {
  toDoItems: Array<ToDoItem>;
}

export function getNextToDoItemId(appState: ToDoAppState): number {
  return appState.toDoItems.length + 1;
}

export function findToDoItem(appState: ToDoAppState, toDoItemId: number): ToDoItem | undefined {
  return appState.toDoItems.find(item => item.id === toDoItemId);
}

// #region Actions

export function addToDoItem(appState: ToDoAppState, description: string): ToDoItem {
  const id = getNextToDoItemId(appState);
  const item: ToDoItem = {
    id,
    description,
    isDone: false
  };

  appState.toDoItems.push(item);

  return item;
}

export function changeToDoItemDescription(appState: ToDoAppState, toDoItemId: number, newDescription: string) {
  const item = findToDoItem(appState, toDoItemId);
  if (item === undefined) {
    panic("Could not find to-do item");
    return; // suppress TypeScript warnings
  }

  item.description = newDescription;
}

export function completeToDoItem(appState: ToDoAppState, toDoItemId: number) {
  const item = findToDoItem(appState, toDoItemId);
  if (item === undefined) {
    panic("Could not find to-do item");
    return; // suppress TypeScript warnings
  }

  item.isDone = true;
}

export function uncompleteToDoItem(appState: ToDoAppState, toDoItemId: number) {
  const item = findToDoItem(appState, toDoItemId);
  if (item === undefined) {
    panic("Could not find to-do item");
    return; // suppress TypeScript warnings
  }

  item.isDone = false;
}

export function removeToDoItem(appState: ToDoAppState, toDoItemId: number) {
  const itemIndex = appState.toDoItems.findIndex(item => item.id === toDoItemId);
  if (itemIndex === undefined) {
    panic("Could not find to-do item");
    return; // suppress TypeScript warnings
  }

  appState.toDoItems.splice(itemIndex, /*deleteCount*/ 1);
}

// #endregion Actions