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
  padding: 6px 20px 10px;
  background: #0f0f1a;
  flex-shrink: 0;
}

.healthbar-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.hb-label,
.hb-value {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Nunito', sans-serif;
  letter-spacing: 0.5px;
}

.healthbar-track {
  position: relative;
  height: 11px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.healthbar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
}

.fill-high {
  background: linear-gradient(90deg, #39FF14, #00d000);
  box-shadow: 0 0 8px rgba(57, 255, 20, 0.5);
}

.fill-medium {
  background: linear-gradient(90deg, #FFD700, #ff8c00);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.fill-low {
  background: linear-gradient(90deg, #ff4444, #c00000);
  box-shadow: 0 0 8px rgba(255, 68, 68, 0.5);
  animation: hb-pulse 1s ease-in-out infinite;
}

@keyframes hb-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.healthbar-segments {
  position: absolute;
  inset: 0;
  display: flex;
}

.segment {
  flex: 1;
  border-right: 1px solid rgba(0, 0, 0, 0.35);
}

.segment:last-child {
  border-right: none;
}
</style>
