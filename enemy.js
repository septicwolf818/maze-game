class EnemyManager {
    constructor() {
        this.enemies = [];
    }

    place(maze, count) {
        this.enemies = [];
        const pathCells = [];
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === CELL.PATH && !(y === 0 && x === 0) &&
                    !(y === maze.length - 1 && x === maze[y].length - 1)) {
                    pathCells.push({ x, y });
                }
            }
        }

        const used = new Set();
        const pick = () => {
            if (pathCells.length === 0) return null;
            let p;
            let attempts = 0;
            do {
                p = pathCells[Math.floor(Math.random() * pathCells.length)];
                attempts++;
            } while (used.has(`${p.x},${p.y}`) && attempts < 50);
            used.add(`${p.x},${p.y}`);
            return p;
        };

        const chosen = Math.min(count, pathCells.length);
        for (let i = 0; i < chosen; i++) {
            const pos = pick();
            if (!pos) break;
            this.enemies.push(new Enemy(pos.x, pos.y));
        }
    }

    update(maze) {
        for (const enemy of this.enemies) {
            enemy.move(maze);
        }
    }

    checkCollision(character) {
        return this.enemies.some(e => e.x === character.x && e.y === character.y);
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dir = 'right';
        this.dirs = ['up', 'right', 'down', 'left'];
        this.moveVec = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 },
        };
    }

    move(maze) {
        const vec = this.moveVec[this.dir];
        const nx = this.x + vec.dx;
        const ny = this.y + vec.dy;

        if (
            ny >= 0 && ny < maze.length &&
            nx >= 0 && nx < maze[0].length &&
            maze[ny][nx] === CELL.PATH
        ) {
            this.x = nx;
            this.y = ny;
            return;
        }

        const available = this.dirs.filter(d => {
            const v = this.moveVec[d];
            const cx = this.x + v.dx;
            const cy = this.y + v.dy;
            return (
                cy >= 0 && cy < maze.length &&
                cx >= 0 && cx < maze[0].length &&
                maze[cy][cx] === CELL.PATH
            );
        });

        if (available.length > 0) {
            this.dir = available[Math.floor(Math.random() * available.length)];
            const v = this.moveVec[this.dir];
            this.x += v.dx;
            this.y += v.dy;
        }
    }
}
