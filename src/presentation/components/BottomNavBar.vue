<template>
  <!-- Bottom nav area: SVG curved bar + canvas snake + PLAY button -->
  <div class="nav-area">

    <!-- Canvas snake (z-index above SVG, below PLAY button) -->
    <canvas ref="canvasRef" class="snake-canvas" />

    <!--
      SVG curved nav bar
    -->
    <svg class="nav-svg" :viewBox="`0 0 ${containerWidth} 88`" preserveAspectRatio="none"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="nav-sh" x="-2%" y="-80%" width="104%" height="220%">
          <feDropShadow dx="0" dy="-3" stdDeviation="8"
                        flood-color="rgba(0,0,0,0.08)" />
        </filter>
      </defs>
      <path :d="navPathD" fill="white" filter="url(#nav-sh)" />
    </svg>

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

      <div class="nav-notch" />

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
    <button class="play-btn" @click="$emit('play')" aria-label="Jugar">
      <div class="play-tri" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineProps({ activeTab: { type: String, default: 'map' } })
defineEmits(['tab-change', 'play'])

const containerWidth = ref(430)

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
const BODY_W    = 14   // width of the body block (polyline stroke)
const SEG_R     = 7    // radius of food apple drawn on nav canvas
const N_BODY    = 18   // fixed number of body segments shown (doesn't change visually)
const SEG_GAP   = 14   // spacing between segment positions
const SPEED     = 0.56 // 2x faster

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
  // Glow
  ctx.save()
  ctx.shadowColor = 'rgba(42,158,42,0.55)'
  ctx.shadowBlur  = 10
  ctx.beginPath(); ctx.arc(x, y, HEAD_R, 0, Math.PI * 2)
  ctx.fillStyle = '#2a9c2a'; ctx.fill()
  ctx.restore()
  // Eyes
  const er = 2.4
  ;[[-1],[1]].forEach(([s]) => {
    const ex = x + nx * HEAD_R * .38 + px * s * HEAD_R * .56
    const ey = y + ny * HEAD_R * .38 + py * s * HEAD_R * .56
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI*2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.beginPath(); ctx.arc(ex + nx*.9, ey + ny*.9, er*.58, 0, Math.PI*2)
    ctx.fillStyle = '#111'; ctx.fill()
  })
  // Tongue
  const tb = { x: x + nx*(HEAD_R-.3), y: y + ny*(HEAD_R-.3) }
  const tt = { x: tb.x + nx*5.5, y: tb.y + ny*5.5 }
  ctx.strokeStyle = '#e53935'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(tb.x,tb.y); ctx.lineTo(tt.x,tt.y); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(tt.x,tt.y); ctx.lineTo(tt.x+nx*3.5+px*3, tt.y+ny*3.5+py*3)
  ctx.moveTo(tt.x,tt.y); ctx.lineTo(tt.x+nx*3.5-px*3, tt.y+ny*3.5-py*3)
  ctx.stroke()
}

function drawApple (pt) {
  const r = SEG_R * .95
  ctx.beginPath(); ctx.arc(pt.x,pt.y,r,0,Math.PI*2)
  ctx.fillStyle = '#e53935'; ctx.fill()
  ctx.beginPath(); ctx.arc(pt.x-r*.30,pt.y-r*.28,r*.30,0,Math.PI*2)
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill()
  ctx.strokeStyle = '#33691e'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(pt.x,pt.y-r); ctx.lineTo(pt.x+2.5,pt.y-r-4.5); ctx.stroke()
  ctx.fillStyle = '#56c75c'
  ctx.beginPath(); ctx.ellipse(pt.x+3.5,pt.y-r-3,3.2,1.5,-.55,0,Math.PI*2); ctx.fill()
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
    // Outer glow
    ctx.save()
    ctx.shadowColor = 'rgba(42,158,42,0.35)'
    ctx.shadowBlur  = 8
    ctx.beginPath()
    ctx.moveTo(bodyPts[0].x, bodyPts[0].y)
    bodyPts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = '#1a6e1a'
    ctx.lineWidth   = BODY_W + 4
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    ctx.restore()
    // Main body
    ctx.beginPath()
    ctx.moveTo(bodyPts[0].x, bodyPts[0].y)
    bodyPts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = '#2a9c2a'
    ctx.lineWidth   = BODY_W
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    // Scale texture: small dots along body
    bodyPts.forEach((p, i) => {
      if (i % 3 !== 0) return
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill()
    })
  }

  // Draw head on top
  const headPt = pathPts[hi]
  if (headPt) drawHead(headPt.x, headPt.y, hi)
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
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
  z-index: 100;
  overflow: visible;
}

/* Snake canvas — overflows above the nav bar */
.snake-canvas {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 130%;   /* extends 30% above the nav bar */
  top: auto;
  z-index: 50;    /* above SVG, buttons AND the PLAY btn */
  pointer-events: none;
  overflow: visible;
}

/* SVG curved bar */
.nav-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  pointer-events: none;
}

/* Nav buttons */
.nav-btns {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 0 16px 10px;
  z-index: 24;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  color: #c0c0c8;
  transition: color .2s;
  font-family: 'Inter', sans-serif;
}
.nav-btn.active { color: #2a9e2a; }

.nav-icon {
  width: 22px;
  height: 22px;
}

.nav-btn span {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .2px;
}

.nav-notch {
  width: 96px;
  flex-shrink: 0;
}

/* PLAY button */
.play-btn {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(150deg, #34c534, #1a841a);
  border: 4px solid #fff;
  box-shadow: 0 6px 24px rgba(42,158,42,.38), 0 2px 8px rgba(0,0,0,.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  transition: transform .12s ease, box-shadow .2s ease;
}
.play-btn:active {
  transform: translateX(-50%) scale(.91);
  box-shadow: 0 2px 10px rgba(42,158,42,.25);
}

/* Triangle play icon */
.play-tri {
  width: 0;
  height: 0;
  border-top: 11px solid transparent;
  border-bottom: 11px solid transparent;
  border-left: 19px solid rgba(255,255,255,.95);
  margin-left: 5px;
}
</style>
