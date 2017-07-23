'use strict';

const getUsers = db =>
  db.collection('users')
  .find({ info: 'name' }).toArray()
  .then( arrayNames => new Promise( (resolve, reject) => {
    resolve(arrayNames.reduce( (acc, v) => {
        const uObj = {}
        uObj[v.uid] = v.name
        return Object.assign(acc, uObj)
      } , {}))
  }))
  .catch(err => console.log('Error getting the users\n', err););

module.exports = getUsers;
