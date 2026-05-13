import { groups } from '@backend/groups.js'
import { Group } from '@/domain/models/Group.js'

let nextId = groups.length + 1

export const GroupRepository = {
  getAll () {
    return groups.map(g => new Group(g))
  },

  findById (id) {
    const raw = groups.find(g => g.id === id)
    return raw ? new Group(raw) : null
  },

  join (groupId) {
    const group = groups.find(g => g.id === groupId)
    if (group) group.joined = true
    return this.getAll()
  },

  leave (groupId) {
    const group = groups.find(g => g.id === groupId)
    if (group) group.joined = false
    return this.getAll()
  },

  create ({ name, emoji }) {
    const newGroup = { id: nextId++, name, emoji, members: 1, activeNow: 1, topScore: 0, joined: true }
    groups.push(newGroup)
    return this.getAll()
  },
}
