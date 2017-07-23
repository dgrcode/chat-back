'use strict';

const updateUserName = (db, uid, uName) =>
  db.collection('users')
  .updateOne(
    { uid, info: 'name' },
    {
      info: 'name',
      uid,
      name: uName
    },
    { upsert: true }
  )
  .catch(err => console.log('Error inserting a new name into the db\n', err));

module.exports = updateUserName;
