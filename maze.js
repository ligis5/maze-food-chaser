const maze = document.querySelector(".maze");
const ctx = maze.getContext("2d");

let current;
let foodCell;

class Maze {
  constructor(rows, cols, size) {
    this.rows = rows;
    this.cols = cols;
    this.size = size;
    this.grid = [];
    this.stack = [];
  }

  setup() {
    foodCell = new Food(this.rows, this.cols, this.size, this.grid);
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.cols; c++) {
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
    current = this.grid[0][0];
    foodCell.chooseCell();
    foodCell.foodNeihbours();
  }

  draw() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "#282871";
    current.visited = true;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.cols, this.rows);
      }
    }
    let neighbours = current.checkNeighbours() ? current.checkNeighbours() : [];
    let random = Math.floor(Math.random() * neighbours.length);
    let next = neighbours[random];
    if (current.food) return;
    foodCell.cell.hightlight(this.cols, this.rows, "#c50404ff");
    foodCell.colorFoodNeighbours();
    current.hightlight(this.cols, this.rows, "purple");
    if (next) {
      next.visited = true;
      this.stack.push(current);
      current.removeWalls(current, next);
      current = next;
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current = cell;
    }
    if (this.stack.length == 0) {
      return;
    }
    const maxFps = 20;
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        this.draw();
      }, 1000 / maxFps);
    });
  }
}

class Food {
  constructor(rows, cols, size, parentGrid) {
    this.rows = rows;
    this.cols = cols;
    this.size = size;
    this.parentGrid = parentGrid;
    this.cell = null;
    this.neighbours = [];
  }
  chooseCell() {
    let grid = this.parentGrid;
    let randomRow = Math.floor(Math.random() * this.rows);
    let randomCol = Math.floor(Math.random() * this.cols);
    let cell = grid[randomRow][randomCol];
    cell.food = true;
    this.cell = cell;
  }
  foodNeihbours() {
    let neighbours = this.cell.checkNeighbours();
    let neighboursTwo = [];
    let neighboursThree = [];
    let neighboursFour = [];
    for (let i = 0; i < neighbours.length; i++) {
      let neigh = neighbours[i].checkNeighbours();
      for (let j = 0; j < neigh.length; j++) {
        neighboursTwo.push(neigh[j]);
      }
    }
    for (let i = 0; i < neighboursTwo.length; i++) {
      let neigh = neighboursTwo[i].checkNeighbours();
      for (let j = 0; j < neigh.length; j++) {
        neighboursThree.push(neigh[j]);
      }
    }
    for (let i = 0; i < neighboursThree.length; i++) {
      let neigh = neighboursThree[i].checkNeighbours();
      for (let j = 0; j < neigh.length; j++) {
        neighboursFour.push(neigh[j]);
      }
    }
    this.neighbours = [
      neighbours,
      neighboursTwo,
      neighboursThree,
      neighboursFour,
    ];

    console.log(this.neighbours);
  }
  colorFoodNeighbours() {
    for (let i = 0; i < this.neighbours[0].length; i++) {
      this.neighbours[0][i].hightlight(this.cols, this.rows, "#982536c2");
    }
    for (let i = 0; i < this.neighbours[1].length; i++) {
      if (this.neighbours[1][i] !== this.cell)
        this.neighbours[1][i].hightlight(this.cols, this.rows, "#98253681");
    }
    for (let i = 0; i < this.neighbours[2].length; i++) {
      if (this.neighbours[2][i] !== this.cell)
        this.neighbours[2][i].hightlight(this.cols, this.rows, "#98253652");
    }
    for (let i = 0; i < this.neighbours[3].length; i++) {
      if (this.neighbours[3][i] !== this.cell)
        this.neighbours[3][i].hightlight(this.cols, this.rows, "#9825363f");
    }
  }
}

class Cell {
  constructor(rowNum, colNum, parentGrid, parentSize) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
    this.walls = { top: true, right: true, bottom: true, left: true };
    this.visited = false;
    this.food = false;
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    if (top && !top.visited) neighbours.push(top);
    if (right && !right.visited) neighbours.push(right);
    if (bottom && !bottom.visited) neighbours.push(bottom);
    if (left && !left.visited) neighbours.push(left);

    return neighbours;
  }

  drawTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }
  drawRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }
  drawBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }
  drawLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  hightlight(columns, rows, color) {
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / rows + 1;
    ctx.fillStyle = color;
    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / rows - 3
    );
  }

  removeWalls(cell, cell2) {
    let x = cell.colNum - cell2.colNum;

    if (x === 1) {
      cell.walls.left = false;
      cell2.walls.right = false;
    } else if (x === -1) {
      cell.walls.right = false;
      cell2.walls.left = false;
    }
    let y = cell.rowNum - cell2.rowNum;

    if (y === 1) {
      cell.walls.top = false;
      cell2.walls.bottom = false;
    } else if (y === -1) {
      cell.walls.bottom = false;
      cell2.walls.top = false;
    }
  }

  show(size, columns, rows) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;
    ctx.strokeStyle = "#649324";
    ctx.fillStyle = "#282871";
    ctx.lineWidth = 2;

    if (this.walls.top) this.drawTopWall(x, y, size, columns, rows);
    if (this.walls.right) this.drawRightWall(x, y, size, columns, rows);
    if (this.walls.bottom) this.drawBottomWall(x, y, size, columns, rows);
    if (this.walls.left) this.drawLeftWall(x, y, size, columns, rows);
    if (this.visited) {
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
  }
}

const mazeInstance = new Maze(30, 30, 700);
mazeInstance.setup();
mazeInstance.draw();
