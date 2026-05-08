<template>
  <div class="carousel-wrap">
    <h3 class="carousel-label">{{ label }}</h3>
    <div class="carousel-track">
      <div
        v-for="item in items"
        :key="item.id"
        class="accessory-card"
        :class="{
          'card-selected': item.id === selected,
          'card-locked':   !item.unlocked,
        }"
        @click="item.unlocked && $emit('select', item.id)"
      >
        <span class="acc-emoji">{{ item.emoji }}</span>
        <span class="acc-name">{{ item.name }}</span>
        <span v-if="!item.unlocked" class="lock-icon">🔒</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:    { type: String, required: true },
  items:    { type: Array,  default: () => [] },
  selected: { type: String, default: null },
})
defineEmits(['select'])
</script>

<style scoped>
.carousel-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.carousel-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  font-family: 'Nunito', sans-serif;
  letter-spacing: 0.5px;
}

.carousel-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.carousel-track::-webkit-scrollbar { display: none; }

.accessory-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 70px;
  height: 76px;
  border-radius: 16px;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.08);
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  transition: all 0.18s ease;
}

.card-selected {
  border-color: #39FF14;
  background: rgba(57,255,20,0.12);
  box-shadow: 0 0 14px rgba(57,255,20,0.25);
}

.card-locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.acc-emoji {
  font-size: 24px;
  line-height: 1;
}

.acc-name {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  font-family: 'Nunito', sans-serif;
  text-align: center;
}

.lock-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
}
</style>
