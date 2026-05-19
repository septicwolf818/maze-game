# Maze Runner

A turn-based maze game where you navigate a character through an 11×11 randomly generated maze while avoiding patrolling enemies. Program your route using a visual block-based builder, then watch it execute step by step.

## How to Play

- **Build a program** — drag blocks from the palette into the program area: Forward (↑), Turn Left, Turn Right, Wait, and Repeat groups.
- **Run** — execute your program. The character moves turn by turn while enemies also move each turn.
- **Reset** — send the character back to start; your program stays so you can edit and rerun.
- **New Maze** — generate a fresh random maze and clear your program.

Reach the bottom-right corner (row 10, column 10) to win.

## Enemies

Three enemy types appear on path cells:

- **Patrol** (red) — walks a fixed back-and-forth route between waypoints.
- **Chaser** (orange) — patrols normally, but if you're within 4 cells, in its line of sight, and it's facing you, it gives chase. Shows a pulsing glow when hunting.
- **Jumper** (rose) — patrols by leaping over walls in a straight line, chaining consecutive wall jumps until it can't go further, then reverses direction.

All enemies follow the same turn-based rules as the player: turning 90° costs one turn, moving forward costs one turn. No enemy can permanently block any cell, so the game is always beatable.

## Run

Open `index.html` in a browser. No server or build step required.

## Tech

Vanilla JavaScript, no frameworks, no bundler. Maze generated with randomized Prim's algorithm.
