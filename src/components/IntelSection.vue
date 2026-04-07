<template>
  <section class="intel-flow-section glass-card">
    <div class="section-title-row">
      <div>
        <h3>{{ dashboard.intelTitle }}</h3>
        <p>{{ dashboard.intelDesc }}</p>
      </div>
      <button class="more-link" @click="$emit('open')">更多</button>
    </div>

    <div class="featured-intel-row">
      <article v-for="item in items" :key="item.title" class="featured-intel-card">
        <div class="top-intel-head">
          <span class="intel-tag">{{ item.tag }}</span>
          <time>{{ item.time }}</time>
        </div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.summary }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  dashboard: { type: Object, required: true },
  items: { type: Array, required: true }
})

defineEmits(['open'])
</script>
