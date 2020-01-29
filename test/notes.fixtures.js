function makeNotesArray() {
  return [
    {
      id: 1,
      name: 'test',
      modified: '2019-01-03T00:00:00.000Z',
      folder_id: 1,
      content: 'olaaa'
    },
    {
      id: 2,
      name: 'test',
      modified: '2019-01-03T00:00:00.000Z',
      folder_id: 2,
      content: 'ruaaaaaaaaaaaaaa'
    }
  ];
}
function makeMaliciousNote(user) {
  const maliciousNote = {
    id: 911,
    name: 'test',
    modified: '2019-01-03T00:00:00.000Z',
    folder_id: 2,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  };
  const expectedNote = {
    ...makeExpectedNote([user], maliciousNote),
    name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousNote,
    expectedNote
  };
}

module.exports = {
  makeNotesArray,
  makeMaliciousNote,
  makeExpectedNote
};
