import { friends } from '@backend/friends.js'
import { Friend } from '@/domain/models/Friend.js'

export const FriendRepository = {
  getAll () {
    return friends.map(f => new Friend(f))
  },

  getOnline () {
    return friends.filter(f => f.status !== 'offline').map(f => new Friend(f))
  },
}
