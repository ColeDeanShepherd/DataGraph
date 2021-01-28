import React from 'react';

import data from "./data.json";

import './App.css';

interface IItem {
  description: string;
  tags: Array<string>;
}

function Tag(props: { tag: string }): JSX.Element {
  const { tag } = props;

  return <span>#{tag}</span>;
}

function Item(props: { value: IItem }): JSX.Element {
  const { value } = props;

  return (
    <div>
      <span>{value.description}</span>
      <ul className="tags">
        {value.tags.map(t => <li><Tag tag={t} /></li>)}
      </ul>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <div>
      <header>
        <ul>
          {data.map(d => <li><Item value={d} /></li>)}
        </ul>
      </header>
    </div>
  );
}

export default App;
