
var boardModule = (function(c){
    /** private members */
    const DARK_COLOR = 'blue';
    const LIGHT_COLOR = 'white';

    var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];

    var table;
    var colorPlaying = c; // 0 = black; 1 = white
    var colorPlayingString;
    var selectedPiece = ' ';

    /** puts the image of the piece in the given tile */
    putImageInTile = function(i, j){
        let tile = document.getElementById('tile' + letters[j] + numbers[i]);
        if (table[i][j] != ' '){ 
            let img = document.createElement("img");
            img.src = 'images/pieces/' + table[i][j].getPieceString() + '.png';
            img.id = 'img' + letters[j] + numbers[i];
            tile.appendChild(img);
        }
    }

    /** resets the colors of the tiles */
    resetColors = function(){
        for (let i = 0; i < 8; ++ i)
            for (let j = 0; j < 8; ++ j){

                let tile = document.getElementById('tile' + letters[j] + numbers[i]);
                if ((i + j) % 2 == colorPlaying)   tile.style.background = DARK_COLOR;
                else tile.style.background = LIGHT_COLOR;
            }
    }

    /** renders the pieces how they appear in the table */
    renderPieces = function(){
        for (let i = 0; i < 8; ++ i)
            for (let j = 0; j < 8; ++ j)
                putImageInTile(i, j);
    }

    /** renders the viable moves for the selected piece */
    renderViableMoves = function(){
        resetColors();
        if (selectedPiece != ' '){
            let viableMoves = selectedPiece.getViableMoves(table);
            for (const move of viableMoves){
                let tile = document.getElementById('tile' + letters[move[1]] + numbers[move[0]]);
                tile.style.backgroundColor = 'red';
            }
        }
    }

    /** moves the seleted piece to i, j (in table and on screen) if some piece is selected */
    moveSelectedPieceTo = function(i, j){
        let prevX = selectedPiece.x, prevY = selectedPiece.y;
        let newTable = selectedPiece.move(table, i, j);
        if (newTable != false) 
        {
            table = newTable;

            /** remove previous image */
            let prevImg = document.getElementById('img' + letters[prevY] + numbers[prevX]);
            prevImg.parentNode.removeChild(prevImg);
            
            /** remove image that was here if it exists */
            prevImg = document.getElementById('img' + letters[j] + numbers[i]);
            if (prevImg != null)
                prevImg.parentNode.removeChild(prevImg);

            /** put new image */
            putImageInTile(i, j);
        }

    }


    /** public members */
    return{
        /** initializes the table with the starting setup, draws it on the screen */
        initialize: function(){
            if (c == 0)
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
                
            for (let i = 0; i < 8; ++ i){
                let row = document.createElement('DIV');
                row.className = 'row';

                for (let j = 0; j < 8; ++ j){
                    let tile = document.createElement('DIV');
                    tile.className = 'tile';
                    tile.id = 'tile' + letters[j] + numbers[i];

                    if (i == 7)tile.innerText = letters[j];
                    if (j == 0)tile.innerText += numbers[i];

                    tile.addEventListener('click', function(){
                        if (selectedPiece == ' '){
                            if (selectedPiece.getPieceString().substring(2) != colorPlayingString)
                                selectedPiece = table[i][j];
                        }
                        else{
                            moveSelectedPieceTo(i, j);
                            selectedPiece = ' ';
                        }
                        renderViableMoves();
                    });
                    tile.addEventListener('contextmenu', function(){
                        selectedPiece = ' ';
                        renderViableMoves();
                    })

                    row.appendChild(tile);
                }
                document.body.append(row);
            }
            resetColors();
            renderPieces();
        }
    }

})(1);

boardModule.initialize();
boardModule.drawBoard();