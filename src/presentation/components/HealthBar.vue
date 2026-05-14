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
  padding: 0 14px 8px;
  background: #fff;
  flex-shrink: 0;
}
.hb-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.hb-label-left {
  display: flex;
  align-items: center;
  gap: 5px;
}
.hb-labels small { font-size: 11px; font-weight: 600; color: #aaa; font-family: 'Inter', sans-serif; }
.hb-info-btn {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #bbb;
  background: #f5f5f5;
  color: #888;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  font-family: serif;
}
.hb-info-btn:active { background: #e8e8e8; }
.hb-tooltip {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 12px 14px 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #444;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.hb-tooltip strong { display: block; font-size: 12px; color: #111; margin-bottom: 6px; }
.hb-tooltip ul { margin: 0; padding-left: 16px; }
.hb-tooltip li { margin-bottom: 4px; line-height: 1.4; }
.hb-tooltip-close {
  display: block;
  margin-top: 10px;
  width: 100%;
  padding: 7px;
  border-radius: 7px;
  border: 1px solid #e0e0e0;
  background: #f7f7f8;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.hb-track {
  height: 6px;
  background: #f0f0f3;
  border-radius: 3px;
  overflow: hidden;
}
.hb-fill {
  height: 100%;
  border-radius: 3px;
  transition: width .5s ease;
}
.fill-green  { background: #2a9e2a; }
.fill-yellow { background: #f5a623; }
.fill-red    { background: #e74c3c; animation: hb-pulse 1s ease-in-out infinite; }
@keyframes hb-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
.info-fade-enter-active, .info-fade-leave-active { transition: opacity .2s, transform .2s; }
.info-fade-enter-from, .info-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
