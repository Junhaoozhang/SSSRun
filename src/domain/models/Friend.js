export class Friend {
  constructor ({ id, name, level, score, streak, color, status, food, speed }) {
    this.id = id
    this.name = name
    this.level = level
    this.score = score
    this.streak = streak
    this.color = color
    this.status = status
    this.food = food
    this.speed = speed
  }

  get isOnline () {
    return this.status !== 'offline'
  }
}
