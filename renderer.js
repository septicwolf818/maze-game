class Renderer {
    constructor() {
        this.container = document.getElementById('maze');
        this.cells = [];
        this.prevCharPos = null;
    }

    render(maze, character, enemies) {
        if (!maze) return;
        const h = maze.length;
        const w = maze[0].length;

        if (this.cells.length !== h * w) {
            this.container.innerHTML = '';
            this.cells = [];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.y = y;
                    cell.dataset.x = x;
                    this.container.appendChild(cell);
                    this.cells.push(cell);
                }
            }
        }

        const ec = new Set();
        if (enemies) {
            for (const e of enemies) {
                ec.add(`${e.x},${e.y}`);
            }
        }

        for (let i = 0; i < this.cells.length; i++) {
            const y = Math.floor(i / w);
            const x = i % w;
            const cell = this.cells[i];
            const val = maze[y][x];
            const hasChar = character && character.x === x && character.y === y;
            const hasEnemy = ec.has(`${x},${y}`);

            cell.className = 'cell';

            if (val === CELL.WALL) {
                cell.classList.add('wall');
            } else if (val === CELL.START) {
                cell.classList.add('start');
            } else if (val === CELL.END) {
                cell.classList.add('end');
            } else {
                cell.classList.add('path');
            }

            if (hasChar) {
                cell.classList.add('char');
                cell.style.backgroundImage =
                    `url("assets/textures/character/${character.dir}.png")`;
            } else if (hasEnemy) {
                cell.classList.add('enemy');
                cell.style.backgroundImage = '';
            } else {
                cell.style.backgroundImage = '';
            }
        }
    }
}
