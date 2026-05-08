export class Player {
  constructor ({ id, name, score, health, x, y, color }) {
    this.id = id
    this.name = name
    this.score = score
    this.health = health
    this.x = x
    this.y = y
    this.color = color
  }
}

export class CurrentPlayer {
  constructor ({ id, name, health, maxHealth, score, level }) {
    this.id = id
    this.name = name
    this.health = health
    this.maxHealth = maxHealth
    this.score = score
    this.level = level
  }

  get healthPercent () {
    return Math.round((this.health / this.maxHealth) * 100)
  }
}
