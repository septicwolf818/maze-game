class Renderer {
    constructor() {
        this.container = document.getElementById('maze');
        this.cells = [];
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

        const enemyMap = new Map();
        if (enemies) {
            for (const e of enemies) {
                enemyMap.set(`${e.x},${e.y}`, e);
            }
        }

        for (let i = 0; i < this.cells.length; i++) {
            const y = Math.floor(i / w);
            const x = i % w;
            const cell = this.cells[i];
            const val = maze[y][x];
            const hasChar = character && character.x === x && character.y === y;
            const enemy = enemyMap.get(`${x},${y}`);

            cell.className = 'cell';
            cell.innerHTML = '';
            cell.removeAttribute('data-enemy-type');
            cell.removeAttribute('data-enemy-dir');
            cell.style.backgroundImage = '';

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
            }

            if (enemy) {
                cell.classList.add('enemy');
                cell.dataset.enemyType = enemy.type;
                cell.dataset.enemyDir = enemy.dir;
                if (enemy.chasing) cell.classList.add('is-chasing');

                const dirIcon = document.createElement('i');
                const iconMap = {
                    up: 'fa-arrow-up',
                    down: 'fa-arrow-down',
                    left: 'fa-arrow-left',
                    right: 'fa-arrow-right',
                };
                dirIcon.className = 'fa-solid ' + (iconMap[enemy.dir] || 'fa-question');
                cell.appendChild(dirIcon);
            }
        }
    }
}
