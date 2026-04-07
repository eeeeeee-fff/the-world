<template>
  <section class="hero-strip glass-card">
    <div class="hero-copy">
      <p class="section-kicker">{{ dashboard.kicker }}</p>
      <h2>{{ dashboard.heroTitle }}</h2>
      <p>{{ dashboard.heroDescription }}</p>
    </div>
    <div class="hero-status compact-status">
      <div class="status-badge">系统摘要</div>
      <p>{{ dashboard.systemSummary }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  dashboard: { type: Object, required: true }
})
</script>
