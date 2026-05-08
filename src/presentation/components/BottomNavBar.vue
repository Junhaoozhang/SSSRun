<template>
  <nav class="bottom-nav">
    <!-- Left: Social (Friends + Groups) -->
    <button
      class="nav-btn"
      :class="{ 'nav-active': activeTab === 'social' }"
      @click="$emit('tab-change', 'social')"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
      <span>Amigos</span>
    </button>

    <!-- Center notch spacer -->
    <div class="nav-notch" />

    <!-- Right: Leaderboard -->
    <button
      class="nav-btn"
      :class="{ 'nav-active': activeTab === 'leaderboard' }"
      @click="$emit('tab-change', 'leaderboard')"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <rect x="18" y="3" width="4" height="18"/>
        <rect x="10" y="8" width="4" height="13"/>
        <rect x="2"  y="13" width="4" height="8"/>
      </svg>
      <span>Top</span>
    </button>

    <!-- Floating PLAY button -->
    <button class="play-btn" @click="$emit('play')">
      <span class="play-text">PLAY</span>
      <div class="play-ring" />
    </button>
  </nav>
</template>

<script setup>
defineProps({
  activeTab: { type: String, default: 'map' },
})
defineEmits(['tab-change', 'play'])
</script>

<style scoped>
.bottom-nav {
  position: relative;
  display: flex;
  align-items: center;
  height: 70px;
  background: #16162a;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
  /* Circular notch cut-out via radial gradient overlay */
  background:
    radial-gradient(circle 42px at 50% 0%, transparent 42px, #16162a 42px);
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.38);
  transition: color 0.2s;
  font-family: 'Nunito', sans-serif;
}

.nav-btn.nav-active {
  color: #39FF14;
}

.nav-icon {
  width: 22px;
  height: 22px;
}

.nav-btn span {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Empty space for the floating button */
.nav-notch {
  width: 90px;
  flex-shrink: 0;
}

/* Floating PLAY button */
.play-btn {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(145deg, #39FF14 0%, #00b800 100%);
  border: 4px solid #16162a;
  box-shadow:
    0 4px 22px rgba(57, 255, 20, 0.55),
    0 0 0 2px rgba(57, 255, 20, 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.play-btn:active {
  transform: translateX(-50%) scale(0.94);
  box-shadow: 0 2px 12px rgba(57, 255, 20, 0.4);
}

.play-text {
  font-size: 13px;
  font-weight: 900;
  color: #0a0a14;
  letter-spacing: 1.5px;
  font-family: 'Nunito', sans-serif;
  position: relative;
  z-index: 1;
}

.play-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(57, 255, 20, 0.45);
  animation: ring-pulse 2s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}
</style>
