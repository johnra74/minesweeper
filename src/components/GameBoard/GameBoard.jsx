import React from 'react';
import Cell from '../Cell/Cell';
import './GameBoard.css';

/**
 * GameBoard
 *
 * Renders the minesweeper grid as a CSS-grid container of Cell components.
 * It is a pure presentational component: no game logic lives here.
 *
 * @param {object}   props
 * @param {Cell[][]} props.board          - 2-D array of cell data.
 * @param {Function} props.onCellClick    - Forwarded to each Cell as onLeftClick.
 * @param {Function} props.onCellRightClick - Forwarded to each Cell as onRightClick.
 */
const GameBoard = ({ board, onCellClick, onCellRightClick }) => {
  const cols = board[0]?.length ?? 0;

  return (
    <div
      className="game-board"
      style={{ gridTemplateColumns: `repeat(${cols}, 28px)` }}
      role="grid"
      aria-label="Minesweeper board"
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            onLeftClick={onCellClick}
            onRightClick={onCellRightClick}
          />
        ))
      )}
    </div>
  );
};

export default React.memo(GameBoard);
