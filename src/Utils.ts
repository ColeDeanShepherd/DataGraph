export const JSON_SPACES_IN_INDENT = 2;

export function caseInsensitiveStrSortCompareFn(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}