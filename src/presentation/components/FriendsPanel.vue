<template>
  <div class="friends-panel">
    <h2 class="panel-title">Grupos</h2>
    <div class="groups-list">
      <div
        v-for="group in groups"
        :key="group.id"
        class="group-card"
        :class="{ 'card-joined': group.joined }"
      >
        <div class="group-emoji">{{ group.emoji }}</div>
        <div class="group-info">
          <div class="group-name">{{ group.name }}</div>
          <div class="group-meta">
            <span>👥 {{ group.members }}</span>
            <span :class="group.activeNow > 0 ? 'active-yes' : 'active-no'">
              {{ group.activeNow > 0 ? `● ${group.activeNow} activos` : '○ inactivo' }}
            </span>
          </div>
          <div class="group-score">⭐ {{ group.topScore.toLocaleString() }} pts</div>
        </div>
        <button
          class="join-btn"
          :class="{ 'btn-joined': group.joined }"
          @click="$emit('toggle-join', group.id)"
        >
          {{ group.joined ? 'Salir' : 'Unirse' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  groups: { type: Array, default: () => [] },
})
defineEmits(['toggle-join'])
</script>

<style scoped>
.friends-panel {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #0f0f1a;
  min-height: 0;
}

.panel-title {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 14px;
  font-family: 'Nunito', sans-serif;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

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

.group-emoji {
  font-size: 28px;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  font-family: 'Nunito', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-meta {
  display: flex;
  gap: 8px;
  margin-top: 3px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  font-family: 'Nunito', sans-serif;
}

.active-yes { color: #39FF14; }
.active-no  { color: rgba(255, 255, 255, 0.3); }

.group-score {
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

.join-btn:hover {
  background: rgba(57, 255, 20, 0.12);
}

.btn-joined {
  background: #39FF14;
  color: #0f0f1a;
}

.btn-joined:hover {
  background: #2fd010;
  border-color: #2fd010;
}
</style>
