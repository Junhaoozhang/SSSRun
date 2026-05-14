<template>
  <div class="d-flex flex-column overflow-hidden h-100" style="background:#f4f4f6">

    <!-- Header with Back Button -->
    <div class="d-flex align-items-center gap-2 px-3 py-2 bg-white border-bottom flex-shrink-0">
      <button class="btn btn-sm btn-light border flex-shrink-0" style="width:36px;height:36px;padding:0" @click="$router.back()" title="Atrás">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      </button>
      <h5 class="mb-0 fw-bold m-auto" style="padding-right: 36px">Perfil</h5>
    </div>

    <!-- Banner: avatar + snake SVG -->
    <div class="d-flex align-items-center gap-3 px-3 py-3 bg-white border-bottom flex-shrink-0">
      <div class="position-relative flex-shrink-0">
        <div class="rounded-circle d-flex align-items-center justify-content-center fw-black"
             style="width:72px;height:72px;background:linear-gradient(135deg,#d4f4d4,#a8e6a8);border:3px solid #2a9e2a;font-size:30px;color:#1a6e1a">
          {{ initial }}
        </div>
        <span class="position-absolute bottom-0 start-50 translate-middle-x badge bg-success fw-bold"
              style="font-size:10px;padding:3px 8px;border-radius:8px;white-space:nowrap">
          Nv. {{ player.level }}
        </span>
      </div>
      <div class="flex-grow-1 overflow-hidden">
        <svg class="w-100" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg" style="height:80px">
          <circle cx="40"  cy="55" r="11" :fill="snakeColor" opacity="0.6"/>
          <circle cx="62"  cy="48" r="11" :fill="snakeColor" opacity="0.7"/>
          <circle cx="82"  cy="40" r="11" :fill="snakeColor" opacity="0.75"/>
          <circle cx="102" cy="34" r="11" :fill="snakeColor" opacity="0.8"/>
          <circle cx="122" cy="40" r="11" :fill="snakeColor" opacity="0.85"/>
          <circle cx="140" cy="50" r="11" :fill="snakeColor" opacity="0.88"/>
          <circle cx="158" cy="54" r="11" :fill="snakeColor" opacity="0.9"/>
          <circle cx="176" cy="46" r="11" :fill="snakeColor" opacity="0.95"/>
          <circle cx="200" cy="38" r="14" :fill="snakeColor" filter="url(#glow)"/>
          <circle cx="194" cy="33" r="3.5" fill="#0a0a14"/>
          <circle cx="207" cy="33" r="3.5" fill="#0a0a14"/>
          <circle cx="195" cy="32" r="1.2" fill="white"/>
          <circle cx="208" cy="32" r="1.2" fill="white"/>
          <line x1="210" y1="40" x2="220" y2="37" stroke="#ff2222" stroke-width="1.5"/>
          <line x1="220" y1="37" x2="225" y2="34" stroke="#ff2222" stroke-width="1.5"/>
          <line x1="220" y1="37" x2="225" y2="40" stroke="#ff2222" stroke-width="1.5"/>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="flex-grow-1 overflow-auto p-3">
      <div class="row g-3">
        <div class="col-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <div style="font-size:26px" class="mb-1">🍎</div>
              <div class="fw-black text-success fs-4 lh-1">{{ player.score.toLocaleString() }}</div>
              <small class="text-muted fw-semibold text-center mt-1">Comida total</small>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <div style="font-size:26px" class="mb-1">⚡</div>
              <div class="fw-black text-success fs-4 lh-1">{{ (player.score / 1000).toFixed(1) }}</div>
              <small class="text-muted fw-semibold text-center mt-1">Vel. máx m/s</small>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <div style="font-size:26px" class="mb-1">🔥</div>
              <div class="fw-black text-success fs-4 lh-1">{{ player.level * 3 }}</div>
              <small class="text-muted fw-semibold text-center mt-1">Racha días</small>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <div style="font-size:26px" class="mb-1">📍</div>
              <div class="fw-black text-success fs-4 lh-1">{{ (player.score / 200).toFixed(1) }}</div>
              <small class="text-muted fw-semibold text-center mt-1">Km totales</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GetPlayersUseCase } from '@/application/usecases/GetPlayersUseCase.js'

const player = ref({ name: 'Jugador', health: 80, maxHealth: 100, score: 0, level: 1 })

const initial    = computed(() => player.value.name?.charAt(0).toUpperCase() ?? 'U')
const snakeColor = '#2a9e2a'

onMounted(() => {
  player.value = GetPlayersUseCase.getCurrent()
})
</script>


