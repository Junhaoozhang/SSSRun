<template>
  <div class="home-view">
    <MapCanvas :players="players" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MapCanvas from '@/presentation/components/MapCanvas.vue'
import { GetPlayersUseCase } from '@/application/usecases/GetPlayersUseCase.js'

const players = ref([])

onMounted(() => {
  players.value = GetPlayersUseCase.execute()
})
</script>

<style scoped>
.home-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
