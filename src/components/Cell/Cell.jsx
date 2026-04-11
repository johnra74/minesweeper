import React from 'react';
import { ADJACENT_MINE_COLORS } from '../../constants/gameConfig';
import './Cell.css';

/**
 * Determines the visible content of a cell based on its state.
 * @param {Cell} cell
 * @returns {string|number}
 */
const getCellContent = (cell) => {
  if (!cell.isRevealed) return cell.isFlagged ? '🚩' : '';
  if (cell.isMine) return '💣';
  if (cell.adjacentMines > 0) return cell.adjacentMines;
  return '';
};

/**
 * Cell
 *
 * Renders a single minesweeper cell as a <button>.
 * Delegates all game logic to parent via callbacks — it owns no state.
 *
 * @param {object}   props
 * @param {Cell}     props.cell         - Cell data object.
 * @param {number}   props.row          - Row index (for callbacks).
 * @param {number}   props.col          - Column index (for callbacks).
 * @param {Function} props.onLeftClick  - Called with (row, col) on primary click.
 * @param {Function} props.onRightClick - Called with (row, col) on context menu.
 */
const Cell = ({ cell, row, col, onLeftClick, onRightClick }) => {
  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick(row, col);
  };

  const content = getCellContent(cell);
  const color =
    cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
      ? ADJACENT_MINE_COLORS[cell.adjacentMines]
      : undefined;

  const classNames = [
    'cell',
    cell.isRevealed ? 'cell--revealed' : 'cell--hidden',
    cell.isMine && cell.isRevealed ? 'cell--mine' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      onClick={() => onLeftClick(row, col)}
      onContextMenu={handleContextMenu}
      style={{ color }}
      aria-label={`Cell ${row}-${col}${cell.isFlagged ? ' flagged' : ''}${
        cell.isRevealed ? ' revealed' : ''
      }`}
      aria-pressed={cell.isRevealed}
    >
      {content}
    </button>
  );
};

export default React.memo(Cell);
