<template>
  <div class="map-container">
    <canvas ref="canvasRef" class="map-canvas" />
    <div class="map-badge">
      <span class="badge-dot" />
      {{ players.length }} online
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  players: { type: Array, default: () => [] },
})

const canvasRef = ref(null)
let animFrameId = null
let ctx = null
const CELL = 16

// Internal animated player state
const mapPlayers = []
const foodItems = []

function initPlayers () {
  mapPlayers.length = 0
  props.players.forEach(p => {
    mapPlayers.push({
      ...p,
      px: p.x,
      py: p.y,
      dx: (Math.random() - 0.5) * 0.0015,
      dy: (Math.random() - 0.5) * 0.0015,
      trail: [],
    })
  })
}

function initFood () {
  foodItems.length = 0
  for (let i = 0; i < 14; i++) {
    foodItems.push({ x: 0.05 + Math.random() * 0.9, y: 0.05 + Math.random() * 0.9 })
  }
}

function drawBackground (w, h) {
  ctx.fillStyle = '#111122'
  ctx.fillRect(0, 0, w, h)

  // Road stripes
  for (let y = 0; y < h; y += 64) {
    ctx.fillStyle = 'rgba(30, 30, 55, 0.9)'
    ctx.fillRect(0, y, w, 32)
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(57, 255, 20, 0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += CELL * 2) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += CELL * 2) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
}

function drawFood (w, h) {
  foodItems.forEach(f => {
    const fx = f.x * w
    const fy = f.y * h
    ctx.shadowBlur = 6
    ctx.shadowColor = '#ff3333'
    ctx.fillStyle = '#ff2222'
    ctx.fillRect(fx - 5, fy - 5, 10, 10)
    ctx.fillStyle = '#ff8888'
    ctx.fillRect(fx - 3, fy - 7, 6, 3) // leaf
    ctx.fillStyle = '#ff6060'
    ctx.fillRect(fx - 3, fy - 3, 4, 3) // highlight
    ctx.shadowBlur = 0
  })
}

function drawPlayers (w, h) {
  mapPlayers.forEach(player => {
    player.px += player.dx
    player.py += player.dy

    if (player.px < 0.04 || player.px > 0.96) player.dx *= -1
    if (player.py < 0.04 || player.py > 0.96) player.dy *= -1
    player.px = Math.max(0.03, Math.min(0.97, player.px))
    player.py = Math.max(0.03, Math.min(0.97, player.py))

    player.trail.push({ x: player.px, y: player.py })
    if (player.trail.length > 18) player.trail.shift()

    // Trail
    player.trail.forEach((pos, i) => {
      const alpha = i / player.trail.length
      const size = 4 + alpha * 8
      const hex = Math.floor(alpha * 200).toString(16).padStart(2, '0')
      ctx.fillStyle = player.color + hex
      ctx.fillRect(pos.x * w - size / 2, pos.y * h - size / 2, size, size)
    })

    // Head
    const px = player.px * w
    const py = player.py * h
    ctx.shadowBlur = 12
    ctx.shadowColor = player.color
    ctx.fillStyle = player.color
    ctx.fillRect(px - 8, py - 8, 16, 16)
    ctx.shadowBlur = 0

    // Name tag
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = 'bold 9px Nunito, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(player.name, px, py - 13)
  })
}

function render () {
  if (!canvasRef.value) return
  const w = canvasRef.value.width
  const h = canvasRef.value.height

  drawBackground(w, h)
  drawFood(w, h)
  drawPlayers(w, h)

  animFrameId = requestAnimationFrame(render)
}

function resize () {
  if (!canvasRef.value) return
  canvasRef.value.width = canvasRef.value.offsetWidth
  canvasRef.value.height = canvasRef.value.offsetHeight
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  resize()
  initPlayers()
  initFood()
  render()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', resize)
})

watch(() => props.players, () => {
  initPlayers()
}, { deep: true })
</script>

<style scoped>
.map-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.map-canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.map-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 10, 25, 0.85);
  border: 2px solid #39FF14;
  padding: 5px 11px;
  font-size: 7px;
  font-weight: 400;
  color: #39FF14;
  font-family: 'Press Start 2P', monospace;
  backdrop-filter: blur(4px);
  image-rendering: pixelated;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #39FF14;
  animation: blink 1.2s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.15; }
}
</style>
