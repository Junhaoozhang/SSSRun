import { GroupRepository } from '@/data/repositories/GroupRepository.js'

export const GetGroupsUseCase = {
  execute () {
    return GroupRepository.getAll()
  },

  toggleJoin (groupId) {
    const group = GroupRepository.findById(groupId)
    if (group?.joined) {
      return GroupRepository.leave(groupId)
    }
    return GroupRepository.join(groupId)
  },

  create ({ name, emoji }) {
    return GroupRepository.create({ name, emoji })
  },
}
