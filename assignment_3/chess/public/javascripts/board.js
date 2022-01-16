var boardModule = function(){
    /** private members */

    var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];

    var table;
    var colorPlaying; // 0 = black; 1 = white
    var colorPlayingString;
    var canMove = false;
    var selectedPiece = ' ';
    var gameState;

    /** remove any preexisting image from a tile */
    removeImageFromTile = function(i, j){
        let prevImg = document.getElementById('img' + letters[j] + numbers[i]);

        if (prevImg != null)
            prevImg.parentNode.removeChild(prevImg);
    }

    /** puts the image of the piece in the given tile if it should have an image */
    putImageInTile = function(i, j){

        let tile = document.getElementById('tile' + letters[j] + numbers[i]);

        removeImageFromTile(i, j);

        if (table[i][j] != ' '){

            let img = document.createElement("img");
            img.src = 'images/pieces/' + table[i][j].getPieceString() + '.png';
            img.id = 'img' + letters[j] + numbers[i];
            img.className = 'image';
            tile.appendChild(img);
        }
    }

    /** resets the colors of the tiles (and not visible tiles) */
    resetColors = function(visibleSquares){
        for (let i = 0; i < 8; ++ i)
            for (let j = 0; j < 8; ++ j){
                let tile = document.getElementById('tile' + letters[j] + numbers[i]);

                if (typeof visibleSquares != 'undefined' && visibleSquares != null
                    && !isVisibleSquare(visibleSquares, i, j))
                    tile.className = 'not-visible';
                else tile.className = 'tile';

            }
    }

    /** returns an array of all visible tiles */
    findVisibleSquares = function(){
        let visibleSquares = [];

        /** find visible squares */
        for (let i = 0; i < 8; ++ i)
            for (let j = 0; j < 8; ++ j)
                if (table[i][j] != ' ' && table[i][j].getPieceString().substring(2) == colorPlayingString)
                {
                    visibleSquares = visibleSquares.concat(table[i][j].getViableMoves(table));
                    visibleSquares.push([i, j]);
                }
        return visibleSquares;
    }
    
    /** returns if i, j is visible in the current board configuration */
    isVisibleSquare = function(visibleSquares, i, j){
        return typeof visibleSquares.find(element => element[0] == i && element[1] == j) != 'undefined';
    }

    /** renders the pieces how they appear in the table if the player should be able to see them*/
    renderPieces = function(){
        let visibleSquares = findVisibleSquares();
        /** display only those squares */
        for (let i = 0; i < 8; ++ i)
            for (let j = 0; j < 8; ++ j)
            {
                if (isVisibleSquare(visibleSquares, i, j))
                    putImageInTile(i, j);
                else removeImageFromTile(i, j);
            }
    }

    /** renders the viable moves for the selected piece */
    renderViableMoves = function(){
        resetColors(findVisibleSquares());

        if (selectedPiece != ' '){
            let viableMoves = selectedPiece.getViableMoves(table);
            for (const move of viableMoves){
                let tile = document.getElementById('tile' + letters[move[1]] + numbers[move[0]]);
                tile.className = 'selected';
            }
        }
    }

    /** moves the seleted piece to i, j (in table and on screen) if some piece is selected */
    moveSelectedPieceTo = function(i, j){

        if (document.getElementById('messageBox').innerHTML == Status.gameStart)
        document.getElementById('messageBox').innerHTML = '';

        let prevX = selectedPiece.x, prevY = selectedPiece.y;
        let newTable = selectedPiece.move(table, i, j);
        if (newTable != false) 
        {
            table = newTable;
            gameState.updateGame(letters[prevY] + numbers[prevX] + " " + letters[j] + numbers[i]);
            canMove = false;

            resetColors(findVisibleSquares());
            renderPieces();
        }

    }


    /** public members */
    return{
        /** 
         * initializes the table with the starting setup
         * color is 0 for black and 1 for white
         */
        initialize: function(gs, color){
            gameState = gs;

            colorPlaying = color;

            if (colorPlaying == 0)
                letters.reverse();
            else numbers.reverse();

            let thisColor = colorPlaying == 0 ? 'black' : 'white';
            let otherColor = colorPlaying == 0 ? 'white' : 'black';

            colorPlayingString = thisColor;

            table = [];
            for (let i = 0; i < 8; ++ i){
                let row = [];
                for (let j = 0; j < 8; ++ j)
                    row.push(' ');
                table.push(row);
            }

            /** pawns */
            for (let j = 0; j < 8; ++ j){
                table[1][j] = new Pawn(otherColor, 1, j);
                table[6][j] = new Pawn(thisColor, 6, j);
            }

            /** rooks */
            table[0][0] = new Rook(otherColor, 0, 0)
            table[0][7] = new Rook(otherColor, 0, 7);
            table[7][0] = new Rook(thisColor, 7, 0)
            table[7][7] = new Rook(thisColor, 7, 7);

            /** knights */
            table[0][1] = new Knight(otherColor, 0, 1);
            table[0][6] = new Knight(otherColor, 0, 6);
            table[7][1] = new Knight(thisColor, 7, 1);
            table[7][6] = new Knight(thisColor, 7, 6);

            /** bishops */
            table[0][2] = new Bishop(otherColor, 0, 2);
            table[0][5] = new Bishop(otherColor, 0, 5);
            table[7][2] = new Bishop(thisColor, 7, 2);
            table[7][5] = new Bishop(thisColor, 7, 5);

            /** king & queen */
            if (thisColor == 'white'){
                table[0][3] = new Queen(otherColor, 0, 3);
                table[0][4] = new King(otherColor, 0, 4);
                table[7][3] = new Queen(thisColor, 7, 3);
                table[7][4] = new King(thisColor, 7, 4);
            }
            else{
                table[0][3] = new King(otherColor, 0, 3);
                table[0][4] = new Queen(otherColor, 0, 4);
                table[7][3] = new King(thisColor, 7, 3);
                table[7][4] = new Queen(thisColor, 7, 4);
            }
        },

        /** constructs and draws the initial board */
        drawBoard:  function(){
            let gridContainer = document.createElement('DIV');
            gridContainer.className = 'grid-container';
            document.body.append(gridContainer);
            
            for (let i = 0; i < 8; ++ i)
                for (let j = 0; j < 8; ++ j){
                    let tile = document.createElement('DIV');
                    tile.className = 'tile';
                    tile.id = 'tile' + letters[j] + numbers[i];

                    if (i == 7)tile.innerText = letters[j];
                    if (j == 0)tile.innerText += numbers[i];

                    tile.addEventListener('click', function(){

                        if (!canMove) return;
                        if (selectedPiece == ' '){
                            if (table[i][j] != ' ' && table[i][j].getPieceString().substring(2) == colorPlayingString)
                                selectedPiece = table[i][j];
                        }
                        else{
                            moveSelectedPieceTo(i, j);
                            selectedPiece = ' ';
                        }
                        renderViableMoves();
                    });

                    gridContainer.appendChild(tile);
                }

            /** create the place to display messages */
            /*let messageBox = document.createElement('DIV');
            messageBox.className = 'messageBox';
            messageBox.id = 'messageBox';
            document.body.appendChild(messageBox);*/

            resetColors(findVisibleSquares());
            renderPieces();
        },
        /** make oponent move */
        moveOpponentPieceTo: function(move){
            const coordinates = move.split(' ');
            const prevY = letters.indexOf(coordinates[0][0]);
            const prevX = numbers.indexOf(coordinates[0][1]);
            const j = letters.indexOf(coordinates[1][0]); 
            const i = numbers.indexOf(coordinates[1][1]);

            let piece = table[prevX][prevY];

            if (piece != ' ' )
            {
                /** end of the game */
                if (table[i][j] != ' ' && table[i][j].getPieceString().charAt(0) == 'K')
                    gameState.setWinner(colorPlaying == 0 ? 'W' : 'B');

                /** normal move */
                table = piece.moveOpponent(table, i, j);
                canMove = true;

                resetColors(findVisibleSquares());
                renderPieces();
            }
            else console.log("An invalid move was sent");
        }, 
        /** starts the game */
        startGame: function(){
            canMove = true;
            document.getElementById('messageBox').innerHTML = Status.gameStart;
        },
        /** returns the color of the player */
        getColor: function(){
            return colorPlaying;
        }
    }

};
