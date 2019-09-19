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
  
  processScoreChange: (intPlayerNumber, game)=> {
    // This function handles the increase in game score and set scores and returns a new game object reflecting
    // the proper current score
  
  }
}
