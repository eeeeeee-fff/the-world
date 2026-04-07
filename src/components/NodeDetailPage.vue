<template>
  <div class="detail-root">
    <div class="detail-bg detail-grid"></div>
    <div class="detail-bg detail-glow"></div>

    <header class="detail-topbar glass-card">
      <div>
        <p class="eyebrow">NODE DETAIL / RELATION VIEW</p>
        <h1>{{ detail.title }}</h1>
        <p class="subtitle">{{ detail.subtitle }}</p>
      </div>
      <button class="back-btn" @click="$emit('back')">返回情报主屏</button>
    </header>

    <section class="detail-hero glass-card">
      <div class="hero-main">
        <span class="type-chip" :style="chipStyle(detail.category)">{{ categoryLabel }}</span>
        <h2>{{ detail.name }}</h2>
        <h3>{{ detail.title }}</h3>
        <p>{{ detail.subtitle }}</p>
        <div class="tag-row">
          <span v-for="tag in detail.tags || []" :key="tag">{{ tag }}</span>
        </div>
      </div>
      <div class="hero-metrics">
        <div class="metric-card">
          <span>城市</span>
          <strong>{{ detail.cityName || '--' }}</strong>
        </div>
        <div class="metric-card">
          <span>省份</span>
          <strong>{{ detail.provinceName || '--' }}</strong>
        </div>
        <div class="metric-card">
          <span>活跃指数</span>
          <strong>{{ detail.value }}</strong>
        </div>
        <div class="metric-card">
          <span>关联条目</span>
          <strong>{{ detail.related?.length || 0 }}</strong>
        </div>
      </div>
    </section>

    <main class="detail-content">
      <section class="glass-card relation-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">RELATION MAP</p>
            <h3>关联信息</h3>
          </div>
          <strong>{{ detail.related?.length || 0 }} 条</strong>
        </div>

        <div class="relation-list">
          <article
            v-for="item in detail.related || []"
            :key="item.id"
            class="relation-card"
            :class="{ active: item.id === detail.id }"
          >
            <div class="relation-top">
              <span class="type-chip" :style="chipStyle(item.category)">{{ CATEGORY_STYLES[item.category]?.label || item.category }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.subtitle }}</p>
            <div class="tag-row compact">
              <span v-for="tag in item.tags || []" :key="tag">{{ tag }}</span>
            </div>
          </article>
        </div>
      </section>

      <aside class="side-stack">
        <section class="glass-card info-card">
          <div class="section-head">
            <div>
              <p class="eyebrow">NODE PROFILE</p>
              <h3>节点画像</h3>
            </div>
          </div>
          <div class="bullet-list">
            <div class="bullet-item">
              <span>节点类型</span>
              <strong>{{ categoryLabel }}</strong>
            </div>
            <div class="bullet-item">
              <span>节点名称</span>
              <strong>{{ detail.name }}</strong>
            </div>
            <div class="bullet-item">
              <span>趋势值</span>
              <strong>{{ detail.trend || '--' }}</strong>
            </div>
          </div>
        </section>

        <section class="glass-card info-card">
          <div class="section-head">
            <div>
              <p class="eyebrow">RELATED TAGS</p>
              <h3>标签网络</h3>
            </div>
          </div>
          <div class="tag-cloud">
            <span v-for="tag in allTags" :key="tag">{{ tag }}</span>
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CATEGORY_STYLES } from '../data/map-scene-data'

const props = defineProps({
  detail: {
    type: Object,
    required: true,
  },
})

defineEmits(['back'])

const categoryLabel = computed(() => CATEGORY_STYLES[props.detail.category]?.label || props.detail.category)
const allTags = computed(() => {
  const tags = new Set()
  ;(props.detail.related || []).forEach((item) => {
    ;(item.tags || []).forEach((tag) => tags.add(tag))
  })
  return Array.from(tags)
})

function chipStyle(category) {
  const color = CATEGORY_STYLES[category]?.color || 0x58d5ff
  const css = `#${color.toString(16).padStart(6, '0')}`
  return {
    background: `${css}24`,
    borderColor: `${css}55`,
    color: '#e8f7ff',
    boxShadow: `0 0 18px ${css}22`,
  }
}
</script>

