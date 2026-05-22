<template>
  <div class="home-view">

    <!-- ������ Map area (always visible, always general view) ������ -->
    <div class="map-content">
      <div ref="mapRef" class="map" />

      <!-- Danger flash overlay -->
      <div v-if="dangerLevel && playMode" class="danger-flash" :class="dangerLevel">
        <div class="danger-label">��� Estela aprop!</div>
      </div>

      <!-- Pause overlay (play mode) -->
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
                <span class="stat-val">���� {{ statsApples }}</span>
              </div>
            </div>
            <button class="pause-action continue" @click="paused = false">��� Continuar</button>
            <button class="pause-action finish" @click="finishRun">���� Acabar recorrido</button>
          </div>
        </div>
      </Transition>

      <!-- Summary overlay -->
      <Transition name="fade">
        <div v-if="showSummary" class="pause-overlay">
          <div class="pause-card">
            <div class="pause-title">���� Recorrido completado</div>
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
                <span class="stat-val">���� {{ statsApples }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Tiempo</span>
                <span class="stat-val">{{ statsTime }}</span>
              </div>
              <div class="stat-row stat-row-pts">
                <span class="stat-label">Puntos ganados</span>
                <span class="stat-val stat-pts">+{{ statsPoints.toLocaleString() }} pts</span>
              </div>
            </div>
            <button class="pause-action continue" @click="closeSummary">ԣ� Aceptar</button>
          </div>
        </div>
      </Transition>

      <!-- Group picker modal (before starting) -->
      <Transition name="fade">
        <div v-if="showGroupPicker" class="picker-overlay" @click.self="showGroupPicker = false">
          <div class="picker-sheet">
            <div class="picker-title">-+Con quien juegas?</div>
            <button class="picker-option" @click="startPlay(null)">
              <span>General</span>
            </button>
            <button
              v-for="g in joinedGroups"
              :key="g.id"
              class="picker-option"
              @click="startPlay(g.id)"
            >
              <span class="picker-emoji">{{ g.emoji }}</span>
              <span>{{ g.name }}</span>
            </button>
            <button class="picker-cancel" @click="showGroupPicker = false">Cancelar</button>
          </div>
        </div>
      </Transition>

      <!-- Friends panel -->
      <div class="side-panel" :class="{ visible: navTab === 'friends' && !playMode }">
        <!-- Panel header with back button -->
        <div class="panel-header">
          <button class="panel-back-btn" @click="navTab = 'map'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="panel-tabs">
            <button class="panel-tab" :class="{ active: friendTab === 'amigos' }" @click="friendTab = 'amigos'">Amigos</button>
            <button class="panel-tab" :class="{ active: friendTab === 'grupos' }" @click="friendTab = 'grupos'">Grupos</button>
          </div>
        </div>

        <!-- Amigos list -->
        <div v-if="friendTab === 'amigos'" class="panel-body">
          <p class="section-label">Amigos ({{ sortedFriends.length }})</p>
          <div class="player-list">
            <div v-for="f in sortedFriends" :key="f.id" class="player-row">
              <div class="avatar" :style="{ background: f.color + '18', border: '2px solid ' + f.color, color: f.color }">
                {{ f.name.charAt(0) }}
              </div>
              <div class="player-info">
                <div class="player-name">{{ f.name }}</div>
                <div class="player-sub" :style="{ color: f.isOnline ? '#2ecc71' : '#aaa' }">
                  {{ f.isOnline ? 'Jugando' : 'Offline' }} -� Nv.{{ f.level }}
                </div>
              </div>
              <span class="badge-food">���� {{ f.food }}</span>
              <button class="icon-btn" @click="removeFriend(f.id)">ԣ�</button>
            </div>
          </div>

          <p class="section-label mt">A+�adir amigos</p>
          <div class="player-list">
            <div v-for="f in nonFriends" :key="'nf-'+f.id" class="player-row muted">
              <div class="avatar" :style="{ background: f.color + '18', border: '2px solid ' + f.color, color: f.color }">
                {{ f.name.charAt(0) }}
              </div>
              <div class="player-info">
                <div class="player-name">{{ f.name }}</div>
                <div class="player-sub">Nv.{{ f.level }}</div>
              </div>
              <button class="add-btn" @click="addFriend(f.id)">+ A+�adir</button>
            </div>
          </div>
          <p v-if="nonFriends.length === 0" class="empty-msg">-�Ya sigues a todos!</p>
        </div>

        <!-- Grupos list -->
        <div v-if="friendTab === 'grupos'" class="panel-body">
          <template v-if="managingGroup">
            <button class="back-link" @click="managingGroup = null">��� Volver</button>
            <div class="group-card">
              <span style="font-size:28px">{{ managingGroup.emoji }}</span>
              <div>
                <div class="player-name">{{ managingGroup.name }}</div>
                <div class="player-sub">{{ groupMemberCount(managingGroup.id) }} miembros</div>
              </div>
            </div>

            <p class="section-label">Miembros</p>
            <p v-if="groupMembers(managingGroup.id).length === 0" class="empty-msg">Sin miembros a+�n</p>
            <div class="player-list">
              <div v-for="p in groupMembers(managingGroup.id)" :key="'gm-'+p.id" class="player-row">
                <div class="avatar sm" :style="{ background: p.color + '18', border: '2px solid ' + p.color, color: p.color }">
                  {{ p.name.charAt(0) }}
                </div>
                <div class="player-info">
                  <div class="player-name">{{ p.name }}</div>
                  <div class="player-sub">Nv.{{ p.level }}</div>
                </div>
                <button class="icon-btn" @click="removeMemberFromGroup(managingGroup.id, p.id)">ԣ�</button>
              </div>
            </div>

            <p class="section-label mt">A+�adir miembros</p>
            <div class="player-list">
              <div v-for="p in nonGroupMembers(managingGroup.id)" :key="'ngm-'+p.id" class="player-row muted">
                <div class="avatar sm" :style="{ background: p.color + '18', border: '2px solid ' + p.color, color: p.color }">
                  {{ p.name.charAt(0) }}
                </div>
                <div class="player-info">
                  <div class="player-name">{{ p.name }}</div>
                  <div class="player-sub">Nv.{{ p.level }}</div>
                </div>
                <button class="add-btn" @click="addMemberToGroup(managingGroup.id, p.id)">+ A+�adir</button>
              </div>
            </div>

            <button class="danger-btn" @click="toggleJoin(managingGroup.id); managingGroup = null">Salir del grupo</button>
          </template>

          <template v-else>
            <button v-if="!showCreateGroup" class="create-group-btn" @click="showCreateGroup = true">
              + Crear grupo
            </button>

            <div v-else class="create-group-form">
              <p class="player-name" style="margin-bottom:12px">Nuevo grupo</p>
              <div class="emoji-row">
                <button v-for="e in GROUP_EMOJIS" :key="e"
                        class="emoji-btn" :class="{ selected: newGroupEmoji === e }"
                        @click="newGroupEmoji = e">{{ e }}</button>
              </div>
              <input v-model="newGroupName" class="text-input" placeholder="Nombre del grupo" maxlength="24" />
              <p class="section-label">Invitar jugadores</p>
              <div class="player-list compact">
                <button v-for="p in ALL_PLAYERS" :key="'cgm-'+p.id"
                        class="player-row selectable" :class="{ selected: newGroupMemberIds.has(p.id) }"
                        @click="toggleNewMember(p.id)">
                  <div class="avatar sm" :style="{ background: p.color + '22', border: '2px solid ' + p.color, color: p.color }">
                    {{ p.name.charAt(0) }}
                  </div>
                  <span class="player-name">{{ p.name }}</span>
                  <span v-if="newGroupMemberIds.has(p.id)" class="check-mark">ԣ�</span>
                </button>
              </div>
              <div class="form-row">
                <button class="cancel-btn" @click="cancelCreateGroup">Cancelar</button>
                <button class="submit-btn" :disabled="!newGroupName.trim()" @click="submitCreateGroup">Crear</button>
              </div>
            </div>

            <p class="section-label" :class="{ mt: !showCreateGroup }">Todos los grupos</p>
            <div class="player-list">
              <div v-for="g in groups" :key="g.id" class="player-row">
                <span style="font-size:22px;flex-shrink:0">{{ g.emoji }}</span>
                <div class="player-info">
                  <div class="player-name">{{ g.name }}</div>
                  <div class="player-sub">
                    ���� {{ groupMemberCount(g.id) || g.members }} -�
                    <span :style="{ color: g.activeNow > 0 ? '#2ecc71' : '#aaa' }">
                      {{ g.activeNow > 0 ? `��� ${g.activeNow} activos` : '��� inactivo' }}
                    </span>
                  </div>
                </div>
                <button v-if="g.joined" class="outline-btn" @click="managingGroup = g">Gestionar</button>
                <button v-else class="add-btn" @click="toggleJoin(g.id)">Unirse</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { GetGroupsUseCase }  from '@/application/usecases/GetGroupsUseCase.js'
import L from 'leaflet'

// ������ Injected from App.vue ������������������������������������������������������������������������������������������������������������������������������������������
const playMode        = inject('playMode', ref(false))
const navTab          = inject('navTab',   ref('map'))
const showGroupPicker = inject('showGroupPicker', ref(false))
const paused          = inject('gamePaused', ref(false))
const currentPlayer   = inject('currentPlayer', ref(null))

// ������ Local state ������������������������������������������������������������������������������������������������������������������������������������������������������������������������
const friendTab = ref('amigos')

// ������ Pause / summary state ������������������������������������������������������������������������������������������������������������������������������������������
const showSummary = ref(false)
const statsApples = ref(0)
const statsKm     = ref('0.00')
const statsSpeed  = ref('0.0')
const statsTime   = ref('0:00')
const statsPoints = ref(0)

let runStartTime  = null
let runDistKm     = 0
let totalPtsWalked = 0

function finishRun () {
  paused.value      = false
  // Calculate points: 200 pts/km + 100 pts/apple
  const earned = Math.round(parseFloat(statsKm.value) * 200) + statsApples.value * 100
  statsPoints.value = earned
  // Add to player profile
  if (currentPlayer.value) {
    currentPlayer.value.score = (currentPlayer.value.score || 0) + earned
  }
  showSummary.value = true
  playMode.value    = false
}
function closeSummary () {
  showSummary.value = false
  statsApples.value = 0
  runDistKm         = 0
  totalPtsWalked    = 0
}

function startPlay (groupId) {
  showGroupPicker.value = false
  playMode.value = true
}

// ������ Data ���������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������
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

// ������ Create group ���������������������������������������������������������������������������������������������������������������������������������������������������������������������
const GROUP_EMOJIS = ['����','����','���','����','��Ž','�������','����','����','����','��Ƭ','���+','��Ļ']
const showCreateGroup  = ref(false)
const newGroupName     = ref('')
const newGroupEmoji    = ref('����')
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
  newGroupEmoji.value = '����'
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

// ������ Map ������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������
const mapRef = ref(null)
let leafletMap   = null
let playerStates = []

// ������ Reactive food ������������������������������������������������������������������������������������������������������������������������������������������������������������������
const foods = []  // { lat, lng, marker, eaten, routePts }

function spawnFood (lat, lng, routePts = null) {
  const html = `<div style="font-size:20px;line-height:1;filter:drop-shadow(0 1px 4px rgba(0,0,0,.3));transition:transform .15s">����</div>`
  const marker = L.marker([lat, lng], {
    icon: L.divIcon({ html, className: '', iconSize: [22,22], iconAnchor: [11,11] }),
    zIndexOffset: 50,
  }).addTo(leafletMap)
  return { lat, lng, marker, eaten: false, routePts }
}

// Spawn a food item some steps ahead of fromIdx on a given route
function spawnFoodAhead (routePts, fromIdx) {
  const offset = 15 + Math.floor(Math.random() * 35)
  const idx = (fromIdx + offset) % routePts.length
  const [lat, lng] = routePts[idx]
  return spawnFood(lat, lng, routePts)
}

function popApple (marker) {
  // Brief scale-up then remove
  const el = marker.getElement()
  if (el) {
    el.style.transition = 'transform .18s ease, opacity .18s'
    el.style.transform  = 'scale(1.8)'
    el.style.opacity    = '0'
  }
}

// ������ Player defs ������������������������������������������������������������������������������������������������������������������������������������������������������������������������
// groupIds: groups this player belongs to (matches backend groups.js ids)
const PLAYER_DEFS = [
  { name: 'Jiajun', color: '#E67E22', phase: 0.00, groupIds: [2],
    wpts: [[41.3861,2.1651],[41.3882,2.1651],[41.3882,2.1665],[41.3861,2.1665]] },
  { name: 'Alicia', color: '#2980B9', phase: 0.25, groupIds: [2, 1],
    wpts: [[41.3882,2.1594],[41.3882,2.1651],[41.3903,2.1651],[41.3903,2.1594]] },
  { name: 'Carlos', color: '#E74C3C', phase: 0.50, groupIds: [1, 3],
    wpts: [[41.3861,2.1700],[41.3882,2.1700],[41.3882,2.1724],[41.3861,2.1724]] },
  { name: 'Mar+�a',  color: '#8E44AD', phase: 0.70, groupIds: [1],
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

// Check if a lat/lng is within ~20m of a trail point
function nearTrail (lat, lng, trail) {
  const R  = 6371000
  const tl = (Math.PI / 180)
  for (const [tla, tln] of trail) {
    const dlat = (lat - tla) * tl
    const dlng = (lng - tln) * tl * Math.cos(lat * tl)
    if (Math.sqrt(dlat*dlat + dlng*dlng) * R < 20) return true
  }
  return false
}

let walkInterval = null
const WALK_SPEED = 1500   // ms per step ��� visually ~5 min/km pace
const STEP_KM    = 0.005  // km per step: 0.005 * (3600/1.5) = 12 km/h ��� 5 min/km

// ������ Danger alert ���������������������������������������������������������������������������������������������������������������������������������������������
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

// ������ Group filter watcher removed (map always shows all players) ���������������������

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
    attribution: '-� OSM, -� CARTO',
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

  // Spawn food ahead of each player (2 per NPC) and along user route (3)
  playerStates.forEach((s, i) => {
    foods.push(spawnFoodAhead(s.finePts, s.ptIdx))
    foods.push(spawnFoodAhead(s.finePts, s.ptIdx + Math.floor(s.finePts.length / 3)))
  })
  if (userRoutePts.length) {
    const step = Math.floor(userRoutePts.length / 4)
    for (let i = 0; i < 4; i++) {
      foods.push(spawnFoodAhead(userRoutePts, i * step))
    }
  }

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
          // Respawn ahead of the eating player after 8s
          setTimeout(() => {
            const offset = 15 + Math.floor(Math.random() * 35)
            const idx = (s.ptIdx + offset) % s.finePts.length
            const [rla, rln] = s.finePts[idx]
            f.lat = rla; f.lng = rln
            f.eaten = false
            f.marker = spawnFood(rla, rln, s.finePts).marker
          }, 8000)
        }
      })
    })
  }, WALK_SPEED)
}

