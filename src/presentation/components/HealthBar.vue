<template>
  <div class="health-bar-wrap">
    <div class="hb-labels">
      <div class="hb-label-left">
        <small>❤️ HP</small>
        <button class="hb-info-btn" @click="showInfo = !showInfo" aria-label="Información">ℹ</button>
      </div>
      <small>{{ player.health }} / {{ player.maxHealth }}</small>
    </div>
    <Transition name="info-fade">
      <div v-if="showInfo" class="hb-tooltip">
        <strong>¿Qué es el HP?</strong>
        <ul>
          <li>Si llega a 0 pierdes todos tus puntos y la cola que tenías.</li>
          <li>Se va restando poco a poco por cada día que no juegas.</li>
          <li>Cada vez que juegas recuperas vidas.</li>
        </ul>
        <button class="hb-tooltip-close" @click="showInfo = false">Entendido</button>
      </div>
    </Transition>
    <div class="hb-track">
      <div class="hb-fill" :class="fillClass" :style="{ width: healthPercent + '%' }" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
})

const showInfo = ref(false)

const healthPercent = computed(() =>
  Math.round((props.player.health / props.player.maxHealth) * 100)
)

const fillClass = computed(() => {
  if (healthPercent.value > 60) return 'fill-green'
  if (healthPercent.value > 30) return 'fill-yellow'
  return 'fill-red'
})
</script>

<style scoped>
.health-bar-wrap {
  padding: clamp(8px, 1.8vw, 12px) clamp(12px, 2vw, 16px) clamp(10px, 2vw, 14px);
  background: #F2F0EF;
  flex-shrink: 0;
  border-bottom: 2px solid #408201;
}
.hb-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-family: 'Press Start 2P', monospace;
}
.hb-label-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hb-labels small {
  font-size: clamp(9px, 1.4vw, 12px);
  font-weight: 400;
  color: #408201;
  font-family: 'Press Start 2P', monospace;
  letter-spacing: 0.5px;
}
.hb-info-btn {
  width: clamp(18px, 2.8vw, 24px);
  height: clamp(18px, 2.8vw, 24px);
  border: 1px solid #408201;
  background: rgba(64, 130, 1, 0.08);
  color: #408201;
  font-size: clamp(10px, 1.5vw, 13px);
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
}
.hb-info-btn:active { background: rgba(64, 130, 1, 0.2); }
.hb-tooltip {
  background: #F2F0EF;
  border: 2px solid #408201;
  padding: clamp(12px, 2vw, 16px) clamp(12px, 2vw, 16px) clamp(10px, 1.8vw, 14px);
  margin-bottom: 8px;
  font-size: clamp(9px, 1.4vw, 12px);
  color: #408201;
  font-family: 'Press Start 2P', monospace;
  line-height: 1.7;
  image-rendering: pixelated;
}
.hb-tooltip strong { display: block; font-size: clamp(10px, 1.6vw, 13px); color: #408201; margin-bottom: 8px; letter-spacing: 0.5px; }
.hb-tooltip ul { margin: 0; padding-left: 14px; }
.hb-tooltip li { margin-bottom: 5px; line-height: 1.6; color: rgba(64, 130, 1, 0.75); }
.hb-tooltip-close {
  display: inline-block;
  margin-top: 8px;
  padding: clamp(6px, 1vw, 8px) clamp(10px, 1.6vw, 12px);
  border: 2px solid #408201;
  background: rgba(64, 130, 1, 0.08);
  font-size: clamp(8px, 1.2vw, 11px);
  font-weight: 400;
  color: #408201;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
  letter-spacing: 0.5px;
}
.hb-tooltip-close:active { background: rgba(64, 130, 1, 0.2); }
.hb-track {
  height: clamp(8px, 1.4vw, 10px);
  background: rgba(64, 130, 1, 0.12);
  border: 1px solid #408201;
  overflow: hidden;
  image-rendering: pixelated;
}
.hb-fill {
  height: 100%;
  transition: width .5s ease;
}
.fill-green  { background: #408201; }
.fill-yellow { background: #d8b24c; }
.fill-red    { background: #d64b4b; animation: hb-pulse 0.8s step-end infinite; }
@keyframes hb-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.info-fade-enter-active, .info-fade-leave-active { transition: opacity .2s, transform .2s; }
.info-fade-enter-from, .info-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>