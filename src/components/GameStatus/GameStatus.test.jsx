import React from 'react';
import { render, screen } from '@testing-library/react';
import GameStatus from './GameStatus';
import { GAME_STATUS } from '../../constants/gameConfig';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderStatus = ({ gameStatus = GAME_STATUS.IDLE, minesLeft = 10, time = 0 } = {}) =>
  render(<GameStatus gameStatus={gameStatus} minesLeft={minesLeft} time={time} />);

// ---------------------------------------------------------------------------
// Mine counter
// ---------------------------------------------------------------------------

describe('GameStatus — mine counter', () => {
  it('displays mines-left padded to 3 digits', () => {
    renderStatus({ minesLeft: 10 });
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('010');
  });

  it('displays a single-digit count padded to 3 digits', () => {
    renderStatus({ minesLeft: 3 });
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('003');
  });

  it('displays 000 when no mines remain', () => {
    renderStatus({ minesLeft: 0 });
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('000');
  });

  it('displays negative mine counts (over-flagging)', () => {
    renderStatus({ minesLeft: -2 });
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('-2');
  });
});

// ---------------------------------------------------------------------------
// Timer
// ---------------------------------------------------------------------------

describe('GameStatus — timer', () => {
  it('displays 000 when time is 0', () => {
    renderStatus({ time: 0 });
    expect(screen.getByLabelText(/time/i)).toHaveTextContent('000');
  });

  it('displays elapsed time padded to 3 digits', () => {
    renderStatus({ time: 42 });
    expect(screen.getByLabelText(/time/i)).toHaveTextContent('042');
  });

  it('caps display at 999', () => {
    renderStatus({ time: 1500 });
    expect(screen.getByLabelText(/time/i)).toHaveTextContent('999');
  });

  it('displays 3-digit time without padding when >= 100', () => {
    renderStatus({ time: 123 });
    expect(screen.getByLabelText(/time/i)).toHaveTextContent('123');
  });
});

// ---------------------------------------------------------------------------
// Face / status emoji
// ---------------------------------------------------------------------------

describe('GameStatus — face emoji', () => {
  const cases = [
    [GAME_STATUS.IDLE, '😊'],
    [GAME_STATUS.PLAYING, '😮'],
    [GAME_STATUS.WON, '😎'],
    [GAME_STATUS.LOST, '😵'],
  ];

  test.each(cases)('shows %s face for %s status', (status, emoji) => {
    renderStatus({ gameStatus: status });
    expect(screen.getByRole('img').textContent).toBe(emoji);
  });
});

// ---------------------------------------------------------------------------
// Status messages (aria labels)
// ---------------------------------------------------------------------------

describe('GameStatus — accessibility', () => {
  it('has a live region for screen-reader announcements', () => {
    renderStatus();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('shows win message as aria-label when game is won', () => {
    renderStatus({ gameStatus: GAME_STATUS.WON });
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('won')
    );
  });

  it('shows lost message as aria-label when game is lost', () => {
    renderStatus({ gameStatus: GAME_STATUS.LOST });
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Game over')
    );
  });
});
