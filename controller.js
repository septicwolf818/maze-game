steps = ""
operate = false;
character_y = 0;
character_x = 0;
character_dir = "right";


function addTurnLeft() {
    if (!operate) return null;
    var lst = document.getElementById("list");
    if (steps == "") {
        lst.innerHTML = "";
    }
    steps += "l";
    var obj = document.createElement("div");
    obj.classList.add("instruction", "left");
    obj.innerHTML = "turnLeft()";
    lst.appendChild(obj);
    lst.scrollTop = lst.scrollHeight;

}

function addTurnRight() {
    if (!operate) return null;
    var lst = document.getElementById("list");
    if (steps == "") {
        lst.innerHTML = "";
    }
    steps += "r";
    var obj = document.createElement("div");
    obj.classList.add("instruction", "right");
    obj.innerHTML = "turnRight()";
    lst.appendChild(obj);
    lst.scrollTop = lst.scrollHeight;
}

function addGoForward() {
    if (!operate) return null;
    var lst = document.getElementById("list");
    if (steps == "") {
        lst.innerHTML = "";
    }
    steps += "f";
    var obj = document.createElement("div");
    obj.classList.add("instruction", "forward");
    obj.innerHTML = "goForward()";
    lst.appendChild(obj);
    lst.scrollTop = lst.scrollHeight;

}

function reset() {
    if (!operate) return null;
    console.log("Reset...");
    steps = "";
    document.getElementById("list").innerHTML = "Select commands";
    character_y = 0;
    character_x = 0;
    character_dir = "right";
    show();
}


async function show() {
    console.log("Show...");
    localMaze = undefined;
    await Promise.resolve(window.maze).then(async (v) => {
        console.log("Resolve maze...");
        localMaze = v;
        var showd = document.getElementById("show");
        showd.innerHTML = "";
        generateNewMaze = false;
        for (var y = 0; y < localMaze.length; y++) {
            for (var x = 0; x < localMaze[0].length; x++) {
                if (localMaze[y][x] == "m") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "green");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "path";
                    showd.appendChild(obj);
                } else if (localMaze[y][x] == "w") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "blue");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "target";
                    showd.appendChild(obj);
                } else if (localMaze[y][x] == "y") {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "orange");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "path";
                    showd.appendChild(obj);
                } else {
                    var obj = document.createElement("div");
                    obj.classList.add("cell", "black");
                    obj.dataset.y = y;
                    obj.dataset.x = x;
                    obj.dataset.type = "wall";
                    showd.appendChild(obj);
                }
                if (showd.lastChild.dataset.y == character_y && showd.lastChild.dataset.x == character_x) {
                    showd.lastChild.style.backgroundImage = "url(\"assets/textures/character/" + character_dir + ".png\")";
                    if (showd.lastChild.dataset.type == "wall") {
                        window.alert("You have hit the wall! Try again!");
                        operate = true;
                        reset();
                        operate = false;
                    }

                    if (character_y == localMaze.length - 1 && character_x == localMaze[0].length - 1) {
                        window.alert("You have solved the maze! Congratulations!");
                        generateNewMaze = true;
                        operate = true;
                        reset();
                        operate = false;
                        generateNew();
                        reset();
                        show();

                    }
                }
            }
        }
        if (!generateNewMaze) {
            showd.firstChild.classList.add("orange");
            showd.lastChild.classList.add("orange");
        }

    }).catch((d) => {
        void(0);
    });
    await sleep(500);
}


async function generateNew() {
    console.log("Generate new maze...");
    window.maze = generateMaze(11, 11);
}

async function run() {
    if (operate) {
        operate = !operate;
        var options = document.querySelectorAll(".option");
        for (var i = 0; i < options.length; i++) {
            options[i].classList.add("disabled");
        }
    } else return null;
    console.log("Run...");
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
                    Promise.resolve(window.maze).then((v) => {
                        if (character_x > v[0].length - 1) {
                            window.alert("You went beyond the maze boundary!");
                            reset();
                        }
                    });
                } else if (character_dir == "down") {
                    character_y++;
                    Promise.resolve(window.maze).then((v) => {
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
    operate = !operate;
    var options = document.querySelectorAll(".option");
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove("disabled");
    }
}