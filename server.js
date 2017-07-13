require('dotenv').config();
const WebSocket = require('ws');
const mongo = require('mongodb');
const markdown = require('markdown').markdown;
const getInitialMessages = require('./controllers/getInitialMessages');
const saveMessage = require('./controllers/saveMessage');

const usedPort = process.env.PORT || 4000;
const usedWsAddress = 'ws://' + process.env.IP + ':' + usedPort;
const usedName = process.env.NAME;

let db = null;
const MongoClient = mongo.MongoClient;
MongoClient.connect('mongodb://localhost:27017/chat')
.then((connectedDb) => {
  db = connectedDb;
})
.catch((err) => {
  console.log('Error connecting to the DB for seeding.');
  console.log(err);
});


const wss = new WebSocket.Server({ port: usedPort });

wss.on('connection', (ws) => {
  console.log('New connection');
  
  ws.send(JSON.stringify(
    {
      type: 'HANDSHAKE',
      payload: {
        name: usedName
      }
    }
  ));

  getInitialMessages(db)
  .then((initialMessages) => {
    const messageGroupAction = {
      type: 'MESSAGE_GROUP',
      payload: {
        messages: initialMessages
      }
    }
    ws.send(JSON.stringify(messageGroupAction));
  });

  ws.on('message', (data) => {
    data = JSON.parse(data);
    const dbMessage = {
      rawMessage: data.payload.rawMessage,
      htmlMessage: markdown.toHTML(data.payload.rawMessage),
      timestamp: new Date(),
      userId: data.payload.userId,
    }
    
    saveMessage(db, dbMessage);

    // TODO LOOK FOR XSS!

    const wsMessage = {
       type: "MESSAGE",
       payload: {
         htmlMessage: dbMessage.htmlMessage,
         userId: dbMessage.userId,
         timestamp: dbMessage.timestamp
       }
    };



    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(wsMessage));
      }
    });
  });
});

console.log('Serving at: \'' + usedWsAddress + '\'');
