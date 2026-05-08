// Simulated backend data – snake accessories
export const accessories = {
  hats: [
    { id: 'h1', name: 'Cap',     emoji: '🧢', color: '#FF6B35', unlocked: true  },
    { id: 'h2', name: 'Crown',   emoji: '👑', color: '#FFD700', unlocked: false },
    { id: 'h3', name: 'Beanie',  emoji: '🎩', color: '#9B59B6', unlocked: true  },
    { id: 'h4', name: 'Helmet',  emoji: '⛑️', color: '#E74C3C', unlocked: true  },
    { id: 'h5', name: 'Santa',   emoji: '🎅', color: '#FF0000', unlocked: false },
  ],
  glasses: [
    { id: 'g1', name: 'Shades',   emoji: '😎', color: '#2C3E50', unlocked: true  },
    { id: 'g2', name: 'VR',       emoji: '🥽', color: '#00D4FF', unlocked: false },
    { id: 'g3', name: 'Heart',    emoji: '💝', color: '#FF69B4', unlocked: true  },
    { id: 'g4', name: 'Neon',     emoji: '👓', color: '#39FF14', unlocked: true  },
    { id: 'g5', name: 'Monocle',  emoji: '🧐', color: '#8B7355', unlocked: false },
  ],
  tails: [
    { id: 't1', name: 'Classic',  emoji: '🐍', color: '#39FF14', unlocked: true  },
    { id: 't2', name: 'Fire',     emoji: '🔥', color: '#FF4500', unlocked: true  },
    { id: 't3', name: 'Ice',      emoji: '❄️', color: '#00D4FF', unlocked: false },
    { id: 't4', name: 'Galaxy',   emoji: '🌌', color: '#9B59B6', unlocked: false },
    { id: 't5', name: 'Rainbow',  emoji: '🌈', color: '#FF6B35', unlocked: true  },
  ],
}

export const currentLoadout = { hat: 'h1', glasses: 'g1', tail: 't1' }
