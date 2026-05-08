import { AccessoryRepository } from '@/data/repositories/AccessoryRepository.js'

export const GetAccessoriesUseCase = {
  execute () {
    return {
      hats:    AccessoryRepository.getHats(),
      glasses: AccessoryRepository.getGlasses(),
      tails:   AccessoryRepository.getTails(),
      loadout: AccessoryRepository.getLoadout(),
    }
  },

  saveLoadout (loadout) {
    return AccessoryRepository.saveLoadout(loadout)
  },
}
