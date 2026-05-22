<template>
  <!-- Bottom nav area: canvas snake + nav buttons OR pause button -->
  <div class="nav-area" :class="{ 'play-mode': playMode }">

    <!-- Pause mode: big pause button filling the bar -->
    <button v-if="playMode" class="pause-bar-btn" @click="$emit('pause')" aria-label="Pausar">
      <!-- Small snake toggle inside pause mode too -->
      <div class="snake-toggle-corner" @click.stop>
        <button
          class="snake-toggle-mini"
          :class="{ off: snakeDisabled }"
          @click="snakeDisabled = !snakeDisabled"
          title="Activar/desactivar serpiente"
        >
          <span class="toggle-label">{{ snakeDisabled ? 'OFF' : 'ON' }}</span>
          <span class="toggle-icon">🐍</span>
        </button>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="4" width="4" height="16" rx="1"/>
        <rect x="14" y="4" width="4" height="16" rx="1"/>
      </svg>
      <span class="pause-label">Pausar</span>
    </button>

    <template v-else>
      <!-- Canvas snake (v-show keeps canvas in DOM so animation continues) -->
      <canvas v-show="!snakeDisabled" ref="canvasRef" class="snake-canvas" />

      <!-- Small snake toggle in bottom-right corner of map -->
      <div class="snake-toggle-corner">
        <button
          class="snake-toggle-mini"
          :class="{ off: snakeDisabled }"
          @click="snakeDisabled = !snakeDisabled"
          title="Activar/desactivar serpiente"
        >
          <span class="toggle-label">{{ snakeDisabled ? 'OFF' : 'ON' }}</span>
          <span class="toggle-icon">🐍</span>
        </button>
      </div>

      <!-- Flat nav bar background -->
      <div class="nav-bar-bg" />

      <!-- Nav buttons -->
      <div class="nav-btns">
        <button
          class="nav-btn"
          :class="{ active: activeTab === 'friends' }"
          @click="$emit('tab-change', 'friends')"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Amigos</span>
        </button>

        <div class="nav-spacer" />

        <button
          class="nav-btn"
          :class="{ active: activeTab === 'leaderboard' }"
          @click="$emit('tab-change', 'leaderboard')"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="18" y="3"  width="4" height="18" rx="1"/>
            <rect x="10" y="8"  width="4" height="13" rx="1"/>
            <rect x="2"  y="13" width="4" height="8"  rx="1"/>
          </svg>
          <span>Top</span>
        </button>
      </div>

      <!-- PLAY button -->
      <button class="pixel-play-btn start-play-btn" @click="$emit('play')" aria-label="Jugar">
        <svg class="pixel-play-svg" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img">
          <g shape-rendering="crispEdges" fill="#101817">
            <rect x="5" y="3" width="2" height="10" />
            <rect x="7" y="5" width="2" height="6" />
            <rect x="9" y="7" width="2" height="2" />
          </g>
        </svg>
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineProps({
  activeTab: { type: String, default: 'map' },
  playMode:  { type: Boolean, default: false },
})
defineEmits(['tab-change', 'play', 'pause'])

const containerWidth = ref(430)
const snakeDisabled  = ref(false)

const navPathD = computed(() => {
  const w = containerWidth.value
  const c = w / 2
  return `M 0,88 L 0,28 L ${c-36},28 Q ${c-19},4 ${c},4 Q ${c+19},4 ${c+36},28 L ${w},28 L ${w},88 Z`
})

const snakePathD = computed(() => {
  const w = containerWidth.value
  const c = w / 2
  return `M 0,28 L ${c-36},28 Q ${c-19},4 ${c},4 Q ${c+19},4 ${c+36},28 L ${w},28`
})

const canvasRef = ref(null)
const N_SAMPLES = 700
const HEAD_R    = 10
const BODY_W    = 12   // width of the body block (polyline stroke)
const SEG_R     = 7    // radius of food apple drawn on nav canvas
const N_BODY    = 18   // fixed number of body segments shown (doesn't change visually)
const SEG_GAP   = 14   // spacing between segment positions
const SPEED     = 0.112 // 0.2x slower

let ctx, hpath, totalLen
let pathPts   = []
let segStep   = 20
let headIdx   = 0
let headDir   = 1     // +1 = going right, -1 = going left (ping-pong)
let tailBonus = 0
let apples    = []
let rafId     = null

function buildHelperPath () {
  const NS = 'http://www.w3.org/2000/svg'
  if (!hpath) {
    const hsvg = document.createElementNS(NS, 'svg')
    hsvg.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden'
    hpath = document.createElementNS(NS, 'path')
    hsvg.appendChild(hpath)
    document.body.appendChild(hsvg)
  }
  hpath.setAttribute('d', snakePathD.value)
  totalLen = hpath.getTotalLength()
}

