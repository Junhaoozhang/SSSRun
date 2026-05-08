<template>
  <header class="app-header">
    <div class="header-left">
      <span class="logo-sss">SSS</span>
      <span class="logo-run">run</span>
    </div>
    <div class="header-right">
      <div class="score-pill">
        <span class="score-star">⭐</span>
        <span class="score-value">{{ player.score.toLocaleString() }}</span>
      </div>
      <button class="avatar-btn" @click="$emit('profile-click')">
        <div class="avatar-circle">{{ initial }}</div>
        <div class="level-badge">{{ player.level }}</div>
      </button>
    </div>
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
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px 10px;
  background: #0f0f1a;
  border-bottom: 1px solid rgba(57, 255, 20, 0.12);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.logo-sss {
  font-size: 28px;
  font-weight: 900;
  color: #39FF14;
  text-shadow: 0 0 14px rgba(57, 255, 20, 0.7);
  letter-spacing: -1px;
  font-family: 'Nunito', sans-serif;
}

.logo-run {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(57, 255, 20, 0.1);
  border: 1px solid rgba(57, 255, 20, 0.3);
  padding: 5px 12px;
  border-radius: 20px;
}

.score-star {
  font-size: 12px;
}

.score-value {
  font-size: 13px;
  font-weight: 700;
  color: #39FF14;
  font-family: 'Nunito', sans-serif;
}

.avatar-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.avatar-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #39FF14 0%, #00c200 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 900;
  color: #0f0f1a;
  font-family: 'Nunito', sans-serif;
  box-shadow: 0 0 14px rgba(57, 255, 20, 0.45);
}

.level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #FFD700;
  color: #0f0f1a;
  font-size: 9px;
  font-weight: 900;
  padding: 1px 5px;
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  line-height: 1.4;
}
</style>
