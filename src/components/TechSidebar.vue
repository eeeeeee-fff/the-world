<template>
  <aside class="right-side-stack">
    <section class="switch-panel glass-card">
      <div class="side-panel-head">
        <div>
          <h3>技术领域</h3>
          <p>纵向切换技术视角</p>
        </div>
      </div>
      <div class="tech-category-list">
        <button
          v-for="item in categories"
          :key="item.key"
          class="tech-category-vertical"
          :class="{ active: item.key === modelValue }"
          @click="$emit('update:modelValue', item.key)"
        >
          <span class="tech-category-name">{{ item.label }}</span>
          <span class="tech-category-heat">热度 {{ categoryData[item.key].metricCards[0].value }}</span>
        </button>
      </div>
    </section>

    <section class="talent-panel glass-card">
      <div class="side-panel-head">
        <div>
          <h3>活跃人才</h3>
          <p>当前技术视角下的重点人才线索</p>
        </div>
      </div>
      <div class="talent-list">
        <article v-for="talent in talents" :key="talent.name" class="talent-card talent-card-large">
          <div class="talent-head">
            <div class="talent-avatar">{{ talent.name.slice(0, 1) }}</div>
            <div>
              <h4>{{ talent.name }}</h4>
              <p>{{ talent.org }}</p>
            </div>
          </div>
          <div class="talent-tags">
            <span class="talent-tag">{{ talent.direction }}</span>
            <span class="talent-score">{{ talent.score }}</span>
          </div>
          <p class="talent-note">{{ talent.note }}</p>
        </article>
      </div>
    </section>
  </aside>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, required: true },
  categoryData: { type: Object, required: true },
  talents: { type: Array, required: true }
})

defineEmits(['update:modelValue'])
</script>
