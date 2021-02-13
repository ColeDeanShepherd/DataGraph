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
  props: { searchText: string, onChange: (value: string) => void }
): JSX.Element {
  const { searchText, onChange } = props;

  return (
    <div>
      <input
        type="text"
        placeholder="search"
        value={searchText}
        onChange={e => onChange(e.target.value)} />
      
    </div>
  );
}

function App(): JSX.Element {
  const [selectedTags, setSelectedTags] = useState(Set<string>());
  const [searchText, setSearchText] = useState("");
  

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
    _.includes(item.description.toLowerCase(), searchText.toLowerCase()) ||
    item.tags.some(t => _.includes(t.toLowerCase(), searchText.toLowerCase()));

  const passesTags = (item: IItem) =>
    selectedTags.isEmpty() ||
    item.tags.some(t => selectedTags.contains(t));

  return (
    <div>
      <header>
        <SearchBar searchText={searchText} onChange={setSearchText} />
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
