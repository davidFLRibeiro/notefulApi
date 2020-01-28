require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const foldersRouter = require('./folders/folders-router');
const FoldersService = require('./folders/folders-service');
const notesRouter = require('./notes/notes-router');
const notessService = require('./notes/notes-service');

const app = express();
const jsonParser = express.json();

app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'common'));
app.use(cors());
app.use(helmet());
app.use('/api/folders', foldersRouter);
app.use('/api/notes', notesRouter);

app.get('/folders', (req, res, next) => {
  const knexInstance = req.app.get('db');
  FoldersService.getAllFolders(knexInstance)
    .then(folders => {
      res.json(folders);
    })
    .catch(next);
});

app.get('/folders/:folder_id', (req, res, next) => {
  const knexInstance = req.app.get('db');
  FoldersService.getById(knexInstance, req.params.folder_id)
    .then(folder => {
      if (!folder) {
        return res.status(404).json({
          error: { message: `folder doesn't exist` }
        });
      }
      res.json(folder);
    })
    .catch(next);
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: 'Server error' };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
