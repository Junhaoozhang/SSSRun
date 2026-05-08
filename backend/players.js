// Simulated backend data – players on the map
export const players = [
  { id: 1, name: 'Junhao',      score: 12500, health: 80,  x: 0.30, y: 0.40, color: '#39FF14' },
  { id: 2, name: 'Jiajun',      score:  9800, health: 60,  x: 0.65, y: 0.30, color: '#FF6B35' },
  { id: 3, name: 'Alicia',      score: 11000, health: 90,  x: 0.50, y: 0.60, color: '#00D4FF' },
  { id: 4, name: 'RunnerX',     score:  7500, health: 45,  x: 0.20, y: 0.72, color: '#FF69B4' },
  { id: 5, name: 'SpeedMaster', score: 15200, health: 100, x: 0.80, y: 0.50, color: '#FFD700' },
  { id: 6, name: 'GreenMamba',  score:  5100, health: 70,  x: 0.42, y: 0.22, color: '#7FFF00' },
]

export const currentPlayer = {
  id: 0,
  name: 'Junhao',
  health: 80,
  maxHealth: 100,
  score: 12500,
  level: 7,
}
