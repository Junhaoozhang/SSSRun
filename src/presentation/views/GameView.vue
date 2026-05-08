<template>
  <div class="game-view">
    <!-- Game canvas -->
    <canvas
      ref="canvasRef"
      class="game-canvas"
      :class="{ 'canvas-paused': isPaused }"
    />

    <!-- HUD -->
    <div class="hud hud-left">
      <div class="hud-pill">🍎 {{ stats.food }}</div>
      <div class="hud-pill">📍 {{ stats.km.toFixed(2) }} km</div>
    </div>
    <div class="hud hud-right">
      <div class="hud-pill">⚡ {{ stats.speed.toFixed(1) }} m/s</div>
    </div>

    <!-- PAUSE button (shown when playing) -->
    <button v-if="!isPaused" class="pause-bar" @click="pause">
      <span class="pause-icon">⏸</span>
      <span class="pause-text">PAUSE</span>
    </button>

    <!-- Pause / Game-over overlay -->
    <Transition name="overlay-fade">
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-modal">
          <h2 class="pause-title">⏸ PAUSA</h2>

          <!-- Stats summary -->
          <div class="pause-stats">
            <div class="ps-item">
              <span class="ps-num">{{ stats.food }}</span>
              <span class="ps-lbl">Comida</span>
            </div>
            <div class="ps-item">
              <span class="ps-num">{{ stats.km.toFixed(2) }}</span>
              <span class="ps-lbl">Kilómetros</span>
            </div>
            <div class="ps-item">
              <span class="ps-num">{{ stats.speed.toFixed(1) }}</span>
              <span class="ps-lbl">Vel. m/s</span>
            </div>
          </div>

          <!-- Ouroboros buttons -->
          <div class="ouroboros-row">
            <button class="ouroboros-btn btn-resume" @click="resume">
              <OuroborosRing :color="'#39FF14'" />
              <span class="ouro-icon">▶</span>
            </button>
            <button class="ouroboros-btn btn-stop" @click="stopGame">
              <OuroborosRing :color="'#ff4444'" />
              <span class="ouro-icon ouro-stop">■</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import OuroborosRing from '@/presentation/components/OuroborosRing.vue'

const router    = useRouter()
const canvasRef = ref(null)
const isPaused  = ref(false)

const stats = reactive({ food: 0, km: 0, speed: 2.8 })

let ctx        = null
let animId     = null
let tick       = 0
const CELL     = 20
const SPEED    = 4

// Snake state
let snake = []
let direction = { x: 1, y: 0 }
let pendingDir = { x: 1, y: 0 }
let foodItems = []
let cols = 0
let rows = 0

// ── City map drawing ──────────────────────────────────────────────────────────
function drawMap (w, h) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, w, h)

  const BLOCK = 80
  const ROAD  = 20
  const STEP  = BLOCK + ROAD

  // Buildings
  for (let bx = 0; bx < w + STEP; bx += STEP) {
    for (let by = 0; by < h + STEP; by += STEP) {
      ctx.fillStyle = '#16213e'
      ctx.fillRect(bx, by, BLOCK, BLOCK)

      // Windows
      ctx.fillStyle = 'rgba(255,225,80,0.25)'
      for (let wx = 0; wx < 3; wx++) {
        for (let wy = 0; wy < 3; wy++) {
          const lit = Math.random() > 0.35
          if (lit) ctx.fillRect(bx + 8 + wx * 22, by + 8 + wy * 22, 10, 10)
        }
      }
    }
  }

  // Road dashes
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth   = 1
  ctx.setLineDash([8, 8])
  for (let x = ROAD / 2; x < w; x += STEP) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = ROAD / 2; y < h; y += STEP) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.setLineDash([])
}

// ── Food drawing ─────────────────────────────────────────────────────────────
function spawnFood () {
  const x = Math.floor(Math.random() * cols)
  const y = Math.floor(Math.random() * rows)
  foodItems.push({ x, y })
}

