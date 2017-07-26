const mongo = require('mongodb');
const saveMessage = require('./controllers/saveMessage.js');

const MongoClient = mongo.MongoClient;
MongoClient.connect('mongodb://127.0.0.1:27017/chat')
.then( db => {
  db.collection('seed').find({}).toArray()
  .then( found => {
    if (found.length === 0) {
      console.log('There was no seed, inserting a new one');
      db.collection('seed')
      .insert({uidSeed: 0})
      .catch(err => console.log('There was an error inserting the uidSeed\n', err))
      .then( _ => db.close());
    } else {
      db.close();
    }
  }).catch( err => console.log('ERROR:', err))
})
.catch((err) => {
  console.log('Error connecting to the DB for seeding.');
  console.log(err);
});
