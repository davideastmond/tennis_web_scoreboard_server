// This module will interpret incomming messages and respond to them accordingly. 
// This keeps web_server.js free from clutter
module.exports = {
	handleIncomingMessage: (parsedData, socket, gamesRef) => {
		if (parsedData.type === 'game_new') {
      if (gamesRef.includes(parsedData.id)) {
				socket.send(JSON.stringify({ type: 'server_response', message: "game_already_started" }));
				return;
      } else {
        console.log('game added to games array');
        gamesRef.push(parsedData.id);
				socket.send(JSON.stringify({ type: 'server_response', message: "game_start_ok", id: parsedData.id }));
				return;
      }
    }
    throw "Invalid message from client (or forgot to include a return statement)";
	}
};