import { OrderedSet, Set } from "immutable";
import * as _ from "lodash";

import queryString from "query-string";

import history from 'history/browser';

import React, { useState } from "react";

import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

import Autosuggest from 'react-autosuggest';

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
  const uriParams = queryString.parse(history.location.search);
  const uriTags = (uriParams.t !== undefined)
    ? (Array.isArray(uriParams.t)
      ? (uriParams.t as Array<string>)
      : [uriParams.t as string])
    : undefined;

  const [searchText, setSearchText] = useState((uriParams.q !== undefined) ? (uriParams.q as string) : "");
  const [selectedTags, setSelectedTags] = useState((uriTags !== undefined) ? Set<string>(uriTags) : Set<string>());
  const [searchDescriptions, setSearchDescriptions] = useState((uriParams.searchDesc !== undefined) ? (uriParams.searchDesc === "true") : true);
  const [searchTags, setSearchTags] = useState((uriParams.searchTags !== undefined) ? (uriParams.searchTags === "true") : true);
  const [searchResults, setSearchResults] = useState(getSearchResults());

  function SelectedTags(): JSX.Element {
    function autosuggestRenderInput(props: TagsInput.RenderInputProps<string>) {
      const handleOnChange = (event: React.FormEvent<any>, params: Autosuggest.ChangeEvent) => {
        const { method } = params;

        if (method === 'enter') {
          event.preventDefault();
        } else {
          props.onChange(event as any);
        }
      };
     
      const inputValue = (props.value && props.value.trim().toLowerCase()) || '';
     
      const suggestions = getAvailableTags()
        .filter(tag => tag.toLowerCase().slice(0, inputValue.length) === inputValue)
        .toArray();
     
      return (
        <Autosuggest
          ref={props.ref}
          suggestions={suggestions}
          shouldRenderSuggestions={value => !!value && (value.trim().length > 0)}
          getSuggestionValue={suggestion => suggestion}
          renderSuggestion={suggestion => <span>{suggestion}</span>}
          inputProps={{...props, onChange: handleOnChange}}
          onSuggestionSelected={(e, {suggestion}) => props.addTag(suggestion)}
          onSuggestionsClearRequested={() => {}}
          onSuggestionsFetchRequested={() => {}}
        />
      );
    }

    return (
      <div>
        <span>Selected Tags: </span>
        <TagsInput
          renderInput={autosuggestRenderInput}
          value={selectedTags.toArray()}
          onChange={tags => setSelectedTags(Set<string>(tags))} />
      </div>
    );
  }

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
          {searchResults
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
  
  function getSearchResults() { return data.filter(passesFilters); }

  const onSearchClick = () => {
    setSearchResults(getSearchResults());

    const uriParams = getUriParams();
    history.push({
      search: '?' + queryString.stringify(uriParams)
    })
  };

  function passesFilters(item: IItem) { return passesTags(item) && passesSearch(item); }

  function passesSearch(item: IItem) {
    return (searchText.length === 0) ||
    (searchDescriptions && passesDescriptionSearch(item)) ||
    (searchTags && passesTagSearch(item));
  }
  
  function passesDescriptionSearch(item: IItem) {
    return _.includes(item.description.toLowerCase(), searchText.toLowerCase());
  }
  
  function passesTagSearch(item: IItem) {
    return item.tags.some(t => _.includes(t.toLowerCase(), searchText.toLowerCase()));
  }

  function passesTags(item: IItem) {
    return selectedTags.isEmpty() ||
      item.tags.some(t => selectedTags.contains(t));
  }

  const getUriParams = () => ({
    q: searchText,
    t: selectedTags.toArray(),
    searchDesc: searchDescriptions,
    searchTags: searchTags
  });

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
        {false ? <div><AvailableTags /><br /></div> : null}
        <div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onSearchClick}>
          Search
        </button>
        </div>
        <Activities />
      </header>
    </div>
  );
}

export default App;
