<template>
  <section class="charts-support-section">
    <div class="section-title-row">
      <div>
        <h3>辅助分析</h3>
        <p>图表用于支撑判断，不作为页面主内容</p>
      </div>
    </div>
    <div class="charts-grid">
      <article class="chart-panel glass-card">
        <div class="panel-head compact-head">
          <div>
            <h3>{{ dashboard.trendTitle }}</h3>
            <p>{{ dashboard.trendDesc }}</p>
          </div>
          <span class="panel-tag">趋势</span>
        </div>
        <div ref="trendChartRef" class="chart-box chart-box-small"></div>
      </article>

      <article class="chart-panel glass-card">
        <div class="panel-head compact-head">
          <div>
            <h3>{{ dashboard.rankingTitle }}</h3>
            <p>{{ dashboard.rankingDesc }}</p>
          </div>
          <span class="panel-tag">排行</span>
        </div>
        <div ref="rankingChartRef" class="chart-box chart-box-small"></div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { buildRankingOption, buildTrendOption } from '../charts/chart-options.js'

const props = defineProps({
  dashboard: { type: Object, required: true }
})

const trendChartRef = ref(null)
const rankingChartRef = ref(null)
const trendChart = ref(null)
const rankingChart = ref(null)

function resizeCharts() {
  trendChart.value?.resize()
  rankingChart.value?.resize()
}

function ensureCharts() {
  if (!trendChartRef.value || !rankingChartRef.value) {
    return false
  }

  if (!trendChart.value) {
    trendChart.value = echarts.init(trendChartRef.value)
  }

  if (!rankingChart.value) {
    rankingChart.value = echarts.init(rankingChartRef.value)
  }

  return true
}

async function refreshCharts() {
  await nextTick()

  if (!ensureCharts()) {
    return
  }

  trendChart.value.setOption(buildTrendOption(props.dashboard, echarts), true)
  rankingChart.value.setOption(buildRankingOption(props.dashboard, echarts), true)
  resizeCharts()
}

watch(() => props.dashboard, refreshCharts, { deep: true })

onMounted(() => {
  refreshCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart.value?.dispose()
  rankingChart.value?.dispose()
})
</script>
