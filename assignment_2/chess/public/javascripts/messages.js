(function (exports) {
    
  /**
   * Server to client: start the game
   */
    exports.T_GAME_START = "GAME-START";
    exports.O_GAME_START = {
      type: exports.T_GAME_START,
    };
    exports.S_GAME_START = JSON.stringify(exports.O_GAME_START);

    /*
     * Client to server: game is complete, the winner is ...
     */
    exports.T_GAME_WON_BY = "GAME-WON-BY";
    exports.O_GAME_WON_BY = {
      type: exports.T_GAME_WON_BY,
      data: null,
    };
  
    /*
     * Server to client: abort game (e.g. if second player exited the game)
     */
    exports.T_GAME_ABORTED = "GAME-ABORTED";
    exports.O_GAME_ABORTED = {
      type: exports.T_GAME_ABORTED,
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);
  
  
    /*
     * Server to client: set as white
     */
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_WHITE = {
      type: exports.T_PLAYER_TYPE,
      data: "WHITE",
    };
    exports.S_PLAYER_WHITE = JSON.stringify(exports.O_PLAYER_WHITE);
  
    /*
     * Server to client: set as black
     */
    exports.O_PLAYER_BLACK = {
      type: exports.T_PLAYER_TYPE,
      data: "BLACK",
    };
    exports.S_PLAYER_BLACK = JSON.stringify(exports.O_PLAYER_BLACK);

    /*
     * Client to server / server to client: this/other client has made a move
     */
    exports.T_MOVE = "MOVE";
    exports.O_MADE_A_MOVE= {
      type: exports.T_MOVE,
      data: null,
    };
    exports.S_MADE_A_MOVE = JSON.stringify(exports.O_MADE_A_MOVE);
    
    /*
     * Server to Player A & B: game over with result won/loss
     */
    exports.T_GAME_OVER = "GAME-OVER";
    exports.O_GAME_OVER = {
      type: exports.T_GAME_OVER,
      data: null,
    };
  })(typeof exports === "undefined" ? (this.Messages = {}) : exports);