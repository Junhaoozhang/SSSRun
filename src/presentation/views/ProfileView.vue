<template>
  <div class="profile-view">

    <!-- Header -->
    <div class="pf-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="pf-title">Perfil</span>
    </div>

    <!-- Avatar + snake banner -->
    <div class="pf-banner">
      <div class="pf-avatar-wrap">
        <div class="pf-avatar">{{ initial }}</div>
        <span class="pf-level">Nv. {{ player.level }}</span>
      </div>
      <div class="pf-snake-wrap">
        <svg viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg" class="pf-snake-svg">
          <circle cx="40"  cy="55" r="11" :fill="snakeColor" opacity="0.55"/>
          <circle cx="62"  cy="48" r="11" :fill="snakeColor" opacity="0.65"/>
          <circle cx="82"  cy="40" r="11" :fill="snakeColor" opacity="0.72"/>
          <circle cx="102" cy="34" r="11" :fill="snakeColor" opacity="0.80"/>
          <circle cx="122" cy="40" r="11" :fill="snakeColor" opacity="0.86"/>
          <circle cx="140" cy="50" r="11" :fill="snakeColor" opacity="0.90"/>
          <circle cx="158" cy="54" r="11" :fill="snakeColor" opacity="0.93"/>
          <circle cx="176" cy="46" r="11" :fill="snakeColor" opacity="0.96"/>
          <!-- Head -->
          <circle cx="200" cy="38" r="14" :fill="snakeColor"/>
          <circle cx="194" cy="33" r="3.5" fill="#0a0a14"/>
          <circle cx="207" cy="33" r="3.5" fill="#0a0a14"/>
          <circle cx="195" cy="32" r="1.2" fill="white"/>
          <circle cx="208" cy="32" r="1.2" fill="white"/>
          <line x1="210" y1="40" x2="220" y2="37" stroke="#ff2222" stroke-width="1.5"/>
          <line x1="220" y1="37" x2="225" y2="34" stroke="#ff2222" stroke-width="1.5"/>
          <line x1="220" y1="37" x2="225" y2="40" stroke="#ff2222" stroke-width="1.5"/>
        </svg>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="pf-stats">
      <div class="stat-card">
        <div class="stat-icon">🍎</div>
        <div class="stat-num">{{ player.score.toLocaleString() }}</div>
        <div class="stat-lbl">Puntos totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-num">{{ player.level * 3 }}</div>
        <div class="stat-lbl">Racha días</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-num">{{ (player.score / 200).toFixed(1) }}</div>
        <div class="stat-lbl">Km totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-num">{{ (player.score / 1000).toFixed(1) }}</div>
        <div class="stat-lbl">Vel. máx m/s</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GetPlayersUseCase } from '@/application/usecases/GetPlayersUseCase.js'

const player = ref({ name: 'Jugador', health: 80, maxHealth: 100, score: 0, level: 1 })

const initial    = computed(() => player.value.name?.charAt(0).toUpperCase() ?? 'U')
const snakeColor = '#2a9e2a'

onMounted(() => {
  player.value = GetPlayersUseCase.getCurrent()
})
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f7f8;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

/* Header */
.pf-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: clamp(10px, 1.8vw, 14px) clamp(12px, 2vw, 16px);
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.back-btn {
  width: clamp(40px, 5.5vw, 48px);
  height: clamp(40px, 5.5vw, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  color: #333;
  flex-shrink: 0;
}
.pf-title {
  font-size: clamp(15px, 2.2vw, 20px);
  font-weight: 700;
  color: #111;
  flex: 1;
  text-align: center;
  padding-right: clamp(36px, 5.5vw, 48px); /* offset back btn */
}

/* Banner */
.pf-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: clamp(16px, 2.5vw, 20px) clamp(14px, 2.2vw, 18px);
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.pf-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.pf-avatar {
  width: clamp(68px, 10vw, 84px);
  height: clamp(68px, 10vw, 84px);
  border-radius: 50%;
  background: #2a9e2a;
  color: #fff;
  font-size: clamp(28px, 4vw, 34px);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #eee;
}
.pf-level {
  font-size: clamp(10px, 1.5vw, 13px);
  font-weight: 700;
  color: #fff;
  background: #f5a623;
  border-radius: 8px;
  padding: clamp(3px, 0.8vw, 5px) clamp(8px, 1.4vw, 10px);
}
.pf-snake-wrap {
  flex: 1;
  overflow: hidden;
}
.pf-snake-svg {
  width: 100%;
  height: 80px;
  display: block;
}

/* Stats grid */
.pf-stats {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: clamp(14px, 2.2vw, 18px) clamp(12px, 2vw, 16px);
  overflow-y: auto;
  align-content: start;
}
.stat-card {
  background: #fff;
  border-radius: clamp(12px, 2vw, 16px);
  border: 1px solid #eee;
  padding: clamp(16px, 2.6vw, 20px) clamp(12px, 2vw, 16px) clamp(14px, 2.2vw, 18px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-icon { font-size: clamp(24px, 3.4vw, 30px); margin-bottom: 2px; }
.stat-num  { font-size: clamp(22px, 3.2vw, 28px); font-weight: 800; color: #2a9e2a; line-height: 1; }
.stat-lbl  { font-size: clamp(11px, 1.6vw, 14px); font-weight: 600; color: #aaa; text-align: center; margin-top: 2px; }
</style>


