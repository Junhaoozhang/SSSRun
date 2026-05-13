<template>
  <div class="home-view" :class="{ 'play-mode': playMode }">

    <!-- ── Top tabs: General / Grupos (hidden while friends panel is open) ── -->
    <div class="tabs" v-if="!playMode && navTab !== 'friends'">
      <div class="tab-pill-wrap">
        <button class="tab-pill" :class="{ active: tab === 'general' }" @click="tab = 'general'">
          General
        </button>
        <button class="tab-pill" :class="{ active: tab === 'groups' }" @click="tab = 'groups'">
          Grupos
        </button>
      </div>
    </div>

    <!-- ── Map area ── -->
    <div class="map-content">
      <div ref="mapRef" class="map" />

      <!-- Danger flash overlay (near collision) -->
      <div v-if="dangerLevel" class="danger-flash" :class="dangerLevel" />

      <!-- Pause overlay (play mode) -->
      <button v-if="playMode && !paused" class="pause-btn" @click="paused = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
      </button>

      <!-- Pause menu overlay -->
      <Transition name="fade">
        <div v-if="paused" class="pause-overlay">
          <div class="pause-card">
            <div class="pause-title">En pausa</div>
            <div class="pause-stats">
              <div class="stat-row">
                <span class="stat-label">Distancia</span>
                <span class="stat-val">{{ statsKm }} km</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Velocidad media</span>
                <span class="stat-val">{{ statsSpeed }} km/h</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Manzanas comidas</span>
                <span class="stat-val">🍎 {{ statsApples }}</span>
              </div>
            </div>
            <button class="pause-action continue" @click="paused = false">▶ Continuar</button>
            <button class="pause-action finish" @click="finishRun">🏁 Acabar recorrido</button>
          </div>
        </div>
      </Transition>

      <!-- Summary overlay (after finishing) -->
      <Transition name="fade">
        <div v-if="showSummary" class="pause-overlay">
          <div class="pause-card">
            <div class="pause-title">🏁 Recorrido completado</div>
            <div class="pause-stats">
              <div class="stat-row">
                <span class="stat-label">Distancia</span>
                <span class="stat-val">{{ statsKm }} km</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Velocidad media</span>
                <span class="stat-val">{{ statsSpeed }} km/h</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Manzanas comidas</span>
                <span class="stat-val">🍎 {{ statsApples }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Tiempo</span>
                <span class="stat-val">{{ statsTime }}</span>
              </div>
            </div>
            <button class="pause-action continue" @click="closeSummary">✓ Aceptar</button>
          </div>
        </div>
      </Transition>

      <!-- Friends + Groups panel (slides in from nav "Amigos" button) -->
      <div class="side-panel" :class="{ visible: navTab === 'friends' && !playMode }">
        <!-- Nav tabs: Amigos / Grupos -->
        <div class="bg-white border-bottom flex-shrink-0">
          <ul class="nav nav-tabs px-3 pt-2 border-0">
            <li class="nav-item flex-fill text-center">
              <button class="nav-link w-100 fw-bold border-0"
                      :class="{ active: friendTab === 'amigos' }"
                      @click="friendTab = 'amigos'">Amigos</button>
            </li>
            <li class="nav-item flex-fill text-center">
              <button class="nav-link w-100 fw-bold border-0"
                      :class="{ active: friendTab === 'grupos' }"
                      @click="friendTab = 'grupos'">Grupos</button>
            </li>
          </ul>
        </div>

        <!-- Amigos list -->
        <div v-if="friendTab === 'amigos'" class="overflow-auto flex-grow-1 p-3">
          <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.8px">
            Amigos ({{ sortedFriends.length }})
          </p>
          <div class="list-group mb-4">
            <div v-for="f in sortedFriends" :key="f.id"
                 class="list-group-item d-flex align-items-center gap-3 py-2 px-3">
              <div class="position-relative flex-shrink-0">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-black"
                     :style="{ width:'40px', height:'40px', background: f.color+'18', border:'2.5px solid '+f.color, color:f.color, fontSize:'16px' }">
                  {{ f.name.charAt(0) }}
                </div>
                <span class="position-absolute rounded-circle border border-2 border-white"
                      :style="{ width:'11px', height:'11px', background: f.isOnline ? '#2ecc71' : '#ccc', bottom:0, right:0, display:'block' }"></span>
              </div>
              <div class="flex-grow-1 min-width-0">
                <div class="fw-bold text-truncate" style="font-size:14px">{{ f.name }}</div>
                <small class="text-muted">Nv.{{ f.level }} ·
                  <span :style="{ color: f.isOnline ? '#2ecc71' : '#bbb' }">
                    {{ f.isOnline ? '● Jugando' : '○ Offline' }}
                  </span>
                </small>
              </div>
              <span class="badge border fw-semibold flex-shrink-0"
                    style="background:#f4f4f6;color:#444;font-size:11px">🍎 {{ f.food }}</span>
              <button class="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style="width:28px;height:28px;font-size:11px;padding:0"
                      @click="removeFriend(f.id)" title="Eliminar amigo">✕</button>
            </div>
          </div>

          <p class="text-uppercase fw-bold mb-2 mt-1" style="font-size:10px;color:#aaa;letter-spacing:.8px">
            Añadir amigos
          </p>
          <div class="list-group">
            <div v-for="f in nonFriends" :key="'nf-'+f.id"
                 class="list-group-item d-flex align-items-center gap-3 py-2 px-3"
                 style="opacity:.85">
              <div class="rounded-circle d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                   :style="{ width:'40px', height:'40px', background: f.color+'18', border:'2.5px solid '+f.color, color:f.color, fontSize:'16px' }">
                {{ f.name.charAt(0) }}
              </div>
              <div class="flex-grow-1 min-width-0">
                <div class="fw-bold text-truncate" style="font-size:14px">{{ f.name }}</div>
                <small class="text-muted">Nv.{{ f.level }}</small>
              </div>
              <button class="btn btn-sm btn-outline-success rounded-pill fw-bold flex-shrink-0"
                      @click="addFriend(f.id)">+ Añadir</button>
            </div>
          </div>
          <p v-if="nonFriends.length === 0" class="text-center text-muted py-3 small">
            ¡Ya sigues a todos!
          </p>
        </div>

        <!-- Grupos list -->
        <div v-if="friendTab === 'grupos'" class="overflow-auto flex-grow-1 p-3 pb-4">

          <!-- ── Group management detail ── -->
          <template v-if="managingGroup">
            <button class="btn btn-link p-0 fw-bold text-success mb-3 text-decoration-none"
                    @click="managingGroup = null">← Volver</button>
            <div class="card rounded-4 border mb-3">
              <div class="card-body d-flex align-items-center gap-3 py-3">
                <span style="font-size:30px">{{ managingGroup.emoji }}</span>
                <div>
                  <div class="fw-black" style="font-size:16px">{{ managingGroup.name }}</div>
                  <small class="text-muted">
                    {{ groupMemberCount(managingGroup.id) }} miembro{{ groupMemberCount(managingGroup.id) !== 1 ? 's' : '' }}
                  </small>
                </div>
              </div>
            </div>

            <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.8px">Miembros</p>
            <p v-if="groupMembers(managingGroup.id).length === 0"
               class="text-center text-muted small py-2">Sin miembros aún</p>
            <div class="list-group mb-3">
              <div v-for="p in groupMembers(managingGroup.id)" :key="'gm-'+p.id"
                   class="list-group-item d-flex align-items-center gap-3 py-2 px-3">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                     :style="{ width:'36px', height:'36px', background: p.color+'18', border:'2px solid '+p.color, color:p.color, fontSize:'14px' }">
                  {{ p.name.charAt(0) }}
                </div>
                <div class="fw-semibold flex-grow-1 text-truncate" style="font-size:14px">{{ p.name }}</div>
                <small class="text-muted flex-shrink-0">Nv.{{ p.level }}</small>
                <button class="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style="width:28px;height:28px;font-size:11px;padding:0"
                        @click="removeMemberFromGroup(managingGroup.id, p.id)">✕</button>
              </div>
            </div>

            <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.8px">Añadir miembros</p>
            <p v-if="nonGroupMembers(managingGroup.id).length === 0"
               class="text-center text-muted small py-2">Ya están todos</p>
            <div class="list-group mb-3">
              <div v-for="p in nonGroupMembers(managingGroup.id)" :key="'ngm-'+p.id"
                   class="list-group-item d-flex align-items-center gap-3 py-2 px-3"
                   style="opacity:.85">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                     :style="{ width:'36px', height:'36px', background: p.color+'18', border:'2px solid '+p.color, color:p.color, fontSize:'14px' }">
                  {{ p.name.charAt(0) }}
                </div>
                <div class="fw-semibold flex-grow-1 text-truncate" style="font-size:14px">{{ p.name }}</div>
                <small class="text-muted flex-shrink-0">Nv.{{ p.level }}</small>
                <button class="btn btn-sm btn-outline-success rounded-pill fw-bold flex-shrink-0"
                        @click="addMemberToGroup(managingGroup.id, p.id)">+ Añadir</button>
              </div>
            </div>

            <button class="btn btn-outline-danger w-100 rounded-3 fw-bold py-3 mt-2"
                    @click="toggleJoin(managingGroup.id); managingGroup = null">
              Salir del grupo
            </button>
          </template>

          <!-- ── Groups list ── -->
          <template v-else>
            <button v-if="!showCreateGroup"
                    class="btn w-100 fw-bold rounded-3 mb-3 py-3"
                    style="border:1.5px dashed #2a9e2a;background:#f0fdf0;color:#2a9e2a"
                    @click="showCreateGroup = true">+ Crear grupo</button>

            <!-- Create group form -->
            <div v-else class="card rounded-4 border mb-3">
              <div class="card-body p-3">
                <p class="fw-bold mb-3">Nuevo grupo</p>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <button v-for="e in GROUP_EMOJIS" :key="e"
                          class="btn btn-sm rounded-3 p-1"
                          :class="newGroupEmoji === e ? 'btn-success' : 'btn-light border'"
                          style="width:36px;height:36px;font-size:17px"
                          @click="newGroupEmoji = e">{{ e }}</button>
                </div>
                <input v-model="newGroupName" class="form-control mb-3"
                       placeholder="Nombre del grupo" maxlength="24" />
                <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.7px">
                  Invitar jugadores
                </p>
                <div class="border rounded-3 overflow-hidden mb-3" style="max-height:180px;overflow-y:auto!important">
                  <button v-for="p in ALL_PLAYERS" :key="'cgm-'+p.id"
                          class="w-100 d-flex align-items-center gap-3 px-3 py-2 border-0 text-start"
                          :class="newGroupMemberIds.has(p.id) ? 'bg-success bg-opacity-10' : 'bg-white'"
                          @click="toggleNewMember(p.id)">
                    <div class="rounded-circle d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                         :style="{ width:'30px', height:'30px', background: p.color+'22', border:'2px solid '+p.color, color:p.color, fontSize:'13px' }">
                      {{ p.name.charAt(0) }}
                    </div>
                    <span class="flex-grow-1 fw-semibold" style="font-size:13px">{{ p.name }}</span>
                    <span class="fw-black text-success" style="width:16px">{{ newGroupMemberIds.has(p.id) ? '✓' : '' }}</span>
                  </button>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-light border flex-fill fw-semibold" @click="cancelCreateGroup">Cancelar</button>
                  <button class="btn btn-success flex-fill fw-bold"
                          :disabled="!newGroupName.trim()" @click="submitCreateGroup">Crear</button>
                </div>
              </div>
            </div>

            <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.8px">
              Todos los grupos
            </p>
            <div class="list-group">
              <div v-for="g in groups" :key="g.id"
                   class="list-group-item d-flex align-items-center gap-3 py-2 px-3">
                <span style="font-size:24px;flex-shrink:0">{{ g.emoji }}</span>
                <div class="flex-grow-1 min-width-0">
                  <div class="fw-bold text-truncate" style="font-size:14px">{{ g.name }}</div>
                  <small class="text-muted">
                    👥 {{ groupMemberCount(g.id) || g.members }} ·
                    <span :class="g.activeNow > 0 ? 'text-success fw-semibold' : ''">
                      {{ g.activeNow > 0 ? `● ${g.activeNow} activos` : '○ inactivo' }}
                    </span>
                  </small>
                </div>
                <button v-if="g.joined"
                        class="btn btn-sm btn-outline-success rounded-pill fw-bold flex-shrink-0"
                        @click="managingGroup = g">Gestionar</button>
                <button v-else
                        class="btn btn-sm btn-success rounded-pill fw-bold flex-shrink-0"
                        @click="toggleJoin(g.id)">Unirse</button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Groups tab: select group to filter map -->
      <div class="side-panel" :class="{ visible: tab === 'groups' && !playMode }">
        <div class="overflow-auto p-3">
          <p class="text-uppercase fw-bold mb-2" style="font-size:10px;color:#aaa;letter-spacing:.8px">
            Filtrar por grupo
          </p>
          <div class="list-group">
            <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 fw-semibold"
                    :class="{ active: activeGroupFilter === null }"
                    @click="activeGroupFilter = null; tab = 'general'">
              <span style="font-size:20px">🌍</span>
              <span>Todos (General)</span>
            </button>
            <button v-for="g in joinedGroups" :key="g.id"
                    class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 fw-semibold"
                    :class="{ active: activeGroupFilter === g.id }"
                    @click="activeGroupFilter = g.id; tab = 'general'">
              <span style="font-size:20px">{{ g.emoji }}</span>
              <span class="flex-grow-1">{{ g.name }}</span>
              <span class="badge border" style="background:#f4f4f6;color:#888;font-size:10px">
                {{ g.members }} miembros
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { GetGroupsUseCase }  from '@/application/usecases/GetGroupsUseCase.js'
import L from 'leaflet'

// ── Injected from App.vue ──────────────────────────────────────────────
const playMode = inject('playMode', ref(false))
const navTab   = inject('navTab',   ref('map'))

// ── Local tab (top pill: General / Grupos) ─────────────────────────────
const tab       = ref('general')
const friendTab = ref('amigos')  // tab inside the friends panel

// ── Pause / summary state ──────────────────────────────────────────────
const paused      = ref(false)
const showSummary = ref(false)
const statsApples = ref(0)
const statsKm     = ref('0.00')
const statsSpeed  = ref('0.0')
const statsTime   = ref('0:00')

let runStartTime  = null
let runDistKm     = 0
let totalPtsWalked = 0

function finishRun () {
  paused.value      = false
  showSummary.value = true
  playMode.value    = false
}
function closeSummary () {
  showSummary.value = false
  statsApples.value = 0
  runDistKm         = 0
  totalPtsWalked    = 0
}

// ── Data ───────────────────────────────────────────────────────────────
// Full pool of potential players (friends + non-friends)
const ALL_PLAYERS = [
  { id: 1, name: 'Jiajun',      level: 6,  score: 98000,  streak: 3,  color: '#FF6B35', isOnline: true,  food: 312, speed: 4.2 },
  { id: 2, name: 'Alicia',      level: 8,  score: 110000, streak: 5,  color: '#00D4FF', isOnline: true,  food: 289, speed: 5.1 },
  { id: 3, name: 'SpeedMaster', level: 12, score: 152000, streak: 14, color: '#FFD700', isOnline: false, food: 520, speed: 6.3 },
  { id: 4, name: 'GreenMamba',  level: 4,  score: 51000,  streak: 1,  color: '#7FFF00', isOnline: false, food: 198, speed: 3.9 },
  { id: 5, name: 'RunnerX',     level: 5,  score: 75000,  streak: 2,  color: '#FF69B4', isOnline: true,  food: 145, speed: 4.7 },
  { id: 6, name: 'FastFoot',    level: 9,  score: 62000,  streak: 8,  color: '#9B59B6', isOnline: false, food: 404, speed: 5.8 },
  { id: 7, name: 'SnakeKing',   level: 11, score: 118000, streak: 21, color: '#E74C3C', isOnline: true,  food: 390, speed: 5.5 },
  { id: 8, name: 'Sprinter99',  level: 3,  score: 43000,  streak: 4,  color: '#3498DB', isOnline: false, food: 88,  speed: 3.2 },
  { id: 9, name: 'MilesAhead',  level: 7,  score: 38000,  streak: 6,  color: '#1ABC9C', isOnline: true,  food: 210, speed: 4.0 },
]
const friendIds = ref(new Set([1, 2, 3, 4, 5, 6]))

const friends = computed(() => ALL_PLAYERS.filter(p => friendIds.value.has(p.id)))
const nonFriends = computed(() => ALL_PLAYERS.filter(p => !friendIds.value.has(p.id)))

const sortedFriends = computed(() =>
  [...friends.value].sort((a, b) => (a.isOnline ? 0 : 1) - (b.isOnline ? 0 : 1))
)

function removeFriend (id) {
  const s = new Set(friendIds.value)
  s.delete(id)
  friendIds.value = s
}
function addFriend (id) {
  const s = new Set(friendIds.value)
  s.add(id)
  friendIds.value = s
}

const groups  = ref(GetGroupsUseCase.execute())
const joinedGroups = computed(() => groups.value.filter(g => g.joined))

// ── Per-group member tracking ──────────────────────────────────────────
// Map<groupId, Set<playerId>>
const groupMemberMap = ref(new Map([
  [1, new Set([1, 5])],
  [2, new Set([1, 2, 4])],
  [3, new Set([3, 7])],
  [4, new Set([6])],
  [5, new Set([2, 5, 7])],
]))

function groupMemberCount (groupId) {
  return groupMemberMap.value.get(groupId)?.size ?? 0
}
function groupMembers (groupId) {
  const ids = groupMemberMap.value.get(groupId) ?? new Set()
  return ALL_PLAYERS.filter(p => ids.has(p.id))
}
function nonGroupMembers (groupId) {
  const ids = groupMemberMap.value.get(groupId) ?? new Set()
  return ALL_PLAYERS.filter(p => !ids.has(p.id))
}
function addMemberToGroup (groupId, playerId) {
  const map = new Map(groupMemberMap.value)
  const s = new Set(map.get(groupId) ?? [])
  s.add(playerId)
  map.set(groupId, s)
  groupMemberMap.value = map
}
function removeMemberFromGroup (groupId, playerId) {
  const map = new Map(groupMemberMap.value)
  const s = new Set(map.get(groupId) ?? [])
  s.delete(playerId)
  map.set(groupId, s)
  groupMemberMap.value = map
}

// ── Create group ───────────────────────────────────────────────────────
const GROUP_EMOJIS = ['🏃','🐍','⚡','🌙','🏫','🏘️','🔥','🏆','🚀','💪','🌿','🎯']
const showCreateGroup  = ref(false)
const newGroupName     = ref('')
const newGroupEmoji    = ref('🏃')
const newGroupMemberIds = ref(new Set())
const managingGroup    = ref(null)

function toggleNewMember (id) {
  const s = new Set(newGroupMemberIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  newGroupMemberIds.value = s
}
function cancelCreateGroup () {
  showCreateGroup.value = false
  newGroupName.value = ''
  newGroupEmoji.value = '🏃'
  newGroupMemberIds.value = new Set()
}
function submitCreateGroup () {
  if (!newGroupName.value.trim()) return
  groups.value = GetGroupsUseCase.create({ name: newGroupName.value.trim(), emoji: newGroupEmoji.value })
  const newId = groups.value[groups.value.length - 1].id
  const map = new Map(groupMemberMap.value)
  map.set(newId, new Set(newGroupMemberIds.value))
  groupMemberMap.value = map
  cancelCreateGroup()
}

const activeGroupFilter = ref(null)

function toggleJoin (id) {
  GetGroupsUseCase.toggleJoin(id)
  groups.value = GetGroupsUseCase.execute()
}

// ── Map ────────────────────────────────────────────────────────────────
const mapRef = ref(null)
let leafletMap   = null
let playerStates = []

// ── Reactive food ──────────────────────────────────────────────────────
const FOOD_COORDS = [
  [41.3861, 2.1651], [41.3882, 2.1665], [41.3903, 2.1651],
  [41.3882, 2.1594], [41.3861, 2.1700], [41.3930, 2.1651],
  [41.3861, 2.1565], [41.3882, 2.1724], [41.3892, 2.1650],
  [41.3870, 2.1665], [41.3903, 2.1680], [41.3917, 2.1594],
  [41.3875, 2.1620], [41.3895, 2.1710], [41.3850, 2.1680],
]
const foods = []  // { lat, lng, marker, eaten }

function spawnFood (lat, lng) {
  const html = `<div style="font-size:18px;line-height:1;filter:drop-shadow(0 1px 4px rgba(0,0,0,.3))">🍎</div>`
  const marker = L.marker([lat, lng], {
    icon: L.divIcon({ html, className: '', iconSize: [20,20], iconAnchor: [10,10] }),
    zIndexOffset: 50,
  }).addTo(leafletMap)
  return { lat, lng, marker, eaten: false }
}

// ── Player defs ────────────────────────────────────────────────────────
// groupIds: groups this player belongs to (matches backend groups.js ids)
const PLAYER_DEFS = [
  { name: 'Jiajun', color: '#E67E22', phase: 0.00, groupIds: [2],
    wpts: [[41.3861,2.1651],[41.3882,2.1651],[41.3882,2.1665],[41.3861,2.1665]] },
  { name: 'Alicia', color: '#2980B9', phase: 0.25, groupIds: [2, 1],
    wpts: [[41.3882,2.1594],[41.3882,2.1651],[41.3903,2.1651],[41.3903,2.1594]] },
  { name: 'Carlos', color: '#E74C3C', phase: 0.50, groupIds: [1, 3],
    wpts: [[41.3861,2.1700],[41.3882,2.1700],[41.3882,2.1724],[41.3861,2.1724]] },
  { name: 'María',  color: '#8E44AD', phase: 0.70, groupIds: [1],
    wpts: [[41.3903,2.1651],[41.3930,2.1651],[41.3930,2.1680],[41.3903,2.1680]] },
  { name: 'Pau',    color: '#16A085', phase: 0.10, groupIds: [3],
    wpts: [[41.3861,2.1565],[41.3882,2.1565],[41.3882,2.1594],[41.3861,2.1594]] },
]

async function fetchStreetRoute (wpts) {
  const loop   = [...wpts, wpts[0]]
  const coords = loop.map(([la, ln]) => `${ln},${la}`).join(';')
  try {
    const res  = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(7000) }
    )
    const json = await res.json()
    if (json.code === 'Ok' && json.routes?.[0])
      return json.routes[0].geometry.coordinates.map(([ln, la]) => [la, ln])
  } catch { /* fallback */ }
  const pts = []
  for (let i = 0; i < wpts.length; i++) {
    const a = wpts[i], b = wpts[(i+1) % wpts.length]
    for (let t = 0; t < 80; t++) {
      const u = t / 80
      pts.push([a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u])
    }
  }
  return pts
}

