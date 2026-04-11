/**
 * Game Engine — responsible solely for game rule evaluation.
 *
 * All functions are pure transformations over board state.
 * No UI, no timers, no external dependencies.
 */

/**
 * Reveals the cell at (row, col).  If the cell has zero adjacent mines,
 * performs a BFS flood-fill to reveal all reachable empty cells.
 * Flagged and already-revealed cells are never modified.
 *
 * @param {Cell[][]} board
 * @param {number}   row
 * @param {number}   col
 * @returns {Cell[][]} New board with the appropriate cells revealed.
 */
export const revealCell = (board, row, col) => {
  const cell = board[row][col];
  if (cell.isRevealed || cell.isFlagged) return board;

  const rows = board.length;
  const cols = board[0].length;

  // Deep-clone so we never mutate the incoming board.
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  newBoard[row][col] = { ...newBoard[row][col], isRevealed: true };

  // BFS flood-fill: only spreads through cells with zero adjacent mines.
  if (newBoard[row][col].adjacentMines === 0 && !newBoard[row][col].isMine) {
    const queue = [[row, col]];

    while (queue.length > 0) {
      const [r, c] = queue.shift();

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;

          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            !newBoard[nr][nc].isRevealed &&
            !newBoard[nr][nc].isFlagged &&
            !newBoard[nr][nc].isMine
          ) {
            newBoard[nr][nc] = { ...newBoard[nr][nc], isRevealed: true };
            if (newBoard[nr][nc].adjacentMines === 0) {
              queue.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  return newBoard;
};

/**
 * Toggles the flagged state of the cell at (row, col).
 * Already-revealed cells cannot be flagged.
 *
 * @param {Cell[][]} board
 * @param {number}   row
 * @param {number}   col
 * @returns {Cell[][]}
 */
export const toggleFlag = (board, row, col) => {
  if (board[row][col].isRevealed) return board;

  return board.map((r, ri) =>
    r.map((c, ci) =>
      ri === row && ci === col ? { ...c, isFlagged: !c.isFlagged } : c
    )
  );
};

/**
 * Returns a new board where every mine cell is revealed.
 * Used when the player hits a mine (game-over reveal).
 *
 * @param {Cell[][]} board
 * @returns {Cell[][]}
 */
export const revealAllMines = (board) =>
  board.map((row) =>
    row.map((cell) =>
      cell.isMine ? { ...cell, isRevealed: true } : cell
    )
  );

/**
 * Returns true when every non-mine cell has been revealed —
 * the win condition for Minesweeper.
 *
 * @param {Cell[][]} board
 * @returns {boolean}
 */
export const checkWinCondition = (board) =>
  board.every((row) =>
    row.every((cell) => (cell.isMine ? !cell.isRevealed : cell.isRevealed))
  );
