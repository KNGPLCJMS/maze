const canvas = document.getElementById("maze");
const context = canvas.getContext("2d");

const col = 30;
const row =30;
const size = 20;
document.getElementById("generateButton").addEventListener("click", generateMaze);
canvas.width=col*size;
canvas.height = row*size;
class Cell {
    constructor(x,y){
        this.x=x;
        this.y=y;

        this.visited=false;

        this.walls=[true,true,true,true]
    }
    draw(){
    const x = this.x * size;
    const y = this.y * size;
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.beginPath();
    if(this.walls[0]){
        context.moveTo(x,y);
        context.lineTo(x+size, y);
    }
    if(this.walls[1]){
        context.moveTo(x+size,y);
        context.lineTo(x+size, y+size);
    }
    if(this.walls[2]){
        context.moveTo(x+size,y+size);
        context.lineTo(x, y+size);
    }
    if(this.walls[3]){
        context.moveTo(x,y+size);
        context.lineTo(x, y);
    }
    context.stroke();

    if (this.visited){
        context.fillStyle="#ddd";
        context.fillRect(
            x+1,y+1,size-2,size-2
        );
    }
    }
}

let grid = [];

for(let y=0; y<row; y++){
    for(let x=0; x<col; x++){
        grid.push(new Cell(x,y));
    }
}

function index(x,y){
    if(x<0||y<0||x>=col||y>=row){
        return -1;
    }

    return x+y*col;
}

function getNeighbors(cell) {
    let neighbors = [];

    const directions = [
        {x:0,y:-1,wall:0,opposite:2},
        {x:1,y:0,wall:1,opposite:3},
        {x:0,y:1,wall:2,opposite:0},
        {x:-1,y:0,wall:3,opposite:1}
    ];

    for(let dir of directions){
        let neighbor = grid[index(
            cell.x+dir.x,cell.y+dir.y
        )];

        if (neighbor&&!neighbor.visited){
            neighbors.push({
                cell: neighbor,
                wall: dir.wall,
                opposite: dir.opposite
            });
        }
    }
    return neighbors;
}
async function generateMaze() {
    grid = [];
    for(let y=0; y<row; y++){
        for(let x=0; x<col; x++){
            grid.push(new Cell(x,y));
        }
    }
    let algorithm = document.getElementById("algoSelect").value;
    if (algorithm === "DFS") {
        await dfs(grid[0]);
    } else if (algorithm === "Prim's") {
        prim();
    } else if (algorithm === "Wilson's") {
        wilsons();
    } else if (algorithm === "BinaryTree") {
        binaryTree();
    } else if (algorithm === "Kruskal's") {
    kruskals();
    }
    drawGrid();
}
function removeWalls(current, next, wall, opposite) {
    current.walls[wall] = false;
    next.walls[opposite] = false;
}

async function dfs(cell) {
    cell.visited = true;
    drawGrid();

    let neighbors = getNeighbors(cell);

    while (neighbors.length > 0) {
        let randomIndex = Math.floor(Math.random() * neighbors.length);
        let { cell: nextCell, wall, opposite } = neighbors[randomIndex];

        removeWalls(cell, nextCell, wall, opposite);
        await sleep(20);
        await dfs(nextCell);

        neighbors = getNeighbors(cell);
    }


}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function drawGrid() {

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let cell of grid) {
        cell.draw();
    }
}
function getAllNeighbors(cell) {
    let neighbors = [];

    const directions = [
        {x:0, y:-1, wall:0, opposite:2}, // top
        {x:1, y:0, wall:1, opposite:3},  // right
        {x:0, y:1, wall:2, opposite:0},  // bottom
        {x:-1,y:0, wall:3, opposite:1}   // left
    ];

    for (let dir of directions) {
        let neighbor = grid[index(
            cell.x + dir.x,
            cell.y + dir.y
        )];

        if (neighbor) {
            neighbors.push({
                cell: neighbor,
                wall: dir.wall,
                opposite: dir.opposite
            });
        }
    }

    return neighbors;
}


function getVisitedNeighbors(cell) {
    let neighbors = [];

    const directions = [
        {x:0, y:-1, wall:0, opposite:2},
        {x:1, y:0, wall:1, opposite:3},
        {x:0, y:1, wall:2, opposite:0},
        {x:-1,y:0, wall:3, opposite:1}
    ];

    for (let dir of directions) {
        let neighbor = grid[index(
            cell.x + dir.x,
            cell.y + dir.y
        )];

        if (neighbor && neighbor.visited) {
            neighbors.push({
                cell: neighbor,
                wall: dir.wall,
                opposite: dir.opposite
            });
        }
    }

    return neighbors;
}

async function prim() {
    let start = grid[0];
    start.visited = true;

    let frontier = getAllNeighbors(start);

    while (frontier.length > 0) {
        // Pick random frontier cell
        let randomIndex = Math.floor(Math.random() * frontier.length);
        let current = frontier.splice(randomIndex, 1)[0];

        let cell = current.cell;

        let visitedNeighbors = getVisitedNeighbors(cell);

        if (visitedNeighbors.length > 0) {
            let randomNeighbor = visitedNeighbors[
                Math.floor(Math.random() * visitedNeighbors.length)
            ];

            removeWalls(
                cell,
                randomNeighbor.cell,
                randomNeighbor.wall,
                randomNeighbor.opposite
            );

            cell.visited = true;

            drawGrid();
            await sleep(20);

            let newNeighbors = getAllNeighbors(cell);

            for (let neighbor of newNeighbors) {
                if (!neighbor.cell.visited && 
                !frontier.some(f => f.cell === neighbor.cell)) {
                frontier.push(neighbor);
            }
        }
        }
    }

    drawGrid();
}
function wilsons() {
    // Implement Wilson's algorithm for maze generation here
}

function binaryTree() {
    // Implement Binary Tree algorithm for maze generation here
}