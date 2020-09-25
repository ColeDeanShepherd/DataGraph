import { arrayLastElement, isIndexValid } from './Array';
import { isSome, isNone } from './Option';

test('arrayLastElement_emptyArray_returnsNone', () => {
  const array: Array<number> = [];
  const lastElement = arrayLastElement(array);
  expect(isNone(lastElement)).toBeTruthy();
});

test('arrayLastElement_returnsSome', () => {
  const array: Array<number> = [1, 2];
  const lastElement = arrayLastElement(array);
  expect(isSome(lastElement)).toBeTruthy();
});

test('isIndexValid_emptyArray_returnsFalse', () => {
  const array: Array<number> = [];
  expect(isIndexValid(array, 0)).toBeFalsy();
});

test('isIndexValid_negativeIndex_returnsFalse', () => {
  const array: Array<number> = [1, 2, 3];
  expect(isIndexValid(array, -1)).toBeFalsy();
});

test('isIndexValid_indexTooLarge_returnsFalse', () => {
  const array: Array<number> = [1, 2, 3];
  expect(isIndexValid(array, 3)).toBeFalsy();
});

test('isIndexValid', () => {
  const array: Array<number> = [1, 2, 3];
  expect(isIndexValid(array, 2)).toBeTruthy();
});