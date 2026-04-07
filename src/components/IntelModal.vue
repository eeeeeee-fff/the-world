<template>
  <div v-if="visible" class="intel-modal-mask" @click.self="$emit('close')">
    <section class="intel-modal glass-card">
      <div class="intel-modal-head">
        <div>
          <h3>{{ dashboard.intelTitle }}</h3>
          <p>完整情报流，按时间排序展示全部事件</p>
        </div>
        <button class="modal-close" @click="$emit('close')">关闭</button>
      </div>
      <div class="intel-modal-list">
        <article v-for="item in items" :key="`modal-${item.time}-${item.title}`" class="intel-flow-card">
          <div class="intel-flow-head">
            <div class="intel-left-meta">
              <span class="intel-tag">{{ item.tag }}</span>
              <span class="impact-tag" :class="item.impact">{{ item.impact }}</span>
            </div>
            <time>{{ item.time }}</time>
          </div>
          <h4>{{ item.title }}</h4>
          <p class="intel-summary">{{ item.summary }}</p>
          <div class="intel-analysis">{{ item.analysis }}</div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  dashboard: { type: Object, required: true },
  items: { type: Array, required: true }
})

defineEmits(['close'])
</script>
