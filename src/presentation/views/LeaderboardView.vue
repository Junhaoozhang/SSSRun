<template>
  <div class="lb-view">

    <!-- Header -->
    <div class="lb-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="scope-toggle">
        <button class="scope-btn" :class="{ active: scope === 'global' }" @click="scope = 'global'">🌍 Global</button>
        <button class="scope-btn" :class="{ active: scope === 'friends' }" @click="scope = 'friends'">👥 Amigos</button>
      </div>
      <button class="filter-btn" :class="{ active: filterOpen }" @click="filterOpen = !filterOpen">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Filter panel -->
    <Transition name="filter-slide">
      <div v-if="filterOpen" class="filter-panel">
        <div class="filter-section">
          <p class="filter-label">Ordenar</p>
          <div class="radio-group">
            <button class="radio-btn" :class="{ active: sortBy === 'score' }" @click="sortBy = 'score'">⭐ Puntos</button>
            <button class="radio-btn" :class="{ active: sortBy === 'food' }" @click="sortBy = 'food'">🍎 Comida</button>
            <button class="radio-btn" :class="{ active: sortBy === 'streak' }" @click="sortBy = 'streak'">🔥 Racha</button>
          </div>
        </div>
        <div class="filter-section">
          <p class="filter-label">Zona</p>
          <select class="zone-select" v-model="zone">
            <option value="all">Todas las zonas</option>
            <option value="ub">Campus UB</option>
            <option value="gracia">Gràcia</option>
            <option value="eixample">Eixample</option>
            <option value="poblenou">Poblenou</option>
          </select>
        </div>
      </div>
    </Transition>

    <!-- List -->
    <div class="lb-list">
      <div
        v-for="(entry, i) in visibleEntries"
        :key="entry.name"
        class="lb-row"
        :class="{
          'lb-gold':   i === 0,
          'lb-silver': i === 1,
          'lb-bronze': i === 2,
          'lb-me':     entry.name === currentName,
        }"
      >
        <div class="rank-col">
          <span v-if="i < 3" style="font-size:20px">{{ ['🥇','🥈','🥉'][i] }}</span>
          <span v-else class="rank-num">{{ i + 1 }}</span>
        </div>
        <div class="lb-avatar" :style="{ background: entry.color + '22', color: entry.color, border: '2px solid ' + entry.color }">
          {{ entry.name.charAt(0) }}
        </div>
        <div class="lb-info">
          <div class="lb-name">{{ entry.name }}</div>
          <span class="streak-badge">🔥 {{ entry.streak }}d</span>
        </div>
        <div class="lb-score">
          <div class="score-val">{{ displayValue(entry).toLocaleString() }}</div>
          <div class="score-unit">{{ sortBy === 'score' ? 'pts' : sortBy === 'food' ? '🍎' : 'días' }}</div>
        </div>
      </div>

      <div v-if="visibleEntries.length === 0" class="empty-state">
        Sin resultados para esta zona
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GetLeaderboardUseCase } from '@/application/usecases/GetLeaderboardUseCase.js'
import { GetFriendsUseCase }     from '@/application/usecases/GetFriendsUseCase.js'
import { GetPlayersUseCase }     from '@/application/usecases/GetPlayersUseCase.js'

const PLAYER_COLORS = ['#E67E22','#2980B9','#E74C3C','#8E44AD','#16A085','#C0392B','#27AE60','#2C3E50']

const PLAYER_ZONES = {
  'SpeedMaster': 'eixample',
  'Junhao':      'gracia',
  'SnakeKing':   'poblenou',
  'Alicia':      'gracia',
  'Jiajun':      'eixample',
  'RunnerX':     'ub',
  'FastFoot':    'poblenou',
  'GreenMamba':  'ub',
  'Sprinter99':  'eixample',
  'MilesAhead':  'gracia',
}

const allEntries    = ref([])
const friendEntries = ref([])
const currentName   = ref('')
const scope         = ref('global')
const sortBy        = ref('score')
const zone          = ref('all')
const filterOpen    = ref(false)

const visibleEntries = computed(() => {
  let base = scope.value === 'global' ? allEntries.value : friendEntries.value
  if (zone.value !== 'all') base = base.filter(e => e.zone === zone.value)
  return [...base].sort((a, b) => {
    if (sortBy.value === 'streak') return b.streak - a.streak
    if (sortBy.value === 'food')   return b.food   - a.food
    return b.score - a.score
  })
})

function displayValue (entry) {
  if (sortBy.value === 'streak') return entry.streak
  if (sortBy.value === 'food')   return entry.food
  return entry.score
}

onMounted(() => {
  currentName.value = GetPlayersUseCase.getCurrent().name

  const raw = GetLeaderboardUseCase.execute()
  allEntries.value = raw.map((e, i) => ({
    ...e,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    food: e.food ?? e.streak * 42,
    zone: PLAYER_ZONES[e.name] ?? 'eixample',
  }))

  const friendList = GetFriendsUseCase.execute()
  friendEntries.value = [...friendList]
    .sort((a, b) => b.score - a.score)
    .map((f, i) => ({
      rank: i + 1, name: f.name, score: f.score,
      streak: f.streak, food: f.food,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    }))
})
</script>

