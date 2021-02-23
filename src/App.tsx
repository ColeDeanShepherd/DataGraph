import { OrderedSet, Set } from "immutable";
import * as _ from "lodash";

import queryString from "query-string";

import history from 'history/browser';

import { saveAs } from 'file-saver';

import React from "react";

import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

import Autosuggest from 'react-autosuggest';

import { caseInsensitiveStrSortCompareFn, JSON_SPACES_IN_INDENT } from "./Utils";

import { IItem } from "./IItem";
import { SearchIndex } from "./SearchIndex";

import data from "./data.json";

import "./App.css";

const allTags = OrderedSet(
  data
    .flatMap(d => d.tags)
    .sort(caseInsensitiveStrSortCompareFn)
);

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

const searchIndex = new SearchIndex(data);

interface IAppState {
  searchText: string;
  selectedTags: Set<string>;
  searchDescriptions: boolean;
  searchTags: boolean;
  searchResults: Array<IItem>;
}

class App extends React.Component<{}, IAppState> {
  public constructor(props: {}) {
    super(props);

    const uriParams = queryString.parse(history.location.search);
    const uriTags = (uriParams.t !== undefined)
      ? (Array.isArray(uriParams.t)
        ? (uriParams.t as Array<string>)
        : [uriParams.t as string])
      : undefined;

    this.state = {
      searchText: (uriParams.q !== undefined) ? (uriParams.q as string) : "",
      selectedTags: (uriTags !== undefined) ? Set<string>(uriTags) : Set<string>(),
      searchDescriptions: (uriParams.searchDesc !== undefined) ? (uriParams.searchDesc === "true") : true,
      searchTags: (uriParams.searchTags !== undefined) ? (uriParams.searchTags === "true") : true,
      searchResults: []
    };
  }

  public componentDidMount() {
    this.doSearch();
  }

  public render(): JSX.Element {
    const {
      searchText,
      selectedTags,
      searchDescriptions,
      searchTags,
      searchResults
    } = this.state;
  
    const SelectedTags = () => {
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
            onChange={tags => this.setState({ selectedTags: Set<string>(tags) })} />
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
          <span>Results:</span>
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
      this.setState({ selectedTags: selectedTags.add(tag)}, () => this.doSearch());
    };
  
    const onClearClick = () => {
      this.setState({
        searchText: "",
        selectedTags: Set<string>(),
        searchDescriptions: true,
        searchTags: true
      }, () => {
        this.doSearch();
      });
    }
  
    return (
      <div>
        <header>
          <h1>Seattle Area Activities</h1>
          <div className="card">
            <div className="card-body">
              <SearchBar
                searchText={searchText}
                searchDescriptions={searchDescriptions}
                searchTags={searchTags}
                onChange={value => this.setState({ searchText: value })}
                onSearchDescriptionsChange={value => this.setState({ searchDescriptions: value })}
                onSearchTagsChange={value => this.setState({ searchTags: value })} />
              <br />
              <SelectedTags />
              <br />
              {false ? <div><AvailableTags /><br /></div> : null}
              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => this.doSearch()}>
                  Search
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onClearClick}>
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => this.exportData()}>
            Export Results
          </button>
          </div>
          <Activities />
        </header>
      </div>
    );
  }

  private doSearch() {
    this.setState({ searchResults: this.getSearchResults() });

    const uriParams = this.getUriParams();
    history.push({
      search: '?' + queryString.stringify(uriParams)
    })
  }
  
  private getSearchResults() {
    const {
      searchText,
      selectedTags,
      searchDescriptions,
      searchTags
    } = this.state;

    const searchResults = searchIndex.search(searchText, searchDescriptions, searchTags);
  
    function passesTags(item: IItem) {
      return selectedTags.isEmpty() ||
        item.tags.some(t => selectedTags.contains(t));
    }

    return searchResults.filter(passesTags);
  }

  private getUriParams() {
    const {
      searchText,
      selectedTags,
      searchDescriptions,
      searchTags
    } = this.state;

    return {
      q: searchText,
      t: selectedTags.toArray(),
      searchDesc: searchDescriptions,
      searchTags: searchTags
    };
  }

  private exportData() {
    const { searchResults } = this.state;

    const serializedData = JSON.stringify(searchResults, undefined, JSON_SPACES_IN_INDENT);

    const blob = new Blob([serializedData], {type: "application/json;charset=utf-8"});
    saveAs(blob, "data.json");
  }
}

export default App;
