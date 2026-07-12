const canvas = document.getElementById("maze");
const context = canvas.getContext("2d");

const col = 30;
const row =30;
const size = 20;

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

function removeWalls(current, next, wall, opposite) {
    current.walls[wall] = false;
    next.walls[opposite] = false;
}

function dfs(cell) {
    cell.visited = true;

    let neighbors = getNeighbors(cell);

    while (neighbors.length > 0) {
        let randomIndex = Math.floor(Math.random() * neighbors.length);
        let { cell: nextCell, wall, opposite } = neighbors[randomIndex];

        removeWalls(cell, nextCell, wall, opposite);
        dfs(nextCell);

        neighbors = getNeighbors(cell);
    }

    cell.draw();

}

dfs(grid[0]);