import { accessories, currentLoadout } from '@backend/accessories.js'
import { AccessoryItem, Loadout } from '@/domain/models/Accessory.js'

const _loadout = { ...currentLoadout }

export const AccessoryRepository = {
  getHats    () { return accessories.hats.map(a => new AccessoryItem(a)) },
  getGlasses () { return accessories.glasses.map(a => new AccessoryItem(a)) },
  getTails   () { return accessories.tails.map(a => new AccessoryItem(a)) },

  getLoadout () { return new Loadout(_loadout) },

  saveLoadout (loadout) {
    Object.assign(_loadout, loadout)
    return new Loadout(_loadout)
  },
}
