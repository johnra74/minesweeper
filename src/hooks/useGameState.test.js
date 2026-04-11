import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import { GAME_STATUS } from '../constants/gameConfig';
import * as boardFactory from '../engine/boardFactory';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a 9×9 board configured for mine-hit tests.
 * - Mine at (0,0)  — will be clicked in the second act to trigger LOST.
 * - Mine at (3,4)  — adjacent to (4,4), giving it adjacentMines=1 so BFS
 *                    flood-fill stops after revealing only (4,4). This
 *                    prevents the first click from accidentally winning.
 */
const makeBoardForMineHitTest = () => {
  const board = boardFactory.createEmptyBoard(9, 9);
  board[0][0] = { ...board[0][0], isMine: true };
  board[3][4] = { ...board[3][4], isMine: true };
  return boardFactory.calculateAdjacentMines(board);
};

/**
 * Build a 9×9 board with NO mines.
 * When this board is used, clicking any cell triggers a BFS flood-fill that
 * reveals all 81 cells, satisfying checkWinCondition without any mock.
 */
const makeMineFreeBoard = () =>
  boardFactory.calculateAdjacentMines(boardFactory.createEmptyBoard(9, 9));

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useGameState — initial state', () => {
  it('defaults to BEGINNER when no argument is provided', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.difficulty).toBe('BEGINNER');
    expect(result.current.board).toHaveLength(9);
  });

  it('starts with IDLE status', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    expect(result.current.gameStatus).toBe(GAME_STATUS.IDLE);
  });

  it('starts with BEGINNER difficulty', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    expect(result.current.difficulty).toBe('BEGINNER');
  });

  it('starts with the correct mine count for BEGINNER', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    expect(result.current.minesLeft).toBe(10);
  });

  it('starts with time = 0', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    expect(result.current.time).toBe(0);
  });

  it('creates a 9×9 board for BEGINNER', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    expect(result.current.board).toHaveLength(9);
    expect(result.current.board[0]).toHaveLength(9);
  });

  it('creates a 16×16 board for INTERMEDIATE', () => {
    const { result } = renderHook(() => useGameState('INTERMEDIATE'));
    expect(result.current.board).toHaveLength(16);
    expect(result.current.board[0]).toHaveLength(16);
  });
});

// ---------------------------------------------------------------------------
// startNewGame
// ---------------------------------------------------------------------------

describe('useGameState — startNewGame', () => {
  it('resets status to IDLE', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.startNewGame());
    expect(result.current.gameStatus).toBe(GAME_STATUS.IDLE);
  });

  it('resets the timer to 0', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.startNewGame());
    expect(result.current.time).toBe(0);
  });

  it('resets mines to BEGINNER count when called without arguments', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.startNewGame());
    expect(result.current.minesLeft).toBe(10);
  });

  it('switches difficulty and updates board dimensions', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.startNewGame('INTERMEDIATE'));
    expect(result.current.difficulty).toBe('INTERMEDIATE');
    expect(result.current.board).toHaveLength(16);
    expect(result.current.board[0]).toHaveLength(16);
    expect(result.current.minesLeft).toBe(40);
  });

  it('creates a fresh hidden board after new game', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    // Start a game and reveal some cells.
    act(() => result.current.handleCellClick(4, 4));
    act(() => result.current.startNewGame());
    const anyRevealed = result.current.board.flat().some((c) => c.isRevealed);
    expect(anyRevealed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handleCellClick — first click (IDLE → PLAYING)
// ---------------------------------------------------------------------------

describe('useGameState — handleCellClick (first click)', () => {
  it('transitions from IDLE to PLAYING on first click', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    expect(result.current.gameStatus).toBe(GAME_STATUS.PLAYING);
  });

  it('places mines after the first click', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    const totalMines = result.current.board.flat().filter((c) => c.isMine).length;
    expect(totalMines).toBe(10);
  });

  it('guarantees the first-clicked cell is revealed and safe', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    expect(result.current.board[4][4].isRevealed).toBe(true);
    expect(result.current.board[4][4].isMine).toBe(false);
  });

  it('does not place a mine inside the 3×3 safe zone', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        expect(result.current.board[4 + dr][4 + dc].isMine).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// handleCellClick — hitting a mine (PLAYING → LOST)
// ---------------------------------------------------------------------------

describe('useGameState — handleCellClick (mine hit)', () => {
  it('transitions to LOST when a mine is clicked', () => {
    // Control mine placement: mine at (0,0), safe zone around (4,4).
    jest
      .spyOn(boardFactory, 'placeMines')
      .mockReturnValue(makeBoardForMineHitTest());

    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4)); // first click → PLAYING
    act(() => result.current.handleCellClick(0, 0)); // mine hit → LOST

    expect(result.current.gameStatus).toBe(GAME_STATUS.LOST);
  });

  it('reveals all mines on loss', () => {
    jest
      .spyOn(boardFactory, 'placeMines')
      .mockReturnValue(makeBoardForMineHitTest());

    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    act(() => result.current.handleCellClick(0, 0));

    expect(result.current.board[0][0].isRevealed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// handleCellClick — winning (PLAYING → WON)
//
// Strategy: mock placeMines to return a mine-free board so the BFS flood-fill
// triggered by the first click reveals every cell, satisfying checkWinCondition
// without needing to spy on it.
// ---------------------------------------------------------------------------

describe('useGameState — handleCellClick (win condition)', () => {
  it('transitions to WON when all non-mine cells are revealed', () => {
    jest.spyOn(boardFactory, 'placeMines').mockReturnValue(makeMineFreeBoard());

    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4)); // flood-fills everything → WON

    expect(result.current.gameStatus).toBe(GAME_STATUS.WON);
  });
});

// ---------------------------------------------------------------------------
// handleCellClick — no-op cases
// ---------------------------------------------------------------------------

describe('useGameState — handleCellClick (no-ops)', () => {
  it('ignores clicks when the game is already WON', () => {
    jest.spyOn(boardFactory, 'placeMines').mockReturnValue(makeMineFreeBoard());

    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4)); // → WON
    const boardAfterWin = result.current.board;

    act(() => result.current.handleCellClick(0, 0)); // must be no-op
    expect(result.current.board).toBe(boardAfterWin);
  });

  it('ignores clicks when the game is LOST', () => {
    jest
      .spyOn(boardFactory, 'placeMines')
      .mockReturnValue(makeBoardForMineHitTest());

    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4)); // first click
    act(() => result.current.handleCellClick(0, 0)); // mine hit → LOST
    const boardAfterLoss = result.current.board;

    act(() => result.current.handleCellClick(2, 2)); // must be no-op
    expect(result.current.board).toBe(boardAfterLoss);
  });

  it('ignores left-click on a flagged cell', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4)); // start game

    // Find a hidden non-revealed cell to flag.
    const target = result.current.board
      .flatMap((row, r) => row.map((cell, c) => ({ cell, r, c })))
      .find(({ cell }) => !cell.isRevealed && !cell.isFlagged);

    act(() => result.current.handleCellRightClick(target.r, target.c)); // flag it
    const boardBeforeClick = result.current.board;
    act(() => result.current.handleCellClick(target.r, target.c)); // click flagged cell

    expect(result.current.board).toBe(boardBeforeClick);
  });
});

