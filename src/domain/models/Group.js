export class Group {
  constructor ({ id, name, emoji, members, activeNow, topScore, joined }) {
    this.id = id
    this.name = name
    this.emoji = emoji
    this.members = members
    this.activeNow = activeNow
    this.topScore = topScore
    this.joined = joined
  }
}
