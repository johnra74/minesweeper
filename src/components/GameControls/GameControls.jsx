import React from 'react';
import { DIFFICULTIES } from '../../constants/gameConfig';
import './GameControls.css';

/**
 * GameControls
 *
 * Toolbar that lets the player select a difficulty and start a new game.
 * Purely presentational — communicates intent via the `onNewGame` callback.
 *
 * @param {object}              props
 * @param {string}              props.currentDifficulty - Active difficulty key.
 * @param {Function}            props.onNewGame         - Called with the chosen difficulty key.
 */
const GameControls = ({ currentDifficulty, onNewGame }) => (
  <div className="game-controls" role="toolbar" aria-label="Game controls">
    <div className="game-controls__difficulties">
      {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
        <button
          key={key}
          className={`difficulty-btn ${
            key === currentDifficulty ? 'difficulty-btn--active' : ''
          }`}
          onClick={() => onNewGame(key)}
          aria-pressed={key === currentDifficulty}
        >
          {label}
        </button>
      ))}
    </div>

    <button
      className="new-game-btn"
      onClick={() => onNewGame(currentDifficulty)}
      aria-label="Start new game"
    >
      New Game
    </button>
  </div>
);

export default GameControls;