// Check if a lat/lng is within ~12m of a trail point
function nearTrail (lat, lng, trail) {
  const R  = 6371000
  const tl = (Math.PI / 180)
  for (const [tla, tln] of trail) {
    const dlat = (lat - tla) * tl
    const dlng = (lng - tln) * tl * Math.cos(lat * tl)
    if (Math.sqrt(dlat*dlat + dlng*dlng) * R < 12) return true
  }
  return false
}

let walkInterval = null
const WALK_SPEED = 1500   // ms per step → visually ~5 min/km pace
const STEP_KM    = 0.005  // km per step: 0.005 * (3600/1.5) = 12 km/h ≈ 5 min/km

// ── Danger alert ───────────────────────────────────────────────
const dangerLevel = ref('')   // '' | 'low' | 'med' | 'high'
let lastDangerBeep = 0
let audioCtx = null

function playDangerBeep (volume = 0.25, freq = 880) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain); gain.connect(audioCtx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)
    osc.start(); osc.stop(audioCtx.currentTime + 0.3)
  } catch (e) { /* AudioContext may need user gesture */ }
}

function checkDanger (la, ln) {
  const R  = 6371000
  const tl = Math.PI / 180
  let minDist = Infinity
  let hitState = null

  for (const s of playerStates) {
    for (const [tla, tln] of s.trail) {
      const dlat = (la - tla) * tl
      const dlng = (ln - tln) * tl * Math.cos(la * tl)
      const d = Math.sqrt(dlat * dlat + dlng * dlng) * R
      if (d < minDist) { minDist = d; hitState = s }
    }
  }

  // Collision: shorten the hit snake's tail + suppress beeping
  if (minDist < 8 && hitState) {
    hitState.tailLen = Math.max(5, hitState.tailLen - 3)
    dangerLevel.value = 'high'
    lastDangerBeep = Date.now() + 2000  // silence beeps for 2s after collision
    return
  }

  // Progressive proximity alert
  let level = ''
  let beepVol = 0; let beepFreq = 880
  if (minDist < 15)      { level = 'high'; beepVol = 0.55; beepFreq = 960 }
  else if (minDist < 30) { level = 'med';  beepVol = 0.30; beepFreq = 880 }
  else if (minDist < 50) { level = 'low';  beepVol = 0.12; beepFreq = 780 }

  dangerLevel.value = level

  // Cooldown between beeps scales with danger level
  const cooldown = level === 'high' ? 600 : level === 'med' ? 1200 : 2000
  const now = Date.now()
  if (level && now - lastDangerBeep > cooldown) {
    lastDangerBeep = now
    playDangerBeep(beepVol, beepFreq)
  }
}

