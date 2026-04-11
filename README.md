# Minesweeper

A classic Minesweeper game built with React 18, following SOLID design principles with 100% unit test coverage. Styled in the spirit of the original Windows 95 version.

## Features

- Three difficulty levels — Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), Expert (16×30, 99 mines)
- Safe first click — mines are placed after your first move, with a 3×3 guaranteed safe zone around it
- BFS flood-fill reveal — clicking an empty cell cascades outward automatically
- Flag placement — right-click any hidden cell to mark a suspected mine; the counter updates live
- Elapsed timer — starts on your first click, stops on win or loss
- Fully keyboard accessible — all cells are focusable `<button>` elements with ARIA labels

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 |
| Build tooling | Create React App |
| Testing | Jest + React Testing Library |
| Styling | Plain CSS (no external UI library) |

## Getting started

### Prerequisites

- Node.js 16 or later
- npm 8 or later

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm start
```

Opens `http://localhost:3000` in your default browser. The page reloads automatically when you save changes.

### Run the test suite

```bash
npm test          # interactive watch mode
```

### Run tests with coverage report

```bash
npm run test:coverage
```

Produces a full HTML coverage report in `./coverage/lcov-report/index.html` and enforces 80% minimum thresholds across all four metrics (statements, branches, functions, lines).

### Build for production

```bash
npm run build
```

Outputs an optimised static bundle to `./build`, ready to serve from any static file host.

## Project structure

```
src/
├── constants/
│   └── gameConfig.js          # Difficulty presets, game status values, cell colours
├── engine/
│   ├── boardFactory.js        # Pure functions: board creation, mine placement, adjacency
│   ├── boardFactory.test.js
│   ├── gameEngine.js          # Pure functions: reveal (BFS), flag, win detection
│   └── gameEngine.test.js
├── hooks/
│   ├── useGameState.js        # All game state, timer, and state-transition logic
│   └── useGameState.test.js
├── components/
│   ├── Cell/                  # Single board cell (button)
│   ├── GameBoard/             # CSS grid of cells
│   ├── GameControls/          # Difficulty selector + New Game button
│   └── GameStatus/            # Mine counter · emoji face · elapsed timer
├── App.jsx                    # Composition root — wiring only, no game logic
└── App.test.jsx               # Integration tests
```

The `engine/` modules are plain JavaScript with no React imports and can be reused independently of the UI framework.

## How to play

| Action | Control |
|--------|---------|
| Reveal a cell | Left-click |
| Place / remove a flag | Right-click |
| Start a new game | Click **New Game** or select a difficulty |

Reveal all non-mine cells to win. Clicking a mine ends the game and reveals the full board.

## License

MIT — see [LICENSE](./LICENSE) for details.
