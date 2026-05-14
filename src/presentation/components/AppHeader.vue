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
  padding: 10px 14px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
}
.app-title {
  flex: 1;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -.5px;
  color: #111;
}
.app-title em {
  font-style: normal;
  color: #2a9e2a;
}
.score-badge {
  font-size: 12px;
  font-weight: 600;
  color: #444;
  background: #f4f4f5;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 5px 11px;
}
.avatar-btn {
  position: relative;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}
.avatar-btn:active { opacity: .85; }
.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2a9e2a;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.level-badge {
  position: absolute;
  top: -2px;
  right: -4px;
  background: #f5a623;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 10px;
  padding: 2px 5px;
  font-family: 'Inter', sans-serif;
}
</style>