// ── Group filter watcher ───────────────────────────────────────────────
watch(activeGroupFilter, (gid) => {
  playerStates.forEach(s => {
    const visible = gid === null || s.groupIds.includes(gid)
    if (visible) {
      if (!leafletMap.hasLayer(s.marker)) s.marker.addTo(leafletMap)
      if (!leafletMap.hasLayer(s.poly))   s.poly.addTo(leafletMap)
    } else {
      if (leafletMap.hasLayer(s.marker)) s.marker.remove()
      if (leafletMap.hasLayer(s.poly))   s.poly.remove()
    }
  })
})

const USER_WPTS = [[41.3892,2.1637],[41.3870,2.1637],[41.3870,2.1665],[41.3892,2.1665]]
let userRoutePts = []
let userState    = null
let userInterval = null
let resizeTimeout = null

function onMapResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    leafletMap?.invalidateSize()
  }, 100)
}

async function initMap () {
  leafletMap = L.map(mapRef.value, {
    center: [41.3892, 2.1651], zoom: 16,
    zoomControl: false, attributionControl: true,
  })
  L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  {
    attribution: '© OSM, © CARTO',
    maxZoom: 19,
  }
).addTo(leafletMap)

  const allFetched = await Promise.all([
    ...PLAYER_DEFS.map(p => fetchStreetRoute(p.wpts)),
    fetchStreetRoute(USER_WPTS),
  ])
  userRoutePts = allFetched[allFetched.length - 1]
  const routes = allFetched.slice(0, PLAYER_DEFS.length)

  playerStates = PLAYER_DEFS.map((p, i) => {
    const finePts  = routes[i]
    const startIdx = Math.floor(p.phase * finePts.length) % finePts.length
    const [lat, lng] = finePts[startIdx]

    const headHtml = `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${p.color};border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;font-weight:900;color:#fff;
      box-shadow:0 0 0 5px ${p.color}44,0 3px 12px rgba(0,0,0,.32);
      font-family:Inter,sans-serif;
    ">${p.name[0]}</div>`

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ html: headHtml, className: '', iconSize: [32,32], iconAnchor: [16,16] }),
      zIndexOffset: 100,
    }).addTo(leafletMap)
    marker.bindTooltip(`<b>${p.name}</b>`, { direction: 'top', offset: [0,-20] })

    const poly = L.polyline([[lat, lng]], {
      color: p.color, weight: 8, opacity: 0.8,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(leafletMap)

    return { marker, poly, finePts, ptIdx: startIdx, trail: [[lat, lng]], tailLen: 25, groupIds: p.groupIds }
  })

  // Spawn food
  FOOD_COORDS.forEach(([la, ln]) => foods.push(spawnFood(la, ln)))

  walkInterval = setInterval(() => {
    if (paused.value) return
    playerStates.forEach(s => {
      s.ptIdx = (s.ptIdx + 1) % s.finePts.length
      const [lat, lng] = s.finePts[s.ptIdx]
      s.marker.setLatLng([lat, lng])
      s.trail.push([lat, lng])
      if (s.trail.length > s.tailLen) s.trail.shift()
      s.poly.setLatLngs(s.trail)

      // Check food collision
      foods.forEach(f => {
        if (f.eaten) return
        if (nearTrail(f.lat, f.lng, [[lat, lng]])) {
          f.eaten = true
          f.marker.remove()
          s.tailLen = Math.min(s.tailLen + 6, 60)
          // Respawn this food at its original position after 8s
          setTimeout(() => {
            f.eaten = false
            f.marker = spawnFood(f.lat, f.lng).marker
          }, 8000)
        }
      })
    })
  }, WALK_SPEED)
}