<style scoped>
.detail-root {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 18% 12%, rgba(35, 92, 176, 0.2), transparent 22%), radial-gradient(circle at 82% 28%, rgba(35, 150, 255, 0.16), transparent 24%), linear-gradient(180deg, #010611 0%, #020b18 42%, #01050c 100%);
  color: #e8f5ff;
  font-family: 'Segoe UI', 'PingFang SC', sans-serif;
}
.detail-bg { position: absolute; inset: 0; pointer-events: none; }
.detail-grid {
  opacity: 0.14;
  background-image: linear-gradient(rgba(116, 188, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(116, 188, 255, 0.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(circle at center, black 32%, transparent 92%);
}
.detail-glow {
  background: radial-gradient(circle at 70% 30%, rgba(75, 165, 255, 0.18), transparent 32%), radial-gradient(circle at 20% 70%, rgba(71, 232, 255, 0.1), transparent 28%);
}
.glass-card {
  background: linear-gradient(180deg, rgba(10, 23, 48, 0.76), rgba(6, 15, 32, 0.62));
  border: 1px solid rgba(123, 195, 255, 0.18);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(123, 195, 255, 0.06);
  backdrop-filter: blur(14px);
}
.eyebrow { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.18em; color: #7fb9ff; }
.subtitle { margin: 4px 0 0; color: #9fc5ec; }
.detail-topbar {
  position: relative;
  z-index: 2;
  margin: 18px;
  border-radius: 18px;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}
.detail-topbar h1 { margin: 0; font-size: 32px; }
.back-btn {
  border: 1px solid rgba(128, 199, 255, 0.2);
  background: linear-gradient(90deg, rgba(63, 111, 255, 0.95), rgba(67, 224, 255, 0.8));
  color: #effaff;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
}
.detail-hero {
  position: relative;
  z-index: 2;
  margin: 0 18px 18px;
  border-radius: 22px;
  padding: 22px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
}
.hero-main h2 { margin: 10px 0 4px; font-size: 36px; }
.hero-main h3 { margin: 0 0 10px; font-size: 22px; color: #f4fbff; }
.hero-main p { margin: 0; color: #9fc5ec; line-height: 1.7; }
.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.metric-card, .info-card {
  border-radius: 16px;
  padding: 16px;
  background: rgba(24, 46, 92, 0.32);
  border: 1px solid rgba(123, 192, 255, 0.12);
}
.metric-card span, .bullet-item span { font-size: 12px; color: #8fbdf0; display: block; }
.metric-card strong, .bullet-item strong { display: block; margin-top: 6px; font-size: 22px; }
.detail-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 18px;
  padding: 0 18px 18px;
}
.relation-panel {
  border-radius: 22px;
  padding: 18px;
  min-height: calc(100vh - 280px);
  display: grid;
  grid-template-rows: auto 1fr;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.section-head h3 { margin: 0; font-size: 22px; }
.relation-list { overflow: auto; padding-right: 4px; margin-top: 14px; }
.relation-card {
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
  background: linear-gradient(180deg, rgba(18, 36, 71, 0.78), rgba(11, 22, 42, 0.7));
  border: 1px solid rgba(120, 191, 255, 0.14);
}
.relation-card.active {
  border-color: rgba(130, 219, 255, 0.38);
  box-shadow: 0 0 0 1px rgba(130, 219, 255, 0.18), 0 0 28px rgba(79, 142, 255, 0.18);
}
.relation-top, .tag-row, .bullet-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.relation-top { justify-content: space-between; align-items: center; }
.relation-card h4 { margin: 12px 0 8px; font-size: 18px; line-height: 1.45; }
.relation-card p { margin: 0; color: #9cc4eb; line-height: 1.6; font-size: 14px; }
.type-chip, .tag-row span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(123, 192, 255, 0.14);
  font-size: 12px;
}
.tag-row { margin-top: 12px; }
.tag-row span { background: rgba(70, 104, 167, 0.22); color: #d4ebff; }
.tag-row.compact span { margin-top: 0; }
.side-stack { display: grid; gap: 18px; align-content: start; }
.bullet-list { flex-direction: column; }
.bullet-item + .bullet-item { margin-top: 10px; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.tag-cloud span {
  border-radius: 999px;
  padding: 7px 11px;
  background: rgba(70, 104, 167, 0.22);
  border: 1px solid rgba(123, 192, 255, 0.14);
  color: #d4ebff;
  font-size: 12px;
}
@media (max-width: 1200px) {
  .detail-hero, .detail-content { grid-template-columns: 1fr; }
}
</style>
