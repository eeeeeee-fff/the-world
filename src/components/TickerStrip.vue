<template>
  <section class="ticker-strip glass-card">
    <span class="ticker-label">实时情报</span>
    <div class="ticker-window">
      <div class="ticker-track">
        <span v-for="(item, index) in items" :key="`${index}-${item}`" class="ticker-item">{{ item }}</span>
        <span v-for="(item, index) in items" :key="`dup-${index}-${item}`" class="ticker-item">{{ item }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true }
})
</script>
