const socketServer = require('ws').Server;
const express = require('express');
const PORT = 7001;
const path = require('path');
const games = [];

const server = express()
.listen(PORT, '0.0.0.0', 'localhost', ()=> {
	console.log(`Listening on port ${PORT}`);
});
const wss = new socketServer({ server });

wss.on('connection', (ws, req) => {
	console.log("Connection established.");
	ws.on('message', (msg) => {
		const parsedMessage = JSON.parse(msg);

		if (parsedMessage.type === 'game_new') {
			if (games.includes(parsedMessage.id)) {
				ws.send(JSON.stringify({ type: 'server_response', message: "game_already_started" }));
			} else {
				console.log('game added to games array');
				games.push(parsedMessage.id);
				ws.send(JSON.stringify({ type: 'server_response', message: "game_start_ok" }));
			}
		}
		console.log("recieved message", parsedMessage);
		ws.send(JSON.stringify({ type: 'server_response', message: 'response from server!'}));
	});

	ws.on('close', ()=> {
		console.log("Connection closed");
	});
});