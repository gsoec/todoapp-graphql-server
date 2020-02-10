const path = require('path');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const dbFilePath = path.resolve(__dirname, 'db.json');

function getTodos() {
  return readFile(dbFilePath).then(data => JSON.parse(data));
}

function setTodos(todos) {
  return writeFile(
    dbFilePath,
    JSON.stringify(todos),
  );
}

module.exports = {
  getTodos,
  setTodos,
}
