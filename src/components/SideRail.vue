<template>
  <aside class="side-rail">
    <div class="rail-logo">
      <div class="rail-mark"><span></span><span></span></div>
    </div>
    <button
      v-for="item in items"
      :key="item"
      class="rail-item"
      :class="{ active: item === modelValue }"
      @click="$emit('update:modelValue', item)"
    >
      {{ item }}
    </button>
    <div class="rail-footer">情报</div>
  </aside>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: String, required: true }
})

defineEmits(['update:modelValue'])
</script>
