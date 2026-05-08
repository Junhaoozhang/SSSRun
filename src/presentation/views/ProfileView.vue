<template>
  <div class="profile-view">
    <!-- Avatar + snake banner -->
    <div class="profile-banner">
      <div class="avatar-wrap">
        <div class="avatar-ring">
          <div class="avatar-inner">{{ initial }}</div>
        </div>
        <div class="level-tag">Nv. {{ player.level }}</div>
      </div>

      <div class="snake-stage">
        <svg class="snake-svg" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Accessories top layer -->
          <text v-if="editMode" x="198" y="14" font-size="16" text-anchor="middle">{{ loadout.hat    && accessoryLabel('hats',    loadout.hat)    }}</text>
          <text v-if="editMode" x="207" y="42" font-size="12" text-anchor="middle">{{ loadout.glasses && accessoryLabel('glasses', loadout.glasses) }}</text>
          <!-- Body segments (S-curve) -->
          <circle cx="40"  cy="55" r="11" :fill="snakeColor" opacity="0.6"/>
          <circle cx="62"  cy="48" r="11" :fill="snakeColor" opacity="0.7"/>
          <circle cx="82"  cy="40" r="11" :fill="snakeColor" opacity="0.75"/>
          <circle cx="102" cy="34" r="11" :fill="snakeColor" opacity="0.8"/>
          <circle cx="122" cy="40" r="11" :fill="snakeColor" opacity="0.85"/>
          <circle cx="140" cy="50" r="11" :fill="snakeColor" opacity="0.88"/>
          <circle cx="158" cy="54" r="11" :fill="snakeColor" opacity="0.9"/>
          <circle cx="176" cy="46" r="11" :fill="snakeColor" opacity="0.95"/>
          <!-- Head -->
          <circle cx="200" cy="38" r="14" :fill="snakeColor" filter="url(#glow)"/>
          <!-- Eyes -->
          <circle cx="194" cy="33" r="3.5" fill="#0a0a14"/>
          <circle cx="207" cy="33" r="3.5" fill="#0a0a14"/>
          <circle cx="195" cy="32" r="1.2" fill="white"/>
          <circle cx="208" cy="32" r="1.2" fill="white"/>
          <!-- Tongue -->
          <line x1="210" y1="40" x2="220" y2="37" stroke="#ff2222" stroke-width="1.5"/>
          <line x1="220" y1="37" x2="225" y2="34" stroke="#ff2222" stroke-width="1.5"/>
          <line x1="220" y1="37" x2="225" y2="40" stroke="#ff2222" stroke-width="1.5"/>
          <!-- Tail emoji -->
          <text x="28" y="68" font-size="12" text-anchor="middle">{{ loadout.tail && accessoryLabel('tails', loadout.tail) }}</text>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Stats / Edit panel -->
    <div class="panel-body">
      <!-- Stats mode -->
      <transition name="fade-panel">
        <div v-if="!editMode" class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🍎</span>
            <span class="stat-val">{{ player.score.toLocaleString() }}</span>
            <span class="stat-lbl">Comida total</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⚡</span>
            <span class="stat-val">{{ (player.score / 1000).toFixed(1) }}</span>
            <span class="stat-lbl">Vel. máx m/s</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🔥</span>
            <span class="stat-val">{{ player.level * 3 }}</span>
            <span class="stat-lbl">Racha días</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📍</span>
            <span class="stat-val">{{ (player.score / 200).toFixed(1) }}</span>
            <span class="stat-lbl">Km totales</span>
          </div>
        </div>
      </transition>

      <!-- Edit mode carousels -->
      <transition name="fade-panel">
        <div v-if="editMode" class="carousels">
          <AccessoryCarousel
            label="Sombreros 🎩"
            :items="accessories.hats"
            :selected="draftLoadout.hat"
            @select="draftLoadout.hat = $event"
          />
          <AccessoryCarousel
            label="Gafas 👓"
            :items="accessories.glasses"
            :selected="draftLoadout.glasses"
            @select="draftLoadout.glasses = $event"
          />
          <AccessoryCarousel
            label="Colas 🐍"
            :items="accessories.tails"
            :selected="draftLoadout.tail"
            @select="draftLoadout.tail = $event"
          />
        </div>
      </transition>
    </div>

    <!-- Action buttons -->
    <div class="profile-actions">
      <button v-if="!editMode" class="btn-edit" @click="startEdit">✏️ Personalizar</button>

      <template v-else>
        <button class="btn-cancel" @click="cancelEdit">Cancelar</button>
        <button class="btn-save"   @click="saveEdit">Guardar</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import AccessoryCarousel from '@/presentation/components/AccessoryCarousel.vue'
