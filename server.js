const WebSocket = require('ws');
const markdown = require('markdown').markdown;

const wss = new WebSocket.Server({ port: 4000 });

wss.on('connection', (ws) => {
  console.log('Connected to 4000');

  ws.on('message', (data) => {
    data = JSON.parse(data);
    const rawMessage = data.payload.rawMessage;
    const htmlMessage = markdown.toHTML(rawMessage);
    const timestamp = new Date();
    const sendUser = data.payload.user

    // TODO LOOK FOR XSS!

    const wsMessage = {
       type: "MESSAGE",
       payload: {
         htmlMessage,
         user: data.payload.user
       }
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(wsMessage));
      }
    });
  });
});

console.log('Done.');