<style scoped>
.lb-view {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background: #F2F0EF;
  font-family: 'Press Start 2P', monospace;
}

/* Header */
.lb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: clamp(10px, 1.8vw, 14px) clamp(10px, 2vw, 16px);
  background: #F2F0EF;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
}
.back-btn {
  width: clamp(36px, 5vw, 48px);
  height: clamp(36px, 5vw, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #d0d0d0;
  border-radius: 0;
  cursor: pointer;
  color: #333333;
  flex-shrink: 0;
}
.scope-toggle { display: flex; flex: 1; border: 1px solid #d0d0d0; border-radius: 0; overflow: hidden; }
.scope-btn { flex: 1; padding: clamp(8px, 1.4vw, 12px) 0; border: none; background: #f5f5f5; font-size: clamp(9px, 1.2vw, 12px); font-weight: 400; color: #666666; cursor: pointer; font-family: 'Press Start 2P', monospace; }
.scope-btn.active { background: #2fca4d; color: #F2F0EF; }
.filter-btn { width: clamp(36px, 5vw, 48px); height: clamp(36px, 5vw, 48px); display: flex; align-items: center; justify-content: center; background: #f5f5f5; border: 1px solid #d0d0d0; border-radius: 0; cursor: pointer; color: #333333; flex-shrink: 0; }
.filter-btn.active { background: #2fca4d; color: #F2F0EF; border-color: #2fca4d; }

/* Filter panel */
.filter-panel { background: #F2F0EF; border-bottom: 1px solid #e0e0e0; padding: clamp(12px, 2.2vw, 18px); flex-shrink: 0; }
.filter-section { margin-bottom: 14px; }
.filter-section:last-child { margin-bottom: 0; }
.filter-label { font-size: clamp(8px, 1.1vw, 11px); font-weight: 400; color: #666666; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 8px; }
.radio-group { display: flex; border: 1px solid #d0d0d0; border-radius: 0; overflow: hidden; }
.radio-btn { flex: 1; padding: clamp(8px, 1.4vw, 12px) 0; border: none; background: #f5f5f5; font-size: clamp(9px, 1.2vw, 12px); font-weight: 400; color: #666666; cursor: pointer; font-family: 'Press Start 2P', monospace; border-right: 1px solid #d0d0d0; }
.radio-btn:last-child { border-right: none; }
.radio-btn.active { background: #2fca4d; color: #F2F0EF; }
.zone-select { width: 100%; padding: clamp(10px, 1.6vw, 14px) clamp(10px, 1.6vw, 14px); border: 1px solid #d0d0d0; border-radius: 0; font-size: clamp(9px, 1.2vw, 12px); font-family: 'Press Start 2P', monospace; background: #F2F0EF; color: #333333; }

/* List */
.lb-list { flex: 1; overflow-y: auto; padding: clamp(10px, 1.8vw, 14px); display: flex; flex-direction: column; gap: 0; }
.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: clamp(10px, 1.8vw, 14px) clamp(10px, 1.8vw, 14px);
  background: #F2F0EF;
  border-bottom: 1px solid #e0e0e0;
}
.lb-row:first-child { border-radius: 0; }
.lb-row:last-child  { border-bottom: none; border-radius: 0; }

.lb-gold   { border-left: 3px solid #d8b24c; }
.lb-silver { border-left: 3px solid #8d8d96; }
.lb-bronze { border-left: 3px solid #a66a34; }
.lb-me     { background: #e8f8e8; }

.rank-col { width: 28px; text-align: center; flex-shrink: 0; }
.rank-num { font-size: clamp(12px, 1.6vw, 16px); font-weight: 700; color: #666666; }

.lb-avatar {
  width: clamp(36px, 5vw, 46px);
  height: clamp(36px, 5vw, 46px);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(14px, 2vw, 18px);
  font-weight: 800;
  flex-shrink: 0;
}
.lb-info { flex: 1; min-width: 0; }
.lb-name { font-size: clamp(11px, 1.7vw, 15px); font-weight: 400; color: #333333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.streak-badge { font-size: clamp(9px, 1.2vw, 12px); color: #d64b4b; background: rgba(214,75,75,.08); border: 1px solid rgba(214,75,75,.28); border-radius: 0; padding: clamp(2px, 0.7vw, 4px) clamp(4px, 0.8vw, 6px); }

.lb-score { text-align: right; flex-shrink: 0; }
.score-val  { font-size: clamp(11px, 1.7vw, 15px); font-weight: 400; color: #2fca4d; }
.score-unit { font-size: clamp(8px, 1.1vw, 11px); color: #666666; }

.empty-state { text-align: center; color: #666666; padding: clamp(24px, 4vw, 32px) 0; font-size: clamp(10px, 1.4vw, 13px); }

.filter-slide-enter-active, .filter-slide-leave-active { transition: all .2s ease; overflow: hidden; }
.filter-slide-enter-from, .filter-slide-leave-to { opacity: 0; max-height: 0; padding-top: 0 !important; padding-bottom: 0 !important; }
.filter-slide-enter-to, .filter-slide-leave-from { opacity: 1; max-height: 200px; }
</style>

