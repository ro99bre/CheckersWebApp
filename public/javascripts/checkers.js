let sx = -1;
let sy = -1;

function move(y, x) {
    //check if source tile has been selected
    if (sx === -1 && sy === -1) {
        sx = x;
        sy = y;
        document.getElementById("turn label").innerHTML = "Select Destination Tile";
    } else {
        window.location.href = "http://localhost:9000/move/sx="+sx+"/sy="+sy+"/dx="+x+"/dy="+y;
        sx = -1;
        sy = -1;
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