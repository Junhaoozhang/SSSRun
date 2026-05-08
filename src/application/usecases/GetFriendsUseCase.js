import { FriendRepository } from '@/data/repositories/FriendRepository.js'

export const GetFriendsUseCase = {
  execute () {
    return FriendRepository.getAll()
  },
}
