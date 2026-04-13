import React, { useEffect, useRef } from 'react';
import './TouchActionMenu.css';

/**
 * TouchActionMenu
 *
 * A contextual floating action menu that appears on long-press.
 * Renders only the actions that are valid for the current cell state.
 * Delegates all game logic to the caller via onAction / onClose.
 *
 * @param {object}   props
 * @param {Cell}     props.cell      - Cell data object.
 * @param {{x,y}}    props.position  - Viewport coordinates to anchor the menu.
 * @param {Function} props.onAction  - Called with action string on selection.
 * @param {Function} props.onClose   - Called when the menu is dismissed.
 */
const TouchActionMenu = ({ cell, position, onAction, onClose }) => {
  const menuRef = useRef(null);

  // Close when the user taps outside the menu.
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [onClose]);

  const actions = [];

  if (!cell.isRevealed && !cell.isFlagged && !cell.isSuspect) {
    actions.push({ key: 'reveal', label: 'Reveal' });
  }

  if (cell.isRevealed && cell.adjacentMines > 0) {
    actions.push({ key: 'chord', label: 'Chord' });
  }

  if (!cell.isRevealed) {
    actions.push({
      key:   'flag',
      label: cell.isFlagged ? 'Unflag' : 'Flag',
    });
    actions.push({
      key:   'suspect',
      label: cell.isSuspect ? 'Unsuspect' : 'Suspect',
    });
  }

  return (
    <div
      ref={menuRef}
      className="touch-action-menu"
      style={{ top: position.y, left: position.x }}
      role="dialog"
      aria-label="Cell actions"
    >
      {actions.map(({ key, label }) => (
        <button
          key={key}
          className="touch-action-menu__item"
          onClick={() => { onAction(key); onClose(); }}
        >
          {label}
        </button>
      ))}
      <button
        className="touch-action-menu__item touch-action-menu__item--close"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default TouchActionMenu;
