// This module will interpret incomming messages and respond to them accordingly. 
// This keeps web_server.js free from clutter

const WebSocket = require('ws').Server;
const match = require('./tennis_score');
const bcrypt = require('bcryptjs');
module.exports = {
  handleIncomingMessage: (parsedData, socket, gamesRef, socket_server) => {
    
    if (parsedData.type === 'game_new') {
      if (gamesRef.includes(parsedData.id)) {
        socket.send(JSON.stringify({ type: 'server_response', message: "game_already_started" }));
        return;
      } else {
        if (parsedData.game.max_set_game !== 3 && parsedData.game.max_set_game !== 5) {
          socket.send(JSON.stringify({ type: 'server_response', message: "Invalid game set value. It must be 3 or 5" }));
          return;
        }

        // Hash the gameID and send it over
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(parsedData.game.id, salt);

        if (!parsedData.game.encryptedValue) {
          parsedData.game.encryptedValue = hash;
          gamesRef.push(parsedData.game);
          socket.send(JSON.stringify({ type: 'server_response', message: "game_start_ok", id: parsedData.game.id, encryptedValue: hash }));
          return;
        }
      }
    } else if (parsedData.type === "fetch_score") {
      // Get the game score from the array
      const gameElement = getGame(parsedData.id, gamesRef);
      socket.game_id = parsedData.id;
      if (gameElement) {
        socket.send(JSON.stringify({type: 'server_response', message: 'current_game_score', id: gameElement.id, game: gameElement }));
      } else {
        // Send an error response
        socket.send(JSON.stringify({ type: 'server_response', message: "game_id_not_found", id: parsedData.id }));
      }
    
    } else if (parsedData.type === "bump_score") {
      // This handles increasing a player's score. Get a copy of the current score, change it, then insert it back into the  gameRef
      const gameElement = getGame(parsedData.id, gamesRef);
      if (gameElement) {
        
        if (!parsedData.encryptedValue === gameElement.encryptedValue) {
          // Can't change score
          console.log("Can't change score");
          return;
        }
        match.processScoreChange(parsedData.forPlayer, gameElement);
        // The score has been changed save it to the game
        gamesRef = setGameAttrib(gameElement, gamesRef);
        const new_gameElement = getGame(parsedData.id, gamesRef);
        if (new_gameElement) {
          broadcast(socket_server, JSON.stringify({type: 'server_response', message: 'current_game_score', id: new_gameElement.id, game: new_gameElement }), new_gameElement.id);
        } else {
          // Send an error response
          throw "new_gameElement is null";
        }
        // Broad
      } else {
        // Invalid game
        socket.send(JSON.stringify({ type: 'server_response', message: "game_id_not_found", id: parsedData.id }));
      }
    } else if (parsedData.type === "client_request_updated_game_data") {
      // Try to find the game in question
      const findGame = getGame(parsedData.id, gamesRef);

      if (findGame) {
        // Send the game to the client
        const server_response = JSON.stringify({ type: 'server_response', status: "found_game", game_data: findGame })
        socket.send(server_response);
      } else {
        // Send an error response
        const server_response = JSON.stringify({ type: 'server_response', status: "game_not_found"})
        socket.send(server_response);
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

function broadcast(s_server, data, game_id) {
  s_server.clients.forEach((client) => {
    //console.log("Client game ID", client.game_id, game_id);
    if (client.readyState === 1 && game_id === client.game_id) {
      
      client.send(data);
    }
  });
}