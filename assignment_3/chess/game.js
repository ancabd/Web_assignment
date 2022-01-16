const websocket = require("ws");

/** game constructor */
const game = function(gameID) {
    this.white = null;
    this.black = null;
    this.id = gameID;
    this.gameState = "0 PLAYERS";
  };


/*
 * All valid transition states are keys of the transitionStates object.
 */
game.prototype.transitionStates = { 
    "0 PLAYERS": 0, 
    "1 PLAYER": 1, 
    "2 PLAYERS": 2,
    "W": 3, //white won
    "B": 4, //black won
    "ABORTED": 5
  };

/**
 * Valid transactions
 */
game.prototype.transitionMatrix = [
    [0, 1, 0, 0, 0, 0], //0 players
    [1, 0, 1, 0, 0, 1], //1 player
    [0, 0, 0, 1, 1, 1], //2 players
    [0, 0, 0, 0, 0, 0], //white WON
    [0, 0, 0, 0, 0, 0], //black WON
    [0, 0, 0, 0, 0, 0] //ABORTED
  ];
  
/**
 * Tests if a transaction is valid
 * @param {string} from 
 * @param {string} to 
 * @returns true if the transaction is valid
 */
game.prototype.isValidTransition = function(from, to){
    let i, j;
    if (!(from in game.prototype.transitionStates))
        return false;
    else i = game.prototype.transitionStates[from];

    if (!(to in game.prototype.transitionStates)) 
        return false;
    else j = game.prototype.transitionStates[to];

    return game.prototype.transitionMatrix[i][j] > 0;
}

game.prototype.isValidState = function(s) {
    return s in game.prototype.transitionStates;
};

/**
 * Updates the game status to `w` if the state is valid and the transition to `w` is valid.
 * @param {string} w new game status
 */
 game.prototype.setStatus = function(w) {
    if (game.prototype.isValidState(w) &&
        game.prototype.isValidTransition(this.gameState, w))
    {
        this.gameState = w;
        console.log("[STATUS] %s", this.gameState);
    } 
    else return new Error(`Impossible status change from ${this.gameState} to ${w}`);
};

/**
 * Checks whether the game is full.
 * @returns {boolean} returns true if the game is full (2 players), false otherwise
 */
 game.prototype.hasTwoConnectedPlayers = function() {
    return this.gameState == "2 PLAYERS";
  };

/**
 * Adds a player to the game. Returns an error if a player cannot be added to the current game.
 * @param {websocket} p WebSocket object of the player
 * @returns {(string|Error)} returns "A" or "B" depending on the player added; returns an error if that isn't possible
 */
 game.prototype.addPlayer = function(p) {
    if (this.gameState != "0 PLAYERS" && this.gameState != "1 PLAYER") {
      return new Error(
        `Invalid call to addPlayer, current state is ${this.gameState}`
      );
    }
  
    const error = this.setStatus("1 PLAYER");
    if (error instanceof Error) {
      this.setStatus("2 PLAYERS");
    }
  
    if (this.playerW == null) {
      this.playerW = p;
      return "W";
    } else {
      this.playerB = p;
      return "B";
    }
  };
  
  module.exports = game;