import { GetPlayersUseCase } from '@/application/usecases/GetPlayersUseCase.js'
import { GetAccessoriesUseCase } from '@/application/usecases/GetAccessoriesUseCase.js'

const player      = ref({ name: 'Jugador', health: 80, maxHealth: 100, score: 0, level: 1 })
const accessories = ref({ hats: [], glasses: [], tails: [] })
const loadout     = ref({ hat: 'h1', glasses: 'g1', tail: 't1' })
const draftLoadout = reactive({ hat: 'h1', glasses: 'g1', tail: 't1' })
const editMode    = ref(false)

const initial    = computed(() => player.value.name?.charAt(0).toUpperCase() ?? 'U')
const snakeColor = computed(() => {
  const tail = accessories.value.tails.find(t => t.id === loadout.value.tail)
  return tail?.color ?? '#39FF14'
})

function accessoryLabel (type, id) {
  const list = accessories.value[type] ?? []
  return list.find(a => a.id === id)?.emoji ?? ''
}

function startEdit () {
  Object.assign(draftLoadout, loadout.value)
  editMode.value = true
}

function cancelEdit () {
  editMode.value = false
}

function saveEdit () {
  const saved = GetAccessoriesUseCase.saveLoadout({ ...draftLoadout })
  loadout.value = { hat: saved.hat, glasses: saved.glasses, tail: saved.tail }
  editMode.value = false
}

onMounted(() => {
  player.value = GetPlayersUseCase.getCurrent()
  const data = GetAccessoriesUseCase.execute()
  accessories.value = { hats: data.hats, glasses: data.glasses, tails: data.tails }
  loadout.value = { hat: data.loadout.hat, glasses: data.loadout.glasses, tail: data.loadout.tail }
  Object.assign(draftLoadout, loadout.value)
})
</script>

<style scoped>
.profile-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: #0f0f1a;
}

/* Banner */
.profile-banner {
  display: flex;
  align-items: center;
  padding: 18px 20px 14px;
  gap: 16px;
  background: linear-gradient(160deg, #141428 0%, #0f0f1a 100%);
  border-bottom: 1px solid rgba(57,255,20,0.1);
  flex-shrink: 0;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid #39FF14;
  box-shadow: 0 0 18px rgba(57,255,20,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #39FF14, #00c200);
}

.avatar-inner {
  font-size: 30px;
  font-weight: 900;
  color: #0a0a14;
  font-family: 'Nunito', sans-serif;
}

.level-tag {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  background: #FFD700;
  color: #0a0a14;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  white-space: nowrap;
}

.snake-stage {
  flex: 1;
  min-width: 0;
}

.snake-svg {
  width: 100%;
  height: 80px;
}

/* Panel body */
.panel-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 16px;
  position: relative;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-icon { font-size: 24px; }

.stat-val {
  font-size: 22px;
  font-weight: 900;
  color: #39FF14;
  font-family: 'Nunito', sans-serif;
}

.stat-lbl {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.45);
  font-family: 'Nunito', sans-serif;
  text-align: center;
}

/* Carousels */
.carousels {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Action buttons */
.profile-actions {
  padding: 14px 20px 20px;
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  background: #0f0f1a;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.btn-edit,
.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border-radius: 28px;
  font-size: 15px;
  font-weight: 900;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  border: none;
  transition: all 0.18s ease;
}

.btn-edit {
  background: rgba(57,255,20,0.1);
  border: 2px solid #39FF14;
  color: #39FF14;
}

.btn-cancel {
  background: rgba(255,255,255,0.07);
  border: 2px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.7);
}

.btn-save {
  background: linear-gradient(135deg, #39FF14, #00b800);
  color: #0a0a14;
  box-shadow: 0 4px 20px rgba(57,255,20,0.4);
}

.btn-save:active { transform: scale(0.97); }

/* Transitions */
.fade-panel-enter-active,
.fade-panel-leave-active { transition: opacity 0.22s ease; }
.fade-panel-enter-from,
.fade-panel-leave-to     { opacity: 0; }
</style>
