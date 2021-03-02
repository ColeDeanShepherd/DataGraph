import { OrderedSet, Set } from "immutable";

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

import "./App.css";
import { BlurConfirmInput } from "./BlurConfirmInput";

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

export enum AppTab {
  Search,
  Edit
}

export const allAppTabs = [AppTab.Search, AppTab.Edit];

export class AppModel {
  public data: Array<IItem>;
  public allTags: OrderedSet<string>;
  public searchIndex: SearchIndex;
  public newTags: Array<string>;
  public newItemDescription: string;

  public constructor(data: Array<IItem>) {
    this.data = data;
    this.allTags = OrderedSet(
      this.data
        .flatMap(d => d.tags)
        .sort(caseInsensitiveStrSortCompareFn)
    );
    this.searchIndex = new SearchIndex(this.data);
    this.newTags = this.data.map(x => "");
    this.newItemDescription = "";
  }

  public canAddItem(): boolean {
    return this.newItemDescription.length > 0;
  }

  public canAddTag(itemIndex: number): boolean {
    return this.newTags[itemIndex].length > 0;
  }
}

export interface IAppViewProps {
  model: AppModel;
}

export interface IAppViewState {
  tab: AppTab;
  searchText: string;
  selectedTags: Set<string>;
  searchDescriptions: boolean;
  searchTags: boolean;
  searchResults: Array<IItem>;
}

function exportSearchResults(searchResults: Array<IItem>) {
  const serializedData = JSON.stringify(searchResults, undefined, JSON_SPACES_IN_INDENT);

  const blob = new Blob([serializedData], {type: "application/json;charset=utf-8"});
  saveAs(blob, "data.json");
}

//#region Actions

function runNewItemDescriptionChangeAction(model: AppModel, newValue: string) {
  model.newItemDescription = newValue;
}

function runAddItemAction(model: AppModel) {
  if (!model.canAddItem()) { return; }

  model.data.push({
    description: model.newItemDescription,
    tags: []
  } as IItem);
  model.newItemDescription = "";
  model.newTags.push("");
}

function runItemDescriptionChangeAction(model: AppModel, itemIndex: number, newValue: string) {
  model.data[itemIndex].description = newValue;
}

function runRemoveItemAction(model: AppModel, itemIndex: number) {
  model.data.splice(itemIndex, 1);
  model.newTags.splice(itemIndex, 1);
}

function runNewItemTagChangeAction(model: AppModel, itemIndex: number, newValue: string) {
  model.newTags[itemIndex] = newValue;
}

function runAddTagAction(model: AppModel, itemIndex: number) {
  if (!model.canAddTag(itemIndex)) { return; }

  const newTag = model.newTags[itemIndex];
  model.data[itemIndex].tags.push(newTag);
  model.newTags[itemIndex] = "";
}

function runItemTagChangeAction(model: AppModel, itemIndex: number, tagIndex: number, newValue: string) {
  model.data[itemIndex].tags[tagIndex] = newValue;
}

function runRemoveTagAction(model: AppModel, itemIndex: number, tagIndex: number) {
  model.data[itemIndex].tags.splice(tagIndex, 1);
}

function runSearchAction(model: AppModel) {

}

//#endregion

interface IUriParams {
  q: string;
  t: Array<string>;
  searchDesc: boolean;
  searchTags: boolean;
}

