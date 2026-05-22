<template>
  <header class="app-header">
    <span class="app-title">SSS <em>run</em></span>
    <span class="score-badge">🍎 {{ player.score.toLocaleString() }} pts</span>
    <button class="avatar-btn" @click="$emit('profile-click')">
      <div class="avatar-circle">{{ initial }}</div>
      <span class="level-badge">{{ player.level }}</span>
    </button>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
})
defineEmits(['profile-click'])

const initial = computed(() => props.player.name?.charAt(0).toUpperCase() ?? 'U')
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: clamp(10px, 1.8vw, 14px) clamp(12px, 2vw, 18px);
  background: #F2F0EF;
  border-bottom: 2px solid #408201;
  flex-shrink: 0;
  font-family: 'Press Start 2P', monospace;
}
.app-title {
  flex: 1;
  font-size: clamp(12px, 2vw, 18px);
  font-weight: 400;
  color: #408201;
  letter-spacing: 0;
}
.app-title em {
  font-style: normal;
  color: #408201;
}
.score-badge {
  font-size: clamp(7px, 1.1vw, 11px);
  font-weight: 400;
  color: #408201;
  background: rgba(64, 130, 1, 0.06);
  border: 1px solid #408201;
  padding: clamp(6px, 1vw, 8px) clamp(8px, 1.4vw, 12px);
  letter-spacing: 0.25px;
  image-rendering: pixelated;
}
.avatar-btn {
  position: relative;
  width: clamp(42px, 7vw, 56px);
  height: clamp(42px, 7vw, 56px);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}
.avatar-btn:active { opacity: .85; }
.avatar-circle {
  width: clamp(42px, 7vw, 56px);
  height: clamp(42px, 7vw, 56px);
  border-radius: 0;
  background: #408201;
  color: #F2F0EF;
  font-size: clamp(15px, 2.5vw, 22px);
  font-weight: 400;
  font-family: 'Press Start 2P', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
}
.level-badge {
  position: absolute;
  top: -3px;
  right: -5px;
  background: #d8b24c;
  color: #F2F0EF;
  font-size: clamp(7px, 1vw, 11px);
  font-weight: 400;
  padding: clamp(3px, 0.7vw, 5px) clamp(5px, 0.9vw, 8px);
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
  border: 1px solid #F2F0EF;
}
</style>