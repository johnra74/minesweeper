import React from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import GameControls from './components/GameControls/GameControls';
import GameStatus from './components/GameStatus/GameStatus';
import TouchActionMenu from './components/TouchActionMenu/TouchActionMenu';
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
 *   TouchActionMenu renders as a fixed overlay when touchMenuCell is set.
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
    touchMenuCell,
    startNewGame,
    handleCellClick,
    handleCellRightClick,
    handleChord,
    openTouchMenu,
    closeTouchMenu,
    handleTouchAction,
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
          onCellLongPress={openTouchMenu}
          onCellChord={handleChord}
        />
      </div>

      {touchMenuCell && (
        <TouchActionMenu
          cell={board[touchMenuCell.row][touchMenuCell.col]}
          position={touchMenuCell.position}
          onAction={(action) =>
            handleTouchAction(action, touchMenuCell.row, touchMenuCell.col)
          }
          onClose={closeTouchMenu}
        />
      )}
    </div>
  );
};

export default App;
