<template>
  <div class="app-shell">
    <!-- Hide header/healthbar on game screen for immersion -->
    <template v-if="route.name !== 'game'">
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
    <template v-if="route.name !== 'game'">
      <SnakeDecoration />
      <BottomNavBar
        :active-tab="activeTab"
        @tab-change="onTabChange"
        @play="onPlay"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader      from '@/presentation/components/AppHeader.vue'
import HealthBar      from '@/presentation/components/HealthBar.vue'
import SnakeDecoration from '@/presentation/components/SnakeDecoration.vue'
import BottomNavBar   from '@/presentation/components/BottomNavBar.vue'
import { GetPlayersUseCase } from '@/application/usecases/GetPlayersUseCase.js'

const router = useRouter()
const route  = useRoute()

const currentPlayer = ref({ name: 'Jugador', health: 80, maxHealth: 100, score: 0, level: 1 })

const activeTab = computed(() => {
  if (route.name === 'leaderboard') return 'leaderboard'
  if (route.name === 'social')      return 'social'
  return 'map'
})

function onTabChange (tab) {
  if (tab === 'leaderboard') router.push({ name: 'leaderboard' })
  else if (tab === 'social') router.push({ name: 'social' })
  else                       router.push({ name: 'home' })
}

function onPlay () {
  router.push({ name: 'game' })
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
  background: #0f0f1a;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