// ── User snake ─────────────────────────────────────────────────────────
watch(playMode, (on) => {
  // Leaflet needs to recalculate its size when the container changes
  setTimeout(() => leafletMap?.invalidateSize(), 50)
  if (on) {
    if (!userRoutePts.length || !leafletMap) return
    runStartTime   = Date.now()
    runDistKm      = 0
    totalPtsWalked = 0
    statsApples.value = 0
    paused.value   = false

    const [lat, lng] = userRoutePts[0]
    const headHtml = `<div style="
      width:36px;height:36px;border-radius:50%;
      background:#2a9e2a;border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:900;color:#fff;
      box-shadow:0 0 0 6px #2a9e2a44,0 3px 14px rgba(0,0,0,.32);
      font-family:Inter,sans-serif;
    ">Tú</div>`
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ html: headHtml, className: '', iconSize: [36,36], iconAnchor: [18,18] }),
      zIndexOffset: 200,
    }).addTo(leafletMap)
    marker.bindTooltip('<b>Tú</b>', { direction: 'top', offset: [0,-22], permanent: true })
    const poly = L.polyline([[lat, lng]], {
      color: '#2a9e2a', weight: 9, opacity: 0.9,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(leafletMap)
    userState = { marker, poly, ptIdx: 0, trail: [[lat, lng]], tailLen: 20 }

    userInterval = setInterval(() => {
      if (paused.value) return
      userState.ptIdx = (userState.ptIdx + 1) % userRoutePts.length
      const [la, ln] = userRoutePts[userState.ptIdx]
      userState.marker.setLatLng([la, ln])
      userState.trail.push([la, ln])
      if (userState.trail.length > userState.tailLen) userState.trail.shift()
      userState.poly.setLatLngs(userState.trail)
      leafletMap?.panTo([la, ln], { animate: true, duration: 0.22 })

      // Fixed-step distance accumulation → realistic pace (~5 km/h)
      runDistKm += STEP_KM
      totalPtsWalked++

      // Stats
      statsKm.value    = runDistKm.toFixed(2)
      const elapsedH   = (Date.now() - runStartTime) / 3600000
      statsSpeed.value = elapsedH > 0 ? Math.min(runDistKm / elapsedH, 25).toFixed(1) : '0.0'

      // Near-collision danger check
      checkDanger(la, ln)
      const elapsedS   = Math.floor((Date.now() - runStartTime) / 1000)
      const mm         = Math.floor(elapsedS / 60)
      const ss         = String(elapsedS % 60).padStart(2, '0')
      statsTime.value  = `${mm}:${ss}`

      // Food collision for user
      foods.forEach(f => {
        if (f.eaten) return
        if (nearTrail(f.lat, f.lng, [[la, ln]])) {
          f.eaten = true
          f.marker.remove()
          statsApples.value++
          userState.tailLen = Math.min(userState.tailLen + 6, 80)
          setTimeout(() => {
            f.eaten  = false
            f.marker = spawnFood(f.lat, f.lng).marker
          }, 8000)
        }
      })
    }, WALK_SPEED)
  } else {
    clearInterval(userInterval)
    userInterval = null
    if (userState) {
      userState.marker.remove()
      userState.poly.remove()
      userState = null
    }
  }
})

