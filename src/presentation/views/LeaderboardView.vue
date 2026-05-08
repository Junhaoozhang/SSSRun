<template>
  <div class="leaderboard-view">
    <!-- Header row: toggle + filter btn -->
    <div class="lb-header">
      <div class="lb-toggle">
        <button
          class="toggle-btn"
          :class="{ 'toggle-active': scope === 'global' }"
          @click="scope = 'global'"
        >🌍 Global</button>
        <button
          class="toggle-btn"
          :class="{ 'toggle-active': scope === 'friends' }"
          @click="scope = 'friends'"
        >👥 Amigos</button>
      </div>
      <button class="filter-btn" @click="filterOpen = !filterOpen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4"  y1="6"  x2="20" y2="6"/>
          <line x1="8"  y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Filter panel slide-down -->
    <Transition name="filter-slide">
      <div v-if="filterOpen" class="filter-panel">
        <div class="filter-row">
          <span class="filter-lbl">Ordenar por</span>
          <div class="sort-pills">
            <button
              class="sort-pill"
              :class="{ 'pill-active': sortBy === 'score' }"
              @click="sortBy = 'score'"
            >⭐ Puntos</button>
            <button
              class="sort-pill"
              :class="{ 'pill-active': sortBy === 'food' }"
              @click="sortBy = 'food'"
            >🍎 Comida</button>
            <button
              class="sort-pill"
              :class="{ 'pill-active': sortBy === 'streak' }"
              @click="sortBy = 'streak'"
            >🔥 Racha</button>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-lbl">Zona</span>
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
      <Transition name="tab-slide" mode="out-in">
        <div :key="scope" class="lb-inner">
          <div
            v-for="entry in visibleEntries"
            :key="entry.rank"
            class="lb-row"
            :class="{
              'row-gold':   entry.rank === 1,
              'row-silver': entry.rank === 2,
              'row-bronze': entry.rank === 3,
              'row-me':     entry.name === currentName,
            }"
          >
            <div class="rank-cell">{{ entry.avatar }}</div>

            <div class="name-cell">
              <span class="player-name">{{ entry.name }}</span>
              <span class="streak-badge">🔥 {{ entry.streak }}d</span>
            </div>

            <div class="score-cell">
              <span class="score-num">{{ entry.score.toLocaleString() }}</span>
              <span class="score-unit">pts</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GetLeaderboardUseCase } from '@/application/usecases/GetLeaderboardUseCase.js'
import { GetFriendsUseCase }     from '@/application/usecases/GetFriendsUseCase.js'
import { GetPlayersUseCase }     from '@/application/usecases/GetPlayersUseCase.js'

const allEntries    = ref([])
const friendEntries = ref([])
const currentName   = ref('')
const scope         = ref('global')
const sortBy        = ref('score')
const zone          = ref('all')
const filterOpen    = ref(false)

const visibleEntries = computed(() => {
  const base = scope.value === 'global' ? allEntries.value : friendEntries.value
  return [...base].sort((a, b) => {
    if (sortBy.value === 'streak') return b.streak - a.streak
    if (sortBy.value === 'food')   return b.streak * 50 - a.streak * 50
    return b.score - a.score
  })
})

onMounted(() => {
  allEntries.value  = GetLeaderboardUseCase.execute()
  currentName.value = GetPlayersUseCase.getCurrent().name

  // Build friend leaderboard from friend data
  const friendList = GetFriendsUseCase.execute()
  friendEntries.value = friendList.map((f, i) => ({
    rank:   i + 1,
    name:   f.name,
    score:  f.score,
    streak: f.streak,
    avatar: ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'][i] ?? '🎮',
  })).sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }))
})
</script>

<style scoped>
.leaderboard-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: #0f0f1a;
}

/* ── Header ── */
.lb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  flex-shrink: 0;
}

.lb-toggle {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 4px;
}

.toggle-btn {
  padding: 7px 16px;
  border-radius: 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  transition: all 0.2s;
}

.toggle-active {
  background: #39FF14;
  color: #0a0a14;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.4);
}

.filter-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #39FF14;
  color: #39FF14;
}

/* ── Filter panel ── */
.filter-panel {
  padding: 10px 16px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-lbl {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Nunito', sans-serif;
  width: 72px;
  flex-shrink: 0;
}

.sort-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sort-pill {
  padding: 5px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  transition: all 0.18s;
}

.pill-active {
  border-color: #39FF14;
  color: #39FF14;
  background: rgba(57, 255, 20, 0.1);
}

.zone-select {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-family: 'Nunito', sans-serif;
  padding: 6px 10px;
  outline: none;
  cursor: pointer;
}

/* ── List ── */
.lb-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.lb-inner {
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: border-color 0.2s;
}

.row-gold   { border-color: rgba(255, 215, 0, 0.5);   background: rgba(255, 215, 0, 0.07); }
.row-silver { border-color: rgba(192, 192, 192, 0.4);  background: rgba(192, 192, 192, 0.05); }
.row-bronze { border-color: rgba(205, 127, 50, 0.4);   background: rgba(205, 127, 50, 0.05); }
.row-me     { border-color: rgba(57, 255, 20, 0.5);    background: rgba(57, 255, 20, 0.07); }

.rank-cell {
  font-size: 20px;
  width: 30px;
  text-align: center;
  flex-shrink: 0;
}

.name-cell {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.player-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  font-family: 'Nunito', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.streak-badge {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 140, 0, 0.85);
  font-family: 'Nunito', sans-serif;
  white-space: nowrap;
}

.score-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.score-num {
  font-size: 15px;
  font-weight: 900;
  color: #39FF14;
  font-family: 'Nunito', sans-serif;
}

.score-unit {
  font-size: 9px;
  font-weight: 700;
  color: rgba(57, 255, 20, 0.55);
  font-family: 'Nunito', sans-serif;
  letter-spacing: 0.5px;
}

/* ── Transitions ── */
.filter-slide-enter-active,
.filter-slide-leave-active { transition: all 0.22s ease; overflow: hidden; }
.filter-slide-enter-from,
.filter-slide-leave-to     { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.filter-slide-enter-to,
.filter-slide-leave-from   { opacity: 1; max-height: 200px; }

.tab-slide-enter-active,
.tab-slide-leave-active { transition: opacity 0.18s ease; }
.tab-slide-enter-from,
.tab-slide-leave-to     { opacity: 0; }
</style>