export class AppView extends React.Component<IAppViewProps, IAppViewState> {
  public constructor(props: IAppViewProps) {
    super(props);

    const uriParams = queryString.parse(history.location.search);
    const uriTags = (uriParams.t !== undefined)
      ? (Array.isArray(uriParams.t)
        ? (uriParams.t as Array<string>)
        : [uriParams.t as string])
      : undefined;

    this.state = {
      tab: AppTab.Search,
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

  public render(): JSX.Element | null {
    return (
      <div>
        {this.renderTabSelector()}
        {this.renderCurrentTab()}
      </div>
    );
  }

  private renderTabSelector(): JSX.Element {
    const { tab: currentTab } = this.state;

    return (
      <ul className="nav nav-tabs">
        {allAppTabs.map(tab => {
          const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            this.setState({ tab: tab });

            event.preventDefault();
            event.stopPropagation();
          };

          return (
            <li className="nav-item">
              <a
                className={"nav-link" + ((currentTab === tab) ? " active" : "")}
                aria-current="page"
                href="#"
                onClick={onClick}>{AppTab[tab]}</a>
            </li>
          );
        })}
      </ul>
    );
  }

  private renderCurrentTab(): JSX.Element | null {
    const { tab } = this.state;

    switch (tab) {
      case AppTab.Search:
        return this.renderSearchTab();
      case AppTab.Edit:
        return this.renderEditTab();
      default:
        return null;
    }
  }

  private renderSearchTab(): JSX.Element {
    const { model } = this.props;
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
  
    const getAvailableTags = () => model.allTags.subtract(selectedTags);
  
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
              onClick={() => exportSearchResults(searchResults)}>
              Export Results
            </button>
          </div>
          <Activities />
        </header>
      </div>
    );
  }

  private renderEditTab(): JSX.Element {
    const { model } = this.props;

    const onNewItemDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      runNewItemDescriptionChangeAction(model, event.target.value);
      this.forceUpdate();
    };
    
    const addItem = () => {
      runAddItemAction(model);
      this.forceUpdate();
    };

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {model.data.map((item: IItem, itemIndex: number) => {
              const onDescriptionChange = (newValue: string) => {
                runItemDescriptionChangeAction(model, itemIndex, newValue);
                this.forceUpdate();
              };

              const onNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                runNewItemTagChangeAction(model, itemIndex, e.target.value);
                this.forceUpdate();
              };

              const addTag = () => {
                runAddTagAction(model, itemIndex);
                this.forceUpdate();
              };
              
              const removeItem = () => {
                runRemoveItemAction(model, itemIndex);
                this.forceUpdate();
              };

              return (
                <tr>
                  <td>
                    <BlurConfirmInput value={item.description} onChange={onDescriptionChange} />
                  </td>
                  <td>
                    <table className="table">
                      <tbody>
                        {item.tags.map((t: string, tagIndex: number) => {
                          const onTagChange = (newValue: string) => {
                            runItemTagChangeAction(model, itemIndex, tagIndex, newValue);
                            this.forceUpdate();
                          };

                          const removeTag = () => {
                            runRemoveTagAction(model, itemIndex, tagIndex);
                            this.forceUpdate();
                          };

                          return (
                            <tr>
                              <td><BlurConfirmInput value={t} onChange={onTagChange} /></td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={removeTag}>
                                  x
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td>
                            <input
                              type="text"
                              value={model.newTags[itemIndex]}
                              onChange={onNewTagChange}
                              className="form-control" />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={addTag}
                              disabled={!model.canAddTag(itemIndex)}>
                              +
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={removeItem}>
                      x
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>
                <input
                  type="text"
                  value={model.newItemDescription}
                  onChange={onNewItemDescriptionChange}
                  className="form-control" />
              </td>
              <td></td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addItem}
                  disabled={!model.canAddItem()}>
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  private doSearch() {
    const { model } = this.props;
    
    runSearchAction(model);

    this.setState({ searchResults: this.getSearchResults() });

    const uriParams = this.getUriParamsFromState();
    history.push({
      search: '?' + queryString.stringify(uriParams)
    })
  }
  
  private getSearchResults() {
    const { model } = this.props;
    const {
      searchText,
      selectedTags,
      searchDescriptions,
      searchTags
    } = this.state;

    const searchResults = model.searchIndex.search(searchText, searchDescriptions, searchTags);
  
    function passesTags(item: IItem) {
      return selectedTags.isEmpty() ||
        item.tags.some(t => selectedTags.contains(t));
    }

    return searchResults.filter(passesTags);
  }

  private getUriParamsFromState(): IUriParams {
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
}