function drawFood () {
  foodItems.forEach(f => {
    const fx = f.x * CELL + CELL / 2
    const fy = f.y * CELL + CELL / 2
    ctx.shadowBlur = 10
    ctx.shadowColor = '#ff3333'
    ctx.fillStyle = '#ff2222'
    ctx.beginPath()
    ctx.arc(fx, fy, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ff8888'
    ctx.beginPath()
    ctx.arc(fx - 2, fy - 2, 2, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ── Snake drawing ─────────────────────────────────────────────────────────────
function drawSnake () {
  snake.forEach((seg, i) => {
    const isHead = i === snake.length - 1
    const sx = seg.x * CELL
    const sy = seg.y * CELL

    if (isHead) {
      ctx.shadowBlur = 12
      ctx.shadowColor = '#39FF14'
      ctx.fillStyle = '#39FF14'
    } else {
      const t = i / snake.length
      const g = Math.floor(120 + t * 135)
      ctx.fillStyle = `rgb(0,${g},0)`
      ctx.shadowBlur = 0
    }

    ctx.fillRect(sx + 1, sy + 1, CELL - 2, CELL - 2)
    ctx.shadowBlur = 0

    if (isHead) {
      ctx.fillStyle = '#0a0a14'
      const eyeOff = direction.x !== 0 ? 2 : 0
      ctx.fillRect(sx + 4 + eyeOff, sy + 3, 3, 3)
      ctx.fillRect(sx + 4 + eyeOff, sy + 11, 3, 3)
    }
  })
}

// ── Game logic ────────────────────────────────────────────────────────────────
function update () {
  tick++
  // Gradually increase speed
  const effectiveSpeed = Math.max(2, SPEED - Math.floor(tick / 300))
  if (tick % effectiveSpeed !== 0) return

  direction = { ...pendingDir }
  const head = snake[snake.length - 1]
  const newHead = {
    x: (head.x + direction.x + cols) % cols,
    y: (head.y + direction.y + rows) % rows,
  }

  const ateIdx = foodItems.findIndex(f => f.x === newHead.x && f.y === newHead.y)
  if (ateIdx >= 0) {
    foodItems.splice(ateIdx, 1)
    spawnFood()
    stats.food++
    snake.push(newHead)
    if (snake.length > 20) snake.shift()
  } else {
    snake.push(newHead)
    snake.shift()
  }

  // Accumulate distance
  stats.km += 0.00035
  stats.speed = 2.4 + (tick % 120) * 0.008
}

function loop () {
  if (isPaused.value) return
  const w = canvasRef.value.width
  const h = canvasRef.value.height
  drawMap(w, h)
  drawFood()
  drawSnake()
  update()
  animId = requestAnimationFrame(loop)
}

function initGame () {
  const w = canvasRef.value.offsetWidth
  const h = canvasRef.value.offsetHeight
  canvasRef.value.width  = w
  canvasRef.value.height = h
  cols = Math.floor(w / CELL)
  rows = Math.floor(h / CELL)

  snake = []
  for (let i = 0; i < 8; i++) snake.push({ x: 4 + i, y: Math.floor(rows / 2) })
  direction  = { x: 1, y: 0 }
  pendingDir = { x: 1, y: 0 }
  foodItems  = []
  for (let i = 0; i < 8; i++) spawnFood()
  stats.food  = 0
  stats.km    = 0
  stats.speed = 2.8
  tick = 0
}

// ── Auto-pilot: smooth snake turns ───────────────────────────────────────────
let turnTimer = null
function scheduleAutoTurn () {
  const interval = 1800 + Math.random() * 2200
  turnTimer = setTimeout(() => {
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 },
    ].filter(d => !(d.x === -direction.x && d.y === -direction.y))
    pendingDir = dirs[Math.floor(Math.random() * dirs.length)]
    scheduleAutoTurn()
  }, interval)
}

// ── Controls ──────────────────────────────────────────────────────────────────
function pause  () { isPaused.value = true;  cancelAnimationFrame(animId) }
function resume () { isPaused.value = false; loop() }
function stopGame () { router.push({ name: 'home' }) }

function onKey (e) {
  const map = { ArrowRight: {x:1,y:0}, ArrowLeft: {x:-1,y:0}, ArrowDown: {x:0,y:1}, ArrowUp: {x:0,y:-1} }
  if (map[e.key]) pendingDir = map[e.key]
}

// ── Swipe controls ────────────────────────────────────────────────────────────
let touchX = 0
let touchY = 0
function onTouchStart (e) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY }
function onTouchEnd (e) {
  const dx = e.changedTouches[0].clientX - touchX
  const dy = e.changedTouches[0].clientY - touchY
  if (Math.abs(dx) > Math.abs(dy)) {
    pendingDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 }
  } else {
    pendingDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 }
  }
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  initGame()
  loop()
  scheduleAutoTurn()
  window.addEventListener('keydown', onKey)
  canvasRef.value.addEventListener('touchstart', onTouchStart, { passive: true })
  canvasRef.value.addEventListener('touchend',   onTouchEnd,   { passive: true })
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  clearTimeout(turnTimer)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.game-view {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  background: #1a1a2e;
}

.game-canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  transition: filter 0.3s ease;
}

.canvas-paused {
  filter: blur(6px) brightness(0.5);
}

/* HUD */
.hud {
  position: absolute;
  top: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  pointer-events: none;
}

.hud-left  { left:  12px; }
.hud-right { right: 12px; align-items: flex-end; }

.hud-pill {
  background: rgba(0,0,0,0.65);
  border: 1px solid rgba(57,255,20,0.3);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  padding: 4px 11px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* PAUSE bar */
.pause-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 88%;
  padding: 14px 24px;
  background: rgba(15,15,26,0.6);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 2px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}

.pause-icon { font-size: 18px; }
.pause-text { letter-spacing: 3px; }

/* Overlay */
.pause-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.pause-modal {
  background: rgba(15,15,26,0.92);
  border: 1px solid rgba(57,255,20,0.25);
  border-radius: 28px;
  padding: 28px 24px;
  width: 82%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.7);
  backdrop-filter: blur(6px);
}

.pause-title {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  font-family: 'Nunito', sans-serif;
  letter-spacing: 2px;
}

/* Stats */
.pause-stats {
  display: flex;
  gap: 20px;
  width: 100%;
  justify-content: space-around;
}

.ps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ps-num {
  font-size: 26px;
  font-weight: 900;
  color: #39FF14;
  font-family: 'Nunito', sans-serif;
}

.ps-lbl {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.45);
  font-family: 'Nunito', sans-serif;
  letter-spacing: 0.5px;
}

/* Ouroboros row */
.ouroboros-row {
  display: flex;
  gap: 32px;
  justify-content: center;
}

.ouroboros-btn {
  position: relative;
  width: 80px;
  height: 80px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}

.ouroboros-btn:active { transform: scale(0.93); }

.ouro-icon {
  position: absolute;
  font-size: 26px;
  color: #39FF14;
  font-weight: 900;
}

.ouro-stop { color: #ff4444; }

/* Overlay transition */
.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to     { opacity: 0; }
</style>