// ---------------------------------------------------------------------------
// handleCellRightClick — flagging
// ---------------------------------------------------------------------------

describe('useGameState — handleCellRightClick', () => {
  const startGame = (result) => act(() => result.current.handleCellClick(4, 4));

  /** Find the first hidden, unflagged, unrevealed cell. */
  const findHiddenCell = (board) =>
    board
      .flatMap((row, r) => row.map((cell, c) => ({ cell, r, c })))
      .find(({ cell }) => !cell.isRevealed && !cell.isFlagged);

  it('does nothing when game is IDLE', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellRightClick(0, 0));
    expect(result.current.board[0][0].isFlagged).toBe(false);
  });

  it('does nothing when game is WON', () => {
    jest.spyOn(boardFactory, 'placeMines').mockReturnValue(makeMineFreeBoard());
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4)); // → WON
    act(() => result.current.handleCellRightClick(0, 0));
    expect(result.current.board[0][0].isFlagged).toBe(false);
  });

  it('flags a hidden cell while PLAYING', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    startGame(result);
    const { r, c } = findHiddenCell(result.current.board);

    act(() => result.current.handleCellRightClick(r, c));

    expect(result.current.board[r][c].isFlagged).toBe(true);
  });

  it('decrements minesLeft when a flag is placed', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    startGame(result);
    const before = result.current.minesLeft;
    const { r, c } = findHiddenCell(result.current.board);

    act(() => result.current.handleCellRightClick(r, c));

    expect(result.current.minesLeft).toBe(before - 1);
  });

  it('increments minesLeft when a flag is removed', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    startGame(result);
    const { r, c } = findHiddenCell(result.current.board);

    act(() => result.current.handleCellRightClick(r, c)); // flag
    const afterFlag = result.current.minesLeft;

    act(() => result.current.handleCellRightClick(r, c)); // unflag

    expect(result.current.minesLeft).toBe(afterFlag + 1);
  });

  it('does not flag an already-revealed cell', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    startGame(result);

    act(() => result.current.handleCellRightClick(4, 4)); // revealed cell

    expect(result.current.board[4][4].isFlagged).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Timer behaviour
// ---------------------------------------------------------------------------

describe('useGameState — timer', () => {
  it('does not start the timer until the first click', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.time).toBe(0);
  });

  it('starts incrementing time after the first click', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.time).toBe(3);
  });

  it('stops the timer after a win', () => {
    jest.spyOn(boardFactory, 'placeMines').mockReturnValue(makeMineFreeBoard());
    const { result } = renderHook(() => useGameState('BEGINNER'));

    act(() => result.current.handleCellClick(4, 4)); // → WON, timer stopped
    const timeAtWin = result.current.time;

    act(() => jest.advanceTimersByTime(5000));
    expect(result.current.time).toBe(timeAtWin);
  });

  it('stops the timer after a loss', () => {
    jest
      .spyOn(boardFactory, 'placeMines')
      .mockReturnValue(makeBoardForMineHitTest());

    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    act(() => jest.advanceTimersByTime(1000));
    act(() => result.current.handleCellClick(0, 0)); // → LOST
    const timeAtLoss = result.current.time;

    act(() => jest.advanceTimersByTime(5000));
    expect(result.current.time).toBe(timeAtLoss);
  });

  it('resets the timer on new game', () => {
    const { result } = renderHook(() => useGameState('BEGINNER'));
    act(() => result.current.handleCellClick(4, 4));
    act(() => jest.advanceTimersByTime(5000));
    act(() => result.current.startNewGame());
    expect(result.current.time).toBe(0);
  });
});