function buildPath () {
  const canvas = canvasRef.value
  const dy = canvas.height - 88   // canvas extends this many px above nav area
  pathPts = []
  for (let i = 0; i <= N_SAMPLES; i++) {
    const p = hpath.getPointAtLength((i / N_SAMPLES) * totalLen)
    pathPts.push({ x: p.x, y: p.y + dy })
  }
  let totalPx = 0
  for (let i = 1; i < pathPts.length; i++)
    totalPx += Math.hypot(pathPts[i].x - pathPts[i-1].x, pathPts[i].y - pathPts[i-1].y)
  segStep = SEG_GAP / totalPx * N_SAMPLES
}

function resizeCanvas () {
  const canvas = canvasRef.value
  if (!canvas) return
  const w = canvas.offsetWidth || 430
  containerWidth.value = w
  canvas.width  = w
  canvas.height = canvas.offsetHeight || 88
  buildHelperPath()
  buildPath()
}

function isOnBody (idx) {
  // Check if idx overlaps with any body segment (head=0 to N_BODY+tailBonus)
  const total = N_BODY + tailBonus + 2
  for (let s = 0; s <= total; s++) {
    const raw = headIdx - s * segStep
    const si  = Math.round(((raw % (N_SAMPLES + 1)) + (N_SAMPLES + 1)) % (N_SAMPLES + 1))
    const diff = Math.abs(si - idx)
    if (diff < 20 || (N_SAMPLES + 1 - diff) < 20) return true
  }
  return false
}

function spawnApple () {
  let idx, tries = 0
  do {
    idx = Math.floor(Math.random() * (N_SAMPLES + 1))
    tries++
  } while ((isOnBody(idx) || (idx > 155 && idx < 545)) && tries < 300)
  apples.push({ idx, eaten: false })
}

function getDir (idx) {
  const i     = Math.round(idx)
  const ahead  = Math.max(0, Math.min(N_SAMPLES, i + 3 * headDir))
  const behind = Math.max(0, Math.min(N_SAMPLES, i - 3 * headDir))
  if (!pathPts[behind] || !pathPts[ahead]) return { nx: headDir, ny: 0, px: 0, py: 1 }
  const dx = pathPts[ahead].x - pathPts[behind].x
  const dy = pathPts[ahead].y - pathPts[behind].y
  const len = Math.hypot(dx, dy) || 1
  return { nx: dx/len, ny: dy/len, px: -dy/len, py: dx/len }
}

