let selected_x = 0;
let selected_y = 0;

async function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));
}


function isConnected(maze, y, x) {
    connection_count = 0;
    if (y == selected_y && x == selected_x) return 1;
    if (maze[y - 1] != undefined)
        if (maze[y - 1][x] != undefined)
            if (maze[y - 1][x] == "m") connection_count++;
    if (maze[y + 1] != undefined)
        if (maze[y + 1][x] != undefined)
            if (maze[y + 1][x] == "m") connection_count++;
    if (maze[y] != undefined)
        if (maze[y][x - 1] != undefined)
            if (maze[y][x - 1] == "m") connection_count++;
    if (maze[y] != undefined)
        if (maze[y][x + 1] != undefined)
            if (maze[y][x + 1] == "m") connection_count++;

    return connection_count;
}

async function generateMaze(width, height) {
    console.log("Generate maze...");
    let maze = [];
    let walls = [];

    for (var y = 0; y < height; y++) {
        let maze_row = [];
        for (var x = 0; x < width; x++) {
            maze_row.push("i");
        }
        maze.push(maze_row);
    }

    maze[selected_y][selected_x] = "m";

    walls.push([selected_y + 2, selected_x])
    maze[selected_y + 2][selected_x] = "w";
    walls.push([selected_y, selected_x + 2])
    maze[selected_y][selected_x + 2] = "w";


    while (walls.length > 0) {

        var show = document.getElementById("show");

        connected = false;

        var vertical_connection = Math.random();
        if (vertical_connection < 0.5) vertical_connection = true;
        else vertical_connection = false;

        wall = walls.splice(parseInt(Math.random() * walls.length), 1)[0];
        maze[wall[0]][wall[1]] = "m";
        if (maze[wall[0] - 2] != undefined)
            if (maze[wall[0] - 2][wall[1]] != undefined) {
                if (maze[wall[0] - 2][wall[1]] == "m") {
                    if (isConnected(maze, wall[0] - 2, wall[1]) > 0 && !connected) {
                        maze[wall[0] - 1][wall[1]] = "m";
                        connected = true;
                    }
                } else if (maze[wall[0] - 2][wall[1]] == "i") {
                    maze[wall[0] - 2][wall[1]] = "w";
                    walls.push([wall[0] - 2, wall[1]]);
                }
            }
        if (maze[wall[0]] != undefined)
            if (maze[wall[0]][wall[1] + 2] != undefined) {
                if (maze[wall[0]][wall[1] + 2] == "m") {
                    if (isConnected(maze, wall[0], wall[1] + 2) > 0 && !connected) {
                        maze[wall[0]][wall[1] + 1] = "m";
                        connected = true;
                    }
                } else if (maze[wall[0]][wall[1] + 2] == "i") {
                    maze[wall[0]][wall[1] + 2] = "w";
                    walls.push([wall[0], wall[1] + 2]);
                }
            }
        if (maze[wall[0] + 2] != undefined)
            if (maze[wall[0] + 2][wall[1]] != undefined) {
                if (maze[wall[0] + 2][wall[1]] == "m") {
                    if (isConnected(maze, wall[0] + 2, wall[1]) > 0 && !connected) {
                        maze[wall[0] + 1][wall[1]] = "m";
                        connected = true;
                    }
                } else if (maze[wall[0] + 2][wall[1]] == "i") {
                    maze[wall[0] + 2][wall[1]] = "w";
                    walls.push([wall[0] + 2, wall[1]]);
                }
            }
        if (maze[wall[0]] != undefined)
            if (maze[wall[0]][wall[1] - 2] != undefined) {
                if (maze[wall[0]][wall[1] - 2] == "m") {
                    if (isConnected(maze, wall[0], wall[1] - 2) > 0 && !connected) {
                        maze[wall[0]][wall[1] - 1] = "m";
                        connected = true;
                    }
                } else if (maze[wall[0]][wall[1] - 2] == "i") {
                    maze[wall[0]][wall[1] - 2] = "w";
                    walls.push([wall[0], wall[1] - 2]);
                }
            }


        await sleep(50);
        show.innerHTML = "";
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                if (maze[y][x] == "m") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "green");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    show.appendChild(obj);
                } else if (maze[y][x] == "w") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "blue");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    show.appendChild(obj);
                } else {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "black");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    show.appendChild(obj);
                }
            }
        }

    }

    maze[0][0] = "y";
    maze[height - 1][width - 1] = "y";

    await sleep(100);
    show.innerHTML = "";
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            if (maze[y][x] == "m") {
                var obj = document.createElement("div");
                obj.classList.add("cell", "green");
                obj.dataset.y = y;
                obj.dataset.x = x;
                show.appendChild(obj);
            } else if (maze[y][x] == "w") {
                var obj = document.createElement("div");
                obj.classList.add("cell", "blue");
                obj.dataset.y = y;
                obj.dataset.x = x;
                show.appendChild(obj);
            } else if (maze[y][x] == "y") {
                var obj = document.createElement("div");
                obj.classList.add("cell", "orange");
                obj.dataset.y = y;
                obj.dataset.x = x;
                show.appendChild(obj);
            } else {
                var obj = document.createElement("div");
                obj.classList.add("cell", "black");
                obj.dataset.y = y;
                obj.dataset.x = x;
                show.appendChild(obj);
            }
        }
    }

    return maze;

}