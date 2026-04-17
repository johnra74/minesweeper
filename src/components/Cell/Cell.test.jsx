import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cell from './Cell';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultCell = {
  isMine: false,
  isRevealed: false,
  isFlagged: false,
  isSuspect: false,
  adjacentMines: 0,
};

const renderCell = (cellOverrides = {}, propOverrides = {}) => {
  const cell = { ...defaultCell, ...cellOverrides };
  const onLeftClick = jest.fn();
  const onRightClick = jest.fn();

  render(
    <Cell
      cell={cell}
      row={1}
      col={2}
      onLeftClick={onLeftClick}
      onRightClick={onRightClick}
      {...propOverrides}
    />
  );

  return { onLeftClick, onRightClick };
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('Cell — rendering', () => {
  it('renders a hidden cell with no text content', () => {
    renderCell();
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('cell--hidden');
    expect(btn).not.toHaveClass('cell--revealed');
    expect(btn.textContent).toBe('');
  });

  it('renders a flagged cell with the flag emoji', () => {
    renderCell({ isFlagged: true });
    expect(screen.getByRole('button').textContent).toBe('🚩');
  });

  it('renders a suspected cell with the question mark emoji', () => {
    renderCell({ isSuspect: true });
    expect(screen.getByRole('button').textContent).toBe('❓');
  });

  it('renders a revealed mine with the bomb emoji', () => {
    renderCell({ isMine: true, isRevealed: true });
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('💣');
    expect(btn).toHaveClass('cell--mine');
  });

  it('renders a revealed cell with adjacent mine count', () => {
    renderCell({ isRevealed: true, adjacentMines: 3 });
    expect(screen.getByRole('button').textContent).toBe('3');
  });

  it('renders an empty revealed cell with no text', () => {
    renderCell({ isRevealed: true, adjacentMines: 0 });
    expect(screen.getByRole('button').textContent).toBe('');
  });

  it('applies the revealed CSS class when isRevealed is true', () => {
    renderCell({ isRevealed: true });
    expect(screen.getByRole('button')).toHaveClass('cell--revealed');
  });

  it('applies correct aria-label for a normal hidden cell', () => {
    renderCell({}, { row: 3, col: 5 });
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('3-5')
    );
  });

  it('includes "flagged" in aria-label when cell is flagged', () => {
    renderCell({ isFlagged: true });
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('flagged')
    );
  });

  it('includes "suspected" in aria-label when cell is suspected', () => {
    renderCell({ isSuspect: true });
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('suspected')
    );
  });

  it('applies a color style for numbered revealed cells', () => {
    renderCell({ isRevealed: true, adjacentMines: 1 });
    expect(screen.getByRole('button')).toHaveStyle({ color: '#0000ff' });
  });

  it('does not apply a color style to unrevealed cells', () => {
    renderCell({ adjacentMines: 3 });
    expect(screen.getByRole('button')).not.toHaveStyle({ color: '#ff0000' });
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe('Cell — interactions', () => {
  it('calls onLeftClick with (row, col) on primary click of a hidden cell', () => {
    const { onLeftClick } = renderCell({}, { row: 2, col: 4 });
    fireEvent.click(screen.getByRole('button'));
    expect(onLeftClick).toHaveBeenCalledWith(2, 4);
    expect(onLeftClick).toHaveBeenCalledTimes(1);
  });

  it('calls onChord instead of onLeftClick when clicking a revealed numbered cell', () => {
    const onChord = jest.fn();
    const { onLeftClick } = renderCell(
      { isRevealed: true, adjacentMines: 2 },
      { row: 1, col: 1, onChord }
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChord).toHaveBeenCalledWith(1, 1);
    expect(onLeftClick).not.toHaveBeenCalled();
  });

  it('calls onLeftClick for a revealed cell with no adjacent mines (no chord)', () => {
    const onChord = jest.fn();
    const { onLeftClick } = renderCell(
      { isRevealed: true, adjacentMines: 0 },
      { onChord }
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onLeftClick).toHaveBeenCalledTimes(1);
    expect(onChord).not.toHaveBeenCalled();
  });

  it('calls onRightClick with (row, col) on context menu', () => {
    const { onRightClick } = renderCell({}, { row: 0, col: 7 });
    fireEvent.contextMenu(screen.getByRole('button'));
    expect(onRightClick).toHaveBeenCalledWith(0, 7);
    expect(onRightClick).toHaveBeenCalledTimes(1);
  });

  it('prevents the default context menu', () => {
    renderCell();
    const btn = screen.getByRole('button');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    btn.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