function drawHead (x, y, idx) {
  const { nx, ny, px, py } = getDir(idx)
  ctx.fillStyle = '#408201'
  ctx.fillRect(Math.round(x - HEAD_R), Math.round(y - HEAD_R), HEAD_R * 2, HEAD_R * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(Math.round(x + nx * 2 + px * 3 - 2), Math.round(y + ny * 2 + py * 3 - 2), 3, 3)
  ctx.fillRect(Math.round(x + nx * 2 - px * 3 - 2), Math.round(y + ny * 2 - py * 3 - 2), 3, 3)
  ctx.fillStyle = '#408201'
  ctx.fillRect(Math.round(x + nx * HEAD_R), Math.round(y + ny * HEAD_R), 4, 2)
}

function drawApple (pt) {
  const r = SEG_R * .95
  ctx.fillStyle = '#d64b4b'
  ctx.fillRect(Math.round(pt.x - r), Math.round(pt.y - r), Math.round(r * 2), Math.round(r * 2))
  ctx.fillStyle = '#f09b7e'
  ctx.fillRect(Math.round(pt.x - r + 2), Math.round(pt.y - r + 2), 3, 3)
  ctx.fillStyle = '#4d7a3f'
  ctx.fillRect(Math.round(pt.x - 1), Math.round(pt.y - r - 3), 2, 4)
}

function loop () {
  rafId = requestAnimationFrame(loop)
  if (!pathPts.length) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // ── Advance head with ping-pong bounce ──
  headIdx += SPEED * headDir
  if (headIdx >= N_SAMPLES) { headIdx = N_SAMPLES; headDir = -1 }
  else if (headIdx <= 0)   { headIdx = 0;          headDir =  1 }
  const hi = Math.round(headIdx)

  // Eat apples
  apples.forEach(a => {
    if (a.eaten || !pathPts[a.idx] || !pathPts[hi]) return
    const hp = pathPts[hi]
    const ap = pathPts[a.idx]
    if (Math.hypot(hp.x - ap.x, hp.y - ap.y) < HEAD_R + 7) {
      a.eaten = true
      // Snake keeps same size: no tailBonus growth
      setTimeout(spawnApple, 800)
    }
  })

  // Draw uneaten apples
  apples.filter(a => !a.eaten).forEach(a => { if (pathPts[a.idx]) drawApple(pathPts[a.idx]) })

  const total = N_BODY + tailBonus

  // ── Draw body as a single thick polyline (block shape) ──
  // Collect segment positions tail→head (body extends BEHIND in direction of travel)
  const bodyPts = []
  for (let s = total; s >= 1; s--) {
    const raw = headIdx - s * segStep * headDir
    const si  = Math.max(0, Math.min(N_SAMPLES, Math.round(raw)))
    if (pathPts[si]) bodyPts.push(pathPts[si])
  }
  if (bodyPts.length > 1) {
    ctx.beginPath()
    ctx.moveTo(bodyPts[0].x, bodyPts[0].y)
    bodyPts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = '#2a5a00'
    ctx.lineWidth   = BODY_W + 3
    ctx.lineCap     = 'butt'
    ctx.lineJoin    = 'miter'
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(bodyPts[0].x, bodyPts[0].y)
    bodyPts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = '#408201'
    ctx.lineWidth   = BODY_W
    ctx.lineCap     = 'butt'
    ctx.lineJoin    = 'miter'
    ctx.stroke()
  }

  // Draw head on top
  const headPt = pathPts[hi]
  if (headPt) drawHead(headPt.x, headPt.y, hi)
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  ctx.imageSmoothingEnabled = false
  resizeCanvas() // This handles both containerWidth sizing and buildHelperPath
  setTimeout(resizeCanvas, 350)
  window.addEventListener('resize', resizeCanvas)
  tailBonus = 0
  for (let i = 0; i < 3; i++) spawnApple()
  loop()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.nav-area {
  flex-shrink: 0;
  position: relative;
  height: 88px;
  z-index: 500;
  overflow: visible;
}

/* ── Play mode: big pause button ── */
.nav-area.play-mode {
  height: 64px;
  overflow: hidden;
}

.pause-bar-btn {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #F2F0EF;
  border: none;
  border-top: 2px solid #408201;
  color: #408201;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 1.2vw, 12px);
  font-size: clamp(10px, 1.5vw, 14px);
  font-weight: 400;
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  letter-spacing: 2px;
  image-rendering: pixelated;
}
.pause-bar-btn:active { background: #0f0f1a; }

/* Flat nav bar background */
.nav-bar-bg {
  position: absolute;
  inset: 0;
  background: #F2F0EF;
  border-top: 2px solid #408201;
  z-index: 20;
}

/* Snake canvas — overflows above the nav bar */
.snake-canvas {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 130%;
  top: auto;
  z-index: 22;
  pointer-events: none;
  overflow: visible;
}

/* Nav buttons */
.nav-btns {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 0 16px 10px;
  z-index: 20;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #5a5a68;
  font-family: 'Press Start 2P', monospace;
}
.nav-btn.active { color: #408201; }
.nav-btn.active .nav-icon { stroke: #408201; }

.nav-icon {
  width: clamp(24px, 4vw, 34px);
  height: clamp(24px, 4vw, 34px);
}

.nav-btn span {
  font-size: clamp(7px, 1.1vw, 11px);
  font-weight: 400;
  letter-spacing: 0.5px;
}

.nav-spacer {
  width: clamp(72px, 12vw, 100px);
  flex-shrink: 0;
}

/* START PLAY button (override to position it at the bottom center) */
.start-play-btn {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: clamp(60px, 10vw, 84px);
  height: clamp(60px, 10vw, 84px);
  z-index: 26;
}
.start-play-btn:active { transform: translateX(-50%) scale(.93); }

/* Snake toggle: small button in bottom-right corner inside map area */
.snake-toggle-corner {
  position: absolute;
  bottom: 4px;
  right: 4px;
  z-index: 25;
}
.snake-toggle-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(242, 240, 239, 0.92);
  border: 1.5px solid #408201;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.5px;
  color: #408201;
  image-rendering: pixelated;
  transition: background 0.15s;
}
.snake-toggle-mini.off {
  border-color: #d64b4b;
  color: #d64b4b;
}
.snake-toggle-mini:hover {
  background: rgba(64, 130, 1, 0.12);
}
.snake-toggle-mini:active {
  transform: scale(0.93);
}
.toggle-icon {
  font-size: 18px;
}
.toggle-label {
  font-size: 16px;
  font-weight: 400;
}
</style>