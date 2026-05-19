const CELL = Object.freeze({
    WALL: 0,
    PATH: 1,
    START: 2,
    END: 3,
    FRONTIER: -1,
});

class MazeGenerator {
    constructor() {
        this.animationDelayMs = 40;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async generate(width, height, onFrame) {
        const grid = Array.from({ length: height }, () => Array(width).fill(CELL.WALL));
        const walls = [];

        grid[0][0] = CELL.PATH;

        if (height >= 2) {
            grid[2][0] = CELL.FRONTIER;
            walls.push([2, 0]);
        }
        if (width >= 2) {
            grid[0][2] = CELL.FRONTIER;
            walls.push([0, 2]);
        }

        while (walls.length > 0) {
            const idx = Math.floor(Math.random() * walls.length);
            const [wy, wx] = walls.splice(idx, 1)[0];

            const neighbors = [];
            const checks = [
                [-2, 0, -1, 0],
                [2, 0, 1, 0],
                [0, -2, 0, -1],
                [0, 2, 0, 1],
            ];

            for (const [dy, dx, my, mx] of checks) {
                const ny = wy + dy;
                const nx = wx + dx;
                if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
                if (grid[ny][nx] === CELL.PATH || grid[ny][nx] === CELL.START) {
                    neighbors.push([ny, nx, wy + my, wx + mx]);
                }
            }

            if (neighbors.length > 0) {
                grid[wy][wx] = CELL.PATH;
                const [py, px, cy, cx] = neighbors[Math.floor(Math.random() * neighbors.length)];
                grid[cy][cx] = CELL.PATH;

                for (const [dy, dx] of checks) {
                    const ny = wy + dy;
                    const nx = wx + dx;
                    if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
                    if (grid[ny][nx] === CELL.WALL) {
                        grid[ny][nx] = CELL.FRONTIER;
                        walls.push([ny, nx]);
                    }
                }
            }

            if (onFrame) {
                const renderGrid = grid.map(row =>
                    row.map(c => c === CELL.PATH || c === CELL.FRONTIER ? CELL.PATH : CELL.WALL)
                );
                onFrame(renderGrid);
                await this.sleep(this.animationDelayMs);
            }
        }

        const result = grid.map(row =>
            row.map(c => c === CELL.PATH ? CELL.PATH : CELL.WALL)
        );
        result[0][0] = CELL.START;
        result[height - 1][width - 1] = CELL.END;

        if (onFrame) onFrame(result);
        return result;
    }
}
