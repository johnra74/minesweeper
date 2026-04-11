import {
  createCell,
  createEmptyBoard,
  placeMines,
  calculateAdjacentMines,
} from './boardFactory';

describe('createCell', () => {
  it('returns a cell with all default values', () => {
    const cell = createCell();
    expect(cell).toEqual({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    });
  });

  it('creates independent cell objects on each call', () => {
    const a = createCell();
    const b = createCell();
    a.isMine = true;
    expect(b.isMine).toBe(false);
  });
});

describe('createEmptyBoard', () => {
  it('creates a board with the correct number of rows and columns', () => {
    const board = createEmptyBoard(9, 9);
    expect(board).toHaveLength(9);
    board.forEach((row) => expect(row).toHaveLength(9));
  });

  it('creates a 16×30 board for expert difficulty', () => {
    const board = createEmptyBoard(16, 30);
    expect(board).toHaveLength(16);
    board.forEach((row) => expect(row).toHaveLength(30));
  });

  it('all cells start with default values', () => {
    const board = createEmptyBoard(3, 3);
    board.forEach((row) =>
      row.forEach((cell) =>
        expect(cell).toEqual({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        })
      )
    );
  });
});

describe('placeMines', () => {
  const ROWS = 9;
  const COLS = 9;
  const MINE_COUNT = 10;
  const SAFE_ROW = 4;
  const SAFE_COL = 4;

  let board;
  let boardWithMines;

  beforeEach(() => {
    board = createEmptyBoard(ROWS, COLS);
    boardWithMines = placeMines(board, MINE_COUNT, SAFE_ROW, SAFE_COL);
  });

  it('places exactly the requested number of mines', () => {
    const totalMines = boardWithMines
      .flat()
      .filter((cell) => cell.isMine).length;
    expect(totalMines).toBe(MINE_COUNT);
  });

  it('never places a mine on the safe cell', () => {
    expect(boardWithMines[SAFE_ROW][SAFE_COL].isMine).toBe(false);
  });

  it('never places a mine within the 3×3 safe zone around first click', () => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = SAFE_ROW + dr;
        const c = SAFE_COL + dc;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          expect(boardWithMines[r][c].isMine).toBe(false);
        }
      }
    }
  });

  it('does not mutate the original board', () => {
    expect(board.flat().every((cell) => !cell.isMine)).toBe(true);
  });

  it('returns a board with calculated adjacent-mine counts', () => {
    const mineCell = boardWithMines
      .flat()
      .find((cell) => cell.isMine);
    // Mine cells should not have adjacentMines recalculated (they stay 0).
    expect(mineCell.adjacentMines).toBe(0);
  });

  it('handles corner first click safe zone clamping', () => {
    const cornerBoard = placeMines(createEmptyBoard(9, 9), 5, 0, 0);
    expect(cornerBoard[0][0].isMine).toBe(false);
    expect(cornerBoard[0][1].isMine).toBe(false);
    expect(cornerBoard[1][0].isMine).toBe(false);
    expect(cornerBoard[1][1].isMine).toBe(false);
  });
});

describe('calculateAdjacentMines', () => {
  it('calculates 0 adjacent mines for an isolated mine-free board', () => {
    const board = createEmptyBoard(3, 3);
    const result = calculateAdjacentMines(board);
    result.forEach((row) =>
      row.forEach((cell) => expect(cell.adjacentMines).toBe(0))
    );
  });

  it('counts all 8 neighbours for a centre cell surrounded by mines', () => {
    // Place mines in all corners and edges, centre is clear.
    const board = createEmptyBoard(3, 3);
    const withMines = board.map((row, r) =>
      row.map((cell, c) =>
        r === 1 && c === 1 ? cell : { ...cell, isMine: true }
      )
    );
    const result = calculateAdjacentMines(withMines);
    expect(result[1][1].adjacentMines).toBe(8);
  });

  it('counts the correct number of adjacent mines for edge cells', () => {
    // Single mine at (0,0), check its two non-mine neighbours.
    const board = createEmptyBoard(3, 3);
    board[0][0] = { ...board[0][0], isMine: true };
    const result = calculateAdjacentMines(board);
    expect(result[0][1].adjacentMines).toBe(1);
    expect(result[1][0].adjacentMines).toBe(1);
    expect(result[1][1].adjacentMines).toBe(1);
    expect(result[0][0].adjacentMines).toBe(0); // mine cells stay 0
  });

  it('correctly counts multiple mines', () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = { ...board[0][0], isMine: true };
    board[0][2] = { ...board[0][2], isMine: true };
    const result = calculateAdjacentMines(board);
    expect(result[0][1].adjacentMines).toBe(2);
    expect(result[1][1].adjacentMines).toBe(2);
    expect(result[1][0].adjacentMines).toBe(1);
    expect(result[1][2].adjacentMines).toBe(1);
  });

  it('does not mutate the original board', () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = { ...board[0][0], isMine: true };
    calculateAdjacentMines(board);
    expect(board[0][1].adjacentMines).toBe(0);
  });
});
