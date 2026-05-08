<template>
  <div class="social-view">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-active': activeTab === 'friends' }"
        @click="activeTab = 'friends'"
      >
        Amigos
        <span v-if="onlineCount" class="online-badge">{{ onlineCount }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-active': activeTab === 'groups' }"
        @click="activeTab = 'groups'"
      >
        Grupos
      </button>
      <div class="tab-indicator" :style="indicatorStyle" />
    </div>

    <!-- Friends list -->
    <Transition name="tab-slide" mode="out-in">
      <div v-if="activeTab === 'friends'" key="friends" class="list-wrap">
        <div
          v-for="friend in friends"
          :key="friend.id"
          class="friend-card"
        >
          <!-- Avatar + online dot -->
          <div class="fc-avatar-wrap">
            <div class="fc-avatar" :style="{ borderColor: friend.color }">
              {{ friend.name.charAt(0) }}
            </div>
            <div class="fc-dot" :class="friend.isOnline ? 'dot-on' : 'dot-off'" />
          </div>

          <!-- Mini snake illustration -->
          <div class="fc-snake-wrap">
            <svg viewBox="0 0 80 24" class="mini-snake" xmlns="http://www.w3.org/2000/svg">
              <circle v-for="(seg, i) in 5" :key="i"
                :cx="10 + i * 14" cy="12" r="7"
                :fill="friend.color"
                :opacity="0.5 + i * 0.1"
              />
              <circle cx="10" cy="12" r="9" :fill="friend.color" />
              <circle cx="7"  cy="9"  r="2.5" fill="#0a0a14"/>
              <circle cx="13" cy="9"  r="2.5" fill="#0a0a14"/>
            </svg>
          </div>

          <!-- Name + status -->
          <div class="fc-info">
            <span class="fc-name">{{ friend.name }}</span>
            <span class="fc-status" :class="friend.isOnline ? 'status-on' : 'status-off'">
              {{ friend.isOnline ? '● En línea' : '○ Desconectado' }}
            </span>
          </div>

          <!-- Stats -->
          <div class="fc-stats">
            <div class="fc-stat">
              <span class="fc-stat-icon">🍎</span>
              <span class="fc-stat-val">{{ friend.food }}</span>
            </div>
            <div class="fc-stat">
              <span class="fc-stat-icon">⚡</span>
              <span class="fc-stat-val">{{ friend.speed }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Groups list -->
      <div v-else key="groups" class="list-wrap">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-card"
          :class="{ 'card-joined': group.joined }"
        >
          <div class="gc-emoji">{{ group.emoji }}</div>
          <div class="gc-info">
            <div class="gc-name">{{ group.name }}</div>
            <div class="gc-meta">
              <span>👥 {{ group.members }}</span>
              <span :class="group.activeNow > 0 ? 'active-yes' : 'active-no'">
                {{ group.activeNow > 0 ? `● ${group.activeNow} activos` : '○ inactivo' }}
              </span>
            </div>
            <div class="gc-score">⭐ {{ group.topScore.toLocaleString() }} pts</div>
          </div>
          <button
            class="join-btn"
            :class="{ 'btn-joined': group.joined }"
            @click="onToggleJoin(group.id)"
          >
            {{ group.joined ? 'Salir' : 'Unirse' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- FAB add friend -->
    <button class="fab" @click="showAddToast">
      <span class="fab-plus">+</span>
    </button>

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="showToast" class="toast">👋 Invitación enviada</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GetFriendsUseCase }  from '@/application/usecases/GetFriendsUseCase.js'
import { GetGroupsUseCase }   from '@/application/usecases/GetGroupsUseCase.js'

const activeTab = ref('friends')
const friends   = ref([])
const groups    = ref([])
const showToast = ref(false)

const onlineCount = computed(() => friends.value.filter(f => f.isOnline).length)

const indicatorStyle = computed(() => ({
  left: activeTab.value === 'friends' ? '0%' : '50%',
  width: '50%',
}))

function onToggleJoin (groupId) {
  GetGroupsUseCase.toggleJoin(groupId)
  groups.value = GetGroupsUseCase.execute()
}

function showAddToast () {
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

onMounted(() => {
  friends.value = GetFriendsUseCase.execute()
  groups.value  = GetGroupsUseCase.execute()
})
</script>

<style scoped>
.social-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: #0f0f1a;
  position: relative;
}

/* ── Tab bar ── */
.tab-bar {
  position: relative;
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #0f0f1a;
}

.tab-btn {
  flex: 1;
  padding: 14px 0 12px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-btn.tab-active {
  color: #39FF14;
}

.online-badge {
  background: #39FF14;
  color: #0a0a14;
  font-size: 10px;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 10px;
  font-family: 'Nunito', sans-serif;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: #39FF14;
  border-radius: 2px 2px 0 0;
  box-shadow: 0 0 8px #39FF14;
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Lists ── */
.list-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Friend card ── */
.friend-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 12px;
}

.fc-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.fc-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  background: rgba(255, 255, 255, 0.07);
  font-family: 'Nunito', sans-serif;
}

.fc-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #0f0f1a;
}

.dot-on  { background: #39FF14; box-shadow: 0 0 5px #39FF14; }
.dot-off { background: rgba(255, 255, 255, 0.25); }

.fc-snake-wrap {
  flex-shrink: 0;
  width: 72px;
}

.mini-snake {
  width: 100%;
  height: 24px;
}

.fc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fc-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  font-family: 'Nunito', sans-serif;
}

.fc-status {
  font-size: 11px;
  font-family: 'Nunito', sans-serif;
}

.status-on  { color: #39FF14; }
.status-off { color: rgba(255, 255, 255, 0.3); }

.fc-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.fc-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.fc-stat-icon { font-size: 11px; }

.fc-stat-val {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  font-family: 'Nunito', sans-serif;
  min-width: 28px;
  text-align: right;
}

/* ── Group card ── */
.group-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px;
  transition: border-color 0.2s;
}

.card-joined {
  border-color: rgba(57, 255, 20, 0.35);
  background: rgba(57, 255, 20, 0.06);
}

.gc-emoji { font-size: 28px; flex-shrink: 0; }

.gc-info { flex: 1; min-width: 0; }

.gc-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  font-family: 'Nunito', sans-serif;
}

.gc-meta {
  display: flex;
  gap: 8px;
  margin-top: 3px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  font-family: 'Nunito', sans-serif;
}

.active-yes { color: #39FF14; }
.active-no  { color: rgba(255, 255, 255, 0.3); }

.gc-score {
  font-size: 11px;
  color: rgba(255, 215, 0, 0.75);
  margin-top: 2px;
  font-family: 'Nunito', sans-serif;
}

.join-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid #39FF14;
  background: transparent;
  color: #39FF14;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  transition: all 0.2s;
}

.join-btn:hover   { background: rgba(57, 255, 20, 0.12); }
.btn-joined       { background: #39FF14; color: #0f0f1a; }
.btn-joined:hover { background: #2fd010; border-color: #2fd010; }

/* ── FAB ── */
.fab {
  position: absolute;
  bottom: 18px;
  right: 18px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(145deg, #39FF14, #00b800);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(57, 255, 20, 0.45);
  transition: transform 0.15s, box-shadow 0.2s;
  z-index: 5;
}

.fab:active { transform: scale(0.92); }

.fab-plus {
  font-size: 28px;
  font-weight: 900;
  color: #0a0a14;
  line-height: 1;
  font-family: 'Nunito', sans-serif;
  margin-top: -2px;
}

/* ── Toast ── */
.toast {
  position: absolute;
  bottom: 82px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid rgba(57, 255, 20, 0.4);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  padding: 10px 20px;
  border-radius: 20px;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  z-index: 10;
}

/* ── Transitions ── */
.tab-slide-enter-active,
.tab-slide-leave-active { transition: opacity 0.18s ease; }
.tab-slide-enter-from,
.tab-slide-leave-to     { opacity: 0; }

.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.3s ease; }
.toast-fade-enter-from,
.toast-fade-leave-to     { opacity: 0; }
</style>
