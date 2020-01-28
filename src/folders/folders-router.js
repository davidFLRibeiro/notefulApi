const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');
const path = require('path');
const folderRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
});

folderRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body;
    const newFolder = { name };

    for (const [key, value] of Object.entries(newFolder))
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    newFolder.name = name;
    FoldersService.insertFolder(req.app.get('db'), newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`));
      })
      .catch(next);
  });

folderRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getById(req.app.get('db'), req.params.folder_id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `folder doesnt exist` }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), req.params.folder_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { name } = req.body;
    const folderToUpdate = { title, content, style };

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name'`
        }
      });
    }

    FoldersService.updateArticle(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;