// ������ User snake ���������������������������������������������������������������������������������������������������������������������������������������������������������������������������
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
    ">T+�</div>`
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ html: headHtml, className: '', iconSize: [36,36], iconAnchor: [18,18] }),
      zIndexOffset: 200,
    }).addTo(leafletMap)
    marker.bindTooltip('<b>T+�</b>', { direction: 'top', offset: [0,-22], permanent: true })
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

      // Fixed-step distance accumulation ��� realistic pace (~5 km/h)
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
          popApple(f.marker)
          const _f = f
          setTimeout(() => { _f.marker.remove() }, 180)
          statsApples.value++
          userState.tailLen = Math.min(userState.tailLen + 6, 80)
          // Respawn ahead of user after 8s
          setTimeout(() => {
            const offset = 15 + Math.floor(Math.random() * 35)
            const idx = (userState.ptIdx + offset) % userRoutePts.length
            const [rla, rln] = userRoutePts[idx]
            f.lat = rla; f.lng = rln
            f.eaten  = false
            f.marker = spawnFood(rla, rln, userRoutePts).marker
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

/* ������ Danger flash ������ */
.danger-flash {
  position: absolute;
  inset: 0;
  z-index: 35;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 24px;
}
.danger-flash.low  { background: rgba(220,50,50,.08); border: 3px solid rgba(220,50,50,.25); }
.danger-flash.med  { background: rgba(220,50,50,.18); border: 4px solid rgba(220,50,50,.50); }
.danger-flash.high { background: rgba(220,50,50,.30); border: 4px solid rgba(220,50,50,.72); }
.danger-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .2px;
  padding: 6px 18px;
  border-radius: 20px;
  background: rgba(200,30,30,.88);
  color: #fff;
  font-family: 'Inter', sans-serif;
}

/* ������ Map content ������ */
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

/* ������ Pause / summary overlay ������ */
.pause-overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pause-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 20px 18px;
  width: 88%;
  max-width: 320px;
}
.pause-title {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  margin-bottom: 18px;
  text-align: center;
}
.pause-stats {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid #f0f0f0;
}
.stat-row:last-child { border-bottom: none; }
.stat-label { font-size: 13px; color: #888; }
.stat-val   { font-size: 14px; color: #111; font-weight: 600; }
.stat-row-pts { background: #f6fff6; border-radius: 6px; margin-top: 4px; padding: 9px 0; }
.stat-pts { color: #2a9e2a; font-size: 16px; }
.pause-action {
  display: block;
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  margin-top: 8px;
}
.pause-action:active { opacity: .8; }
.pause-action.continue { background: #2a9e2a; color: #fff; }
.pause-action.finish   { background: #f0f0f0; color: #444; }

/* ������ Group picker ������ */
.picker-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: flex-end;
}
.picker-sheet {
  background: #fff;
  width: 100%;
  border-radius: 16px 16px 0 0;
  padding: 20px 16px 32px;
}
.picker-title {
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}
.picker-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px 4px;
  background: none;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
  text-align: left;
  font-family: 'Inter', sans-serif;
}
.picker-option:active { background: #f6f6f6; }
.picker-option:last-of-type { border-bottom: none; }
.picker-emoji { font-size: 20px; }
.picker-cancel {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 13px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

/* ������ Side panel (friends) ������ */
.side-panel {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: #fff;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform .25s ease;
}
.side-panel.visible { transform: translateX(0); }

/* ������ Panel header ������ */
.panel-header {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  background: #fff;
}
.panel-back-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  flex-shrink: 0;
}
.panel-tabs {
  display: flex;
  flex: 1;
}
.panel-tab {
  flex: 1;
  padding: 14px 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.panel-tab.active {
  color: #2a9e2a;
  border-bottom-color: #2a9e2a;
}

/* ������ Panel body ������ */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* ������ Shared list items ������ */
.section-label {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: .6px;
  margin-bottom: 8px;
}
.section-label.mt { margin-top: 20px; }

.player-list { display: flex; flex-direction: column; gap: 0; border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
.player-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.player-row:last-child { border-bottom: none; }
.player-row.muted { opacity: .8; }
.player-row.selectable { border: none; cursor: pointer; width: 100%; text-align: left; font-family: 'Inter', sans-serif; }
.player-row.selectable.selected { background: #f0fdf0; }
.player-list.compact { max-height: 180px; overflow-y: auto; }

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  flex-shrink: 0;
}
.avatar.sm { width: 32px; height: 32px; font-size: 13px; }

.player-info { flex: 1; min-width: 0; }
.player-name { font-size: 14px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.player-sub  { font-size: 12px; color: #999; margin-top: 1px; }

.badge-food { font-size: 12px; color: #555; background: #f4f4f6; border: 1px solid #e8e8e8; border-radius: 6px; padding: 2px 7px; flex-shrink: 0; }
.icon-btn { width: 26px; height: 26px; border-radius: 50%; background: #f4f4f6; border: none; font-size: 11px; color: #999; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.add-btn  { padding: 5px 12px; border-radius: 20px; border: 1.5px solid #2a9e2a; background: none; color: #2a9e2a; font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0; font-family: 'Inter', sans-serif; }
.outline-btn { padding: 5px 12px; border-radius: 20px; border: 1.5px solid #ccc; background: none; color: #555; font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0; font-family: 'Inter', sans-serif; }
.check-mark { font-size: 14px; font-weight: 700; color: #2a9e2a; width: 18px; text-align: center; flex-shrink: 0; }
.empty-msg  { text-align: center; color: #aaa; font-size: 13px; padding: 16px 0; }

/* ������ Group card ������ */
.group-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 16px;
}
.back-link {
  background: none;
  border: none;
  color: #2a9e2a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 0 14px 0;
  display: block;
  font-family: 'Inter', sans-serif;
}
.danger-btn {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border-radius: 10px;
  border: 1.5px solid #e74c3c;
  background: none;
  color: #e74c3c;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

/* ������ Create group form ������ */
.create-group-btn {
  display: block;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1.5px dashed #2a9e2a;
  background: #f8fff8;
  color: #2a9e2a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  font-family: 'Inter', sans-serif;
}
.create-group-form {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}
.emoji-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.emoji-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1.5px solid #e8e8e8;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.emoji-btn.selected { border-color: #2a9e2a; background: #f0fdf0; }
.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  margin-bottom: 12px;
  outline: none;
  box-sizing: border-box;
}
.text-input:focus { border-color: #2a9e2a; }
.form-row { display: flex; gap: 8px; margin-top: 12px; }
.cancel-btn { flex: 1; padding: 11px; border-radius: 8px; border: 1px solid #ddd; background: #fff; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
.submit-btn { flex: 1; padding: 11px; border-radius: 8px; border: none; background: #2a9e2a; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
.submit-btn:disabled { background: #ccc; cursor: not-allowed; }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
