<template>
  <div class="type-grid">
    <!-- P1: Tech tag cloud -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>核心技术</span><span class="panel-tag">标签云</span></div>
      <div class="tp-body tag-cloud-wrap">
        <span
          v-for="(t, i) in typeData.techTags" :key="i"
          class="tech-tag"
          :style="{ fontSize: (10 + t.weight*2.5)+'px', opacity: 0.55 + t.weight*0.09, animationDelay: i*0.04+'s' }"
        >{{ t.label }}</span>
      </div>
    </div>

    <!-- P2: Talent composition donut -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>人才构成</span><span class="panel-tag">圆环</span></div>
      <div ref="talentEl" class="tp-chart"></div>
    </div>

    <!-- P3: Output trend stacked bar -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>产出趋势</span><span class="panel-tag">专利 / 论文</span></div>
      <div ref="outputEl" class="tp-chart"></div>
    </div>

    <!-- P4: Partner network + activities -->
    <div class="tp glass-inner">
      <div class="tp-head"><span>合作机构</span><span class="panel-tag">网络</span></div>
      <div class="tp-body split-v">
        <svg class="net-svg net-svg-sm" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
          <line v-for="(l, i) in graph.links" :key="'el'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
          <g v-for="n in graph.nodes" :key="n.id">
            <circle :cx="n.x" :cy="n.y" :r="n.type==='self' ? 12 : 7" :class="['net-node', n.type]" />
            <text :x="n.x" :y="n.y+20" class="net-label" :class="n.type">{{ n.label?.slice(0,6) }}</text>
          </g>
        </svg>
        <div class="mini-activity-list">
          <div
            v-for="(a, i) in typeData.activities.slice(0,3)" :key="i"
            class="mini-act"
            :class="{ clickable: isActivityDetailAvailable(a) }"
            :style="{ '--delay': i*0.1+'s' }"
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
import { buildEnterpriseOutputOption, buildEnterpriseTalentOption } from '../../charts/type-charts.js'

const props = defineProps({
  graph: { type: Object, required: true },
  typeData: { type: Object, required: true },
  isActivityDetailAvailable: { type: Function, required: true },
})
defineEmits(['open-activity'])

const talentEl = ref(null)
const outputEl = ref(null)
let talentChart = null
let outputChart = null

watch(() => props.typeData, async (data) => {
  if (!data) return
  await new Promise((resolve) => setTimeout(resolve, 0))
  if (talentEl.value) {
    talentChart = talentChart || echarts.init(talentEl.value, null, { renderer: 'canvas' })
    talentChart.setOption(buildEnterpriseTalentOption(data, echarts), true)
    talentChart.resize()
  }
  if (outputEl.value) {
    outputChart = outputChart || echarts.init(outputEl.value, null, { renderer: 'canvas' })
    outputChart.setOption(buildEnterpriseOutputOption(data, echarts), true)
    outputChart.resize()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  talentChart?.dispose()
  outputChart?.dispose()
})
</script>
