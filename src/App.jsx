import React from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import GameControls from './components/GameControls/GameControls';
import GameStatus from './components/GameStatus/GameStatus';
import { useGameState } from './hooks/useGameState';
import './App.css';

/**
 * App — root component and composition root.
 *
 * Wires together the game state hook and the three UI regions:
 *   ┌──────────────────────────────┐
 *   │         GameControls         │  ← difficulty selector + new-game button
 *   ├──────────────────────────────┤
 *   │          GameStatus          │  ← mines counter · face · timer
 *   ├──────────────────────────────┤
 *   │          GameBoard           │  ← the clickable cell grid
 *   └──────────────────────────────┘
 *
 * App itself holds no game logic — it delegates entirely to useGameState.
 */
const App = () => {
  const {
    board,
    gameStatus,
    difficulty,
    minesLeft,
    time,
    startNewGame,
    handleCellClick,
    handleCellRightClick,
  } = useGameState('BEGINNER');

  return (
    <div className="app">
      <h1 className="app__title">Minesweeper</h1>

      <div className="app__window">
        <GameControls
          currentDifficulty={difficulty}
          onNewGame={startNewGame}
        />

        <GameStatus
          gameStatus={gameStatus}
          minesLeft={minesLeft}
          time={time}
        />

        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
        />
      </div>
    </div>
  );
};

export default App;
