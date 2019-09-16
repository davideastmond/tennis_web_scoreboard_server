const socketServer = require('ws').Server;
const express = require('express');
const PORT = 7001;
const path = require('path');

// Keeps track of the games and ids for a session
const games = [];
const messageHandler = require('./messages');

const server = express()
.listen(PORT, '0.0.0.0', 'localhost', ()=> {
  console.log(`Listening on port ${PORT}`);
});
const wss = new socketServer({ server });

wss.on('connection', (ws, req) => {
  console.log("Connection established.");
  ws.on('message', (msg) => {
    // We have a message recieved. We'll parse it and determine its type
    const parsedMessage = JSON.parse(msg);
    messageHandler.handleIncomingMessage(parsedMessage, ws, games);
  });

  ws.on('close', ()=> {
    console.log("Connection closed");
  });
});