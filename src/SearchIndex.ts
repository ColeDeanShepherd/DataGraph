import * as _ from "lodash";

import { IItem } from "./IItem";

export class SearchIndex {
  public constructor(
    items: Array<IItem>
  ) {
    this.normalizedItemItemPairs = items
      .map(i => ({
        normalizedItem: {
          description: i.description.toLowerCase(),
          tags: i.tags.map(t => t.toLowerCase())
        } as IItem,
        item: i
      }));
  }

  public search(
    searchText: string,
    searchDescriptions: boolean,
    searchTags: boolean
  ): Array<IItem> {
    if (searchText.length === 0) {
      return this.normalizedItemItemPairs.map(x => x.item);
    }

    // normalize the search text
    searchText = searchText.toLowerCase();

    return this.normalizedItemItemPairs
      .filter(x =>
        (searchDescriptions && _.includes(x.normalizedItem.description, searchText)) ||
        (searchTags && x.normalizedItem.tags.some(t => _.includes(t, searchText))))
      .map(x => x.item);
  }

  private normalizedItemItemPairs: Array<{ normalizedItem: IItem, item: IItem }>;
}