// This module will interpret incomming messages and respond to them accordingly. 
// This keeps web_server.js free from clutter

const WebSocket = require('ws').Server;
const match = require('./tennis_score');
module.exports = {
  handleIncomingMessage: (parsedData, socket, gamesRef, socket_server) => {
    
    if (parsedData.type === 'game_new') {
      if (gamesRef.includes(parsedData.id)) {
        socket.send(JSON.stringify({ type: 'server_response', message: "game_already_started" }));
        return;
      } else {
        console.log('game added to games array');
        gamesRef.push(parsedData.game);
        socket.send(JSON.stringify({ type: 'server_response', message: "game_start_ok", id: parsedData.game.id }));
        console.log(gamesRef);
        return;
      }
    } else if (parsedData.type === "fetch_score") {
      // Get the game score from the array
      const gameElement = getGame(parsedData.id, gamesRef);
      if (gameElement) {
        socket.send(JSON.stringify({type: 'server_response', message: 'current_game_score', id: gameElement.id, score: gameElement.score }));
      } else {
        // Send an error response
        socket.send(JSON.stringify({ type: 'server_response', message: "game_id_not_found", id: parsedData.id }));
      }
    
    } else if (parsedData.type === "bump_score") {
      // This handles increasing a player's score. Get a copy of the current score, change it, then insert it back into the  gameRef
      const gameElement = getGame(parsedData.id, gamesRef);
      if (gameElement) {
        
        match.processScoreChange(parsedData.forPlayer, gameElement);
        // The score has been changed save it to the game
        gamesRef = setGameAttrib(gameElement, gamesRef);
        const new_gameElement = getGame(parsedData.id, gamesRef);
        if (new_gameElement) {
          broadcast(socket_server, JSON.stringify({type: 'server_response', message: 'current_game_score', id: new_gameElement.id, score: new_gameElement.score }));
          socket.send(JSON.stringify({type: 'server_response', message: 'current_game_score', id: new_gameElement.id, score: new_gameElement.score }));
        } else {
          // Send an error response
          throw "new_gameElement is null";
        }
        // Broad
      } else {
        // Invalid game
        socket.send(JSON.stringify({ type: 'server_response', message: "game_id_not_found", id: parsedData.id }));
      }
    } else {
      // Incoming message not found so throw error
      throw "Invalid incoming message from client";
    }
  }
};

function getGame(id, ref_to_game) {
  const gameElement = ref_to_game.find((element) => {
    return element.id === id;
  });

  return gameElement;
}

function setGameAttrib(gameObject, refToGames) {
  // Sets a game attribute by id

  // Filter out the game object by the gameObject.id, then append
  const filteredGameArray = refToGames.filter((element) => {
    return element.id !== gameObject.id;
  });

  if (filteredGameArray) {
    filteredGameArray.push(gameObject);
    return filteredGameArray;
  } else {
    throw "filteredGameArray is undefined or null";
  }
}

function broadcast(s_server, data) {
  s_server.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}