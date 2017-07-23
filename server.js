require('dotenv').config();
const crypto = require('crypto');
const WebSocket = require('ws');
const mongo = require('mongodb');
const markdown = require('markdown').markdown;
const ip = require('ip');
const getInitialMessages = require('./controllers/getInitialMessages');
const saveMessage = require('./controllers/saveMessage');
const getSeedAndUpdate = require('./controllers/getSeedAndUpdate');
const getUsers = require('./controllers/getUsers');
const updateUserName = require('./controllers/updateUserName');

const usedPort = process.env.PORT || 4000;
const usedWsAddress = 'ws://' + ip.address() + ':' + usedPort;
const usedServerName = process.env.NAME;

//let db = null;
const MongoClient = mongo.MongoClient;
const dbPromise = MongoClient.connect('mongodb://localhost:27017/chat');

function* clientIdGenerator (seed = new Date().valueOf()) {
  // TODO improve the seed
  let hash;
  while (true) {
    yield dbPromise
    .then(getSeedAndUpdate)
    .then( uidSeed => new Promise( (resolve, reject) => {
      hash = crypto.createHash('sha1');
      hash.update(seed + uidSeed + '');
      const id = hash.digest().toString('base64');
      resolve(id);
    }))
    .catch( err => console.log('There was an error getting the new id'));
  }
}
const idGen = clientIdGenerator();

// TODO get users ready and don't start to listen to the ws connection until
// this is finished
// TODO NAME this might not make much sense
//const users = {};

/*
dbPromise
.then((connectedDb) => {
  db = connectedDb;
})
.catch((err) => {
  console.log('Error connecting to the DB.');
  console.log(err);
});
*/

const wss = new WebSocket.Server({ port: usedPort });

const broadcast = wsAction => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(wsAction));
    }
  });
}

wss.on('connection', (ws, req) => {
  console.log('New connection');
  
  const initialMessagesPromise = dbPromise.then(getInitialMessages)
    .catch( err => console.log('Error gettign initial messages.\n', err));
  const userNamesPromise = dbPromise.then(getUsers)
    .catch( err => console.log('Error gettign user names.\n', err));

  Promise.all([
    initialMessagesPromise,
    userNamesPromise
  ])
  .then( ([initialMessages, userNames]) => {
    const handshake = {
      type: 'HANDSHAKE',
      payload: {
        serverName: usedServerName,
        messages: initialMessages,
        userNames
      }
    }
    ws.send(JSON.stringify(handshake));
  })

  ws.on('message', (data) => {
    data = JSON.parse(data);
    console.log(data);
    
    let wsAction;
    switch (data.type) {
    case 'HANDSHAKE_USER_INFO':
      let userId = data.payload.userId;
      console.log('current userId', userId);
      new Promise( (resolve, reject) => {
        if (userId === undefined) {
          idGen.next().value.then( id => {
            const wsAction = {
              type: 'NAME_CHANGE',
              payload: {
                userId: id,
                name: 'Anonymous',
                idNamePair: { [id]: 'Anonymous' }
              }
            }
            broadcast(wsAction);
            resolve({
              userId: id,
              name: 'Anonymous'
            });
          })
        } else {
          console.log('user id given from front:', userId);
          userNamesPromise.then( userNames => resolve({
            userId,
            name: userNames[userId]
          }));
        }
      })
      .then( userInfo => {
        console.log(userInfo);
        const wsAction = {
          type: 'USER_INFO',
          payload: userInfo
        }
        ws.send(JSON.stringify(wsAction));
        broadcast({
          type: 'USER_CONNECTED',
          payload: {
            userId: userInfo.userId
          }
        })
      })
      .catch( err => console.log('Error when resolving the userId\n', err));
      break;
    
    case 'NAME_CHANGE':
      // TODO NAME change this on the database too, and then send a broadcast
      // with the updated information
      // users[data.payload.userId].name = data.payload.name;
      dbPromise.then( db => updateUserName(db, data.payload.userId, data.payload.name))
      wsAction = {
        type: 'NAME_CHANGE',
        payload: {
          userId: data.payload.userId,
          name: data.payload.name,
          idNamePair: { [data.payload.userId]: data.payload.name }
        }
      }
      broadcast(wsAction);
      break;
      
    case 'MESSAGE':
      const dbMessage = {
        rawMessage: data.payload.rawMessage,
        htmlMessage: markdown.toHTML(data.payload.rawMessage),
        timestamp: new Date(),
        userId: data.payload.userId,
      }
      dbPromise.then( db => saveMessage(db, dbMessage));
      // TODO LOOK FOR XSS!
      const wsMessage = {
         type: "MESSAGE",
         payload: {
           htmlMessage: dbMessage.htmlMessage,
           userId: dbMessage.userId,
           timestamp: dbMessage.timestamp
         }
      };
      broadcast(wsMessage);
      break;
    
    default:
      // do nothing
      
    }
    
    
    
  });
});

console.log('Serving at: \'' + usedWsAddress + '\'');
