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
  background: #f7f7f8;
  font-family: 'Inter', sans-serif;
}

/* Header */
.lb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.back-btn {
  width: 36px;
  height: 36px;
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
.scope-toggle { display: flex; flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.scope-btn { flex: 1; padding: 7px 0; border: none; background: #fff; font-size: 13px; font-weight: 600; color: #888; cursor: pointer; font-family: 'Inter', sans-serif; }
.scope-btn.active { background: #2a9e2a; color: #fff; }
.filter-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; color: #555; flex-shrink: 0; }
.filter-btn.active { background: #2a9e2a; color: #fff; border-color: #2a9e2a; }

/* Filter panel */
.filter-panel { background: #fff; border-bottom: 1px solid #eee; padding: 14px 14px 16px; flex-shrink: 0; }
.filter-section { margin-bottom: 14px; }
.filter-section:last-child { margin-bottom: 0; }
.filter-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 8px; }
.radio-group { display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.radio-btn { flex: 1; padding: 7px 0; border: none; background: #fff; font-size: 12px; font-weight: 600; color: #888; cursor: pointer; font-family: 'Inter', sans-serif; border-right: 1px solid #e0e0e0; }
.radio-btn:last-child { border-right: none; }
.radio-btn.active { background: #2a9e2a; color: #fff; }
.zone-select { width: 100%; padding: 8px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; background: #fff; }

/* List */
.lb-list { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 0; }
.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.lb-row:first-child { border-radius: 10px 10px 0 0; }
.lb-row:last-child  { border-bottom: none; border-radius: 0 0 10px 10px; }

.lb-gold   { border-left: 3px solid #f0d060; }
.lb-silver { border-left: 3px solid #b0b0b8; }
.lb-bronze { border-left: 3px solid #c87832; }
.lb-me     { background: #f6fff6; }

.rank-col { width: 28px; text-align: center; flex-shrink: 0; }
.rank-num { font-size: 13px; font-weight: 700; color: #bbb; }

.lb-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}
.lb-info { flex: 1; min-width: 0; }
.lb-name { font-size: 14px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.streak-badge { font-size: 10px; color: #e74c3c; background: #fff5f5; border: 1px solid #fcc; border-radius: 4px; padding: 1px 5px; }

.lb-score { text-align: right; flex-shrink: 0; }
.score-val  { font-size: 15px; font-weight: 700; color: #2a9e2a; }
.score-unit { font-size: 11px; color: #aaa; }

.empty-state { text-align: center; color: #aaa; padding: 32px 0; font-size: 14px; }

.filter-slide-enter-active, .filter-slide-leave-active { transition: all .2s ease; overflow: hidden; }
.filter-slide-enter-from, .filter-slide-leave-to { opacity: 0; max-height: 0; padding-top: 0 !important; padding-bottom: 0 !important; }
.filter-slide-enter-to, .filter-slide-leave-from { opacity: 1; max-height: 200px; }
</style>

