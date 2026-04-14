<template>
  <div class="activity-detail-overlay" @click.self="$emit('close')">
    <article class="activity-article-card glass-card">
      <header class="activity-article-hero">
        <div class="activity-article-copy">
          <p class="eyebrow">{{ detail.kindLabel }} / {{ cityName }}</p>
          <h3>{{ detail.title }}</h3>
          <p class="activity-article-lead">{{ detail.summary }}</p>
        </div>
        <button class="close-btn" @click="$emit('close')">关闭</button>
      </header>

      <div class="activity-article-meta">
        <span>{{ detail.date }}</span>
        <span>{{ detail.publisherLabel }}：{{ detail.publisher }}</span>
        <span>{{ detail.codeLabel }}：{{ detail.code }}</span>
      </div>

      <section class="activity-article-main">
        <div class="activity-article-body glass-inner">
          <span class="detail-block-label">摘要</span>
          <p>{{ detail.description }}</p>
          <p>{{ detail.analysis }}</p>
        </div>

        <aside class="activity-article-side">
          <div class="glass-inner activity-side-block">
            <span class="detail-block-label">作者 / 申请信息</span>
            <ul class="detail-list">
              <li v-for="item in detail.people" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="glass-inner activity-side-block">
            <span class="detail-block-label">核心要点</span>
            <ul class="detail-list">
              <li v-for="item in detail.highlights" :key="item">{{ item }}</li>
            </ul>
          </div>
        </aside>
      </section>

      <footer class="activity-article-footer glass-inner">
        <span class="detail-block-label">关键词</span>
        <div class="tag-row">
          <span v-for="tag in detail.tags" :key="tag">{{ tag }}</span>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup>
defineProps({
  detail: { type: Object, required: true },
  cityName: { type: String, default: 'WUHAN' },
})
defineEmits(['close'])
</script>
