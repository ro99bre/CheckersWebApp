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

function showGameErrorBanner(message) {
    var errorBanner = $("<div class=\"alert alert-danger\" role=\"alert\"></div>")
        .text(message);
    $("nav").after(errorBanner);

    setTimeout(
        function() {
            $(errorBanner).remove();
        }, 3000);
}

function showGameSuccessBanner(message) {
    var successBanner = $("<div class=\"alert alert-success\" role=\"alert\"></div>")
        .text(message);
    $("nav").after(successBanner);

    setTimeout(
        function() {
            $(successBanner).remove();
        }, 3000);
}

function undo() {
    $.ajax({
        method: "GET",
        url: "/undo",
        dataType: "json",

        success: function (result) {
            if(result === "Failed"){
                showGameErrorBanner("Failed to undo last step!")
            } else {
                updateGameBoard(result);
            }
        },
        error: function (){
            showConnectionErrorBanner();
        }
    });
}

function redo() {
    $.ajax({
        method: "GET",
        url: "/redo",
        dataType: "json",

        success: function (result) {
            if(result === "Failed"){
                showGameErrorBanner("Failed to redo last step!")
            } else {
                updateGameBoard(result);
            }
        },
        error: function (){
            showConnectionErrorBanner();
        }
    });
}

function save(fileName) {
    $.ajax({
        method: "GET",
        url: "/save?fileName=" + fileName,
        dataType: "json",

        success: function (result) {
            if(result !== "Save Failed"){
                updateGameBoard(result);
                showGameSuccessBanner("Successfully saved Game " + fileName);
            } else {
                showGameErrorBanner("Failed to save game!")
            }
        },
        error: function (){
            showConnectionErrorBanner();
        }
    });
}

function load(fileName) {
    $.ajax({
        method: "GET",
        url: "/load?fileName=" + fileName,
        dataType: "json",

        success: function (result) {
            if(result !== "Load Failed"){
                updateGameBoard(result);
                showGameSuccessBanner("Successfully loaded Game " + fileName);
            } else {
                showGameErrorBanner("Failed to load game!")
            }
        },
        error: function (){
            showConnectionErrorBanner();
        }
    });
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
                    this.game[cells[jsonEntry].y][cells[jsonEntry].x][2] = true;
                }
            }
        }
    }
}

let gameBoard = new GameBoard()

//function printGameBoard(){
//    for(let row=0; row < 8; row++){
//        for(let col=0; col < 8; col++){
//            //Non Empty Cell
//            if(gameBoard.game[row][col][1] !== undefined) {
//                //Queen Piece
//                if(gameBoard.game[row][col][2] === true) {
//                    $("#field-" + row + "-" + col).attr('src', 'assets/images/game/' + gameBoard.game[row][col][0] + gameBoard.game[row][col][1] + 'queen' + '.jpg');
//                    $("#field-" + row + "-" + col).attr('alt', gameBoard.game[row][col][0] + ' Tile' + gameBoard.game[row][col][1] + ' Queen');
//                //Normal Piece
//                } else {
//                    $("#field-" + row + "-" + col).attr('src', 'assets/images/game/' + gameBoard.game[row][col][0] + gameBoard.game[row][col][1] +'.jpg');
//                    $("#field-" + row + "-" + col).attr('alt', gameBoard.game[row][col][0] + ' Tile' + gameBoard.game[row][col][1] + ' Piece');
//                }
//            //Empty Cell
//            } else {
//                $("#field-" + row + "-" + col).attr('src', 'assets/images/game/' + gameBoard.game[row][col][0] + '.jpg');
//                $("#field-" + row + "-" + col).attr('alt', gameBoard.game[row][col][0] + ' Tile');
//            }
//        }
//    }
//}

function updateGameBoard(jsonData) {
    gameBoard = new GameBoard();
    gameBoard.fill(jsonData);
}

function createClickListener(){

    $("#undo-button").click(function() {
        undo();
    })

    $("#redo-button").click(function() {
        redo();
    })

    $("#save-button").click(function() {
        save(savename.value);
        $("#saveModal").modal('toggle');
    })

    $("#load-button").click(function() {
        load(loadname.value);
        $("#loadModal").modal('toggle');
    })
}

function initGame() {
    $.ajax({
        method: "GET",
        url: "/jsonGame",
        dataType: "json",

        success: function (jsonData) {
            gameBoard.fill(jsonData);
            createClickListener();
        },
        error: function (){
            showConnectionErrorBanner();
        }
    });
}

function connectWebSocket() {
    var websocket = new WebSocket("ws://localhost:9000/websocket");
    websocket.setTimeout

    websocket.onopen = function(event) {
        console.log("Connected to Websocket");
    }

    websocket.onclose = function () {
        console.log('Connection with Websocket Closed!');
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
    };

    websocket.onmessage = function (e) {
        if (typeof e.data === "string") {
            let json = JSON.parse(e.data);
            updateGameBoard(json)
        }

    };
}

$( document ).ready(function() {
    connectWebSocket();    
    initGame();

    new Vue({
        el: "#game-board",
        methods: {
            getTile (row, col) {
                path = 'assets/images/game/'
                //Non Empty Cell
                if(gameBoard.game[row][col][1] !== undefined) {
                    //Queen Piece
                    if(gameBoard.game[row][col][2] === true) {
                        return path + gameBoard.game[row][col][0] + gameBoard.game[row][col][1] + 'queen' + '.jpg'
                    //Normal Piece
                    } else {
                        return path + gameBoard.game[row][col][0] + gameBoard.game[row][col][1] +'.jpg'
                    }
                //Empty Cell
                } else {
                    return path + gameBoard.game[row][col][0] + '.jpg'
                }
            },

            getPosition (x, y) {
                //return x.toString() + " " + y.toString()
                return gameBoard.game[x][y][0]
            },

            moveTile (row, col) {
                move(row, col)
            }
        }
    })
});