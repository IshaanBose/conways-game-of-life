/* 
Conway's Game of Life Rules:
1. Any live cell with two or three live neighbours survives.
2. Any dead cell with three live neighbours becomes a live cell.
3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
*/

const parentDiv = document.getElementById("div-parent");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const liveCells = new Set();
const spawnCells = {};
const dyingCells = new Set();
let boxSide = 0;

function drawBoxOnClick(x, y)
{
    var boxX = 0, boxY = 0;
    var breakX = false, breakY = false;

    while (!(breakX && breakY))
    {
        if (!breakX)
        {
            if (x >= boxX && x <= (boxX + boxSide))
                breakX = true;
            else
                boxX += boxSide;
        }
        
        if (!breakY)
        {
            if (y >= boxY && y <= (boxY + boxSide))
                breakY = true;
            else
                boxY += boxSide;
        }
    }

    context.fillStyle = "#000000";
    context.fillRect(boxX + 2.5, boxY + 2.5, boxSide - 4, boxSide - 4);

    liveCells.add(boxX + "x" + boxY);
}

function findNeighbours()
{
    const neighbourVal = [
        [-boxSide, -boxSide],
        [0, -boxSide],
        [boxSide, -boxSide],
        [boxSide, 0],
        [boxSide, boxSide],
        [0, boxSide],
        [-boxSide, boxSide],
        [-boxSide, 0]
    ];
    const removeCells = [];

    liveCells.forEach(function (cell) {

        const cellArr =  cell.split("x").map(num => {
            return Number(num)
        });

        let nCount = 0;
        
        neighbourVal.forEach(function(nVal) {
            if ((cellArr[0] + nVal[0]) >= 0 && (cellArr[1] + nVal[1]) >= 0)
            {
                var nCell = (cellArr[0] + nVal[0]) + "x" + (cellArr[1] + nVal[1]);

                if (liveCells.has(nCell))
                {
                    nCount += 1;
                }    
                else
                {
                    if (spawnCells[nCell] == undefined)
                        spawnCells[nCell] = 1;
                    else
                        spawnCells[nCell] += 1;
                }
            }
        });

        if (nCount < 2 || nCount > 3)
            removeCells.push(cell);

    });

    liveCells.forEach(function(cell) { 
        if (removeCells.includes(cell))
        {
            dyingCells.add(cell);
            liveCells.delete(cell);
        }    
    });

    removeCells.length = 0;
}

function filterSpawns()
{
    // removing all cells from spawnCells which do not have exactly 3 neighbours
    for (let [cell, nbs] of Object.entries(spawnCells))
        if (nbs != 3)
            delete spawnCells[cell];
}

function updateGame()
{
    findNeighbours();
    filterSpawns();

    // clearing dead cells from board
    dyingCells.forEach(function(cell) {
        drawBox(cell, true);
    });
    dyingCells.clear(); // clearing set

    // drawing cells which are supposed spawn
    for (let cell in spawnCells)
        drawBox(cell);

    // adding spawned cells to live cells and subsequently clearing spawnCells obj
    for (let cell in spawnCells)
    {
        liveCells.add(cell);
        delete spawnCells[cell];
    }
}

function drawBox(cell, clear)
{
    var nCell = cell.split("x").map(num => {
        return Number(num)
    });

    if (clear)
        context.fillStyle = "#FFFFFF";
    else
        context.fillStyle = "#000000";

    context.fillRect(nCell[0] + 2.5, nCell[1] + 2.5, boxSide - 4, boxSide - 4);
}

$(document).ready(function() {
    
    let intervalID = null;

    canvas.width = 1280; 
    canvas.height = 1280;
    boxSide = 20;

    
    for (let x = boxSide + 0.5 ; x < canvas.width; x += boxSide)
    {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }
    
    for (let y = boxSide + 0.5 ; y < canvas.height; y += boxSide)
    {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    }

    $("#canvas").click(function(e) {

        var x, y, rect = canvas.getBoundingClientRect();

        x = e.clientX - rect.left;
        y = e.clientY - rect.top;

        drawBoxOnClick(Math.trunc(x), Math.trunc(y));

    });

    $("#start").click(function() {
        if (intervalID === null)
            intervalID = setInterval(updateGame, 250);
    });

    $("#stop").click(function() {
        if (intervalID !== null)
        {
            clearInterval(intervalID);
            intervalID = null;
        }
    });

});