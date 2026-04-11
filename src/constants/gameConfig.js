export const DIFFICULTIES = {
  BEGINNER: { rows: 9, cols: 9, mines: 10, label: 'Beginner' },
  INTERMEDIATE: { rows: 16, cols: 16, mines: 40, label: 'Intermediate' },
  EXPERT: { rows: 16, cols: 30, mines: 99, label: 'Expert' },
};

export const GAME_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

export const ADJACENT_MINE_COLORS = {
  1: '#0000ff',
  2: '#008000',
  3: '#ff0000',
  4: '#000080',
  5: '#800000',
  6: '#008080',
  7: '#000000',
  8: '#808080',
};
