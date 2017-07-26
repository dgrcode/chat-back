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
const usedServerName = process.env.NAME || "No name";
if (!process.env.NAME) {
  console.warn('!  Your server name will default to "No name".\n' +
    '!  You can change the name by creating a file named ".env" in\n' +
    '!  the root of the project with the contents:\n' +
    '!  \tNAME="The name you want to display"');
}

const MongoClient = mongo.MongoClient;
const dbPromise = MongoClient.connect('mongodb://127.0.0.1:27017/chat')
  .catch( err => console.log('Connection failed\n', err));

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
    .catch( err => console.log('Error getting initial messages.\n', err));
  const userNamesPromise = dbPromise.then(getUsers)
    .catch( err => console.log('Error getting user names.\n', err));

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
    //console.log(data);

    let wsAction;
    switch (data.type) {
    case 'HANDSHAKE_USER_INFO':
      let userId = data.payload.userId;
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

console.log('Serving ' + usedServerName + ' at: \'' + usedWsAddress + '\'\n' +
  '\nWhen you stop the server, run "yarn kill" to stop the database\n');

function exitHandler() {
    console.log('\n\n!!  REMEMBER TO RUN "yarn kill" TO STOP THE DATABASE  !!');
}
//process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
//process.on('uncaughtException', exitHandler);
