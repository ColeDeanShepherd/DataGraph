import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import { AppModel, AppView } from './App';
import * as dataFileContents from './data.json';

import 'bootstrap/dist/css/bootstrap.css';

import './index.css';

const appModel = new AppModel(dataFileContents);

ReactDOM.render(
  <React.StrictMode>
    <AppView model={appModel} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
