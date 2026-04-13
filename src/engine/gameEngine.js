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
 * Cycles the mark state of a hidden cell: none → flagged → suspect → none.
 * Already-revealed cells are not affected.
 *
 * @param {Cell[][]} board
 * @param {number}   row
 * @param {number}   col
 * @returns {Cell[][]}
 */
export const toggleFlag = (board, row, col) => {
  const cell = board[row][col];
  if (cell.isRevealed) return board;

  let update;
  if (!cell.isFlagged && !cell.isSuspect) {
    update = { isFlagged: true,  isSuspect: false }; // none → flagged
  } else if (cell.isFlagged) {
    update = { isFlagged: false, isSuspect: true  }; // flagged → suspect
  } else {
    update = { isFlagged: false, isSuspect: false }; // suspect → none
  }

  return board.map((r, ri) =>
    r.map((c, ci) =>
      ri === row && ci === col ? { ...c, ...update } : c
    )
  );
};

/**
 * Chords the cell at (row, col): if the number of flagged neighbours exactly
 * matches the cell's adjacentMines count, reveals all remaining hidden,
 * unflagged neighbours. Returns board unchanged if preconditions are not met.
 *
 * @param {Cell[][]} board
 * @param {number}   row
 * @param {number}   col
 * @returns {Cell[][]}
 */
export const chordCell = (board, row, col) => {
  const cell = board[row][col];
  if (!cell.isRevealed || cell.adjacentMines === 0) return board;

  const rows = board.length;
  const cols = board[0].length;

  const neighbours = [];
  let flaggedCount = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (board[nr][nc].isFlagged) flaggedCount++;
      neighbours.push([nr, nc]);
    }
  }

  if (flaggedCount !== cell.adjacentMines) return board;

  let updatedBoard = board;
  for (const [nr, nc] of neighbours) {
    const neighbour = updatedBoard[nr][nc];
    if (!neighbour.isFlagged && !neighbour.isRevealed) {
      updatedBoard = revealCell(updatedBoard, nr, nc);
    }
  }

  return updatedBoard;
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
