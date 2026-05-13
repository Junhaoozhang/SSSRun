<template>
  <div class="home-view" :class="{ 'play-mode': playMode }">

    <!-- ── Top tabs: General / Amigos ── -->
    <div class="tabs" v-if="!playMode">
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

      <!-- Friends panel (Amigos tab from nav) -->
      <div class="side-panel" :class="{ visible: navTab === 'friends' && !playMode }">
        <div class="fp-section" style="padding-top: 18px">
          <div class="fp-title">En línea ahora</div>
          <div v-for="f in sortedFriends" :key="f.id" class="friend-card">
            <div class="fa-wrap">
              <div class="fa-circle"
                   :style="{ background: f.color + '18', borderColor: f.color, color: f.color }">
                {{ f.name.charAt(0) }}
              </div>
              <div class="online-dot" :class="{ off: !f.isOnline }" />
            </div>
            <div class="fi">
              <div class="fi-name">{{ f.name }}</div>
              <div class="fi-sub">
                <span>Nv.{{ f.level }}</span>
                <span :style="{ color: f.isOnline ? '#2ecc71' : '#bbb' }">
                  {{ f.isOnline ? '● Jugando' : '○ Offline' }}
                </span>
              </div>
            </div>
            <div class="chips">
              <div class="chip">🍎 {{ f.food }}</div>
              <div class="chip">⚡ {{ f.speed }}</div>
            </div>
          </div>
        </div>

        <div class="fp-section" style="margin-top: 6px; padding-bottom: 24px">
          <div class="fp-title">Grupos</div>
          <div v-for="g in groups" :key="g.id" class="group-card">
            <div class="gc-emoji">{{ g.emoji }}</div>
            <div class="gc-info">
              <div class="gc-name">{{ g.name }}</div>
              <div class="gc-meta">
                <span>👥 {{ g.members }}</span>
                <span :class="{ 'gc-active': g.activeNow > 0 }">
                  {{ g.activeNow > 0 ? `● ${g.activeNow} activos` : '○ inactivo' }}
                </span>
              </div>
            </div>
            <button class="join-btn" :class="{ joined: g.joined }" @click="toggleJoin(g.id)">
              {{ g.joined ? 'Salir' : 'Unirse' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Groups tab: select group to filter map -->
      <div class="side-panel" :class="{ visible: tab === 'groups' && !playMode }">
        <div class="fp-section" style="padding-top: 18px; padding-bottom: 24px">
          <div class="fp-title">Filtrar por grupo</div>
          <button
            class="group-filter-btn"
            :class="{ active: activeGroupFilter === null }"
            @click="activeGroupFilter = null; tab = 'general'"
          >
            <span>🌍</span> Todos (General)
          </button>
          <button
            v-for="g in joinedGroups"
            :key="g.id"
            class="group-filter-btn"
            :class="{ active: activeGroupFilter === g.id }"
            @click="activeGroupFilter = g.id; tab = 'general'"
          >
            <span>{{ g.emoji }}</span> {{ g.name }}
            <span class="gfb-count">{{ g.members }} miembros</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { GetFriendsUseCase } from '@/application/usecases/GetFriendsUseCase.js'
import { GetGroupsUseCase }  from '@/application/usecases/GetGroupsUseCase.js'
import L from 'leaflet'

// ── Injected from App.vue ──────────────────────────────────────────────
const playMode = inject('playMode', ref(false))
const navTab   = inject('navTab',   ref('map'))

// ── Local tab (top pill: General / Grupos) ─────────────────────────────
const tab = ref('general')

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
const friends = ref(GetFriendsUseCase.execute())
const groups  = ref(GetGroupsUseCase.execute())

const sortedFriends = computed(() =>
  [...friends.value].sort((a,b) => (a.isOnline ? 0 : 1) - (b.isOnline ? 0 : 1))
)
const joinedGroups = computed(() => groups.value.filter(g => g.joined))

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

  // Collision: shorten the hit snake's tail
  if (minDist < 8 && hitState) {
    hitState.tailLen = Math.max(5, hitState.tailLen - 3)
    dangerLevel.value = 'high'
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

async function initMap () {
  leafletMap = L.map(mapRef.value, {
    center: [41.3892, 2.1651], zoom: 16,
    zoomControl: false, attributionControl: true,
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 19,
  }).addTo(leafletMap)

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
})

onUnmounted(() => {
  clearInterval(walkInterval)
  clearInterval(userInterval)
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

/* ── Side panels (friends / groups filter) ── */
.side-panel {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(250,250,252,.97);
  backdrop-filter: blur(18px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateX(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.side-panel.visible { transform: translateX(0); }

.fp-section { padding: 14px 16px 0; }
.fp-title {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  letter-spacing: .9px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

/* Friend card */
.friend-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: #fff;
  border-radius: 14px;
  margin-bottom: 8px;
  border: 1px solid #ececf0;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.fa-wrap { position: relative; flex-shrink: 0; }
.fa-circle {
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 800; border: 2.5px solid;
}
.online-dot {
  position: absolute; bottom: 0; right: 0;
  width: 11px; height: 11px; border-radius: 50%;
  background: #2ecc71; border: 2.5px solid #fff;
}
.online-dot.off { background: #ccc; }
.fi { flex: 1; min-width: 0; }
.fi-name { font-size: 14px; font-weight: 700; color: #111; }
.fi-sub  { font-size: 11px; color: #999; margin-top: 2px; display: flex; gap: 8px; }
.chips   { display: flex; flex-direction: column; gap: 3px; }
.chip {
  background: #f4f4f6; border-radius: 8px;
  padding: 3px 8px; font-size: 11px; font-weight: 700;
  color: #444; text-align: right;
}

/* Group card */
.group-card {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; background: #fff;
  border-radius: 14px; margin-bottom: 8px;
  border: 1px solid #ececf0;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.gc-emoji { font-size: 26px; flex-shrink: 0; }
.gc-info  { flex: 1; min-width: 0; }
.gc-name  { font-size: 14px; font-weight: 700; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gc-meta  { font-size: 11px; color: #999; margin-top: 2px; display: flex; gap: 8px; }
.gc-active { color: #2a9e2a; font-weight: 600; }
.join-btn {
  flex-shrink: 0; padding: 7px 16px; border-radius: 20px;
  border: 1.5px solid #2a9e2a; background: transparent;
  color: #2a9e2a; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'Inter', sans-serif;
}
.join-btn.joined { background: #2a9e2a; color: #fff; }

/* Group filter buttons (Grupos tab) */
.group-filter-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 16px;
  background: #fff;
  border-radius: 14px;
  margin-bottom: 8px;
  border: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  transition: border-color .15s, background .15s;
}
.group-filter-btn.active {
  border-color: #2a9e2a;
  background: #f0fdf0;
  color: #1a7a1a;
}
.gfb-count {
  margin-left: auto;
  font-size: 11px;
  color: #aaa;
  font-weight: 500;
}
</style>
