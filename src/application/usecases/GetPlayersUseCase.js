import { PlayerRepository } from '@/data/repositories/PlayerRepository.js'

export const GetPlayersUseCase = {
  execute () {
    return PlayerRepository.getAll()
  },

  getCurrent () {
    return PlayerRepository.getCurrent()
  },
}
