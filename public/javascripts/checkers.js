function showConnectionErrorBanner() {
    var errorBanner = $("<div class=\"alert alert-danger\" role=\"alert\"></div>")
        .text("Oops! Updating the Game failed! Please try to reload the page");
    $("nav").after(errorBanner);
}

//Source tiles of move operation
let sx = -1;
let sy = -1;

function move(y, x) {
    //Check if source tile has been selected
    if (sx === -1 && sy === -1) {
        sx = x;
        sy = y;
        document.getElementById("turn label").innerHTML = "Select Destination Tile";
        //$("#turn label").html("Select Destination Tile")

    //Complete move operation
    } else {
        $.ajax({
            method: "GET",
            url: "/move/sx="+sx+"/sy="+sy+"/dx="+x+"/dy="+y,
            dataType: "json",

            success: function (result) {
                updateGameBoard(result);
                sx = -1;
                sy = -1;
                document.getElementById("turn label").innerHTML = "Select Source Tile";
            },
            error: function (){
                showConnectionErrorBanner();
            }
        });
    }
}

function undo() {
    window.location.href = "http://localhost:9000/undo";
}

function redo() {
    window.location.href = "http://localhost:9000/redo";
}

function save(fileName) {
    window.location.href = "http://localhost:9000/save?fileName=" + fileName;
}

function load(fileName) {
    window.location.href = "http://localhost:9000/load?fileName=" + fileName;
}

class GameBoard {
    constructor() {
        this.game = [];
        for(var i = 0; i < 8; i++) {
            this.game[i] = [];
            for(var j = 0; j < 8; j++) {
                this.game[i][j] = Array(3);
            }
        }
    }

    fill(json) {
        let cells = json.game.board.cells;
        for(let jsonEntry=0; jsonEntry < cells.length; jsonEntry++) {
            //Set Tile Color
            this.game[cells[jsonEntry].y][cells[jsonEntry].x][0] = cells[jsonEntry].color;

            //Check if Piece is located on Tile and it is not kicked
            if(cells[jsonEntry].piece.piececolor !== "None" && cells[jsonEntry].piece.kicked !== "isKicked") {
                this.game[cells[jsonEntry].y][cells[jsonEntry].x][1] = cells[jsonEntry].piece.piececolor;

                //Check if Piece is a Queen
                if(cells[jsonEntry].piece.queen === "isQueen") {
                    this.game[cells[jsonEntry].y][json[jsonEntry].x][2] = true;
                }
            }
        }
    }
}

let gameBoard = new GameBoard()

function printGameBoard(){
    for(let row=0; row < 8; row++){
        for(let col=0; col < 8; col++){
            //Non Empty Cell
            if(gameBoard.game[row][col][1] !== undefined) {
                //Queen Piece
                if(gameBoard.game[row][col][2] === true) {
                    $("#field-" + row + "-" + col).attr('src', 'assets/images/game/' + gameBoard.game[row][col][0] + gameBoard.game[row][col][1] + 'queen' + '.jpg');
                    $("#field-" + row + "-" + col).attr('alt', gameBoard.game[row][col][0] + ' Tile' + gameBoard.game[row][col][1] + ' Queen');
                //Normal Piece
                } else {
                    $("#field-" + row + "-" + col).attr('src', 'assets/images/game/' + gameBoard.game[row][col][0] + gameBoard.game[row][col][1] +'.jpg');
                    $("#field-" + row + "-" + col).attr('alt', gameBoard.game[row][col][0] + ' Tile' + gameBoard.game[row][col][1] + ' Piece');
                }
            //Empty Cell
            } else {
                $("#field-" + row + "-" + col).attr('src', 'assets/images/game/' + gameBoard.game[row][col][0] + '.jpg');
                $("#field-" + row + "-" + col).attr('alt', gameBoard.game[row][col][0] + ' Tile');
            }
        }
    }
}

function updateGameBoard(jsonData) {
    gameBoard = new GameBoard();
    gameBoard.fill(jsonData);
    printGameBoard();
}

function createClickListener(){
    for(let row=0; row < 8; row++){
        for(let col=0; col < 8; col++){
            $("#field-" + row + "-" + col).click(function() {
                move(row, col);
            })
        }
    }
}

function initGame() {
    $.ajax({
        method: "GET",
        url: "/jsonGame",
        dataType: "json",

        success: function (jsonData) {
            gameBoard.fill(jsonData);
            printGameBoard();
            createClickListener();
        },
        error: function (){
            showConnectionErrorBanner();
        }
    });
}

$( document ).ready(function() {
    initGame();
});