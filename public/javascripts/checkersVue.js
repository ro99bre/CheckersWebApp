function showConnectionErrorBanner() {
    var errorBanner = $("<div class=\"alert alert-danger\" role=\"alert\"></div>")
        .text("Oops! Updating the Game failed! Please try to reload the page");
    $("nav").after(errorBanner);
}

//Source tiles of move operation
let sx = -1;
let sy = -1;

function move(y, x) {
    console.log(y.toString() + x.toString())
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
                //Vor erneutem Rendering warten, bis Daten vollständig
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
    constructor(jsonData) {
        this.game = [];
        for(var i = 0; i < 8; i++) {
            this.game[i] = [];
            for(var j = 0; j < 8; j++) {
                this.game[i][j] = Array(3);
            }
        }
        console.log("newGameBoard")
        this.fill(jsonData)

    }

    fill(json) {
        console.log(json)
        let cells = json.game.board.cells;
        for(let jsonEntry=0; jsonEntry < cells.length; jsonEntry++) {
            //Set Tile Color
            this.game[cells[jsonEntry].y][cells[jsonEntry].x][0] = cells[jsonEntry].color;
            console.log(this.game[cells[jsonEntry].y][cells[jsonEntry].x][0])

            //Check if Piece is located on Tile and it is not kicked
            if(cells[jsonEntry].piece.piececolor !== "None" && cells[jsonEntry].piece.kicked !== "isKicked") {
                this.game[cells[jsonEntry].y][cells[jsonEntry].x][1] = cells[jsonEntry].piece.piececolor;

                //Check if Piece is a Queen
                if(cells[jsonEntry].piece.queen === "isQueen") {
                    this.game[cells[jsonEntry].y][cells[jsonEntry].x][2] = true;
                }
            }
        }
        console.log("Finished filling")
        console.log(this.game)
    }
}

//let gameBoard = new GameBoard()

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
    //gameBoard = new GameBoard(jsonData);
    //gameBoard.fill(jsonData);
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
            console.log("success")
            //gameBoard.fill(jsonData);
            createVue(jsonData);
            console.log("Created Vue")
            console.log(gameBoard.game[1][1][0]);
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
    console.log("connectWebSocket")
    initGame();
    console.log("InitGame")
    //console.log(gameBoard.game[1][1][0])
});

function createVue(jsonData) {
    var vm = new Vue({
        el: "#game-board",
        //data: {
        //    gameBoard: new GameBoard()
        //},
        data: function() {
            return {
                gameBoard: new GameBoard(jsonData)
            }
        },
        methods: {
            getTile (row, col) {
                path = 'assets/images/game/'
                //Non Empty Cell
                if(this.gameBoard.game[row][col][1] !== undefined) {
                    //Queen Piece
                    if(this.gameBoard.game[row][col][2] === true) {
                        variable = path + this.gameBoard.game[row][col][0] + this.gameBoard.game[row][col][1] + 'queen' + '.jpg'
                        console.log("Queen:" + variable)
                        return variable
                    //Normal Piece
                    } else {
                        variable = path + this.gameBoard.game[row][col][0] + this.gameBoard.game[row][col][1] +'.jpg'
                        console.log("Normal:" + variable)
                        return variable
                    }
                //Empty Cell
                } else {
                    variable = path + this.gameBoard.game[row][col][0] + '.jpg'
                    console.log("Empty:" + "Row:" + row + "Col:" + col + " " + variable)
                    return variable
                }
            },

            getPosition (x, y) {
                return x.toString() + " " + y.toString()
                //return gameBoard.game[x][y][0]
            },

            moveTile (col, row) {
                console.log(row.toString() + col.toString())
                //Check if source tile has been selected
                if (sx === -1 && sy === -1) {
                    sx = row;
                    sy = col;
                    document.getElementById("turn label").innerHTML = "Select Destination Tile";
                    //$("#turn label").html("Select Destination Tile")
            
                //Complete move operation
                } else {
                    console.log(sx + " " + sy)
                    $.ajax({
                        method: "GET",
                        url: "/move/sx="+sx+"/sy="+sy+"/dx="+row+"/dy="+col,
                        dataType: "json",
            
                        success: function (result) {
                            //updateGameBoard(result);
                            vm.gameBoard = new GameBoard(result)
                            //this.gameBoard.fill(result)
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
        }
    })
}