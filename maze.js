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
        if (this.x === 0 && this.y === 0) {
            context.fillStyle = "#7cb37c";
        } else if (this.x === col - 1 && this.y === row - 1) {
            context.fillStyle = "#c74747";
        } else {
            context.fillStyle = "#dadada";
        }
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
        await prim();
    } else if (algorithm === "Wilson's") {
        await wilsons();
    } else if (algorithm === "BinaryTree") {
        await binaryTree();
    } else if (algorithm === "Kruskal's") {
        await kruskals();
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
        await sleep();
        await dfs(nextCell);

        neighbors = getNeighbors(cell);
    }


}
function sleep() {
    const ms = document.getElementById("sleepInput").value;
    if (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    } else {
        return new Promise(resolve => setTimeout(resolve, 20));
    }
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
            await sleep();

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
async function wilsons() {
    let first=grid[Math.floor(Math.random() * grid.length)];
    first.visited=true;

    let unvisited = grid.filter(cell => !cell.visited);

    while (unvisited.length > 0) {
        let randomIndex = Math.floor(Math.random() * unvisited.length);
        let current = unvisited[randomIndex];

        let path = [current];
        let visitedSet = new Set();
        visitedSet.add(current);

        while (!current.visited) {
            let neighbors = getAllNeighbors(current);
            let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)].cell;

            if (visitedSet.has(randomNeighbor)) {
                let loopIndex = path.indexOf(randomNeighbor);
                path = path.slice(0, loopIndex + 1);
            } else {
                path.push(randomNeighbor);
                visitedSet.add(randomNeighbor);
            }

            current = randomNeighbor;
        }

        for (let i = 0; i < path.length - 1; i++) {
            let cell1 = path[i];
            let cell2 = path[i + 1];

            let wallInfo = getAllNeighbors(cell1).find(n => n.cell === cell2);
            if (wallInfo) {
                removeWalls(cell1, cell2, wallInfo.wall, wallInfo.opposite);
            }

            cell1.visited = true;
            drawGrid();
            await sleep();
        }

        unvisited = grid.filter(cell => !cell.visited);
    }

    drawGrid();
}
async function kruskals() {
    let parent = [];
    for (let i = 0; i < grid.length; i++) {
        parent[i] = i;
    }

    function find(i) {
        if (parent[i] === i) return i;
        return parent[i] = find(parent[i]);
    }

    function union(i, j) {
        let rootI = find(i);
        let rootJ = find(j);
        if (rootI !== rootJ) {
            parent[rootJ] = rootI;
            return true;
        }
        return false;
    }

    let edges = [];
    for (let cell of grid) {
        let neighbors = getAllNeighbors(cell);
        for (let neighbor of neighbors) {
            edges.push({
                cell1: cell,
                cell2: neighbor.cell,
                wall: neighbor.wall,
                opposite: neighbor.opposite
            });
        }
    }

    for (let i = edges.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [edges[i], edges[j]] = [edges[j], edges[i]];
    }

    for (let edge of edges) {
        let index1 = index(edge.cell1.x, edge.cell1.y);
        let index2 = index(edge.cell2.x, edge.cell2.y);
        if (union(index1, index2)) {
            removeWalls(edge.cell1, edge.cell2, edge.wall, edge.opposite);
            edge.cell1.visited = true;
            edge.cell2.visited = true;
            drawGrid();
            await sleep();
        }
    }
}
async function binaryTree() {
    for (let cell of grid) {
        let neighbors = [];
        let bottomNeighbor = grid[index(cell.x, cell.y + 1)];
        let rightNeighbor = grid[index(cell.x + 1, cell.y)];
        if (bottomNeighbor) {
            neighbors.push({
                cell: bottomNeighbor,
                wall: 2,
                opposite: 0
            });
        }
        if (rightNeighbor) {
            neighbors.push({
                cell: rightNeighbor,
                wall: 1,
                opposite: 3
            });
        }
        if (neighbors.length > 0) {
            let randomNeighbor =
                neighbors[Math.floor(Math.random() * neighbors.length)];

            removeWalls(
                cell,
                randomNeighbor.cell,
                randomNeighbor.wall,
                randomNeighbor.opposite
            );
        }
        cell.visited = true;
        drawGrid();
        await sleep();
    }
    drawGrid();
}
