// This module handles tennis logic
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
      if (game.sets[game.current_set][pn] === 6 && game.sets[game.current_set][opponent] <= 4) {
        // Call the set
        callSet(pn, game);
      } else if (game.sets[game.current_set][pn] === 7 && game.sets[game.current_set][opponent] <= 5) {
        callSet(pn, game);
      } else if (game.sets[game.current_set][pn] === 6 && game.sets[game.current_set][opponent] === 6) {
        // Tie break situation
        game.tie_break = true;
      }
    } else {
      // Scoring works different with a tie break
      game.score[pn]++;
      if (game.score[pn] >= 7 && game.score[opponent] <= game.score[pn] - 2) {
        game.tie_break = false;
        callGame(pn, game);
        callSet(pn, game);
      }
    }
    game.tennis_score = mapGameScore(game, game.tie_break);

    // Evaluate the set to determine a match win
    if (game.max_set_game === 3) {
      if (game.current_set === 2) {
        const get_winner = determineWinner(game);

        if (get_winner >= 0 ){
          console.log(`${game.players[get_winner]} wins`);
          game.active = false;
        }
      }
    } else if (game.max_set_game === 5) {
      if (game.current_set === 4) {
        const get_winner = determineWinner(game);

        if (get_winner >= 0) {
          console.log(`${game.players[get_winner]} wins`);
          game.active = false;
        }
      }
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

function callSet(pn, game) {
  game.sets[game.current_set][2] = true;
  game.set_winners[game.current_set] = pn;
  game.current_set++;
}

function mapGameScore(game, tie_break) {
  if (!tie_break) {
    return { 0: scoreMap[game.score[0]], 1: scoreMap[game.score[1]] };
  } else {
    return { 0: game.score[0], 1: game.score[1] };
  }
}

function determineWinner(game) {
  // This determines who has won the match

  let p1_match_count, p2_match_count = 0;
  for (let [key, value] of Object.entries(game.sets)) {
    value[0] > value[1] ? p1_match_count++ : p2_match_count++;
  }

  if (p1_match_count > p2_match_count) {
    return 0;
  } else if (p2_match_count > p1_match_count) {
    return 1;
  }

  return -1; // means unable to return winner
}