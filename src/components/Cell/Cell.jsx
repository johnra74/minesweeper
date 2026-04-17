import React from 'react';
import { ADJACENT_MINE_COLORS } from '../../constants/gameConfig';
import { useLongPress } from '../../hooks/useLongPress';
import './Cell.css';

/**
 * Determines the visible content of a cell based on its state.
 * @param {Cell} cell
 * @returns {string|number}
 */
const getCellContent = (cell) => {
  if (!cell.isRevealed) {
    if (cell.isFlagged)  return '🚩';
    if (cell.isSuspect)  return '❓';
    return '';
  }
  if (cell.isMine)            return '💣';
  if (cell.adjacentMines > 0) return cell.adjacentMines;
  return '';
};

/**
 * Cell
 *
 * Renders a single minesweeper cell as a <button>.
 * Delegates all game logic to parent via callbacks — it owns no state.
 *
 * On desktop: left-click reveals (or chords a numbered cell), right-click flags.
 * On touch:   long-press opens the TouchActionMenu via onLongPress.
 *
 * @param {object}   props
 * @param {Cell}     props.cell          - Cell data object.
 * @param {number}   props.row           - Row index (for callbacks).
 * @param {number}   props.col           - Column index (for callbacks).
 * @param {Function} props.onLeftClick   - Called with (row, col) on primary click.
 * @param {Function} props.onRightClick  - Called with (row, col) on context menu.
 * @param {Function} [props.onLongPress] - Called with (row, col, {x,y}) on long press.
 * @param {Function} [props.onChord]     - Called with (row, col) on click of a
 *                                         revealed numbered cell (desktop chord).
 */
const Cell = ({
  cell,
  row,
  col,
  onLeftClick,
  onRightClick,
  onLongPress,
  onChord,
}) => {
  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick(row, col);
  };

  const handleClick = () => {
    if (cell.isRevealed && cell.adjacentMines > 0 && onChord) {
      onChord(row, col);
    } else {
      onLeftClick(row, col);
    }
  };

  const handleLongPress = onLongPress
    ? (e) => {
        const touch = e.changedTouches?.[0] ?? e.touches?.[0];
        const position = touch
          ? { x: touch.clientX, y: touch.clientY }
          : { x: 0, y: 0 };
        onLongPress(row, col, position);
      }
    : null;

  const longPressHandlers = useLongPress(handleLongPress ?? (() => {}), 500);

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
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ color }}
      aria-label={`Cell ${row}-${col}${cell.isFlagged ? ' flagged' : ''}${
        cell.isSuspect ? ' suspected' : ''
      }${cell.isRevealed ? ' revealed' : ''}`}
      aria-pressed={cell.isRevealed}
      {...(onLongPress ? longPressHandlers : {})}
    >
      {content}
    </button>
  );
};

export default React.memo(Cell);
