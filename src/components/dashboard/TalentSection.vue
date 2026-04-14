<template>
  <div class="type-grid">
    <!-- P1: Knowledge graph -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>知识图谱</span><span class="panel-tag">关系网络</span></div>
      <div class="tp-body">
        <svg class="net-svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
          <line v-for="(l, i) in graph.links" :key="'tl'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
          <text v-for="(l, i) in graph.links" :key="'tlb'+i" :x="l.lx" :y="l.ly" class="net-link-label">{{ l.label }}</text>
          <g v-for="n in graph.nodes" :key="n.id">
            <circle :cx="n.x" :cy="n.y" :r="n.type==='self' ? 14 : n.weight*5+5" :class="['net-node', n.type]" />
            <text :x="n.x" :y="n.y + (n.type==='self' ? 24 : n.weight*5+16)" class="net-label" :class="n.type">{{ n.label }}</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- P2: Research directions radar -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>研究方向</span><span class="panel-tag">能力雷达</span></div>
      <div ref="radarEl" class="tp-chart"></div>
    </div>

    <!-- P3: Publication trend -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>发表趋势</span><span class="panel-tag">论文 / 专利</span></div>
      <div ref="pubEl" class="tp-chart"></div>
    </div>

    <!-- P4: Activity timeline -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>近期动态</span><span class="panel-tag">时间线</span></div>
      <div class="activity-list">
        <div
          v-for="(a, i) in typeData.activities" :key="i"
          class="activity-item"
          :class="{ clickable: isActivityDetailAvailable(a) }"
          :style="{ '--delay': i*0.08+'s' }"
          @click="$emit('open-activity', a)"
        >
          <div class="act-dot" :class="a.type"></div>
          <div class="act-body">
            <div class="act-meta">
              <span class="act-tag" :class="a.type">{{ a.tag }}</span>
              <span :class="['impact-chip', a.impact==='利好'?'pos':a.impact==='利空'?'neg':'neu']">{{ a.impact }}</span>
              <time>{{ a.date }}</time>
            </div>
            <p class="act-title">{{ a.title }}</p>
            <span v-if="isActivityDetailAvailable(a)" class="act-link">查看详情</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { buildTalentRadarOption, buildTalentPubOption } from '../../charts/type-charts.js'

const props = defineProps({
  graph: { type: Object, required: true },
  typeData: { type: Object, required: true },
  isActivityDetailAvailable: { type: Function, required: true },
})
defineEmits(['open-activity'])

const radarEl = ref(null)
const pubEl = ref(null)
let radarChart = null
let pubChart = null

watch(() => props.typeData, async (data) => {
  if (!data) return
  await new Promise((resolve) => setTimeout(resolve, 0))
  if (radarEl.value) {
    radarChart = radarChart || echarts.init(radarEl.value, null, { renderer: 'canvas' })
    radarChart.setOption(buildTalentRadarOption(data, echarts), true)
    radarChart.resize()
  }
  if (pubEl.value) {
    pubChart = pubChart || echarts.init(pubEl.value, null, { renderer: 'canvas' })
    pubChart.setOption(buildTalentPubOption(data, echarts), true)
    pubChart.resize()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  radarChart?.dispose()
  pubChart?.dispose()
})
</script>
