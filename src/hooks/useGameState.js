import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DIFFICULTIES, GAME_STATUS } from '../constants/gameConfig';
import { createEmptyBoard, placeMines } from '../engine/boardFactory';
import {
  revealCell,
  toggleFlag,
  chordCell,
  revealAllMines,
  checkWinCondition,
} from '../engine/gameEngine';

/**
 * useGameState
 *
 * Single source of truth for all game state.  Coordinates the board factory,
 * game engine, and timer into a clean API consumed by UI components.
 *
 * Responsibilities:
 *  - Maintain board, game status, mines-remaining counter, and elapsed time.
 *  - Orchestrate the IDLE → PLAYING → WON | LOST transition flow.
 *  - Expose only what the UI needs (no internal implementation leakage).
 *
 * @param {keyof DIFFICULTIES} initialDifficulty
 */
export const useGameState = (initialDifficulty = 'BEGINNER') => {
  const config = DIFFICULTIES[initialDifficulty];

  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.IDLE);
  const [board, setBoard] = useState(() => createEmptyBoard(config.rows, config.cols));
  const [time, setTime] = useState(0);
  const [touchMenuCell, setTouchMenuCell] = useState(null);

  const timerRef = useRef(null);

  // Derive mines-left directly from the board: total mines minus flagged cells.
  // This avoids double-counting caused by calling setMinesLeft inside a setBoard
  // updater, which React Strict Mode double-invokes to detect side effects.
  const minesLeft = useMemo(
    () =>
      DIFFICULTIES[difficulty].mines -
      board.flat().filter((cell) => cell.isFlagged).length,
    [difficulty, board]
  );

  // Start / stop the timer based on game status.
  useEffect(() => {
    if (gameStatus === GAME_STATUS.PLAYING) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  /**
   * Resets all state to start a fresh game, optionally changing difficulty.
   */
  const startNewGame = useCallback((newDifficulty) => {
    const nextDifficulty = newDifficulty ?? difficulty;
    const nextConfig = DIFFICULTIES[nextDifficulty];
    setDifficulty(nextDifficulty);
    setBoard(createEmptyBoard(nextConfig.rows, nextConfig.cols));
    setGameStatus(GAME_STATUS.IDLE);
    setTime(0);
    setTouchMenuCell(null);
  }, [difficulty]);

  /**
   * Handles a left-click on a cell.
   * On the first click (IDLE): mines are placed avoiding the clicked cell.
   */
  const handleCellClick = useCallback((row, col) => {
    if (gameStatus === GAME_STATUS.WON || gameStatus === GAME_STATUS.LOST) return;

    setBoard((currentBoard) => {
      let workingBoard = currentBoard;

      // First ever click — safe mine placement, then start timer.
      if (gameStatus === GAME_STATUS.IDLE) {
        setGameStatus(GAME_STATUS.PLAYING);
        workingBoard = placeMines(
          currentBoard,
          DIFFICULTIES[difficulty].mines,
          row,
          col
        );
      }

      const cell = workingBoard[row][col];
      if (cell.isFlagged || cell.isSuspect || cell.isRevealed) return currentBoard;

      // Player hit a mine — reveal board and end game.
      if (cell.isMine) {
        setGameStatus(GAME_STATUS.LOST);
        return revealAllMines(workingBoard);
      }

      const updatedBoard = revealCell(workingBoard, row, col);

      if (checkWinCondition(updatedBoard)) {
        setGameStatus(GAME_STATUS.WON);
      }

      return updatedBoard;
    });
  }, [gameStatus, difficulty]);

  /**
   * Handles a right-click on a cell to cycle its mark state:
   * none → flagged → suspect → none.
   * Only valid while the game is in the PLAYING state.
   */
  const handleCellRightClick = useCallback((row, col) => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;
    setBoard((currentBoard) => toggleFlag(currentBoard, row, col));
  }, [gameStatus]);

  /**
   * Chords the cell at (row, col).
   * Reveals all unflagged neighbours when flagged count matches adjacentMines.
   * If the chord exposes a mine, transitions to LOST.
   */
  const handleChord = useCallback((row, col) => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;

    setBoard((currentBoard) => {
      const chorded = chordCell(currentBoard, row, col);
      if (chorded === currentBoard) return currentBoard;

      const mineTouched = chorded.some((r) =>
        r.some((c) => c.isMine && c.isRevealed)
      );

      if (mineTouched) {
        setGameStatus(GAME_STATUS.LOST);
        return revealAllMines(chorded);
      }

      if (checkWinCondition(chorded)) {
        setGameStatus(GAME_STATUS.WON);
      }

      return chorded;
    });
  }, [gameStatus]);

  /**
   * Opens the touch action menu for the given cell.
   */
  const openTouchMenu = useCallback((row, col, position) => {
    if (gameStatus === GAME_STATUS.WON || gameStatus === GAME_STATUS.LOST) return;
    setTouchMenuCell({ row, col, position });
  }, [gameStatus]);

  /**
   * Closes the touch action menu.
   */
  const closeTouchMenu = useCallback(() => {
    setTouchMenuCell(null);
  }, []);

  /**
   * Dispatches a touch menu action to the appropriate handler.
   */
  const handleTouchAction = useCallback((action, row, col) => {
    switch (action) {
      case 'reveal':  handleCellClick(row, col);      break;
      case 'chord':   handleChord(row, col);           break;
      case 'flag':    handleCellRightClick(row, col);  break;
      case 'suspect': handleCellRightClick(row, col);  break;
      default: break;
    }
  }, [handleCellClick, handleChord, handleCellRightClick]);

  return {
    board,
    gameStatus,
    difficulty,
    minesLeft,
    time,
    touchMenuCell,
    startNewGame,
    handleCellClick,
    handleCellRightClick,
    handleChord,
    openTouchMenu,
    closeTouchMenu,
    handleTouchAction,
  };
};
