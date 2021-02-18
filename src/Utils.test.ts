import { caseInsensitiveStrSortCompareFn } from './Utils';

test('caseInsensitiveStrSortCompareFn', () => {
  expect(caseInsensitiveStrSortCompareFn("abc", "ABC")).toEqual(0);
});
