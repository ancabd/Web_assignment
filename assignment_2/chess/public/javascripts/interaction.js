const WEB_SOCKET_URL = "ws://localhost:3000";

/**
 * Game state object
 * @param {*} board;
 * @param {*} socket
 */
 function GameState(board, socket) {
    this.board = board;
    this.socket = socket;
    this.winner = null;
  }
  

  GameState.prototype.setWinner = function(w){
    this.winner = w;
    const outGoingMsg = Messages.O_GAME_WON_BY;
    outGoingMsg.data = w;
    this.socket.send(JSON.stringify(outGoingMsg));
  }
  /**
   * Check if anyone one won.
   * @returns {string|null} player who won or null if there is no winner yet
   */
  GameState.prototype.whoWon = function () {
    return this.winner;
  };
  
  
  /**
   * Update the game state and send the move to the other player.
   * @param {string} move
   */
  GameState.prototype.updateGame = function (move) {

    const outgoingMsg = Messages.O_MADE_A_MOVE;
    outgoingMsg.data = move;
    this.socket.send(JSON.stringify(outgoingMsg));
    //TODO other stuff i prob need to do here
  };

  
  
  //set everything up, including the WebSocket
  (function setup(){
    const socket = new WebSocket(WEB_SOCKET_URL);
  
    /*
     * initialize all UI elements of the game:
     * - the chess board and its pieces
     *
     * the GameState object coordinates everything
     */
    
    const board = boardModule();
    const gs = new GameState(board, socket);

    socket.onmessage = function (event) {
      let incomingMsg = JSON.parse(event.data);
  
      //set player type
      if (incomingMsg.type == Messages.T_PLAYER_TYPE) {

        // initialize board
        board.initialize(gs, incomingMsg.data == "BLACK" ? 0 : 1);
        board.drawBoard();

        // deal with messages
        if (incomingMsg.data == "WHITE"){
          document.getElementById('messageBox').innerHTML = Status.player1Intro;
        }
      }
      
      // game start
      if (incomingMsg.type == Messages.T_GAME_START){
        gs.board.startGame(true);
        document.getElementById('messageBox').innerHTML = Status.gameStart;
      }
      // move the opponents piece
      if (incomingMsg.type == Messages.T_MOVE) {
        gs.board.moveOpponentPieceTo(incomingMsg.data);
      }
      // game aborted
      if (incomingMsg.type == Messages.T_GAME_ABORTED){
        document.getElementById('messageBox').innerHTML = Status.aborted;
      }
      // game end
      if (incomingMsg.type == Messages.T_GAME_OVER){
        document.getElementById('messageBox').innerHTML = ((incomingMsg.data == 'WIN') ? Status.gameWon : Status.gameLost) + Status.playAgain;
      }
    };
  
    socket.onopen = function () {
      console.log("connection opened");
    };
  
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function () {
      /*if (gs.whoWon() == null) {
        sb.setStatus(Status["aborted"]);
      }*/
      //TODO smth idk
    };
  
    socket.onerror = function () {};
  })(); //execute immediately