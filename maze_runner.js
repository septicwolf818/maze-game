class MazeRunner {

    constructor(generator) {

        this.generator = generator;
        this.initialize();
    }

    async initialize() {
        this.state = this.generator.state;
        window.maze = (async () => { return this.generator.generateMaze(11, 11); })();
        this.generator.show();
        document.getElementById('left').onclick = this.addTurnLeft.bind(this);
        document.getElementById('right').onclick = this.addTurnRight.bind(this);
        document.getElementById('forward').onclick = this.addGoForward.bind(this);
        document.getElementById('reset').onclick = this.reset.bind(this);
        document.getElementById('run').onclick = this.run.bind(this);
    }

    addInstruction(move, className, text) {
        const { state } = this;
        if (state.blocked) return null;

        const lst = document.getElementById('list');
        if (state.steps === "") {
            lst.innerHTML = "";
        }

        state.steps += move;

        const obj = document.createElement("div");
        obj.classList.add("instruction", className);
        obj.innerText = text;
        lst.appendChild(obj);
        lst.scrollTop = lst.scrollHeight;
    }

    addTurnLeft() {
        this.addInstruction("l", "left", "turnLeft();");
    }

    addTurnRight() {
        this.addInstruction("r", "right", "turnRight();");
    }

    addGoForward() {
        this.addInstruction("f", "forward", "goForward();")
    }



    async reset() {
        
        const { state } = this;
        if(state.blocked) return null;
        console.log("Reset...");
        state.steps = "";
        document.getElementById("list").innerHTML = "Select commands";
        state.character = { y: 0, x: 0, dir: "right" };
        this.unblock();

    }


    async generateNew() {
        console.log("Generate new maze...");
        window.maze = this.generator.generateMaze(11, 11);
    }

    async run() {
        if (!this.state.blocked) {
            this.block();
        } else return null;

        console.log("Run...");
        if (this.state.steps.length > 0) {
            for (let i = 0; i < this.state.steps.length; i++) {
                const move = this.state.steps.charAt(i);
                this.updateCharacterDirection(move);
                await this.moveCharacter(move);
                await this.generator.show();
            }
            this.state.character = { y: 0, x: 0, dir: "right" };
            this.unblock();
            await this.generator.show();


        } else {
            this.reset();
        }

    }

    updateCharacterDirection(move) {
        const { dir } = this.state.character;
        const directions = ["right", "down", "left", "up"];
        const index = directions.indexOf(dir);
        if (move === "l") {
            this.state.character.dir = directions[(index + 3) % 4];
        } else if (move === "r") {
            this.state.character.dir = directions[(index + 1) % 4];
        }
    }

    async moveCharacter(move) {
        switch (move) {
            case "f":
                this.moveForward();
                break;
        }
    }

    moveForward() {
        if (this.state.character.dir === "right") {
            this.state.character.x++;
        } else if (this.state.character.dir === "down") {
            this.state.character.y++;
        } else if (this.state.character.dir === "left") {
            this.state.character.x--;
        } else if (this.state.character.dir === "up") {
            this.state.character.y--;
        }
        this.checkState();
    }

    checkState() {
        window.maze.then((maze) => {
            if (
                this.state.character.x < 0 ||
                this.state.character.y < 0 ||
                this.state.character.x >= maze[0].length ||
                this.state.character.y >= maze.length
            ) {
                window.alert("You went beyond the maze boundary! Try again!");
                this.reset();
            }
            else if (maze[this.state.character.y][this.state.character.x] == "i") {
                window.alert("You have hit the wall! Try again!");
                this.reset();
            }
            else if (this.state.character.y == maze.length - 1 && this.state.character.x == maze[0].length - 1) {
                window.alert("You have solved the maze! Congratulations!");
                this.block()
                this.reset();
                this.generateNew();
                this.unblock();
            }
        });
    }

    block() {
        this.state.blocked = true;
        document.querySelectorAll(".option").forEach((option) => {
            option.classList.add("disabled");
        });
    }

    unblock() {
        this.state.blocked = false;
        document.querySelectorAll(".option").forEach((option) => {
            option.classList.remove("disabled");
        });
    }
}