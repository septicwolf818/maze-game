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

        const types = ['patrol', 'chaser', 'jumper'];
        const chosen = Math.min(count, pathCells.length);
        for (let i = 0; i < chosen; i++) {
            const pos = pick();
            if (!pos) break;
            const enemy = new Enemy(pos.x, pos.y, types[i % types.length]);
            if (enemy.type === 'jumper') {
                enemy.buildJumperRoute(maze);
            } else {
                enemy.buildPatrolRoute(maze);
            }
            enemy.saveInitialState();
            this.enemies.push(enemy);
        }
    }

    update(maze, character) {
        for (const enemy of this.enemies) {
            enemy.move(maze, character);
        }
    }

    checkCollision(character) {
        return this.enemies.some(e => e.x === character.x && e.y === character.y);
    }

    reset() {
        for (const enemy of this.enemies) {
            enemy.resetState();
        }
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type || 'patrol';
        this.dir = 'right';
        this.waypoints = [{ x, y }];
        this.waypointIndex = 0;
        this.chasing = false;
    }

    saveInitialState() {
        this.startX = this.x;
        this.startY = this.y;
        this.startDir = this.dir;
        this.startWaypoints = this.waypoints.map(w => ({ ...w }));
        this.startWaypointIndex = this.waypointIndex;
    }

    resetState() {
        this.x = this.startX;
        this.y = this.startY;
        this.dir = this.startDir;
        this.waypoints = this.startWaypoints.map(w => ({ ...w }));
        this.waypointIndex = this.startWaypointIndex;
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
                this.waypoints = [{ x: this.x, y: this.y }, { x: endX, y: endY }];
                this.waypointIndex = 0;
                if (dx > 0) this.dir = 'right';
                else if (dx < 0) this.dir = 'left';
                else if (dy > 0) this.dir = 'down';
                else if (dy < 0) this.dir = 'up';
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
            if (dx > 0) this.dir = 'right';
            else if (dx < 0) this.dir = 'left';
            else if (dy > 0) this.dir = 'down';
            else if (dy < 0) this.dir = 'up';
        }
    }

    buildJumperRoute(maze) {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const shuffled = [...dirs].sort(() => Math.random() - 0.5);

        for (const [dy, dx] of shuffled) {
            const pts = [{ x: this.x, y: this.y }];
            let cx = this.x;
            let cy = this.y;
            // Keep jumping while wall+path pattern holds
            for (;;) {
                const wx = cx + dx, wy = cy + dy;
                const lx = cx + dx * 2, ly = cy + dy * 2;
                if (
                    wy >= 0 && wy < maze.length &&
                    wx >= 0 && wx < maze[0].length &&
                    maze[wy][wx] === CELL.WALL &&
                    ly >= 0 && ly < maze.length &&
                    lx >= 0 && lx < maze[0].length &&
                    maze[ly][lx] === CELL.PATH
                ) {
                    cx = lx; cy = ly;
                    pts.push({ x: cx, y: cy });
                } else break;
            }

            if (pts.length >= 2) {
                this.waypoints = pts;
                this.waypointIndex = 0;
                if (dx > 0) this.dir = 'right';
                else if (dx < 0) this.dir = 'left';
                else if (dy > 0) this.dir = 'down';
                else if (dy < 0) this.dir = 'up';
                return;
            }
        }

        this.buildPatrolRoute(maze);
    }

    move(maze, character) {
        if (this.type === 'patrol') {
            this.movePatrol(maze);
        } else if (this.type === 'chaser') {
            this.moveChaser(maze, character);
        } else if (this.type === 'jumper') {
            this.moveJumper(maze);
        }
    }

    forwardCell() {
        const offsets = {
            up:    { dx: 0, dy: -1 },
            down:  { dx: 0, dy: 1 },
            left:  { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 },
        };
        const o = offsets[this.dir] || { dx: 0, dy: 0 };
        return { x: this.x + o.dx, y: this.y + o.dy };
    }

    dirTo(targetX, targetY) {
        const dx = Math.sign(targetX - this.x);
        const dy = Math.sign(targetY - this.y);
        if (dx > 0) return 'right';
        if (dx < 0) return 'left';
        if (dy > 0) return 'down';
        if (dy < 0) return 'up';
        return this.dir;
    }

    turnTowards(desiredDir) {
        if (this.dir === desiredDir) return this.dir;
        const dirOrder = ['right', 'down', 'left', 'up'];
        const ci = dirOrder.indexOf(this.dir);
        const ti = dirOrder.indexOf(desiredDir);
        const cw = ((ti - ci) % 4 + 4) % 4;
        // 1 step clockwise or 2 steps (180°) — turn clockwise
        // 3 steps clockwise = 1 step counter-clockwise — turn left
        return cw <= 2 ? dirOrder[(ci + 1) % 4] : dirOrder[(ci + 3) % 4];
    }

    movePatrol(maze) {
        const target = this.waypoints[this.waypointIndex];
        if (!target) return;

        // Already at target — swap to the other waypoint
        if (this.x === target.x && this.y === target.y) {
            this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
            return;
        }

        const desiredDir = this.dirTo(target.x, target.y);

        if (this.dir !== desiredDir) {
            this.dir = this.turnTowards(desiredDir);
            return;
        }

        // Facing the right way — try to move forward
        const fwd = this.forwardCell();
        if (maze[fwd.y] && maze[fwd.y][fwd.x] === CELL.PATH) {
            this.x = fwd.x;
            this.y = fwd.y;
            if (this.x === target.x && this.y === target.y) {
                this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
            }
        }
    }

    moveJumper(maze) {
        const target = this.waypoints[this.waypointIndex];
        if (!target) return;

        if (this.x === target.x && this.y === target.y) {
            this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
            return;
        }

        const desiredDir = this.dirTo(target.x, target.y);

        if (this.dir !== desiredDir) {
            this.dir = this.turnTowards(desiredDir);
            return;
        }

        const fwd = this.forwardCell();
        const jumpOffsets = {
            up:    { dx: 0, dy: -2 },
            down:  { dx: 0, dy: 2 },
            left:  { dx: -2, dy: 0 },
            right: { dx: 2, dy: 0 },
        };
        const j = jumpOffsets[this.dir];
        const jx = this.x + j.dx;
        const jy = this.y + j.dy;

        if (maze[fwd.y] && maze[fwd.y][fwd.x] === CELL.PATH) {
            this.x = fwd.x;
            this.y = fwd.y;
        } else if (
            jy >= 0 && jy < maze.length &&
            jx >= 0 && jx < maze[0].length &&
            maze[jy][jx] === CELL.PATH
        ) {
            this.x = jx;
            this.y = jy;
        }

        if (this.x === target.x && this.y === target.y) {
            this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
        }
    }

    moveChaser(maze, character) {
        this.chasing = false;
        if (!character) { this.movePatrol(maze); return; }

        const dx = character.x - this.x;
        const dy = character.y - this.y;
        const dirVec = {
            right: { dx: 1, dy: 0 },
            left: { dx: -1, dy: 0 },
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
        }[this.dir] || { dx: 0, dy: 0 };
        const facing = dx * dirVec.dx + dy * dirVec.dy > 0 || (dx === 0 && dy === 0);
        const dist = Math.abs(dx) + Math.abs(dy);

        if (dist > 4 || !facing || !this.hasLineOfSight(maze, character)) {
            this.movePatrol(maze);
            return;
        }

        this.chasing = true;

        // Find the best valid direction to chase (closest to player, only open cells)
        const candidates = [
            { dx: 1,  dy: 0,  name: 'right' },
            { dx: -1, dy: 0,  name: 'left' },
            { dx: 0,  dy: 1,  name: 'down' },
            { dx: 0,  dy: -1, name: 'up' },
        ];

        let bestDir = null;
        let bestDist = Infinity;
        for (const c of candidates) {
            const nx = this.x + c.dx;
            const ny = this.y + c.dy;
            if (
                ny >= 0 && ny < maze.length &&
                nx >= 0 && nx < maze[0].length &&
                maze[ny][nx] === CELL.PATH
            ) {
                const nd = Math.abs(nx - character.x) + Math.abs(ny - character.y);
                if (nd < bestDist) {
                    bestDist = nd;
                    bestDir = c.name;
                }
            }
        }

        if (!bestDir) {
            // No open cell — just turn towards player
            const desiredDir = this.dirTo(character.x, character.y);
            if (this.dir !== desiredDir) this.dir = this.turnTowards(desiredDir);
            return;
        }

        if (this.dir !== bestDir) {
            this.dir = this.turnTowards(bestDir);
            return;
        }

        // Already facing the best direction — move forward
        const fwd = this.forwardCell();
        if (maze[fwd.y] && maze[fwd.y][fwd.x] === CELL.PATH) {
            this.x = fwd.x;
            this.y = fwd.y;
        }
    }

    hasLineOfSight(maze, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        const sx = dx < 0 ? -1 : 1;
        const sy = dy < 0 ? -1 : 1;
        let err = adx - ady;
        let cx = this.x;
        let cy = this.y;

        while (cx !== player.x || cy !== player.y) {
            const e2 = 2 * err;
            let mx = false, my = false;
            if (e2 > -ady) {
                err -= ady;
                cx += sx;
                mx = true;
            }
            if (e2 < adx) {
                err += adx;
                cy += sy;
                my = true;
            }
            // Supercover: on a diagonal step, check both corner cells
            if (mx && my) {
                if (maze[cy - sy] && maze[cy - sy][cx] === CELL.WALL) return false;
                if (maze[cy] && maze[cy][cx - sx] === CELL.WALL) return false;
            }
            if (cx === player.x && cy === player.y) break;
            if (maze[cy] && maze[cy][cx] === CELL.WALL) return false;
        }
        return true;
    }
}
