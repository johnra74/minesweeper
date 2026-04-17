/**
 * Board Factory — responsible solely for creating and initialising board state.
 *
 * All functions are pure: they accept data and return new data without
 * mutating their inputs, making them trivially testable and side-effect free.
 */

/**
 * Creates a single cell in its default hidden, unflagged, mine-free state.
 * @returns {Cell}
 */
export const createCell = () => ({
  isMine: false,
  isRevealed: false,
  isFlagged: false,
  isSuspect: false,
  adjacentMines: 0,
});

/**
 * Creates a rows × cols grid of default cells.
 * @param {number} rows
 * @param {number} cols
 * @returns {Cell[][]}
 */
export const createEmptyBoard = (rows, cols) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, createCell)
  );

/**
 * Returns a Set of "row,col" keys representing the 3×3 safe zone centred on
 * (safeRow, safeCol), clamped to board boundaries.
 * @param {number} rows
 * @param {number} cols
 * @param {number} safeRow
 * @param {number} safeCol
 * @returns {Set<string>}
 */
const buildSafeZone = (rows, cols, safeRow, safeCol) => {
  const safeZone = new Set();
  for (let r = safeRow - 1; r <= safeRow + 1; r++) {
    for (let c = safeCol - 1; c <= safeCol + 1; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        safeZone.add(`${r},${c}`);
      }
    }
  }
  return safeZone;
};

/**
 * Returns a deep-cloned board with `mineCount` mines placed at random,
 * guaranteed never to land inside the 3×3 safe zone around (safeRow, safeCol).
 * Adjacent-mine counts are recalculated before returning.
 *
 * @param {Cell[][]} board   - The blank board produced by createEmptyBoard.
 * @param {number}   mineCount
 * @param {number}   safeRow - Row index of the player's first click.
 * @param {number}   safeCol - Column index of the player's first click.
 * @returns {Cell[][]}
 */
export const placeMines = (board, mineCount, safeRow, safeCol) => {
  const rows = board.length;
  const cols = board[0].length;
  const safeZone = buildSafeZone(rows, cols, safeRow, safeCol);

  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!newBoard[r][c].isMine && !safeZone.has(`${r},${c}`)) {
      newBoard[r][c] = { ...newBoard[r][c], isMine: true };
      placed++;
    }
  }

  return calculateAdjacentMines(newBoard);
};

/**
 * Returns a new board where every non-mine cell has its `adjacentMines` count
 * set to the number of neighbouring mines (8-directional).
 * @param {Cell[][]} board
 * @returns {Cell[][]}
 */
export const calculateAdjacentMines = (board) => {
  const rows = board.length;
  const cols = board[0].length;

  return board.map((row, r) =>
    row.map((cell, c) => {
      if (cell.isMine) return cell;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
            count++;
          }
        }
      }

      return { ...cell, adjacentMines: count };
    })
  );
};
