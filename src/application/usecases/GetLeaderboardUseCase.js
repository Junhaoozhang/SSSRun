import { LeaderboardRepository } from '@/data/repositories/LeaderboardRepository.js'

export const GetLeaderboardUseCase = {
  execute () {
    return LeaderboardRepository.getAll()
  },

  getTop (n) {
    return LeaderboardRepository.getTop(n)
  },
}
