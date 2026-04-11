import { useState, useCallback, useEffect, useRef } from 'react';
import { DIFFICULTIES, GAME_STATUS } from '../constants/gameConfig';
import { createEmptyBoard, placeMines } from '../engine/boardFactory';
import {
  revealCell,
  toggleFlag,
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
  const [minesLeft, setMinesLeft] = useState(config.mines);
  const [time, setTime] = useState(0);

  const timerRef = useRef(null);

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
    setMinesLeft(nextConfig.mines);
    setGameStatus(GAME_STATUS.IDLE);
    setTime(0);
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
      if (cell.isFlagged || cell.isRevealed) return currentBoard;

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
   * Handles a right-click on a cell to place or remove a flag.
   * Only valid while the game is in the PLAYING state.
   */
  const handleCellRightClick = useCallback((row, col) => {
    if (gameStatus !== GAME_STATUS.PLAYING) return;

    setBoard((currentBoard) => {
      const newBoard = toggleFlag(currentBoard, row, col);
      // Adjust the mines-left counter: flagging reduces it, un-flagging restores it.
      const wasFlagged = currentBoard[row][col].isFlagged;
      setMinesLeft((prev) => (wasFlagged ? prev + 1 : prev - 1));
      return newBoard;
    });
  }, [gameStatus]);

  return {
    board,
    gameStatus,
    difficulty,
    minesLeft,
    time,
    startNewGame,
    handleCellClick,
    handleCellRightClick,
  };
};
