# AGENTS.md — maze-game

 Vanilla JS maze game. No build, no tests, no npm. Open `index.html` in a browser to run. Uses Font Awesome 6 from CDN for icons.

## Architecture

- `game.js` — `Game` class orchestrates everything (state, loop, coord between components).
- `maze_generator.js` — `MazeGenerator` class: randomized Prim's algorithm, always 11×11, calls `onFrame` callback to animate generation.
- `renderer.js` — `Renderer` class: renders maze grid, character sprite, enemies via DOM. Rebuilds cells once then updates classes in place.
- `path_builder.js` — `PathBuilder` class: visual block-based programming (Forward/TurnLeft/TurnRight/Wait/Repeat). Flat list — Repeat targets the block after it. Compiles blocks to command string (`l`/`r`/`f`/`w`).
- `enemy.js` — `EnemyManager` + `Enemy` classes: places enemies on path cells, each patrols a fixed back-and-forth route (predictable, always beatable).
- `style.css` — Dark theme, `--bg`/`--surface`/`--accent` CSS vars, pixel-art cell rendering.
- No bundler, no modules (ES6 classes via `<script>` tags in order), no npm.

## Key quirks

- **Script load order matters** in `index.html`: `maze_generator.js` → `enemy.js` → `renderer.js` → `path_builder.js` → `game.js`. `CELL` constant must be defined before `EnemyManager`/`Renderer`.
- `window.game` is a global `Game` instance created after all scripts load.
- Maze generation is animated — `generate()` calls `onFrame(grid)` after each wall-carve step.
- Character textures: `assets/textures/character/{right,left,up,down}.png`.
- Move encoding: `l` = turn left, `r` = turn right, `f` = go forward, `w` = wait.
- Character starts at `(0,0)` facing `right`; goal is `(10,10)`.
- `Game.blocked` disables all controls during execution.
- Enemies only patrol on `CELL.PATH` cells (value `1`), never on start/end/walls.
- Collisions are checked **after** player command + enemy movement each turn.

## Commands

- Run: open `index.html` in browser. No server required.
- No tests, no linter, no formatter, no CI.
