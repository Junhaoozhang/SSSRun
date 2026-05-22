<template>
  <svg class="ouroboros-svg" viewBox="0 0 80 80" width="80" height="80">
    <circle
      cx="40" cy="40" r="34"
      fill="none"
      :stroke="color"
      :stroke-width="5"
      stroke-dasharray="180 34"
      stroke-linecap="butt"
      class="ouro-ring"
    />
  </svg>
</template>

<script setup>
defineProps({
  color: { type: String, default: '#1a8a3a' },
})
</script>

<style scoped>
.ouroboros-svg {
  display: block;
  image-rendering: pixelated;
}
.ouro-ring {
  animation: ouro-spin 3s linear infinite;
}
@keyframes ouro-spin {
  to { transform: rotate(360deg); transform-origin: 40px 40px; }
}
</style>