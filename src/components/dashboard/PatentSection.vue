<template>
  <div class="type-grid">
    <!-- P1: Tech treemap -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>技术分类</span><span class="panel-tag">树状图</span></div>
      <div ref="treeEl" class="tp-chart"></div>
    </div>

    <!-- P2: Filing trend -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>申请趋势</span><span class="panel-tag">年度走势</span></div>
      <div ref="trendEl" class="tp-chart"></div>
    </div>

    <!-- P3: Applicant network -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>权利人网络</span><span class="panel-tag">关系图</span></div>
      <div class="tp-body">
        <svg class="net-svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
          <line v-for="(l, i) in graph.links" :key="'ptl'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
          <g v-for="n in graph.nodes" :key="n.id">
            <circle :cx="n.x" :cy="n.y" :r="n.type==='self' ? 13 : 8"
              :class="['net-node', n.type, n.type==='enterprise'?'ent':n.type==='university'?'uni':'']" />
            <text :x="n.x" :y="n.y+21" class="net-label">{{ n.label?.slice(0,6) }}</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- P4: IPC + activities -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>IPC 分类</span><span class="panel-tag">分布</span></div>
      <div class="tp-body split-v">
        <div ref="ipcEl" class="tp-chart flex-half"></div>
        <div class="mini-activity-list">
          <div
            v-for="(a, i) in typeData.activities.slice(0,3)" :key="i"
            class="mini-act"
            :class="{ clickable: isActivityDetailAvailable(a) }"
            :style="{ '--delay': i*0.09+'s' }"
            @click="$emit('open-activity', a)"
          >
            <span class="act-tag" :class="a.type">{{ a.tag }}</span>
            <span class="mini-act-title">{{ a.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { buildPatentTreemapOption, buildPatentTrendOption, buildPatentIpcOption } from '../../charts/type-charts.js'

const props = defineProps({
  graph: { type: Object, required: true },
  typeData: { type: Object, required: true },
  isActivityDetailAvailable: { type: Function, required: true },
})
defineEmits(['open-activity'])

const treeEl = ref(null)
const trendEl = ref(null)
const ipcEl = ref(null)
let treeChart = null
let trendChart = null
let ipcChart = null

watch(() => props.typeData, async (data) => {
  if (!data) return
  await new Promise((resolve) => setTimeout(resolve, 0))
  if (treeEl.value) {
    treeChart = treeChart || echarts.init(treeEl.value, null, { renderer: 'canvas' })
    treeChart.setOption(buildPatentTreemapOption(data, echarts), true)
    treeChart.resize()
  }
  if (trendEl.value) {
    trendChart = trendChart || echarts.init(trendEl.value, null, { renderer: 'canvas' })
    trendChart.setOption(buildPatentTrendOption(data, echarts), true)
    trendChart.resize()
  }
  if (ipcEl.value) {
    ipcChart = ipcChart || echarts.init(ipcEl.value, null, { renderer: 'canvas' })
    ipcChart.setOption(buildPatentIpcOption(data, echarts), true)
    ipcChart.resize()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  treeChart?.dispose()
  trendChart?.dispose()
  ipcChart?.dispose()
})
</script>
