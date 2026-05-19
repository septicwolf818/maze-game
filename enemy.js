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
            const enemy = new Enemy(pos.x, pos.y);
            enemy.buildPatrolRoute(maze);
            this.enemies.push(enemy);
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
        this.waypoints = [{ x, y }];
        this.waypointIndex = 0;
    }

    buildPatrolRoute(maze) {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const shuffled = [...dirs].sort(() => Math.random() - 0.5);

        for (const [dy, dx] of shuffled) {
            let cx = this.x + dx;
            let cy = this.y + dy;
            let steps = 0;
            while (
                cy >= 0 && cy < maze.length &&
                cx >= 0 && cx < maze[0].length &&
                maze[cy][cx] === CELL.PATH &&
                steps < 6
            ) {
                cx += dx;
                cy += dy;
                steps++;
            }

            const endX = this.x + dx * steps;
            const endY = this.y + dy * steps;
            if (steps >= 2 && (endX !== this.x || endY !== this.y)) {
                const route = [
                    { x: this.x, y: this.y },
                    { x: endX, y: endY },
                ];
                this.waypoints = route;
                this.waypointIndex = 0;
                return;
            }
        }

        const neighbor = shuffled.find(([dy, dx]) => {
            const nx = this.x + dx;
            const ny = this.y + dy;
            return (
                ny >= 0 && ny < maze.length &&
                nx >= 0 && nx < maze[0].length &&
                maze[ny][nx] === CELL.PATH
            );
        });
        if (neighbor) {
            const [dy, dx] = neighbor;
            this.waypoints = [
                { x: this.x, y: this.y },
                { x: this.x + dx, y: this.y + dy },
            ];
        }
    }

    move() {
        const target = this.waypoints[this.waypointIndex];
        if (!target) return;

        const dx = Math.sign(target.x - this.x);
        const dy = Math.sign(target.y - this.y);

        if (dx > 0) this.dir = 'right';
        else if (dx < 0) this.dir = 'left';
        else if (dy > 0) this.dir = 'down';
        else if (dy < 0) this.dir = 'up';

        this.x += dx;
        this.y += dy;

        if (this.x === target.x && this.y === target.y) {
            this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
        }
    }
}
