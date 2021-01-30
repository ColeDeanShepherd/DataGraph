import { Set } from "immutable";
import React, { useState } from "react";

import data from "./data.json";

import "./App.css";

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

function App(): JSX.Element {
  const [selectedTags, setSelectedTags] = useState(Set<string>());

  const onSelectedTagClick = (tag: string) => {
    setSelectedTags(selectedTags.delete(tag));
  };

  const onTagClick = (tag: string) => {
    setSelectedTags(selectedTags.add(tag));
  };

  const passesFilters = (item: IItem) =>
    selectedTags.isEmpty() ||
    item.tags.some(it => selectedTags.contains(it));

  return (
    <div>
      <header>
        <div>
          <span>Selected Tags: </span>
          <ul className="tags">
            {selectedTags.map(t => {
              const onClick = () => onSelectedTagClick(t);
              return <li><Tag tag={t} onClick={onClick} /></li>;
            })}
          </ul>
        </div>
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
      </header>
    </div>
  );
}

export default App;
