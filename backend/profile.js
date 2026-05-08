// Simulated backend data – snake accessories for customization
export const accessories = {
  hats: [
    { id: 'h0', label: 'None',     emoji: '❌' },
    { id: 'h1', label: 'Cap',      emoji: '🧢' },
    { id: 'h2', label: 'Crown',    emoji: '👑' },
    { id: 'h3', label: 'Cowboy',   emoji: '🤠' },
    { id: 'h4', label: 'Party',    emoji: '🎉' },
    { id: 'h5', label: 'Wizard',   emoji: '🧙' },
  ],
  glasses: [
    { id: 'g0', label: 'None',      emoji: '❌' },
    { id: 'g1', label: 'Shades',    emoji: '😎' },
    { id: 'g2', label: '3D',        emoji: '🕶️' },
    { id: 'g3', label: 'Nerd',      emoji: '🤓' },
    { id: 'g4', label: 'Monocle',   emoji: '🧐' },
  ],
  tails: [
    { id: 't0', label: 'Classic',   emoji: '🐍' },
    { id: 't1', label: 'Spiky',     emoji: '⚡' },
    { id: 't2', label: 'Fluffy',    emoji: '🦊' },
    { id: 't3', label: 'Dragon',    emoji: '🐲' },
    { id: 't4', label: 'Star',      emoji: '⭐' },
  ],
}

// Profile stats
export const profileStats = {
  foodEaten:   1342,
  maxSpeed:    5.8,
  kmRun:       47.2,
  bestStreak:  14,
  gamesPlayed: 88,
  wins:        23,
}

export const playerProfile = {
  name:         'Junhao',
  snakeColor:   '#39FF14',
  selectedHat:  'h2',
  selectedGlasses: 'g1',
  selectedTail: 't3',
}
