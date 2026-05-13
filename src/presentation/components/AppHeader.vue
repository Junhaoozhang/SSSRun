<template>
  <header class="d-flex align-items-center gap-2 px-3 py-2 bg-white border-bottom flex-shrink-0"
          style="border-color:#ebebef!important">
    <span class="fw-black fs-5 flex-grow-1 lh-1" style="letter-spacing:-.5px">
      SSS <em class="text-success fst-normal">run</em>
    </span>
    <span class="badge rounded-pill border fw-semibold d-flex align-items-center gap-1"
          style="background:#f4f4f5;color:#111;font-size:12px;padding:6px 12px">
      🍎 <span class="text-success">{{ player.score.toLocaleString() }}</span> pts
    </span>
    <button class="btn p-0 border-0 position-relative flex-shrink-0"
            style="width:38px;height:38px" @click="$emit('profile-click')">
      <div class="rounded-circle d-flex align-items-center justify-content-center fw-black w-100 h-100"
           style="background:linear-gradient(135deg,#2a9e2a,#1a761a);color:#fff;font-size:17px;box-shadow:0 2px 8px rgba(42,158,42,.25)">
        {{ initial }}
      </div>
      <span class="position-absolute badge rounded-pill bg-warning text-dark lh-1"
            style="top:-2px;right:-4px;font-size:9px;padding:3px 5px">
        {{ player.level }}
      </span>
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
.btn:active { opacity: .85; transform: scale(.96); }
</style>
