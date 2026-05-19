# AGENTS.md — maze-game

Vanilla JS maze game. No build, no tests, no dependencies. Open `index.html` in a browser to run.

## Architecture

- `maze_generator.js` — `MazeGenerator` class: randomized Prim's algorithm, always 11×11 (hardcoded at `maze_runner.js:11`), renders via DOM.
- `maze_runner.js` — `MazeRunner` class: accepts move strings (`l`/`r`/`f`), executes them step-by-step with animation.
- `style.css` — grid layout, cell types (wall/path/target/safepoint), pixel-art rendering.
- No bundler, no modules (ES6 classes via `<script>` tags), no npm.

## Key quirks

- `window.maze` is a **Promise** wrapping the generated maze array — `checkState()` awaits it via `.then()`.
- Character textures: `assets/textures/character/{right,left,up,down}.png`.
- Move encoding: `l` = turn left, `r` = turn right, `f` = go forward.
- Character starts at `(0,0)` facing `right`; goal is `(10,10)` (bottom-right of 11×11 grid).
- `state.blocked` flag disables all controls during execution.
