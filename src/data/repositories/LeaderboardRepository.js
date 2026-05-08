import { leaderboard } from '@backend/leaderboard.js'
import { LeaderboardEntry } from '@/domain/models/LeaderboardEntry.js'

export const LeaderboardRepository = {
  getAll () {
    return leaderboard.map(e => new LeaderboardEntry(e))
  },

  getTop (n = 10) {
    return leaderboard.slice(0, n).map(e => new LeaderboardEntry(e))
  },
}
