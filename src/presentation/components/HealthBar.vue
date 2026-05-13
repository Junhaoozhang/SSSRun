<template>
  <div class="px-3 pb-2 bg-white flex-shrink-0">
    <div class="d-flex justify-content-between mb-1">
      <small class="fw-semibold" style="color:#999;font-size:11px">❤️ HP</small>
      <small class="fw-semibold" style="color:#999;font-size:11px">{{ player.health }} / {{ player.maxHealth }}</small>
    </div>
    <div class="progress rounded-pill" style="height:6px;background:#f0f0f3">
      <div class="progress-bar rounded-pill" :class="barClass"
           :style="{ width: healthPercent + '%', transition: 'width .6s ease' }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
})

const healthPercent = computed(() =>
  Math.round((props.player.health / props.player.maxHealth) * 100)
)

const barClass = computed(() => {
  if (healthPercent.value > 60) return 'bg-success'
  if (healthPercent.value > 30) return 'bg-warning'
  return 'bg-danger'
})
</script>

<style scoped>
.bg-danger { animation: hb-pulse 1s ease-in-out infinite; }
@keyframes hb-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
</style>
