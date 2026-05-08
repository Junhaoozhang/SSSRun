export class AccessoryItem {
  constructor ({ id, name, emoji, color, unlocked }) {
    this.id = id
    this.name = name
    this.emoji = emoji
    this.color = color
    this.unlocked = unlocked
  }
}

export class Loadout {
  constructor ({ hat, glasses, tail }) {
    this.hat = hat
    this.glasses = glasses
    this.tail = tail
  }
}
