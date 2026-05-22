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

    <!-- Snake movement toggle -->
    <div class="snake-toggle-container">
      <button
        class="snake-toggle"
        :class="{ off: !snakeMoving }"
        @click="toggleSnake"
      >
        {{ snakeMoving ? '🐍 ON' : '🐍 OFF' }}
      </button>

      <div class="info-wrapper">
        <button
          class="info-btn"
          @click="showInfo = !showInfo"
        >
          ?
        </button>

        <div v-if="showInfo" class="info-card">
          Activa o desactiva la serpiente
        </div>
      </div>
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
            <button class="pixel-play-btn" @click="resume" aria-label="Reanudar">
              <svg class="pixel-play-svg" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img">
                <g shape-rendering="crispEdges" fill="#101817">
                  <rect x="5" y="3" width="2" height="10" />
                  <rect x="7" y="5" width="2" height="6" />
                  <rect x="9" y="7" width="2" height="2" />
                </g>
              </svg>
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
const snakeMoving = ref(true)
const showInfo  = ref(false)

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

function toggleSnake() {
  snakeMoving.value = !snakeMoving.value
}

// ── City map drawing (pixel-art style) ───────────────────────────────────────
function drawMap(w, h) {
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#F2F0EF'
  ctx.fillRect(0, 0, w, h)

  const BLOCK = 64
  const ROAD  = 24
  const STEP  = BLOCK + ROAD

  // Buildings – pixel blocks
  for (let bx = 0; bx < w + STEP; bx += STEP) {
    for (let by = 0; by < h + STEP; by += STEP) {
      ctx.fillStyle = '#e0ddd9'
      ctx.fillRect(bx, by, BLOCK, BLOCK)

      ctx.fillStyle = 'rgba(64, 130, 1, 0.10)'
      ctx.fillRect(bx + 10, by + 10, 6, 6)
      ctx.fillRect(bx + 26, by + 18, 6, 6)
      ctx.fillRect(bx + 42, by + 10, 6, 6)
    }
  }

  // Road grid
  ctx.strokeStyle = 'rgba(64, 130, 1, 0.06)'
  ctx.lineWidth   = 1
  for (let x = 0; x < w; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
}

// ── Food drawing (pixel apple) ───────────────────────────────────────────────
function spawnFood() {
  const x = Math.floor(Math.random() * cols)
  const y = Math.floor(Math.random() * rows)
  foodItems.push({ x, y })
}

function drawFood() {
  foodItems.forEach(f => {
    const fx = f.x * CELL
    const fy = f.y * CELL
    ctx.fillStyle = '#d64b4b'
    ctx.fillRect(fx + 4, fy + 4, 10, 10)
    ctx.fillStyle = '#f09b7e'
    ctx.fillRect(fx + 6, fy + 6, 3, 3)
    ctx.fillStyle = '#4d7a3f'
    ctx.fillRect(fx + 8, fy + 2, 2, 4)
  })
}

// ── Snake drawing (pixel art blocks) ─────────────────────────────────────────
function drawSnake() {
  if (!snakeMoving.value) return;
  snake.forEach((seg, i) => {
    const isHead = i === snake.length - 1
    const sx = seg.x * CELL
    const sy = seg.y * CELL

    if (isHead) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(sx + 1, sy + 1, CELL - 2, CELL - 2)
      ctx.fillStyle = '#408201'
      ctx.fillRect(sx + 5, sy + 5, 3, 3)
      ctx.fillRect(sx + 12, sy + 5, 3, 3)
      ctx.fillStyle = '#408201'
      ctx.fillRect(sx + 7, sy + 10, 4, 2)
    } else {
      const t = i / snake.length
      const g = Math.floor(60 + t * 40)
      ctx.fillStyle = `rgb(30,${g},8)`
      ctx.fillRect(sx + 2, sy + 2, CELL - 4, CELL - 4)
    }
  })
}

// ── Game logic ───────────────────────────────────────────────────────────────
function update() {
  if (!snakeMoving.value) return
  tick++
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

  stats.km += 0.00035
  stats.speed = 2.4 + (tick % 120) * 0.008
}

function loop() {
  if (isPaused.value) return
  const w = canvasRef.value.width
  const h = canvasRef.value.height
  drawMap(w, h)
  drawFood()
  drawSnake()
  update()
  animId = requestAnimationFrame(loop)
}

