import express from "express";
import { Database } from "./Database";

const database: Database = {
  id: 1,

  changeHistory: [],

  tables: [],
  nextTableId: 1
};

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
