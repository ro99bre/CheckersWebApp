//Banner Messages
function showConnectionErrorBanner() {
    var errorBanner = $("<div class=\"alert alert-danger\" role=\"alert\"></div>")
        .text("Oops! Updating the Game failed! Please try to reload the page");
    $("nav").after(errorBanner);
}

function showGameErrorBanner(message) {
    var errorBanner = $("<div class=\"alert alert-danger\" role=\"alert\"></div>")
        .text(message);
    $("nav").after(errorBanner);

    setTimeout(
        function () {
            $(errorBanner).remove();
        }, 3000);
}

function showGameSuccessBanner(message) {
    var successBanner = $("<div class=\"alert alert-success\" role=\"alert\"></div>")
        .text(message);
    $("nav").after(successBanner);

    setTimeout(
        function () {
            $(successBanner).remove();
        }, 3000);
}


class GameBoard {
    constructor(jsonData) {
        //console.log(jsonData);

        //Create Datastructure
        this.game = [];
        for (var i = 0; i < 8; i++) {
            this.game[i] = [];
            for (var j = 0; j < 8; j++) {
                this.game[i][j] = Array(3);
            }
        }

        //Fill Datastructure
        let cells = jsonData.game.board.cells;
        for (let jsonEntry = 0; jsonEntry < cells.length; jsonEntry++) {
            //Set Tile Color
            this.game[cells[jsonEntry].y][cells[jsonEntry].x][0] = cells[jsonEntry].color;

            //Check if Piece is located on Tile and it is not kicked
            if (cells[jsonEntry].piece.piececolor !== "None" && cells[jsonEntry].piece.kicked !== "isKicked") {
                this.game[cells[jsonEntry].y][cells[jsonEntry].x][1] = cells[jsonEntry].piece.piececolor;

                //Check if Piece is a Queen
                if (cells[jsonEntry].piece.queen === "isQueen") {
                    this.game[cells[jsonEntry].y][cells[jsonEntry].x][2] = true;
                }
            }
        }
        //console.log(this.game)
    }
}


function connectWebSocket() {
    var websocket = new WebSocket("ws://localhost:9000/websocket");
    websocket.setTimeout;

    websocket.onopen = function (event) {
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
            updateGameBoard(json);
        }

    };
}


//Source tiles of move operation
let srow = -1;
let scol = -1;

function move(row, col) {
    //Check if source tile has been selected
    if (scol === -1 && srow === -1) {
        scol = col;
        srow = row;
        document.getElementById("turn label").innerHTML = "Select Destination Tile";
        //$("#turn label").html("Select Destination Tile")

        //Complete move operation
    } else {
        $.ajax({
            method: "GET",
            url: "/move/sx=" + scol + "/sy=" + srow + "/dx=" + col + "/dy=" + row,
            dataType: "json",

            success: function (result) {
                if (result === "Failed") {
                    showGameErrorBanner("Failed to move piece!")
                } else {
                    scol = -1;
                    srow = -1;
                    document.getElementById("turn label").innerHTML = "Select Source Tile";
                }
            },
            error: function () {
                showConnectionErrorBanner();
            }
        });
    }
}

function undo() {
    $.ajax({
        method: "GET",
        url: "/undo",
        dataType: "json",

        success: function (result) {
            if (result === "Failed") {
                showGameErrorBanner("Failed to undo last step!")
            }
        },
        error: function () {
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
            if (result === "Failed") {
                showGameErrorBanner("Failed to redo last step!")
            }
        },
        error: function () {
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
            if (result !== "Save Failed") {
                showGameSuccessBanner("Successfully saved Game " + fileName);
            } else {
                showGameErrorBanner("Failed to save game!")
            }
        },
        error: function () {
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
            if (result !== "Load Failed") {
                showGameSuccessBanner("Successfully loaded Game " + fileName);
            } else {
                showGameErrorBanner("Failed to load game!")
            }
        },
        error: function () {
            showConnectionErrorBanner();
        }
    });
}

function createClickListener() {

    $("#undo-button").click(function () {
        undo();
    })

    $("#redo-button").click(function () {
        redo();
    })

    $("#save-button").click(function () {
        save(savename.value);
        $("#saveModal").modal('toggle');
    })

    $("#load-button").click(function () {
        load(loadname.value);
        $("#loadModal").modal('toggle');
    })
}


$(document).ready(function () {

    connectWebSocket();
    $.ajax({
        method: "GET",
        url: "/jsonGame",
        dataType: "json",

        success: function (jsonData) {
            createVue(jsonData);
            createClickListener();
        },
        error: function () {
            showConnectionErrorBanner();
        }
    });
})

var vm;

function createVue(jsonData) {
    vm = new Vue({
        el: "checkers-board",
        data: function () {
            return {
                gameBoard: new GameBoard(jsonData),
                rows: 8,
                cols: 8
            }
        },
        //template: '<button>{{ getTile(1, 1) }}</button>',
        template: `
            <table class="GameBoard">
                <tr v-for="row in rows">
                    <td v-for="col in cols">
                        <img v-on:click="moveTile(row-1,col-1)" v-bind:src="getTile(row-1,col-1)" class="field" v-bind:id="'field-' + row + '-' + col"/>
                    </td>
                </tr>
            </table>
        `,

        methods: {
            getPosition(x, y) {
                return x.toString() + " " + y.toString();
                //return gameBoard.game[x][y][0]
            },

            getTile(row, col) {
                path = 'assets/images/game/'
                //Non Empty Cell
                if (this.gameBoard.game[row][col][1] !== undefined) {
                    //Queen Piece
                    if (this.gameBoard.game[row][col][2] === true) {
                        return path + this.gameBoard.game[row][col][0] + this.gameBoard.game[row][col][1] + 'queen' + '.jpg';
                        //Normal Piece
                    } else {
                        return path + this.gameBoard.game[row][col][0] + this.gameBoard.game[row][col][1] + '.jpg';
                    }
                    //Empty Cell
                } else {
                    return path + this.gameBoard.game[row][col][0] + '.jpg';
                }
            },

            moveTile(row, col) {
                //console.log(row.toString() + col.toString())
                move(row, col);
            }

        }
    })
}

function updateGameBoard(jsonData) {
    vm.gameBoard = new GameBoard(jsonData);
}
