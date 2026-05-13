<template>
  <div class="app-shell">
    <!-- Hide header/healthbar on game screen for immersion -->
    <template v-if="route.name !== 'game' && !playMode">
      <AppHeader :player="currentPlayer" @profile-click="router.push({ name: 'profile' })" />
      <HealthBar :player="currentPlayer" />
    </template>

    <!-- Main content -->
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>

    <!-- Snake decoration + bottom nav hidden on game screen -->
    <template v-if="route.name !== 'game' && !playMode">
      <BottomNavBar
        :active-tab="navTab"
        @tab-change="onTabChange"
        @play="onPlay"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader      from '@/presentation/components/AppHeader.vue'
import HealthBar      from '@/presentation/components/HealthBar.vue'
import BottomNavBar   from '@/presentation/components/BottomNavBar.vue'
import { GetPlayersUseCase } from '@/application/usecases/GetPlayersUseCase.js'

const router = useRouter()
const route  = useRoute()

const currentPlayer = ref({ name: 'Jugador', health: 80, maxHealth: 100, score: 0, level: 1 })
const playMode = ref(false)
const navTab   = ref('map')
provide('playMode', playMode)
provide('navTab', navTab)

const activeTab = computed(() => {
  if (route.name === 'leaderboard') return 'leaderboard'
  return navTab.value
})

function onTabChange (tab) {
  if (tab === 'leaderboard') {
    navTab.value = 'leaderboard'
    router.push({ name: 'leaderboard' })
  } else if (tab === 'friends') {
    // toggle friends panel — if already open, close it
    navTab.value = navTab.value === 'friends' ? 'map' : 'friends'
    if (route.name !== 'home') router.push({ name: 'home' })
  } else {
    navTab.value = tab
    if (route.name !== 'home') router.push({ name: 'home' })
  }
}

function onPlay () {
  playMode.value = true
}

onMounted(() => {
  currentPlayer.value = GetPlayersUseCase.getCurrent()
})
</script>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
