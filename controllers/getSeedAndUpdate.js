'use strict';

const getSeedAndUpdate = db =>
  db.collection('seed')
  .findOneAndUpdate({}, { $inc: { uidSeed: 1 } })
  .then( ({ value }) =>
    new Promise( (resolve, reject) => resolve(value.uidSeed))
  )
  .catch(err => console.log('There was an error fetching the uidSeed\n', err));

module.exports = getSeedAndUpdate;
