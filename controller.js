steps = ""

character_y = 0;
character_x = 0;
character_dir = "right";


function addTurnLeft() {
    if (steps == "") {
        document.getElementById("list").innerHTML = "";
    }
    steps += "l";
    var obj = document.createElement("div");
    obj.classList.add("instruction", "left");
    obj.innerHTML = "turnLeft()";
    document.getElementById("list").appendChild(obj);

}

function addTurnRight() {
    if (steps == "") {
        document.getElementById("list").innerHTML = "";
    }
    steps += "r";
    var obj = document.createElement("div");
    obj.classList.add("instruction", "right");
    obj.innerHTML = "turnRight()";
    document.getElementById("list").appendChild(obj);
}

function addGoForward() {
    if (steps == "") {
        document.getElementById("list").innerHTML = "";
    }
    steps += "f";
    var obj = document.createElement("div");
    obj.classList.add("instruction", "forward");
    obj.innerHTML = "goForward()";
    document.getElementById("list").appendChild(obj);

}

function reset() {
    steps = "";
    document.getElementById("list").innerHTML = "Select commands";
    character_y = 0;
    character_x = 0;
    character_dir = "right";
    show();
}


async function show() {
    localMaze = undefined;
    Promise.resolve(maze).then((v) => {
        localMaze = v;
        var show = document.getElementById("show");
        show.innerHTML = "";
        for (var y = 0; y < localMaze.length; y++) {
            for (var x = 0; x < localMaze[0].length; x++) {
                if (localMaze[y][x] == "m") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "green");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "path";
                    show.appendChild(obj);
                } else if (localMaze[y][x] == "w") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "blue");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "target";
                    show.appendChild(obj);
                } else if (localMaze[y][x] == "y") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "orange");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "path";
                    show.appendChild(obj);
                } else {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "black");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "wall";
                    show.appendChild(obj);
                }
                if (show.lastChild.dataset.y == character_y && show.lastChild.dataset.x == character_x) {
                    show.lastChild.style.backgroundImage = "url(\"assets/textures/character/" + character_dir + ".png\")";
                    if (show.lastChild.dataset.type == "wall") {
                        window.alert("You have hit the wall! Try again!");
                        reset();
                    }
                    if (character_y == localMaze.length - 1 && character_x == localMaze[0].length - 1) {
                        window.alert("You have solved the maze! Congratulations!");
                        reset();
                        maze = generateMaze(11, 11);
                    }
                }
            }
        }
        show.firstChild.classList.add("orange");
        show.lastChild.classList.add("orange");

    });
    await sleep(500);
}

async function run() {
    for (var i = 0; i < steps.length; i++) {
        var move = steps.charAt(i);
        switch (move) {
            case "l":
                if (character_dir == "right") character_dir = "up";
                else if (character_dir == "up") character_dir = "left";
                else if (character_dir == "left") character_dir = "down";
                else if (character_dir == "down") character_dir = "right";
                break;
            case "r":
                if (character_dir == "right") character_dir = "down";
                else if (character_dir == "down") character_dir = "left";
                else if (character_dir == "left") character_dir = "up";
                else if (character_dir == "up") character_dir = "right";
                break;
            case "f":
                if (character_dir == "right") {
                    character_x++;
                    Promise.resolve(maze).then((v) => {
                        if (character_x > v[0].length - 1) {
                            window.alert("You went beyond the maze boundary!");
                            reset();
                        }
                    });
                } else if (character_dir == "down") {
                    character_y++;
                    Promise.resolve(maze).then((v) => {
                        if (character_y > v.length - 1) {
                            window.alert("You went beyond the maze boundary!");
                            reset();
                        }
                    });

                } else if (character_dir == "left") {
                    character_x--;
                    if (character_x < 0) {
                        window.alert("You went beyond the maze boundary!");
                        reset();
                    }
                } else if (character_dir == "up") {
                    character_y--;
                    if (character_y < 0) {
                        window.alert("You went beyond the maze boundary!");
                        reset();
                    }
                }
                break;
        }
        await show();
    }
    character_y = 0;
    character_x = 0;
    character_dir = "right";
}