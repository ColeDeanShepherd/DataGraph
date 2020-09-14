import { Option, Some, None } from "./Option";

export function arrayLastElement<T>(array: Array<T>): Option<T> {
  if (array.length === 0) {
    return None();
  }

  return Some(array[array.length - 1]);
}