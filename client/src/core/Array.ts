import { Option, Some, None } from "./Option";

export function arrayLastElement<T>(array: Array<T>): Option<T> {
  if (array.length === 0) {
    return None();
  }

  return Some(array[array.length - 1]);
}

export function isIndexValid<T>(array: Array<T>, index: number): boolean {
  return (index >= 0) && (index < array.length);
}

export function removeElementWithCheckedIndex<T>(array: Array<T>, index: number) {
  array.splice(index, /*deleteCount*/ 1);
}