class MazeGenerator {

  constructor(state) {
    this.animationDelayMS = 100;
    this.state = state;
    this.selected_x = 0;
    this.selected_y = 0;
  }
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isConnected(maze, y, x) {
    let connection_count = 0;
    if (y == this.selected_y && x == this.selected_x) return 1;
    if (maze[y - 1] != undefined && maze[y - 1][x] != undefined && maze[y - 1][x] == "m") connection_count++;
    if (maze[y + 1] != undefined && maze[y + 1][x] != undefined && maze[y + 1][x] == "m") connection_count++;
    if (maze[y] != undefined && maze[y][x - 1] != undefined && maze[y][x - 1] == "m") connection_count++;
    if (maze[y] != undefined && maze[y][x + 1] != undefined && maze[y][x + 1] == "m") connection_count++;

    return connection_count;
  }

  async generateMaze(width, height) {
    console.log("Generate maze...");
    let maze = [];
    let walls = [];

    for (let y = 0; y < height; y++) {
      let maze_row = [];
      for (let x = 0; x < width; x++) {
        maze_row.push("i");
      }
      maze.push(maze_row);
    }

    maze[this.selected_y][this.selected_x] = "m";

    walls.push([this.selected_y + 2, this.selected_x]);
    maze[this.selected_y + 2][this.selected_x] = "w";
    walls.push([this.selected_y, this.selected_x + 2]);
    maze[this.selected_y][this.selected_x + 2] = "w";

    while (walls.length > 0) {
      let connected = false;
      let wall = walls.splice(parseInt(Math.random() * walls.length), 1)[0];
      maze[wall[0]][wall[1]] = "m";

      // Check for vertical connection up
      if (maze[wall[0] - 2] != undefined && maze[wall[0] - 2][wall[1]] != undefined) {
        if (maze[wall[0] - 2][wall[1]] == "m") {
          if (this.isConnected(maze, wall[0] - 2, wall[1]) > 0 && !connected) {
            maze[wall[0] - 1][wall[1]] = "m";
            connected = true;
          }
        } else if (maze[wall[0] - 2][wall[1]] == "i") {
          maze[wall[0] - 2][wall[1]] = "w";
          walls.push([wall[0] - 2, wall[1]]);
        }
      }

      // Check for horizontal connection to the right
      if (maze[wall[0]] != undefined && maze[wall[0]][wall[1] + 2] != undefined) {
        if (maze[wall[0]][wall[1] + 2] == "m") {
          if (this.isConnected(maze, wall[0], wall[1] + 2) > 0 && !connected) {
            maze[wall[0]][wall[1] + 1] = "m";
            connected = true;
          }
        } else if (maze[wall[0]][wall[1] + 2] == "i") {
          maze[wall[0]][wall[1] + 2] = "w";
          walls.push([wall[0], wall[1] + 2]);
        }
      }

      // Check for vertical connection below
      if (maze[wall[0] + 2] != undefined && maze[wall[0] + 2][wall[1]] != undefined) {
        if (maze[wall[0] + 2][wall[1]] == "m") {
          if (this.isConnected(maze, wall[0] + 2, wall[1]) > 0 && !connected) {
            maze[wall[0] + 1][wall[1]] = "m";
            connected = true;
          }
        } else if (maze[wall[0] + 2][wall[1]] == "i") {
          maze[wall[0] + 2][wall[1]] = "w";
          walls.push([wall[0] + 2, wall[1]]);
        }
      }

      // Check for horizontal connection to the left
      if (maze[wall[0]] != undefined && maze[wall[0]][wall[1] - 2] != undefined) {
        if (maze[wall[0]][wall[1] - 2] == "m") {
          if (this.isConnected(maze, wall[0], wall[1] - 2) > 0 && !connected) {
            maze[wall[0]][wall[1] - 1] = "m";
            connected = true;
          }
        } else if (maze[wall[0]][wall[1] - 2] == "i") {
          maze[wall[0]][wall[1] - 2] = "w";
          walls.push([wall[0], wall[1] - 2]);
        }
      }
      await this.sleep(this.animationDelayMS);
      this.renderMaze(maze)
    }
    maze[0][0] = "y";
    maze[height - 1][width - 1] = "y";
    return maze;
  }

  async show() {
    console.log("Show...");
    let localMaze;
    localMaze = await Promise.resolve(window.maze);
    this.renderMaze(localMaze);
    await this.sleep(500);
  }

  renderMaze(localMaze) {
    const showd = document.getElementById("show");
    showd.innerHTML = "";
    localMaze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const obj = document.createElement("div");
        obj.classList.add("cell");
        if (cell === "m") {
          obj.classList.add("path");
          obj.dataset.type = "path";
        } else if (cell === "w") {
          obj.classList.add("target");
          obj.dataset.type = "target";
        } else if (cell === "y") {
          obj.classList.add("safepoint");
          obj.dataset.type = "path";
        } else {
          obj.classList.add("wall");
          obj.dataset.type = "wall";
        }
        obj.dataset.y = y;
        obj.dataset.x = x;
        showd.appendChild(obj);
        this.handleCharacterPosition(obj, localMaze);
      });
    });
  }

  handleCharacterPosition(obj, localMaze) {
    if (obj.dataset.y == this.state.character.y && obj.dataset.x == this.state.character.x) {
      obj.style.backgroundImage = `url("assets/textures/character/${this.state.character.dir}.png")`;
    }
  }
}