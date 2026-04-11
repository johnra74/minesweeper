import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

// ---------------------------------------------------------------------------
// Smoke tests & initial render
// ---------------------------------------------------------------------------

describe('App — initial render', () => {
  it('renders the game title', () => {
    render(<App />);
    expect(screen.getByText(/minesweeper/i)).toBeInTheDocument();
  });

  it('renders the game board', () => {
    render(<App />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders the game controls toolbar', () => {
    render(<App />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders the game status region', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders 81 cells for a Beginner (9×9) board', () => {
    render(<App />);
    // GameControls buttons + board cell buttons all use role="button".
    // Filter to just the grid cells.
    const grid = screen.getByRole('grid');
    expect(within(grid).getAllByRole('button')).toHaveLength(81);
  });

  it('starts with the Beginner difficulty active', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /beginner/i })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows 010 mines at start', () => {
    render(<App />);
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('010');
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe('App — interactions', () => {
  it('places mines and reveals a cell on first click', () => {
    render(<App />);
    const grid = screen.getByRole('grid');
    const cells = within(grid).getAllByRole('button');

    fireEvent.click(cells[40]); // centre cell

    // At least one cell should now be revealed.
    const revealedCells = within(grid)
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
    expect(revealedCells.length).toBeGreaterThan(0);
  });

  it('switches to a 16×16 board when Intermediate is selected', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /intermediate/i }));

    const grid = screen.getByRole('grid');
    expect(within(grid).getAllByRole('button')).toHaveLength(256);
  });

  it('resets the board when "New Game" is clicked', () => {
    render(<App />);
    const grid = screen.getByRole('grid');
    fireEvent.click(within(grid).getAllByRole('button')[40]);

    fireEvent.click(screen.getByRole('button', { name: /new game/i }));

    const revealedAfterReset = within(screen.getByRole('grid'))
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
    expect(revealedAfterReset).toHaveLength(0);
  });

  it('switches to Expert board (16×30 = 480 cells)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /expert/i }));

    const grid = screen.getByRole('grid');
    expect(within(grid).getAllByRole('button')).toHaveLength(480);
  });
});
