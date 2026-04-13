import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TouchActionMenu from './TouchActionMenu';

const baseCell = {
  isMine: false,
  isRevealed: false,
  isFlagged: false,
  isSuspect: false,
  adjacentMines: 0,
};
const pos = { x: 100, y: 200 };

const renderMenu = (cellOverride = {}, handlers = {}) => {
  const onAction = handlers.onAction ?? jest.fn();
  const onClose  = handlers.onClose  ?? jest.fn();
  render(
    <TouchActionMenu
      cell={{ ...baseCell, ...cellOverride }}
      position={pos}
      onAction={onAction}
      onClose={onClose}
    />
  );
  return { onAction, onClose };
};

// ---------------------------------------------------------------------------
// Action visibility
// ---------------------------------------------------------------------------

describe('TouchActionMenu — action visibility', () => {
  it('shows Reveal for a plain hidden cell', () => {
    renderMenu();
    expect(screen.getByText('Reveal')).toBeInTheDocument();
  });

  it('does not show Reveal for a flagged cell', () => {
    renderMenu({ isFlagged: true });
    expect(screen.queryByText('Reveal')).toBeNull();
  });

  it('does not show Reveal for a suspected cell', () => {
    renderMenu({ isSuspect: true });
    expect(screen.queryByText('Reveal')).toBeNull();
  });

  it('does not show Reveal for a revealed cell', () => {
    renderMenu({ isRevealed: true });
    expect(screen.queryByText('Reveal')).toBeNull();
  });

  it('shows Chord for a revealed cell with adjacentMines > 0', () => {
    renderMenu({ isRevealed: true, adjacentMines: 2 });
    expect(screen.getByText('Chord')).toBeInTheDocument();
  });

  it('does not show Chord for a revealed cell with adjacentMines === 0', () => {
    renderMenu({ isRevealed: true, adjacentMines: 0 });
    expect(screen.queryByText('Chord')).toBeNull();
  });

  it('does not show Chord for a hidden cell', () => {
    renderMenu();
    expect(screen.queryByText('Chord')).toBeNull();
  });

  it('shows Flag label "Flag" for a hidden unflagged cell', () => {
    renderMenu();
    expect(screen.getByText('Flag')).toBeInTheDocument();
  });

  it('shows Flag label "Unflag" when cell is flagged', () => {
    renderMenu({ isFlagged: true });
    expect(screen.getByText('Unflag')).toBeInTheDocument();
  });

  it('shows Suspect label "Suspect" for a plain hidden cell', () => {
    renderMenu();
    expect(screen.getByText('Suspect')).toBeInTheDocument();
  });

  it('shows Suspect label "Unsuspect" when cell is suspected', () => {
    renderMenu({ isSuspect: true });
    expect(screen.getByText('Unsuspect')).toBeInTheDocument();
  });

  it('does not show Flag or Suspect for a revealed cell', () => {
    renderMenu({ isRevealed: true });
    expect(screen.queryByText('Flag')).toBeNull();
    expect(screen.queryByText('Suspect')).toBeNull();
  });

  it('always shows the Close button', () => {
    // Test in the most stripped-down state: revealed empty cell.
    renderMenu({ isRevealed: true, adjacentMines: 0 });
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe('TouchActionMenu — interactions', () => {
  it('calls onAction with "reveal" and then onClose when Reveal is clicked', () => {
    const { onAction, onClose } = renderMenu();
    fireEvent.click(screen.getByText('Reveal'));
    expect(onAction).toHaveBeenCalledWith('reveal');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onAction with "chord" when Chord is clicked', () => {
    const { onAction } = renderMenu({ isRevealed: true, adjacentMines: 3 });
    fireEvent.click(screen.getByText('Chord'));
    expect(onAction).toHaveBeenCalledWith('chord');
  });

  it('calls onAction with "flag" when Flag is clicked', () => {
    const { onAction } = renderMenu();
    fireEvent.click(screen.getByText('Flag'));
    expect(onAction).toHaveBeenCalledWith('flag');
  });

  it('calls onAction with "suspect" when Suspect is clicked', () => {
    const { onAction } = renderMenu();
    fireEvent.click(screen.getByText('Suspect'));
    expect(onAction).toHaveBeenCalledWith('suspect');
  });

  it('calls onClose without calling onAction when Close is clicked', () => {
    const { onAction, onClose } = renderMenu();
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('renders a dialog with an accessible label', () => {
    renderMenu();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Cell actions');
  });

  it('positions the menu using top/left from the position prop', () => {
    renderMenu();
    const menu = screen.getByRole('dialog');
    expect(menu).toHaveStyle({ top: '200px', left: '100px' });
  });
});
