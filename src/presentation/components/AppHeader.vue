<template>
  <header class="app-header">
    <div class="logo">SSS <em>run</em></div>
    <div class="score-pill">🍎 <b>{{ player.score.toLocaleString() }}</b> pts</div>
    <button class="avatar-btn" @click="$emit('profile-click')">
      <div class="avatar-circle">{{ initial }}</div>
      <div class="level-badge">{{ player.level }}</div>
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
  padding: 14px 18px 10px;
  background: #fff;
  flex-shrink: 0;
}

.logo {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.8px;
  color: #111;
  flex: 1;
}
.logo em { font-style: normal; color: #2a9e2a; }

.score-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f4f4f5;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #111;
}
.score-pill b { color: #2a9e2a; }

.avatar-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2a9e2a, #1a761a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 2px 8px rgba(42,158,42,.25);
}

.level-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #2a9e2a;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 800;
  color: #fff;
}
</style>
