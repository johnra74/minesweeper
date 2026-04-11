import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from './GameBoard';
import { createEmptyBoard } from '../../engine/boardFactory';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeBoard = (rows = 3, cols = 3) => createEmptyBoard(rows, cols);

const renderBoard = (boardOverride, handlers = {}) => {
  const board = boardOverride ?? makeBoard();
  const onCellClick = handlers.onCellClick ?? jest.fn();
  const onCellRightClick = handlers.onCellRightClick ?? jest.fn();

  render(
    <GameBoard
      board={board}
      onCellClick={onCellClick}
      onCellRightClick={onCellRightClick}
    />
  );

  return { onCellClick, onCellRightClick };
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('GameBoard — rendering', () => {
  it('renders a grid container', () => {
    renderBoard();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('handles an empty board (0 columns) without crashing', () => {
    renderBoard([]);
    expect(screen.getByRole('grid')).toHaveStyle({ gridTemplateColumns: 'repeat(0, 28px)' });
  });

  it('renders the correct number of cells for a 3×3 board', () => {
    renderBoard(makeBoard(3, 3));
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('renders the correct number of cells for a 9×9 board', () => {
    renderBoard(makeBoard(9, 9));
    expect(screen.getAllByRole('button')).toHaveLength(81);
  });

  it('applies correct column count via inline style', () => {
    renderBoard(makeBoard(3, 5));
    const grid = screen.getByRole('grid');
    expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(5, 28px)' });
  });

  it('renders a mine cell with the bomb emoji when revealed', () => {
    const board = makeBoard(1, 1);
    board[0][0] = { ...board[0][0], isMine: true, isRevealed: true };
    renderBoard(board);
    expect(screen.getByRole('button').textContent).toBe('💣');
  });

  it('renders a flagged cell with the flag emoji', () => {
    const board = makeBoard(1, 1);
    board[0][0] = { ...board[0][0], isFlagged: true };
    renderBoard(board);
    expect(screen.getByRole('button').textContent).toBe('🚩');
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe('GameBoard — interactions', () => {
  it('calls onCellClick with correct row and col on left-click', () => {
    const { onCellClick } = renderBoard(makeBoard(3, 3));
    // The 5th button is cell (1,1) in a 3×3 grid (0-indexed row-major).
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]);
    expect(onCellClick).toHaveBeenCalledWith(1, 1);
  });

  it('calls onCellRightClick with correct row and col on right-click', () => {
    const { onCellRightClick } = renderBoard(makeBoard(3, 3));
    const buttons = screen.getAllByRole('button');
    fireEvent.contextMenu(buttons[0]);
    expect(onCellRightClick).toHaveBeenCalledWith(0, 0);
  });

  it('calls onCellClick once per click', () => {
    const { onCellClick } = renderBoard(makeBoard(2, 2));
    fireEvent.click(screen.getAllByRole('button')[3]);
    expect(onCellClick).toHaveBeenCalledTimes(1);
  });
});