onMounted(async () => {
  await initMap()
  window.addEventListener('resize', onMapResize)
})

onUnmounted(() => {
  clearInterval(walkInterval)
  clearInterval(userInterval)
  window.removeEventListener('resize', onMapResize)
  if (resizeTimeout) clearTimeout(resizeTimeout)
  if (userState) { userState.marker.remove(); userState.poly.remove() }
  foods.forEach(f => { if (!f.eaten) f.marker.remove() })
  leafletMap?.remove()
})
</script>

<style scoped>
.home-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: #fff;
}

/* ── Danger flash ── */
.danger-flash {
  position: absolute;
  inset: 0;
  z-index: 35;
  pointer-events: none;
  border-radius: 4px;
  transition: background .1s, border-color .1s;
}
.danger-flash.low  {
  background: rgba(220,50,50,.10);
  border: 3px solid rgba(220,50,50,.30);
}
.danger-flash.med  {
  background: rgba(220,50,50,.22);
  border: 4px solid rgba(220,50,50,.55);
}
.danger-flash.high {
  background: rgba(220,50,50,.38);
  border: 5px solid rgba(220,50,50,.80);
  animation: pulse-danger .35s ease-out;
}
@keyframes pulse-danger {
  0%   { background: rgba(220,50,50,.60); }
  100% { background: rgba(220,50,50,.38); }
}

