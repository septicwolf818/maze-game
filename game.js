class Game {
    constructor() {
        this.mazeGenerator = new MazeGenerator();
        this.renderer = new Renderer();
        this.pathBuilder = new PathBuilder(() => this.onProgramChange());
        this.enemyManager = new EnemyManager();

        this.maze = null;
        this.character = { x: 0, y: 0, dir: 'right' };
        this.blocked = false;
        this.stopped = false;
        this.enemyCount = 3;

        this.runBtn = document.getElementById('runBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.newMazeBtn = document.getElementById('newMazeBtn');
        this.statusMsg = document.getElementById('status-msg');
        this.blockBtns = document.querySelectorAll('.block-btn');

        this.runBtn.addEventListener('click', () => this.run());
        this.resetBtn.addEventListener('click', () => {
            this.pathBuilder.clear();
            this.resetState();
        });
        this.newMazeBtn.addEventListener('click', () => this.generateNew());

        for (const btn of this.blockBtns) {
            btn.addEventListener('click', () => {
                this.pathBuilder.addBlock(btn.dataset.block);
            });
        }

        this.expandBtn = document.getElementById('expandBtn');
        this.expandBtn.addEventListener('click', () => {
            document.getElementById('app').classList.toggle('builder-expanded');
            const icon = this.expandBtn.querySelector('i');
            icon.className = icon.classList.contains('fa-expand')
                ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
        });

        this.generateNew();
    }

    setStatus(msg, cls) {
        this.statusMsg.textContent = msg;
        this.statusMsg.className = cls || '';
    }

    setBlocked(blocked) {
        this.blocked = blocked;
        this.runBtn.disabled = blocked;
        this.newMazeBtn.disabled = blocked;
        for (const btn of this.blockBtns) {
            btn.disabled = blocked;
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onProgramChange() {
    }

    async generateNew() {
        this.setBlocked(true);
        this.setStatus('Generating maze...', 'active');

        this.maze = await this.mazeGenerator.generate(11, 11, (frame) => {
            this.renderer.render(frame, null, null);
        });

        this.character = { x: 0, y: 0, dir: 'right' };
        this.enemyManager.place(this.maze, this.enemyCount);

        this.renderer.render(this.maze, this.character, this.enemyManager.enemies);
        this.pathBuilder.clear();
        this.setBlocked(false);
        this.setStatus('Build your path and press Run', '');
    }

    async run() {
        if (this.blocked || !this.maze) return;
        this.setBlocked(true);
        this.stopped = false;
        this.setStatus('Running...', 'active');

        if (this.enemyManager.checkCollision(this.character)) {
            this.setStatus('Caught by an enemy!', 'error');
            await this.sleep(600);
            this.stop('enemy');
            return;
        }

        const commands = this.pathBuilder.compile();

        for (let i = 0; i < commands.length; i++) {
            if (this.stopped) break;
            this.pathBuilder.highlightCommand(i);
            const cmd = commands[i];

            if (cmd === 'l' || cmd === 'r') {
                this.turn(cmd);
            } else if (cmd === 'f') {
                const hit = this.moveForward();
                if (hit === 'wall' || hit === 'boundary') {
                    this.setStatus('Hit a wall!', 'error');
                    document.getElementById('maze').classList.add('shake');
                    await this.sleep(300);
                    document.getElementById('maze').classList.remove('shake');
                    this.renderer.render(this.maze, this.character, this.enemyManager.enemies);
                    await this.sleep(2000);
                    this.stop('wall');
                    break;
                }
            }

            this.enemyManager.update(this.maze, this.character);

            const chasing = this.enemyManager.enemies.some(e => e.chasing);
            if (chasing) {
                this.setStatus('Chaser is hunting you!', 'active');
            } else {
                this.setStatus('Running...', 'active');
            }

            this.renderer.render(this.maze, this.character, this.enemyManager.enemies);
            await this.sleep(300);

            if (this.enemyManager.checkCollision(this.character)) {
                this.setStatus('Caught by an enemy!', 'error');
                await this.sleep(2000);
                this.stop('enemy');
                break;
            }

            const h = this.maze.length;
            const w = this.maze[0].length;
            if (this.character.x === w - 1 && this.character.y === h - 1) {
                this.setStatus('You solved the maze!', 'win');
                await this.sleep(2000);
                this.generateNew();
                return;
            }
        }

        if (!this.stopped) {
            this.resetState();
        }
    }

    turn(cmd) {
        const dirs = ['right', 'down', 'left', 'up'];
        const idx = dirs.indexOf(this.character.dir);
        if (cmd === 'l') {
            this.character.dir = dirs[(idx + 3) % 4];
        } else if (cmd === 'r') {
            this.character.dir = dirs[(idx + 1) % 4];
        }
    }

    moveForward() {
        const vec = {
            right: { dx: 1, dy: 0 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            up: { dx: 0, dy: -1 },
        }[this.character.dir];

        const nx = this.character.x + vec.dx;
        const ny = this.character.y + vec.dy;

        if (ny < 0 || ny >= this.maze.length || nx < 0 || nx >= this.maze[0].length) {
            return 'boundary';
        }

        if (this.maze[ny][nx] === CELL.WALL) {
            return 'wall';
        }

        this.character.x = nx;
        this.character.y = ny;
        return 'ok';
    }

    stop(reason) {
        this.stopped = true;
        this.pathBuilder.highlightCommand(-1);
        if (reason) {
            setTimeout(() => {
                this.resetState();
            }, 2000);
        } else {
            this.resetState();
        }
    }

    resetState() {
        this.character = { x: 0, y: 0, dir: 'right' };
        this.stopped = true;
        this.setBlocked(false);
        this.enemyManager.reset();
        this.renderer.render(this.maze, this.character, this.enemyManager.enemies);
        this.setStatus('Build your path and press Run', '');
    }
}
