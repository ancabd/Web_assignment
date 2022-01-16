/**
 * In-game stat tracker. 
 * Once the game is out of prototype status, this object will be backed by a database.
 */
 const gameStatus = {
    since: Date.now() /* since we keep it simple and in-memory, keep track of when this object was created */,
    gamesStarted: 0 /* number of games started */,
    gamesAborted: 0 /* number of games aborted */,
    gamesFinished: 0 /* number of games successfully completed */
  };
  
  module.exports = gameStatus;