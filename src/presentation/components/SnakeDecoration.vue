<template>
  <canvas ref="canvasRef" class="snake-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animFrameId = null

const CELL = 14         // px per grid cell
const CANVAS_ROWS = 3   // rows visible
const SPEED = 5         // frames per snake step

let snake = []
let apples = []
let tick = 0
let cols = 0

function initSnake () {
  snake = []
  for (let i = 0; i < 6; i++) {
    snake.push({ x: 2 + i, y: 1 })
  }
}

function spawnApple () {
  const x = Math.floor(2 + Math.random() * (cols - 4))
  apples.push({ x, y: 1 })
}

function initApples () {
  apples = []
  for (let i = 0; i < 4; i++) spawnApple()
}

function update () {
  tick++
  if (tick % SPEED !== 0) return

  const head = snake[snake.length - 1]
  const newHead = { x: (head.x + 1 + cols) % cols, y: head.y }

  const appleIdx = apples.findIndex(a => a.x === newHead.x && a.y === newHead.y)
  if (appleIdx >= 0) {
    apples.splice(appleIdx, 1)
    spawnApple()
    snake.push(newHead)
    if (snake.length > 14) snake.shift()
  } else {
    snake.push(newHead)
    snake.shift()
  }
}

function draw (ctx, w) {
  ctx.clearRect(0, 0, w, CANVAS_ROWS * CELL)

  // Draw apples
  apples.forEach(a => {
    const ax = a.x * CELL
    const ay = a.y * CELL + 1
    ctx.fillStyle = '#DD1111'
    ctx.fillRect(ax + 2, ay + 3, CELL - 4, CELL - 4)
    ctx.fillStyle = '#FF5555'
    ctx.fillRect(ax + 3, ay + 4, 3, 3)
    ctx.fillStyle = '#336633'
    ctx.fillRect(ax + CELL / 2 - 1, ay, 2, 4)
  })

  // Draw snake
  snake.forEach((seg, i) => {
    const sx = seg.x * CELL
    const sy = seg.y * CELL + 1
    const isHead = i === snake.length - 1

    if (isHead) {
      ctx.shadowBlur = 8
      ctx.shadowColor = '#39FF14'
      ctx.fillStyle = '#39FF14'
    } else {
      const brightness = Math.floor(80 + (i / snake.length) * 120)
      ctx.fillStyle = `rgb(0, ${brightness}, 0)`
      ctx.shadowBlur = 0
    }

    ctx.fillRect(sx + 1, sy + 1, CELL - 2, CELL - 2)
    ctx.shadowBlur = 0

    if (isHead) {
      ctx.fillStyle = '#0a0a14'
      ctx.fillRect(sx + 3, sy + 3, 2, 2)
      ctx.fillRect(sx + 7, sy + 3, 2, 2)
    }
  })
}

function loop () {
  if (!canvasRef.value) return
  const w = canvasRef.value.width
  const ctx = canvasRef.value.getContext('2d')
  update()
  draw(ctx, w)
  animFrameId = requestAnimationFrame(loop)
}

function resize () {
  if (!canvasRef.value) return
  canvasRef.value.width = canvasRef.value.offsetWidth
  canvasRef.value.height = CANVAS_ROWS * CELL
  cols = Math.floor(canvasRef.value.width / CELL)
  initSnake()
  initApples()
}

onMounted(() => {
  resize()
  loop()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.snake-canvas {
  width: 100%;
  display: block;
  image-rendering: pixelated;
  background: transparent;
}
</style>
