<template>
  <header class="topbar glass-card">
    <div class="brand-block">
      <div class="brand-mark"><span></span><span></span></div>
      <div>
        <p class="brand-en">INDUSTRIAL INTELLIGENCE</p>
        <h1>产业智能情报分析</h1>
      </div>
    </div>
    <nav class="tab-nav">
      <button
        v-for="item in tabs"
        :key="item"
        class="tab"
        :class="{ active: item === modelValue }"
        @click="$emit('update:modelValue', item)"
      >
        {{ item }}
      </button>
    </nav>
    <div class="live-pill">
      <span class="live-dot"></span>
      <span>实时监测</span>
    </div>
  </header>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, required: true }
})

defineEmits(['update:modelValue'])
</script>
