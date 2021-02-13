import { OrderedSet, Set } from "immutable";
import * as _ from "lodash";
import React, { useState } from "react";

import data from "./data.json";

import "./App.css";

const allTags = OrderedSet(
  data
    .flatMap(d => d.tags)
    .sort(caseInsensitiveStrSortCompareFn)
);

function caseInsensitiveStrSortCompareFn(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

interface IItem {
  description: string;
  tags: Array<string>;
}

function Tag(
  props: {
    tag: string,
    onClick?: () => void
  }): JSX.Element {
  const { tag, onClick } = props;

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={onClick}>
      #{tag}
    </button>
  );
}

function Item(props: { value: IItem, onTagClick?: (tag: string) => void }): JSX.Element {
  const { value, onTagClick } = props;

  return (
    <div>
      <span>{value.description}</span>
      <ul className="tags d-block">
        {value.tags.map(t => {
          const onClick = onTagClick
            ? () => onTagClick(t)
            : undefined;

          return <li><Tag tag={t} onClick={onClick} /></li>;
        })}
      </ul>
    </div>
  );
}

function SearchBar(
  props: {
    searchText: string,
    searchDescriptions: boolean,
    searchTags: boolean,
    onChange: (value: string) => void,
    onSearchDescriptionsChange: (value: boolean) => void,
    onSearchTagsChange: (value: boolean) => void
  }
): JSX.Element {
  const {
    searchText,
    searchDescriptions,
    searchTags,
    onChange,
    onSearchDescriptionsChange,
    onSearchTagsChange
  } = props;

  return (
    <div>
      <input
        type="text"
        placeholder="search"
        value={searchText}
        onChange={e => onChange(e.target.value)}
        className="form-control" />
      <div className="form-check form-check-inline">
        <input
          type="checkbox"
          id="searchDescriptions"
          className="form-check-input"
          value="searchDescriptions"
          checked={searchDescriptions}
          onChange={e => onSearchDescriptionsChange(e.target.checked)} />
        <label
          className="form-check-label"
          htmlFor="searchDescriptions">
          Search Descriptions
        </label>
      </div>
      <div className="form-check form-check-inline">
        <input
          type="checkbox"
          id="searchTags" 
          className="form-check-input"
          value="searchTags"
          checked={searchTags}
          onChange={e => onSearchTagsChange(e.target.checked)} />
        <label
          className="form-check-label"
          htmlFor="searchTags">
          Search Tags
        </label>
      </div>
    </div>
  );
}

function App(): JSX.Element {
  const [selectedTags, setSelectedTags] = useState(Set<string>());
  const [searchText, setSearchText] = useState("");
  const [searchDescriptions, setSearchDescriptions] = useState(true);
  const [searchTags, setSearchTags] = useState(true);

  function SelectedTags(): JSX.Element {
    return (
      <div>
        <span>Selected Tags: </span>
        <ul className="tags">
          {selectedTags.map(t => {
            const onClick = () => onSelectedTagClick(t);
            return <li><Tag tag={t} onClick={onClick} /></li>;
          })}
        </ul>
      </div>
    );
  }

  const onSelectedTagClick = (tag: string) => {
    setSelectedTags(selectedTags.delete(tag));
  };

  const getAvailableTags = () => allTags.subtract(selectedTags);

  function AvailableTags(): JSX.Element {
    return (
      <div>
        <span>Available Tags: </span>
        <ul className="tags d-block">
          {getAvailableTags().map(t => <li><Tag tag={t} onClick={() => onTagClick(t)} /></li>)}
        </ul>
      </div>
    );
  }
  
  function Activities(): JSX.Element {
    return (
      <div>
        <span>Activities:</span>
        <ul className="activities">
          {data
            .filter(passesFilters)
            .map(d => (
              <li>
                <div className="card">
                  <div className="card-body">
                    <Item value={d} onTagClick={onTagClick} />
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    );
  }
  
  const onTagClick = (tag: string) => {
    setSelectedTags(selectedTags.add(tag));
  };

  const passesFilters = (item: IItem) => passesTags(item) && passesSearch(item);

  const passesSearch = (item: IItem) =>
    (searchText.length === 0) ||
    (searchDescriptions && passesDescriptionSearch(item)) ||
    (searchTags && passesTagSearch(item));
  
  const passesDescriptionSearch = (item: IItem) =>
    _.includes(item.description.toLowerCase(), searchText.toLowerCase());
  
  const passesTagSearch = (item: IItem) =>
    item.tags.some(t => _.includes(t.toLowerCase(), searchText.toLowerCase()));

  const passesTags = (item: IItem) =>
    selectedTags.isEmpty() ||
    item.tags.some(t => selectedTags.contains(t));

  return (
    <div>
      <header>
        <SearchBar
          searchText={searchText}
          searchDescriptions={searchDescriptions}
          searchTags={searchTags}
          onChange={setSearchText}
          onSearchDescriptionsChange={setSearchDescriptions}
          onSearchTagsChange={setSearchTags} />
        <br />
        <SelectedTags />
        <br />
        <AvailableTags />
        <br />
        <Activities />
      </header>
    </div>
  );
}

export default App;