/* ── Tabs ── */
.tabs {
  flex-shrink: 0;
  padding: 8px 18px 10px;
  background: #fff;
  border-bottom: 1px solid #f0f0f3;
}
.tab-pill-wrap {
  display: flex;
  background: #f2f2f5;
  border-radius: 10px;
  padding: 3px;
}
.tab-pill {
  flex: 1;
  padding: 7px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background .2s, color .2s, box-shadow .2s;
}
.tab-pill.active {
  background: #fff;
  color: #111;
  box-shadow: 0 1px 4px rgba(0,0,0,.13);
}

/* ── Map content ── */
.map-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
.map {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ── Play mode fullscreen ── */
.home-view.play-mode {
  position: fixed;
  inset: 0;
  z-index: 500;
}
.play-mode .tabs { display: none; }
.play-mode .side-panel { transform: translateX(100%) !important; }

/* ── Pause button ── */
.pause-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 30;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border: none;
  box-shadow: 0 2px 16px rgba(0,0,0,.18);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
}
.pause-btn svg { width: 22px; height: 22px; }
.pause-btn:active { transform: scale(.91); }

/* ── Pause / summary overlay ── */
.pause-overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pause-card {
  background: #fff;
  border-radius: 22px;
  padding: 28px 24px 20px;
  width: 88%;
  max-width: 340px;
  box-shadow: 0 8px 48px rgba(0,0,0,.22);
}
.pause-title {
  font-size: 20px;
  font-weight: 800;
  color: #111;
  margin-bottom: 20px;
  text-align: center;
}
.pause-stats {
  border-radius: 12px;
  background: #f4f4f6;
  padding: 12px 16px;
  margin-bottom: 18px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid #eee;
}
.stat-row:last-child { border-bottom: none; }
.stat-label { font-size: 13px; color: #888; font-weight: 500; }
.stat-val   { font-size: 15px; color: #111; font-weight: 700; }
.pause-action {
  display: block;
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  margin-top: 10px;
  transition: opacity .15s;
}
.pause-action:active { opacity: .8; }
.pause-action.continue { background: #2a9e2a; color: #fff; }
.pause-action.finish   { background: #f4f4f6; color: #555; }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

/* ── Friends panel tabs: override Bootstrap nav-link active color ── */
.nav-tabs .nav-link.active { color: #2a9e2a !important; border-bottom-color: #2a9e2a !important; }
.nav-tabs .nav-link { color: #888; font-size: 14px; }

/* ── Side panels (friends / groups filter) ── */
.side-panel {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(250,250,252,.97);
  backdrop-filter: blur(18px);
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  transform: translateX(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.side-panel.visible { transform: translateX(0); }
</style>
