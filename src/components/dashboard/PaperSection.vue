<template>
  <div class="type-grid">
    <!-- P1: Citation network -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>引用网络</span><span class="panel-tag">关系图</span></div>
      <div class="tp-body">
        <svg class="net-svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
          <line v-for="(l, i) in graph.links" :key="'pl'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
          <g v-for="n in graph.nodes" :key="n.id">
            <circle :cx="n.x" :cy="n.y" :r="n.type==='self' ? 13 : 6+Math.min(n.citations||0,30)/6" :class="['net-node', n.type]" />
            <text :x="n.x" :y="n.y+20" class="net-label" :class="n.type">{{ n.label?.slice(0,8) }}</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- P2: Domain radar -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>研究领域</span><span class="panel-tag">分布雷达</span></div>
      <div ref="keyEl" class="tp-chart"></div>
    </div>

    <!-- P3: Keywords bar -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>关键词权重</span><span class="panel-tag">横向排行</span></div>
      <div ref="relEl" class="tp-chart"></div>
    </div>

    <!-- P4: Authors + related papers -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>作者 & 相关</span><span class="panel-tag">详情</span></div>
      <div class="tp-body split-v">
        <div class="author-list">
          <div v-for="(a, i) in typeData.authors" :key="i" class="author-row" :class="{ main: a.isMain }">
            <span class="author-dot"></span>
            <span class="author-name">{{ a.name }}</span>
            <span class="author-org">{{ a.org }}</span>
            <span v-if="a.isMain" class="author-badge">通讯</span>
          </div>
        </div>
        <div class="related-paper-list">
          <div v-for="(p, i) in typeData.relatedPapers.slice(0,4)" :key="i" class="related-paper" :style="{ '--delay': i*0.07+'s' }">
            <span class="rp-year">{{ p.year }}</span>
            <span class="rp-title">{{ p.name }}</span>
            <span class="rp-cite">{{ p.citations }}引</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { buildPaperKeywordsOption, buildPaperRelatedOption } from '../../charts/type-charts.js'

const props = defineProps({
  graph: { type: Object, required: true },
  typeData: { type: Object, required: true },
})

const keyEl = ref(null)
const relEl = ref(null)
let keyChart = null
let relChart = null

watch(() => props.typeData, async (data) => {
  if (!data) return
  await new Promise((resolve) => setTimeout(resolve, 0))
  if (keyEl.value) {
    keyChart = keyChart || echarts.init(keyEl.value, null, { renderer: 'canvas' })
    keyChart.setOption(buildPaperKeywordsOption(data, echarts), true)
    keyChart.resize()
  }
  if (relEl.value) {
    relChart = relChart || echarts.init(relEl.value, null, { renderer: 'canvas' })
    relChart.setOption(buildPaperRelatedOption(data, echarts), true)
    relChart.resize()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  keyChart?.dispose()
  relChart?.dispose()
})
</script>
