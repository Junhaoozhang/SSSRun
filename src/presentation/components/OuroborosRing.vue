<template>
  <svg
    class="ouroboros-svg"
    viewBox="0 0 80 80"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Snake body circle (dashed for scale effect) -->
    <circle
      cx="40" cy="40" r="34"
      fill="none"
      :stroke="color"
      stroke-width="7"
      stroke-dasharray="8 4"
      stroke-linecap="round"
      stroke-dashoffset="6"
      opacity="0.85"
    />
    <!-- Head (filled circle at "eating" position) -->
    <circle cx="74" cy="40" r="7" :fill="color" />
    <!-- Head eyes -->
    <circle cx="73" cy="37" r="2"   fill="#0a0a14" />
    <circle cx="73.6" cy="36.5" r="0.8" fill="white" />
    <!-- Tail taper (triangle at gap start) -->
    <polygon
      :points="`66,36 74,40 66,44`"
      :fill="color"
      opacity="0.5"
    />
    <!-- Glow filter -->
    <defs>
      <filter :id="`glow-${uid}`">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <circle
      cx="40" cy="40" r="34"
      fill="none"
      :stroke="color"
      stroke-width="2"
      opacity="0.3"
      :filter="`url(#glow-${uid})`"
    />
  </svg>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
const props = defineProps({ color: { type: String, default: '#39FF14' } })
const uid = getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)
</script>

<style scoped>
.ouroboros-svg {
  width: 80px;
  height: 80px;
  animation: ouro-spin 6s linear infinite;
}

@keyframes ouro-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
