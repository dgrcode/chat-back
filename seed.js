const mongo = require('mongodb');
const saveMessage = require('./controllers/saveMessage.js');

const MongoClient = mongo.MongoClient;
MongoClient.connect('mongodb://localhost:27017/chat')
.then((db) => {
  let dummyMsg = {
    rawMessage: 'Test message',
    htmlMessage: '<p>Test message</p>',
    sendUser: 0,
    timestamp: new Date()
  };
  saveMessage(db, dummyMsg);
  setTimeout(() => {
    let dummyMsg = {
      rawMessage: 'Test message 2',
      htmlMessage: '<p>Test message 2</p>',
      sendUser: 1,
      timestamp: new Date()
    };
    saveMessage(db, dummyMsg);
    db.close();
  }, 5000)
})
.catch((err) => {
  console.log('Error connecting to the DB for seeding.');
  console.log(err);
});