function initGame() {
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
function scheduleAutoTurn() {
  const interval = 1800 + Math.random() * 2200
  turnTimer = setTimeout(() => {
    if (!snakeMoving.value) { scheduleAutoTurn(); return }
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 },
    ].filter(d => !(d.x === -direction.x && d.y === -direction.y))
    pendingDir = dirs[Math.floor(Math.random() * dirs.length)]
    scheduleAutoTurn()
  }, interval)
}

// ── Controls ──────────────────────────────────────────────────────────────────
function pause()  { isPaused.value = true;  cancelAnimationFrame(animId) }
function resume() { isPaused.value = false; loop() }
function stopGame() { router.push({ name: 'home' }) }

function onKey(e) {
  const map = { ArrowRight: {x:1,y:0}, ArrowLeft: {x:-1,y:0}, ArrowDown: {x:0,y:1}, ArrowUp: {x:0,y:-1} }
  if (map[e.key]) pendingDir = map[e.key]
}

// ── Swipe controls ────────────────────────────────────────────────────────────
let touchX = 0
let touchY = 0
function onTouchStart(e) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY }
function onTouchEnd(e) {
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
  ctx.imageSmoothingEnabled = false
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
  background: #F2F0EF;
}

.game-canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  transition: filter 0.3s ease;
}

.canvas-paused {
  filter: brightness(0.55);
}

/* Snake toggle container */
.snake-toggle-container {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 50;
}

/* Snake toggle button */
.snake-toggle {
  padding: 5px 12px;
  background: rgba(242, 240, 239, 0.9);
  border: 2px solid #408201;
  color: #408201;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  cursor: pointer;
  image-rendering: pixelated;
  letter-spacing: 1px;
  transition: all 0.15s;
}

.info-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.info-btn {
  width: 26px;
  height: 26px;
  min-width: 26px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(242, 240, 239, 0.95);
  border: 2px solid #408201;
  color: #408201;

  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  line-height: 1;

  cursor: pointer;
  image-rendering: pixelated;
}

.info-card {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);

  background: #F2F0EF;
  border: 2px solid #408201;
  color: #408201;

  padding: 8px;
  font-size: 8px;
  white-space: nowrap;

  z-index: 100;
}

.info-btn:hover {
  background: rgba(64, 130, 1, 0.08);
}

.snake-toggle.off {
  border-color: #d64b4b;
  color: #d64b4b;
}
.snake-toggle:hover {
  background: rgba(64, 130, 1, 0.08);
}
.snake-toggle:active {
  transform: translateX(50px) scale(0.95);
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
  background: rgba(242, 240, 239, 0.95);
  border: 2px solid #408201;
  color: #408201;
  font-size: 8px;
  font-weight: 400;
  font-family: 'Press Start 2P', monospace;
  padding: 5px 10px;
  image-rendering: pixelated;
}

/* PAUSE bar */
.pause-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 88%;
  padding: 12px 24px;
  background: rgba(242, 240, 239, 0.92);
  border: 2px solid #408201;
  backdrop-filter: none;
  color: #408201;
  font-size: 12px;
  font-weight: 400;
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 2px;
  image-rendering: pixelated;
}
.pause-bar:active {
  background: rgba(64, 130, 1, 0.08);
}

.pause-icon { font-size: 16px; }
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
  background: rgba(242, 240, 239, 0.95);
  border: 2px solid #408201;
  padding: 24px 20px;
  width: 82%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  backdrop-filter: none;
  image-rendering: pixelated;
}

.pause-title {
  font-size: 14px;
  font-weight: 400;
  color: #408201;
  font-family: 'Press Start 2P', monospace;
  letter-spacing: 2px;
}

/* Stats */
.pause-stats {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: space-around;
}

.ps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ps-num {
  font-size: 18px;
  font-weight: 400;
  color: #408201;
  font-family: 'Press Start 2P', monospace;
}

.ps-lbl {
  font-size: 7px;
  font-weight: 400;
  color: rgba(64, 130, 1, 0.55);
  font-family: 'Press Start 2P', monospace;
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
  color: #408201;
  font-weight: 900;
}

.ouro-stop { color: #d64b4b; }

/* Overlay transition */
.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to     { opacity: 0; }
</style>