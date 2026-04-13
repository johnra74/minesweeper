import {
  revealCell,
  toggleFlag,
  chordCell,
  revealAllMines,
  checkWinCondition,
} from './gameEngine';
import { createEmptyBoard, calculateAdjacentMines } from './boardFactory';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a simple 3×3 board with a mine at (0,0) and adjacency counts set. */
const makeBoard = () => {
  const board = createEmptyBoard(3, 3);
  board[0][0] = { ...board[0][0], isMine: true };
  return calculateAdjacentMines(board);
};

/** Creates a 3×3 all-safe board (no mines). */
const makeSafeBoard = () => calculateAdjacentMines(createEmptyBoard(3, 3));

// ---------------------------------------------------------------------------
// revealCell
// ---------------------------------------------------------------------------

describe('revealCell', () => {
  it('reveals the clicked cell', () => {
    const board = makeBoard();
    const result = revealCell(board, 1, 1);
    expect(result[1][1].isRevealed).toBe(true);
  });

  it('does not reveal a flagged cell', () => {
    const board = makeBoard();
    board[1][1] = { ...board[1][1], isFlagged: true };
    const result = revealCell(board, 1, 1);
    expect(result[1][1].isRevealed).toBe(false);
  });

  it('does not re-reveal an already-revealed cell', () => {
    const board = makeBoard();
    board[1][1] = { ...board[1][1], isRevealed: true };
    const result = revealCell(board, 1, 1);
    // Should return the same board reference (no-op).
    expect(result).toBe(board);
  });

  it('does not mutate the original board', () => {
    const board = makeBoard();
    revealCell(board, 1, 1);
    expect(board[1][1].isRevealed).toBe(false);
  });

  it('flood-fills through zero-adjacency cells on a safe board', () => {
    const board = makeSafeBoard();
    // All cells have 0 adjacent mines → clicking any cell reveals all.
    const result = revealCell(board, 1, 1);
    result.forEach((row) =>
      row.forEach((cell) => expect(cell.isRevealed).toBe(true))
    );
  });

  it('stops flood-fill at cells with adjacent mine counts > 0', () => {
    // Board: mine at (0,0), click (2,2) — the (2,2) corner is far from mine
    // but neighbours of the mine have adjacentMines > 0 so flood-fill stops there.
    const board = makeBoard();
    const result = revealCell(board, 2, 2);
    // (0,0) is a mine — it must NOT be revealed.
    expect(result[0][0].isRevealed).toBe(false);
    // The cells adjacent to the mine (e.g. (0,1), (1,0), (1,1)) have
    // adjacentMines > 0 and should be revealed but stop the BFS.
    expect(result[0][1].isRevealed).toBe(true);
    expect(result[1][0].isRevealed).toBe(true);
    expect(result[1][1].isRevealed).toBe(true);
    // The clicked cell itself should be revealed.
    expect(result[2][2].isRevealed).toBe(true);
  });

  it('flood-fill does not reveal mines', () => {
    const board = makeSafeBoard();
    // Inject a mine at (0,0) after adjacency calculation so BFS spreads freely.
    const withMine = board.map((row, r) =>
      row.map((cell, c) => (r === 0 && c === 0 ? { ...cell, isMine: true } : cell))
    );
    const result = revealCell(withMine, 2, 2);
    expect(result[0][0].isRevealed).toBe(false);
  });

  it('flood-fill skips flagged cells', () => {
    const board = makeSafeBoard();
    board[0][0] = { ...board[0][0], isFlagged: true };
    const result = revealCell(board, 2, 2);
    expect(result[0][0].isRevealed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toggleFlag — three-way cycle: none → flagged → suspect → none
// ---------------------------------------------------------------------------

describe('toggleFlag', () => {
  it('cycles none → flagged', () => {
    const board = makeBoard();
    const result = toggleFlag(board, 1, 1);
    expect(result[1][1].isFlagged).toBe(true);
    expect(result[1][1].isSuspect).toBe(false);
  });

  it('cycles flagged → suspect', () => {
    const board = makeBoard();
    board[1][1] = { ...board[1][1], isFlagged: true };
    const result = toggleFlag(board, 1, 1);
    expect(result[1][1].isFlagged).toBe(false);
    expect(result[1][1].isSuspect).toBe(true);
  });

  it('cycles suspect → none', () => {
    const board = makeBoard();
    board[1][1] = { ...board[1][1], isSuspect: true };
    const result = toggleFlag(board, 1, 1);
    expect(result[1][1].isFlagged).toBe(false);
    expect(result[1][1].isSuspect).toBe(false);
  });

  it('does not toggle a revealed cell', () => {
    const board = makeBoard();
    board[1][1] = { ...board[1][1], isRevealed: true };
    const result = toggleFlag(board, 1, 1);
    expect(result).toBe(board);
  });

  it('does not mutate the original board', () => {
    const board = makeBoard();
    toggleFlag(board, 1, 1);
    expect(board[1][1].isFlagged).toBe(false);
  });

  it('only modifies the targeted cell', () => {
    const board = makeBoard();
    const result = toggleFlag(board, 1, 1);
    result.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (r === 1 && c === 1) return;
        expect(cell.isFlagged).toBe(false);
      })
    );
  });

  it('never produces a state where both isFlagged and isSuspect are true', () => {
    let board = makeBoard();
    for (let i = 0; i < 9; i++) {
      board = toggleFlag(board, 1, 1);
      expect(board[1][1].isFlagged && board[1][1].isSuspect).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// chordCell
// ---------------------------------------------------------------------------

describe('chordCell', () => {
  /**
   * 3×3 board: mine at (0,0) flagged, centre (1,1) revealed with adjacentMines=1.
   * Safe neighbours: (0,1),(0,2),(1,0),(1,2),(2,0),(2,1),(2,2).
   */
  const buildChordBoard = () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = { ...board[0][0], isMine: true, isFlagged: true };
    const withCounts = calculateAdjacentMines(board);
    // Reveal the centre cell.
    return withCounts.map((row, r) =>
      row.map((cell, c) =>
        r === 1 && c === 1 ? { ...cell, isRevealed: true } : cell
      )
    );
  };

  it('returns board unchanged when target cell is not revealed', () => {
    const board = buildChordBoard();
    const hidden = board.map((row, r) =>
      row.map((cell, c) => (r === 1 && c === 1 ? { ...cell, isRevealed: false } : cell))
    );
    expect(chordCell(hidden, 1, 1)).toBe(hidden);
  });

  it('returns board unchanged when adjacentMines is 0', () => {
    const board = buildChordBoard();
    const noAdj = board.map((row, r) =>
      row.map((cell, c) => (r === 1 && c === 1 ? { ...cell, adjacentMines: 0 } : cell))
    );
    expect(chordCell(noAdj, 1, 1)).toBe(noAdj);
  });

  it('returns board unchanged when flagged count is less than adjacentMines', () => {
    const board = buildChordBoard();
    // Remove the flag so count drops to 0, adjacentMines is 1.
    const noFlag = board.map((row, r) =>
      row.map((cell, c) => (r === 0 && c === 0 ? { ...cell, isFlagged: false } : cell))
    );
    expect(chordCell(noFlag, 1, 1)).toBe(noFlag);
  });

  it('returns board unchanged when flagged count exceeds adjacentMines', () => {
    const board = buildChordBoard();
    // Add a second flag → flaggedCount=2, adjacentMines=1.
    const extraFlag = board.map((row, r) =>
      row.map((cell, c) => (r === 0 && c === 1 ? { ...cell, isFlagged: true } : cell))
    );
    expect(chordCell(extraFlag, 1, 1)).toBe(extraFlag);
  });

  it('reveals all unflagged hidden neighbours when count matches', () => {
    const board = buildChordBoard();
    const result = chordCell(board, 1, 1);
    const safe = [[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]];
    safe.forEach(([r, c]) => expect(result[r][c].isRevealed).toBe(true));
  });

  it('does not reveal the flagged mine', () => {
    const board = buildChordBoard();
    const result = chordCell(board, 1, 1);
    expect(result[0][0].isRevealed).toBe(false);
    expect(result[0][0].isFlagged).toBe(true);
  });

  it('does not re-reveal an already-revealed neighbour', () => {
    const board = buildChordBoard();
    const withRevealed = board.map((row, r) =>
      row.map((cell, c) => (r === 0 && c === 1 ? { ...cell, isRevealed: true } : cell))
    );
    const result = chordCell(withRevealed, 1, 1);
    expect(result[0][1].isRevealed).toBe(true);
  });

  it('cascades BFS when a chorded neighbour has zero adjacent mines', () => {
    // Use a safe 3×3 board: mine at (0,0) flagged, (1,1) revealed adj=1,
    // but (2,2) has adjacentMines=0 so BFS should cascade from it.
    const board = createEmptyBoard(3, 3);
    board[0][0] = { ...board[0][0], isMine: true, isFlagged: true };
    const withCounts = calculateAdjacentMines(board);
    // Manually set (2,2) adjacentMines to 0 (it naturally is for this layout).
    const revealed11 = withCounts.map((row, r) =>
      row.map((cell, c) =>
        r === 1 && c === 1 ? { ...cell, isRevealed: true } : cell
      )
    );
    const result = chordCell(revealed11, 1, 1);
    // BFS should have cascaded — (2,2) and its reachable neighbours should be revealed.
    expect(result[2][2].isRevealed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// revealAllMines
// ---------------------------------------------------------------------------

describe('revealAllMines', () => {
  it('reveals every mine cell', () => {
    const board = makeBoard();
    const result = revealAllMines(board);
    expect(result[0][0].isRevealed).toBe(true);
  });

  it('does not reveal non-mine cells', () => {
    const board = makeBoard();
    const result = revealAllMines(board);
    // All non-mine cells should remain hidden.
    result.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (r === 0 && c === 0) return; // skip the mine
        expect(cell.isRevealed).toBe(false);
      })
    );
  });

  it('does not mutate the original board', () => {
    const board = makeBoard();
    revealAllMines(board);
    expect(board[0][0].isRevealed).toBe(false);
  });

  it('reveals all mines when there are multiple', () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = { ...board[0][0], isMine: true };
    board[2][2] = { ...board[2][2], isMine: true };
    const withCounts = calculateAdjacentMines(board);
    const result = revealAllMines(withCounts);
    expect(result[0][0].isRevealed).toBe(true);
    expect(result[2][2].isRevealed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkWinCondition
// ---------------------------------------------------------------------------

describe('checkWinCondition', () => {
  it('returns false when the board has hidden non-mine cells', () => {
    const board = makeBoard();
    expect(checkWinCondition(board)).toBe(false);
  });

  it('returns true when all non-mine cells are revealed', () => {
    // Reveal every non-mine cell manually.
    const board = makeBoard();
    const winBoard = board.map((row, r) =>
      row.map((cell, c) =>
        cell.isMine ? cell : { ...cell, isRevealed: true }
      )
    );
    expect(checkWinCondition(winBoard)).toBe(true);
  });

  it('returns false if a mine is accidentally revealed', () => {
    const board = makeBoard();
    const lostBoard = board.map((row) =>
      row.map((cell) => ({ ...cell, isRevealed: true }))
    );
    // Mine is revealed → not a clean win.
    expect(checkWinCondition(lostBoard)).toBe(false);
  });

  it('returns false on a fresh empty board', () => {
    const board = makeSafeBoard();
    // No mines, but nothing is revealed yet.
    // checkWinCondition should return false because cells are not revealed.
    // (An all-safe board with nothing revealed is not a win.)
    // NOTE: In a real game this edge case doesn't occur because mines are
    // always placed before the first reveal.
    expect(checkWinCondition(board)).toBe(false);
  });

  it('returns true on a safe board once all cells are revealed', () => {
    // Edge case: no mines, all revealed.
    const board = makeSafeBoard();
    const allRevealed = board.map((row) =>
      row.map((cell) => ({ ...cell, isRevealed: true }))
    );
    expect(checkWinCondition(allRevealed)).toBe(true);
  });
});
