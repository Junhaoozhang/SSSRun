<template>
  <div class="d-flex flex-column overflow-hidden h-100" style="background:#f4f4f6">

    <!-- Header with Scope toggle + filter button -->
    <div class="d-flex align-items-center gap-2 px-3 py-2 bg-white border-bottom flex-shrink-0">
      <button class="btn btn-sm btn-light border flex-shrink-0" style="width:36px;height:36px;padding:0" @click="$router.back()" title="Atrás">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="btn-group flex-grow-1" role="group">
        <input type="radio" class="btn-check" id="scope-global" autocomplete="off"
               v-model="scope" value="global">
        <label class="btn btn-outline-success btn-sm fw-semibold" for="scope-global">🌍 Global</label>
        <input type="radio" class="btn-check" id="scope-friends" autocomplete="off"
               v-model="scope" value="friends">
        <label class="btn btn-outline-success btn-sm fw-semibold" for="scope-friends">👥 Amigos</label>
      </div>
      <button class="btn btn-sm border fw-semibold flex-shrink-0"
              :class="filterOpen ? 'btn-success text-white' : 'btn-light'"
              style="width:36px;height:36px;padding:0"
              @click="filterOpen = !filterOpen">
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
      <div v-if="filterOpen" class="bg-white border-bottom px-3 pt-3 pb-3 flex-shrink-0">
        <div class="mb-3">
          <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.8px">Ordenar</p>
          <div class="btn-group w-100" role="group">
            <input type="radio" class="btn-check" id="sort-score"  autocomplete="off" v-model="sortBy" value="score">
            <label class="btn btn-outline-success btn-sm fw-semibold" for="sort-score">⭐ Puntos</label>
            <input type="radio" class="btn-check" id="sort-food"   autocomplete="off" v-model="sortBy" value="food">
            <label class="btn btn-outline-success btn-sm fw-semibold" for="sort-food">🍎 Comida</label>
            <input type="radio" class="btn-check" id="sort-streak" autocomplete="off" v-model="sortBy" value="streak">
            <label class="btn btn-outline-success btn-sm fw-semibold" for="sort-streak">🔥 Racha</label>
          </div>
        </div>
        <div>
          <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.8px">Zona</p>
          <select class="form-select form-select-sm" v-model="zone">
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
    <div class="flex-grow-1 overflow-auto p-3">
      <Transition name="tab-slide" mode="out-in">
        <div :key="scope + sortBy" class="list-group shadow-sm">
          <div
            v-for="(entry, i) in visibleEntries"
            :key="entry.name"
            class="list-group-item d-flex align-items-center gap-3 py-2 px-3"
            :class="{
              'lb-gold':   i === 0,
              'lb-silver': i === 1,
              'lb-bronze': i === 2,
              'lb-me':     entry.name === currentName,
            }"
          >
            <!-- Rank medal / number -->
            <div class="text-center flex-shrink-0" style="width:28px">
              <template v-if="i < 3">
                <span style="font-size:20px">{{ ['🥇','🥈','🥉'][i] }}</span>
              </template>
              <span v-else class="fw-black" style="color:#aaa;font-size:13px">{{ i + 1 }}</span>
            </div>

            <!-- Avatar -->
            <div class="rounded-circle d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                 :style="{
                   width:'36px', height:'36px',
                   background: entry.color + '22',
                   color: entry.color,
                   border: '2px solid ' + entry.color,
                   fontSize: '14px'
                 }">
              {{ entry.name.charAt(0) }}
            </div>

            <!-- Name + streak -->
            <div class="flex-grow-1 min-width-0">
              <div class="fw-bold text-truncate" style="font-size:14px">{{ entry.name }}</div>
              <span class="badge fw-semibold border"
                    style="font-size:10px;background:#fff5f5;color:#e74c3c;border-color:#fcc!important">
                🔥 {{ entry.streak }}d
              </span>
            </div>

            <!-- Score -->
            <div class="text-end flex-shrink-0">
              <div class="fw-black text-success" style="font-size:15px">
                {{ displayValue(entry).toLocaleString() }}
              </div>
              <small class="text-muted">
                {{ sortBy === 'score' ? 'pts' : sortBy === 'food' ? '🍎' : 'días' }}
              </small>
            </div>
          </div>

          <div v-if="visibleEntries.length === 0"
               class="list-group-item text-center text-muted py-4">
            Sin resultados para esta zona
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
/* Medal border colors for top 3 */
.lb-gold   { border-left: 4px solid #f0d060 !important; background: #fffdf0; }
.lb-silver { border-left: 4px solid #b0b0b8 !important; }
.lb-bronze { border-left: 4px solid #c87832 !important; background: #fffaf6; }
.lb-me     { background: #f0fdf0; }

/* Transitions */
.filter-slide-enter-active, .filter-slide-leave-active { transition: all .22s ease; overflow: hidden; }
.filter-slide-enter-from, .filter-slide-leave-to { opacity: 0; max-height: 0; padding-top: 0 !important; padding-bottom: 0 !important; }
.filter-slide-enter-to, .filter-slide-leave-from { opacity: 1; max-height: 200px; }
.tab-slide-enter-active, .tab-slide-leave-active { transition: opacity .15s ease; }
.tab-slide-enter-from, .tab-slide-leave-to { opacity: 0; }
</style>

