import { players, currentPlayer } from '@backend/players.js'
import { Player, CurrentPlayer } from '@/domain/models/Player.js'

export const PlayerRepository = {
  getAll () {
    return players.map(p => new Player(p))
  },

  getCurrent () {
    return new CurrentPlayer(currentPlayer)
  },
}
