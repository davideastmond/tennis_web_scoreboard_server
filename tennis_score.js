// This module handles converting a numerical score to a standard tennis score
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
    if (!game.active) {
      console.log("Game is in active");
      return;
    }
    const opponent = getOpponent(pn);

    if (!game.tie_break) {
      if (game.score[0] === 3 && game.score[1] === 3) {
        // Deuce situation - advantage
        game.score[pn]++;
      } else if (game.score[pn] === 4 && game.score[opponent] === 3) {
        callGame(pn, game);
      } else if (game.score[pn] === 3 && game.score[opponent] === 4) {
        // Reset to deuce
        game.score = { 0: 3, 1: 3 };
      } else if (game.score[pn] === 3 & game.score[opponent] <= 2) {
        // Call a game
        callGame(pn, game);
      } else {
        game.score[pn]++;
      }
       // Analyze deuce count
      if (game.score[0] === 3 && game.score[1] === 3) {
        game.deuce_count++;
      }
      // Analyze sets
      if (game.sets[game.current_set][pn] === 6 && game.sets[game.current_set][opponent] <= 5) {
        // Call the set
        current_set++;
      } else if (game.sets[game.current_set][pn] === 6 && game.sets[game.current_set][opponent] <= 6) {
        // Tie break situation
        game.tie_break = true;
      }
    } else {
      // Scoring works different with a tie break
      game.score[pn]++;
      if (game.score[pn] >= 7 && game.score[opponent] <= game.score[pn] - 2) {
        game.tie_break = false;
        callGame();
        game.current_set++;
      }
    }
   
    
    game.tennis_score = mapGameScore(game, game.tie_break);
    if (game.current_set > 4) {
      game.active = false;
      console.log("Game is over");
    }
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
  return { 0: 0, 1: 0 };
}

function callGame (pn, game) {
  // call the game after advantage and score
  game.score = resetGameScore();
  game.deuce_count = 0;
  game.sets[game.current_set][pn]++;
}

function mapGameScore(game, tie_break) {
  if (!tie_break) {
    return { 0: scoreMap[game.score[0]], 1: scoreMap[game.score[1]] };
  } else {
    return { 0: game.score[0], 1: game.score[1] };
  }
}