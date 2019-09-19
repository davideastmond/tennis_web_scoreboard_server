// This module handles converting a standard score to a tennis score
const scoreMap = { 0: '0', 1: '15', 2: '30', 3: '40', 4: 'A'};

module.exports = {
  getTennisScore: (input)=> {
    // Returns a string representation of a tennis score
  
    if (scoreMap[input]) {
      return scoreMap[input]
    }
    throw "invalid tennis score input";
  },
  
  processScoreChange: (pn, game, callback)=> {
    // This function handles the increase in game score and set scores and returns a new game object reflecting
    // the proper current score
    
    const opponent = getOpponent(pn);

    if (game.score[0] === 3 && game.score[1] === 3) {
      // Deuce situation - advantage
      game.score[pn]++;
    } else if (game.score[pn] === 4 && game.score[opponent] === 3) {
      // call the game
      game.score = resetGameScore();
      game.sets[game.current_set][pn]++;
    } else if (game.score[pn] === 3 && game.score[opponent] === 4) {
      // Reset to deuce
      game.score = {0: 3, 1: 3};
    } else if (game.score[pn] === 3 & game.score[opponent] <= 2) {
      // Call a game
      // call the game
      game.score = resetGameScore();
      game.sets[game.current_set][pn]++;  
    } else {
      game.score[pn]++;
    }
    game.tennis_score = {0: scoreMap[game.score[0]], 1: scoreMap[game.score[1]]};
    console.log("game ref", game);
  }
}

function getOpponent (pn) {
  if (pn === 0) {
    return 1;
  } else if (pn === 1) {
    return 0;
  }
  throw "Invalid player number";
}

function resetGameScore () {
  // Returns a reset game score object
  return {0: 0, 1: 0};
}

