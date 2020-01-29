const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures');
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures');

describe('Notes Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () =>
    db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE')
  );

  afterEach('cleanup', () =>
    db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE')
  );

  describe(`GET /api/notes`, () => {
    context(`no notes`, () => {
      it(`responds with 200 and empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, []);
      });
    });
    context(`notes in the database`, () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert notes', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db.into('noteful_notes').insert(testNotes);
          });
      });
      it('responds with 200 and all of notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes);
      });
    });
  });
  describe.only(`GET /api/notes/:notes_id`, () => {
    context(`given notes`, () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();
      beforeEach('insert notes', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db.into('noteful_notes').insert(testNotes);
          });
      });
      it(`responts with 200`, () => {
        const noteId = 1;
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, testNotes[0]);
      });
    });
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 99999;
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `note does not exist` } });
      });
    });
    context(`Given an XSS  attack note`, () => {
      const testNotes = makeNotesArray();
      const { maliciousNote, expectedNote } = makeMaliciousNote();

      beforeEach('insert malicious note', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db.into('noteful_notes').insert([maliciousNote]);
          });
      });
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/notes/${maliciousNote.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedNote.name);
            expect(res.body.content).to.eql(expectedNote.content);
          });
      });
    });
  });
});
