<template>
  <div class="healthbar-wrap">
    <div class="healthbar-labels">
      <span class="hb-label">❤️ HP</span>
      <span class="hb-value">{{ player.health }} / {{ player.maxHealth }}</span>
    </div>
    <div class="healthbar-track">
      <div
        class="healthbar-fill"
        :class="fillClass"
        :style="{ width: healthPercent + '%' }"
      ></div>
      <div class="healthbar-segments">
        <span v-for="i in 10" :key="i" class="segment" />
      </div>
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

const fillClass = computed(() => {
  if (healthPercent.value > 60) return 'fill-high'
  if (healthPercent.value > 30) return 'fill-medium'
  return 'fill-low'
})
</script>

<style scoped>
.healthbar-wrap {
  padding: 2px 18px 10px;
  background: #fff;
  flex-shrink: 0;
}

.healthbar-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.hb-label,
.hb-value {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  letter-spacing: 0.3px;
}

.healthbar-track {
  position: relative;
  height: 6px;
  background: #f0f0f3;
  border-radius: 3px;
  overflow: hidden;
}

.healthbar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.fill-high  { background: linear-gradient(90deg, #2a9e2a, #5cc85c); }
.fill-medium { background: linear-gradient(90deg, #f5a623, #f0c040); }
.fill-low {
  background: linear-gradient(90deg, #e53935, #ef5350);
  animation: hb-pulse 1s ease-in-out infinite;
}

@keyframes hb-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.healthbar-segments { display: none; }
</style>
