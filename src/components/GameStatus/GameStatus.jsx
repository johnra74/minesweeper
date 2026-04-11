import React from 'react';
import { GAME_STATUS } from '../../constants/gameConfig';
import './GameStatus.css';

const STATUS_EMOJI = {
  [GAME_STATUS.IDLE]: '😊',
  [GAME_STATUS.PLAYING]: '😮',
  [GAME_STATUS.WON]: '😎',
  [GAME_STATUS.LOST]: '😵',
};

const STATUS_MESSAGE = {
  [GAME_STATUS.IDLE]: 'Click any cell to start!',
  [GAME_STATUS.PLAYING]: 'Good luck!',
  [GAME_STATUS.WON]: 'You won! Congratulations!',
  [GAME_STATUS.LOST]: 'Game over! Try again.',
};

/**
 * Formats elapsed seconds into MM:SS display.
 * @param {number} seconds
 * @returns {string}
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

/**
 * GameStatus
 *
 * Displays the mine counter, face emoji (game state indicator), and timer.
 * Purely presentational — receives all values as props.
 *
 * @param {object} props
 * @param {string} props.gameStatus  - One of the GAME_STATUS values.
 * @param {number} props.minesLeft   - Remaining unflagged mines.
 * @param {number} props.time        - Elapsed seconds.
 */
const GameStatus = ({ gameStatus, minesLeft, time }) => (
  <div className="game-status" role="status" aria-live="polite">
    <div className="game-status__counter" aria-label={`${minesLeft} mines remaining`}>
      <span className="led-display">{String(minesLeft).padStart(3, '0')}</span>
    </div>

    <div className="game-status__face" title={STATUS_MESSAGE[gameStatus]}>
      <span role="img" aria-label={STATUS_MESSAGE[gameStatus]}>
        {STATUS_EMOJI[gameStatus]}
      </span>
    </div>

    <div className="game-status__timer" aria-label={`Time: ${formatTime(time)}`}>
      <span className="led-display">{String(Math.min(time, 999)).padStart(3, '0')}</span>
    </div>
  </div>
);

export default GameStatus;
