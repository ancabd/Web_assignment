const express = require("express");
const http = require("http");
const websocket = require("ws");

const indexRouter = require("./routes/index.js");
const messages = require("./public/javascripts/messages");
const Game = require("./game");
const game = require("./game");

const port = process.argv[2];
const app = express();

app.use(express.static(__dirname + "/public"));
app.get("/", indexRouter);
app.get("/play", indexRouter);

const server = http.createServer(app).listen(port);
const wss = new websocket.Server({ server });

const websockets = {}; //property: websocket, value: game

//TODO gamestatus thing
const gameStatus = require("./statTracker");

/*
 * regularly clean up the websockets object
 */
setInterval(function() {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      let gameObj = websockets[i];
      //if the gameObj has a final status, the game is complete/aborted
      if (gameObj.finalStatus != null) {
        delete websockets[i];
      }
    }
  }
}, 50000);

let currentGame = new Game(gamesInitialized++);
let playerID = 0;

wss.on("connection", function connection(ws) {
    
    const con = ws;
    con.id = playerID++;
    const playerType = currentGame.addPlayer(con);
    websockets[con.id] = currentGame;
  
    console.log(
      `Player ${con.id} placed in game ${currentGame.id} as ${playerType}`
    );
    
  
    /*
     * inform the client about its assigned player type
     */
    con.send(playerType == "W" ? messages.S_PLAYER_WHITE : messages.S_PLAYER_BLACK);
    
    /**
     * inform the first player that they can make a move
     */
    if (playerType == "B")
    {
      console.log("game with player white = " + currentGame.playerW + " player black = " + con.id + " starts now");
      currentGame.playerW.send(messages.S_GAME_START);
      gameStatus.gamesStarted++;
    } 
  
    /*
     * once we have two players, there is no way back;
     * a new game object is created;
     * if a player now leaves, the game is aborted (player is not preplaced)
     */
    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(gamesInitialized++);
    }
  
    /*
     * message coming in from a player:
     *  1. determine the game object
     *  2. determine the opposing player OP
     *  3. send the message to OP
     */
    con.on("message", function incoming(message) {
      const gameObj = websockets[con.id];
      const isPlayerW = gameObj.playerW == con ? true : false;
      
      let incomingMsg = JSON.parse(message);

      /** dealing with the end of the game */
      if (incomingMsg.type == messages.T_GAME_WON_BY)
      {
        gameStatus.gamesFinished++;
        
        let outgoingMsg = messages.O_GAME_OVER;
        outgoingMsg.data = 'WIN';

        if (incomingMsg.data == 'W'){
          gameObj.playerW.send(JSON.stringify(outgoingMsg));

          outgoingMsg = messages.O_GAME_OVER;
          outgoingMsg.data = 'LOSS';

          gameObj.playerB.send(JSON.stringify(outgoingMsg));
        }
        else if (incomingMsg.data == 'B'){
          gameObj.playerB.send(JSON.stringify(outgoingMsg));

          outgoingMsg = messages.O_GAME_OVER;
          outgoingMsg.data = 'LOSS';

          gameObj.playerW.send(JSON.stringify(outgoingMsg));
        }
        gameObj.setStatus(incomingMsg.data);
      }

      /** communicating moves between clients */
      if (isPlayerW) {
        if (gameObj.hasTwoConnectedPlayers()) 
            gameObj.playerB.send(JSON.stringify(incomingMsg));
      } 
      else{
        if (gameObj.hasTwoConnectedPlayers()) 
            gameObj.playerW.send(JSON.stringify(incomingMsg));
      }

    });
  
    con.on("close", function(code) {
      /*
       * code 1001 means almost always closing initiated by the client;
       * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
       */
      console.log(`${con.id} disconnected ...`);
  
      if (code == 1001) {
          
        const gameObj = websockets[con.id];
  
        if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
          gameObj.setStatus("ABORTED");
          gameStatus.gamesAborted++;
          
          try{
            gameObj.playerW.send(messages.S_GAME_ABORTED);
          }catch(e){console.log("player w closed");}

          try{
            gameObj.playerB.send(messages.S_GAME_ABORTED);
          }catch(e){console.log("player b closed");}
          /*
           * determine whose connection remains open;
           * close it
           */
          try {
            gameObj.playerW.close();
            gameObj.playerW = null;
          } catch (e) {
            console.log("Player W closing: " + e);
          }
  
          try {
            gameObj.playerB.close();
            gameObj.playerB = null;
          } catch (e) {
            console.log("Player B closing: " + e);
          }
        }
      }
    });
  });