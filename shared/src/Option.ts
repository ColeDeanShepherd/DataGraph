export interface Option<T> {
  hasValue: boolean;
  value?: T;
}

export function None<T>(): Option<T> {
  return {
    hasValue: false
  };
}

export function Some<T>(value: T): Option<T> {
  return {
    hasValue: true,
    value: value
  };
}

export function isNone<T>(option: Option<T>): boolean {
  return !option.hasValue;
}

export function isSome<T>(option: Option<T>): boolean {
  return option.hasValue;
}