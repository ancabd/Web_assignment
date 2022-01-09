function Piece(s, x, y){
    this.pieceString = s;
    this.x = x;
    this.y = y;
}

Piece.prototype.getPieceString = function(){
    return this.pieceString;
}

/** returns true if the piece can access this tile */
Piece.prototype.isFreeSpace = function(table, x, y){

    if (x < 0 || y < 0 || x > 7 || y > 7) return false;
    if (table[x][y] == ' ') return true;
    if (table[x][y].getPieceString().substring(2) != this.getPieceString().substring(2)) return true;
    return false;
}

/** returns true if the piece can capture something on this tile */
Piece.prototype.isCapturable = function(table, x, y)
{
    if (x < 0 || y < 0 || x > 7 || y > 7) return false;
    if (table[x][y] == ' ') return false;
    if (table[x][y].getPieceString().substring(2) != this.getPieceString().substring(2)) return true;
    return false;
}

/** returns a new table if it can move a piece to a certain location and then moves the piece (and false otherwise)  */
Piece.prototype.move = function(table, i, j)
{
    let array = this.getViableMoves(table);

    if (array.find(element => element[0] == i && element[1] == j))
    {
        /** remove from old position */
        table[this.x][this.y] = ' ';

        /** add to new position */
        this.x = i;
        this.y = j;
        table[i][j] = this;

        if (typeof this.hasMoved != 'undefined')
            this.hasMoved = true;

        console.log("the movement should have worked");
        return table;
    }
    console.log("the movement def didn t work");
    return false;
}

function King(color, x, y){
    Piece.call(this, 'K_' + color, x, y);
}
function Queen(color, x, y){
    Piece.call(this, 'Q_' + color, x, y);
}
function Rook(color, x, y){
    Piece.call(this, 'R_' + color, x, y);
}
function Bishop(color, x, y){
    Piece.call(this, 'B_' + color, x, y);
}
function Knight(color, x, y){
    Piece.call(this, 'N_' + color, x, y);
}
function Pawn(color, x, y){
    Piece.call(this, 'P_' + color, x, y);
    this.hasMoved = false;
}

King.prototype = Object.create(Piece.prototype);
Queen.prototype = Object.create(Piece.prototype);
Rook.prototype = Object.create(Piece.prototype);
Bishop.prototype = Object.create(Piece.prototype);
Knight.prototype = Object.create(Piece.prototype);
Pawn.prototype = Object.create(Piece.prototype);

King.prototype.constructor = King;
Queen.prototype.constructor = Queen;
Rook.prototype.constructor = Rook;
Bishop.prototype.constructor = Bishop;
Knight.prototype.constructor = Knight;
Pawn.prototype.constructor = Pawn;


King.prototype.getViableMoves = function(table)
{
    let x = this.x;
    let y = this.y;

    let move = [0, 1, -1];
    let array = [];
    
    for (let i = 0; i < 3; ++ i)
        for (let j = 0; j < 3; ++ j)
            if (this.isFreeSpace(table, x + move[i], y + move[j]))
                array.push([x + move[i], y + move[j]]);

    return array;
}
Queen.prototype.getViableMoves = function(table)
{
    let x = this.x;
    let y = this.y;

    let rook = new Rook(this.getPieceString().substring(2), x, y);
    let bishop = new Bishop(this.getPieceString().substring(2), x, y);

    let horizontal_vertical = rook.getViableMoves(table);
    let diagonal = bishop.getViableMoves(table);

    return horizontal_vertical.concat(diagonal);
}

Rook.prototype.getViableMoves = function(table)
{
    let x = this.x;
    let y = this.y;

    let array = [];

    /** horizontal and vertical movement */
    for (let i = x + 1; this.isFreeSpace(table, i, y); ++ i){
        array.push([i, y]);
        if (this.isCapturable(table, i, y)) break;
    }

    for (let i = x - 1; this.isFreeSpace(table, i, y); -- i){
        array.push([i, y]);
        if (this.isCapturable(table, i, y)) break;
    }

    for (let j = y + 1; this.isFreeSpace(table, x, j); ++ j){
        array.push([x, j]);
        if (this.isCapturable(table, x, j)) break;
    }

    for (let j = y - 1; this.isFreeSpace(table, x, j); -- j){
        array.push([x, j]);
        if (this.isCapturable(table, x, j)) break;
    }

    return array;
}

Bishop.prototype.getViableMoves = function(table)
{
    let x = this.x;
    let y = this.y;

    let array = [];

    /** diagonal movement */
    for (let i = 1; this.isFreeSpace(table, x + i, y + i); ++ i){
        array.push([x + i, y + i]);
        if (this.isCapturable(table, x + i, y + i)) break;
    }

    for (let i = 1; this.isFreeSpace(table, x - i, y - i); ++ i){
        array.push([x - i, y - i]);
        if (this.isCapturable(table, x - i, y - i)) break;
    }

    for (let i = 1; this.isFreeSpace(table, x - i, y + i); ++ i){
        array.push([x - i, y + i]);
        if (this.isCapturable(table, x - i, y + i)) break;
    }

    for (let i = 1; this.isFreeSpace(table, x + i, y - i); ++ i){
        array.push([x + i, y - i]);
        if (this.isCapturable(table, x + i, y - i)) break;
    }

    console.log("bishop: " + x + " " + y + " arr: " + array);
    return array;
}

Knight.prototype.getViableMoves = function(table)
{
    let x = this.x;
    let y = this.y;

    let move = [1, -1];
    let array = [];
    
    for (let i = 0; i < 2; ++ i)
        for (let j = 0; j < 2; ++ j){
            if (this.isFreeSpace(table, x + move[i], y + move[j] * 2))
                array.push([x + move[i], y + move[j] * 2]);

            if (this.isFreeSpace(table, x + move[i] * 2, y + move[j]))
                array.push([x + move[i] * 2, y + move[j]]);
        }

    return array;   
}

Pawn.prototype.getViableMoves = function(table)
{
    let x = this.x;
    let y = this.y;

    let array = [];
    if (this.isCapturable(table, x - 1, y - 1)) array.push([x - 1, y - 1]);
    if (this.isCapturable(table, x - 1, y + 1)) array.push([x - 1, y + 1]);

    if (!this.isCapturable(table, x - 1, y) && this.isFreeSpace(table, x - 1, y)) 
        array.push([x - 1, y]);
    else return array;

    if (!this.hasMoved && !this.isCapturable(table, x - 2, y) && this.isFreeSpace(table, x - 2, y))
        array.push([x - 2, y]);

    return array;
}