const WEB_SOCKET_URL = "ws://localhost:3000";

/**
 * Game state object
 * @param {*} board;
 * @param {*} socket
 */
 function GameState(board, socket, clock) {
    this.board = board;
    this.socket = socket;
    this.winner = null;
    this.clock = clock;
  }
  
/**
 * Sets the winner locally and sends it to the server+
 * @param {string} w = the winner 
 */
  GameState.prototype.setWinner = function(w){
    this.winner = w;
    const outGoingMsg = Messages.O_GAME_WON_BY;
    outGoingMsg.data = w;
    this.clock.setPlayer('FINISHED');
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
   * Send the move to the other player.
   * @param {string} move
   */
  GameState.prototype.updateGame = function (move) {

    const outgoingMsg = Messages.O_MADE_A_MOVE;
    outgoingMsg.data = move;
    this.clock.setPlayer('OPPONENT');
    this.socket.send(JSON.stringify(outgoingMsg));
    
  };

  
  
  //set everything up, including the WebSocket
  (function setup(){
    const socket = new WebSocket(WEB_SOCKET_URL);
  
    /*
     * initialize all UI elements of the game:
     * - the chess board and its pieces
     * - resign button
     *
     * the GameState object coordinates everything
     */
    
    // the board module
    const board = boardModule();

    // the clock object
    const gameClock = new clock(Date.now());

    // gamestate
    const gs = new GameState(board, socket, gameClock);

    // the resign button
    const button = document.getElementById("resignButton");
    button.addEventListener('click', function(){
      const oppositeColor = 1 - board.getColor();
      gs.setWinner(oppositeColor == 0 ? 'B' : 'W');
    });

    // set up the game clock
    // regularly recalculates the time passed and displays it
    setInterval(function(){
      gameClock.renderTime(gs, board.getColor() == 1 ? 'B' : 'W');
    }, 300);

    // deal with incoming messages 
    socket.onmessage = function (event) {
      let incomingMsg = JSON.parse(event.data);
  
      //set player type
      if (incomingMsg.type == Messages.T_PLAYER_TYPE) {

        // initialize board
        board.initialize(gs, incomingMsg.data == "BLACK" ? 0 : 1);
        if (incomingMsg.data == 'BLACK')gameClock.setPlayer('OPPONENT');

        board.drawBoard();

        // deal with messages
        if (incomingMsg.data == "WHITE"){
          document.getElementById('messageBox').innerHTML = Status.player1Intro;
        }
      }
      
      // game start
      if (incomingMsg.type == Messages.T_GAME_START){
        gs.board.startGame(true);
        gameClock.setPlayer('THIS');
        document.getElementById('messageBox').innerHTML = Status.gameStart;
      }
      // move the opponents piece
      if (incomingMsg.type == Messages.T_MOVE) {
        gameClock.setPlayer('THIS');
        gs.board.moveOpponentPieceTo(incomingMsg.data);
      }
      // game aborted
      if (incomingMsg.type == Messages.T_GAME_ABORTED){
        gameClock.setPlayer('FINISHED');
        document.getElementById('messageBox').innerHTML = Status.aborted;
      }
      // game end
      if (incomingMsg.type == Messages.T_GAME_OVER){
        gameClock.setPlayer('FINISHED');
        document.getElementById('messageBox').innerHTML = ((incomingMsg.data == 'WIN') ? Status.gameWon : Status.gameLost) + Status.playAgain;
      }
    };
  
    socket.onopen = function () {
      console.log("connection opened");
    };
  
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function () {
      if (gs.whoWon() == null) {
        sb.setStatus(Status["aborted"]);
      }
    };
  
    socket.onerror = function () {};
  })(); //execute immediately