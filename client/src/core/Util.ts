import { panic } from './Error';

export function unwrap<T>(value: T | undefined): T {
  if (value !== undefined) {
    return value;
  } else {
    panic("Tried to unwrap an undefined value.");
    throw new Error(); // Just here to make the TypeScript compiler happy.
  }
}