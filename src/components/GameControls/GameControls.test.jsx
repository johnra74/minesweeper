import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameControls from './GameControls';
import { DIFFICULTIES } from '../../constants/gameConfig';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderControls = (overrides = {}) => {
  const onNewGame = overrides.onNewGame ?? jest.fn();
  render(
    <GameControls
      currentDifficulty={overrides.currentDifficulty ?? 'BEGINNER'}
      onNewGame={onNewGame}
    />
  );
  return { onNewGame };
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('GameControls — rendering', () => {
  it('renders a difficulty button for every configured difficulty', () => {
    renderControls();
    const difficultyKeys = Object.keys(DIFFICULTIES);
    difficultyKeys.forEach((key) => {
      expect(
        screen.getByRole('button', { name: DIFFICULTIES[key].label })
      ).toBeInTheDocument();
    });
  });

  it('renders the "New Game" button', () => {
    renderControls();
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument();
  });

  it('marks the active difficulty button as pressed', () => {
    renderControls({ currentDifficulty: 'INTERMEDIATE' });
    const intermediateBtn = screen.getByRole('button', {
      name: DIFFICULTIES.INTERMEDIATE.label,
    });
    expect(intermediateBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not mark inactive difficulties as pressed', () => {
    renderControls({ currentDifficulty: 'BEGINNER' });
    const expertBtn = screen.getByRole('button', { name: DIFFICULTIES.EXPERT.label });
    expect(expertBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies the active CSS class to the selected difficulty', () => {
    renderControls({ currentDifficulty: 'BEGINNER' });
    const beginnerBtn = screen.getByRole('button', { name: DIFFICULTIES.BEGINNER.label });
    expect(beginnerBtn).toHaveClass('difficulty-btn--active');
  });

  it('does not apply the active CSS class to unselected difficulties', () => {
    renderControls({ currentDifficulty: 'BEGINNER' });
    const expertBtn = screen.getByRole('button', { name: DIFFICULTIES.EXPERT.label });
    expect(expertBtn).not.toHaveClass('difficulty-btn--active');
  });

  it('renders the toolbar with an accessible label', () => {
    renderControls();
    expect(screen.getByRole('toolbar', { name: /game controls/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe('GameControls — interactions', () => {
  it('calls onNewGame with the clicked difficulty key', () => {
    const { onNewGame } = renderControls({ currentDifficulty: 'BEGINNER' });
    fireEvent.click(screen.getByRole('button', { name: DIFFICULTIES.INTERMEDIATE.label }));
    expect(onNewGame).toHaveBeenCalledWith('INTERMEDIATE');
  });

  it('calls onNewGame with current difficulty when "New Game" is clicked', () => {
    const { onNewGame } = renderControls({ currentDifficulty: 'EXPERT' });
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    expect(onNewGame).toHaveBeenCalledWith('EXPERT');
  });

  it('calls onNewGame exactly once per difficulty click', () => {
    const { onNewGame } = renderControls();
    fireEvent.click(screen.getByRole('button', { name: DIFFICULTIES.BEGINNER.label }));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('calls onNewGame for each difficulty button independently', () => {
    const { onNewGame } = renderControls({ currentDifficulty: 'BEGINNER' });
    Object.keys(DIFFICULTIES).forEach((key) => {
      fireEvent.click(screen.getByRole('button', { name: DIFFICULTIES[key].label }));
    });
    expect(onNewGame).toHaveBeenCalledTimes(Object.keys(DIFFICULTIES).length);
  });
});
