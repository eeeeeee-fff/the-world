// type-charts.js
// ECharts option builders for the 4 particle-type detail panels.
// Each function receives (data, echarts) where data comes from generateParticleDetail().

// ---------------------------------------------------------------------------
// Shared style constants
// ---------------------------------------------------------------------------
const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(4,13,28,0.94)',
  borderColor: 'rgba(0,180,255,0.2)',
  borderWidth: 1,
  textStyle: { color: '#eef4ff', fontSize: 12 },
}

const AXIS_LINE_STYLE = { lineStyle: { color: 'rgba(100,117,149,0.2)' } }
const SPLIT_LINE_STYLE = { lineStyle: { color: 'rgba(100,117,149,0.08)' } }
const AXIS_LABEL_STYLE = { color: '#647595', fontSize: 11 }

// ---------------------------------------------------------------------------
// Talent — Radar chart (research directions)
// ---------------------------------------------------------------------------
export function buildTalentRadarOption(data, echarts) {
  const { directions } = data

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000,
    animationDelay: idx => idx * 80,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      ...TOOLTIP_STYLE,
    },
    radar: {
      indicator: directions.map(d => ({ name: d.name, max: 100 })),
      center: ['50%', '52%'],
      radius: '68%',
      axisName: { color: '#5ec8ff', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(100,117,149,0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(100,117,149,0.12)' } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar',
        animationDuration: 1000,
        animationDelay: idx => idx * 80,
        animationEasing: 'cubicOut',
        data: [
          {
            value: directions.map(d => d.value),
            name: '研究方向',
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { color: '#00d4ff', width: 2 },
            itemStyle: { color: '#00d4ff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,212,255,0.40)' },
                { offset: 1, color: 'rgba(0,212,255,0.08)' },
              ]),
              opacity: 0.25,
            },
          },
        ],
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Talent — Publication trend (combo: bar patents + line papers)
// ---------------------------------------------------------------------------
export function buildTalentPubOption(data, echarts) {
  const { years, papers, patents } = data.pubTrend

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 900,
    grid: { left: 36, right: 18, top: 40, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...TOOLTIP_STYLE,
    },
    legend: {
      top: 4,
      right: 8,
      textStyle: { color: '#647595', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    xAxis: {
      type: 'category',
      data: years,
      boundaryGap: true,
      axisLine: AXIS_LINE_STYLE,
      axisTick: { show: false },
      axisLabel: AXIS_LABEL_STYLE,
    },
    yAxis: [
      {
        type: 'value',
        name: '论文',
        nameTextStyle: { color: '#647595', fontSize: 10 },
        axisLine: AXIS_LINE_STYLE,
        splitLine: SPLIT_LINE_STYLE,
        axisLabel: AXIS_LABEL_STYLE,
      },
      {
        type: 'value',
        name: '专利',
        nameTextStyle: { color: '#647595', fontSize: 10 },
        axisLine: AXIS_LINE_STYLE,
        splitLine: { show: false },
        axisLabel: AXIS_LABEL_STYLE,
      },
    ],
    series: [
      {
        name: '专利',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: 14,
        data: patents.map((v, idx) => ({
          value: v,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: '#0040cc' },
            ]),
          },
        })),
        animationDuration: 900,
        animationDelay: idx => idx * 60,
        animationEasing: 'cubicOut',
      },
      {
        name: '论文',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#57e38d', width: 2 },
        itemStyle: { color: '#57e38d' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(87,227,141,0.28)' },
            { offset: 1, color: 'rgba(87,227,141,0.02)' },
          ]),
        },
        data: papers,
        animationDuration: 900,
        animationDelay: 300,
        animationEasing: 'cubicOut',
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Enterprise — Stacked output bar (patents bottom, papers top)
// ---------------------------------------------------------------------------
export function buildEnterpriseOutputOption(data, echarts) {
  const { years, patents, papers } = data.outputTrend

  return {
    backgroundColor: 'transparent',
    animation: true,
    grid: { left: 36, right: 18, top: 36, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...TOOLTIP_STYLE,
    },
    legend: {
      top: 4,
      right: 8,
      textStyle: { color: '#647595', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    xAxis: {
      type: 'category',
      data: years,
      boundaryGap: true,
      axisLine: AXIS_LINE_STYLE,
      axisTick: { show: false },
      axisLabel: AXIS_LABEL_STYLE,
    },
    yAxis: {
      type: 'value',
      axisLine: AXIS_LINE_STYLE,
      splitLine: SPLIT_LINE_STYLE,
      axisLabel: AXIS_LABEL_STYLE,
    },
    series: [
      {
        name: '专利',
        type: 'bar',
        stack: 'output',
        barWidth: 14,
        data: patents.map(v => ({
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#5c8dff' },
              { offset: 1, color: '#0040cc' },
            ]),
          },
        })),
        animationDuration: 900,
        animationDelay: idx => idx * 80,
        animationEasing: 'quarticOut',
      },
      {
        name: '论文',
        type: 'bar',
        stack: 'output',
        barWidth: 14,
        data: papers.map(v => ({
          value: v,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#57e38d' },
              { offset: 1, color: '#00b4aa' },
            ]),
          },
        })),
        animationDuration: 900,
        animationDelay: idx => idx * 80,
        animationEasing: 'quarticOut',
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Enterprise — Talent composition donut
// ---------------------------------------------------------------------------
export function buildEnterpriseTalentOption(data, echarts) {
  const { talentTypes } = data
  const palette = ['#00d4ff', '#57e38d', '#ffa14a', '#b57bee', '#ff6b8a', '#5c8dff']

  return {
    backgroundColor: 'transparent',
    animation: true,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      ...TOOLTIP_STYLE,
    },
    legend: {
      bottom: 4,
      textStyle: { color: '#647595', fontSize: 10 },
      itemWidth: 8,
      itemHeight: 8,
    },
    color: palette,
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '52%'],
        animationType: 'expansion',
        animationDuration: 1000,
        animationDelay: idx => idx * 100,
        animationEasing: 'cubicOut',
        label: {
          color: '#9cc4eb',
          fontSize: 10,
        },
        labelLine: {
          lineStyle: { color: 'rgba(100,117,149,0.4)' },
        },
        data: talentTypes.map((item, idx) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: palette[idx % palette.length] },
        })),
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Paper — Keyword horizontal bar chart
// ---------------------------------------------------------------------------
export function buildPaperKeywordsOption(data, echarts) {
  const { keywords } = data
  // keywords already sorted desc by weight from generatePaperDetail

  return {
    backgroundColor: 'transparent',
    animation: true,
    grid: { left: 72, right: 28, top: 10, bottom: 16 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...TOOLTIP_STYLE,
    },
    xAxis: {
      type: 'value',
      axisLine: AXIS_LINE_STYLE,
      splitLine: SPLIT_LINE_STYLE,
      axisLabel: AXIS_LABEL_STYLE,
    },
    yAxis: {
      type: 'category',
      data: keywords.map(k => k.word),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#8fbdf0', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 10,
        data: keywords.map((k, idx) => ({
          value: k.weight,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#0040cc' },
              { offset: 1, color: '#00d4ff' },
            ]),
          },
        })),
        animationDuration: 700,
        animationDelay: idx => (keywords.length - idx) * 60,
        animationEasing: 'cubicOut',
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Paper — Related papers scatter chart
// ---------------------------------------------------------------------------
export function buildPaperRelatedOption(data, echarts) {
  const { relatedPapers } = data
  const palette = ['#00d4ff', '#57e38d', '#ffa14a', '#b57bee', '#ff6b8a', '#5c8dff',
                   '#0096c7', '#00b4aa', '#f7c948', '#e05d9e']

  // Build domain → color index mapping
  const domainMap = {}
  let colorIdx = 0
  relatedPapers.forEach(p => {
    if (domainMap[p.domain] === undefined) {
      domainMap[p.domain] = colorIdx % palette.length
      colorIdx++
    }
  })

  const seriesData = relatedPapers.map((p, idx) => ({
    name: p.name,
    value: [p.year, p.citations, p.citations],
    symbolSize: Math.max(6, Math.sqrt(p.citations) * 1.8),
    itemStyle: {
      color: palette[domainMap[p.domain]],
      shadowBlur: 10,
      shadowColor: palette[domainMap[p.domain]] + '88',
    },
  }))

  return {
    backgroundColor: 'transparent',
    animation: true,
    grid: { left: 44, right: 18, top: 28, bottom: 36 },
    tooltip: {
      trigger: 'item',
      formatter: params => {
        const p = relatedPapers[params.dataIndex]
        return `<b>${p.name}</b><br/>引用次数: ${p.citations}<br/>领域: ${p.domain}`
      },
      ...TOOLTIP_STYLE,
    },
    xAxis: {
      type: 'value',
      name: '年份',
      nameTextStyle: { color: '#647595', fontSize: 10 },
      min: 2018,
      max: 2024,
      interval: 1,
      axisLine: AXIS_LINE_STYLE,
      splitLine: SPLIT_LINE_STYLE,
      axisLabel: { color: '#647595', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: '引用',
      nameTextStyle: { color: '#647595', fontSize: 10 },
      axisLine: AXIS_LINE_STYLE,
      splitLine: SPLIT_LINE_STYLE,
      axisLabel: AXIS_LABEL_STYLE,
    },
    series: [
      {
        type: 'scatter',
        data: seriesData,
        animationDuration: 800,
        animationDelay: idx => idx * 25,
        animationEasing: 'elasticOut',
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Patent — Tech classification treemap
// ---------------------------------------------------------------------------
export function buildPatentTreemapOption(data, echarts) {
  const { techTree } = data
  const topPalette = ['#003a8c', '#005b9f', '#0077b6', '#0096c7']

  const treeData = techTree.map((cat, idx) => ({
    name: cat.name,
    value: cat.value,
    itemStyle: { color: topPalette[idx % topPalette.length] },
    label: {
      fontWeight: 'bold',
      color: '#ffffff',
      fontSize: 12,
    },
    children: cat.children.map(child => ({
      name: child.name,
      value: child.value,
      label: {
        color: '#a0d8f0',
        fontSize: 10,
        fontWeight: 'normal',
      },
    })),
  }))

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
      ...TOOLTIP_STYLE,
    },
    series: [
      {
        type: 'treemap',
        leafDepth: 1,
        roam: false,
        width: '100%',
        height: '100%',
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        label: {
          show: true,
          position: 'insideTopLeft',
        },
        breadcrumb: { show: false },
        data: treeData,
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Patent — Filing trend area line chart
// ---------------------------------------------------------------------------
export function buildPatentTrendOption(data, echarts) {
  const { years, counts } = data.filingTrend

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    grid: { left: 36, right: 18, top: 24, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      ...TOOLTIP_STYLE,
    },
    xAxis: {
      type: 'category',
      data: years,
      boundaryGap: false,
      axisLine: AXIS_LINE_STYLE,
      axisTick: { show: false },
      axisLabel: AXIS_LABEL_STYLE,
    },
    yAxis: {
      type: 'value',
      axisLine: AXIS_LINE_STYLE,
      splitLine: SPLIT_LINE_STYLE,
      axisLabel: AXIS_LABEL_STYLE,
    },
    series: [
      {
        type: 'line',
        data: counts,
        smooth: 0.5,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#00d4ff', width: 2 },
        itemStyle: { color: '#00d4ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,212,255,0.25)' },
            { offset: 1, color: 'rgba(0,212,255,0)' },
          ]),
        },
        animationDuration: 1200,
        animationEasing: 'cubicOut',
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Patent — IPC classification donut
// ---------------------------------------------------------------------------
export function buildPatentIpcOption(data, echarts) {
  const { ipcDist } = data
  const palette = ['#00d4ff', '#0096c7', '#0077b6', '#005b9f', '#003a8c', '#5c8dff']

  return {
    backgroundColor: 'transparent',
    animation: true,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      ...TOOLTIP_STYLE,
    },
    color: palette,
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '52%'],
        animationType: 'expansion',
        animationDuration: 900,
        animationDelay: idx => idx * 80,
        animationEasing: 'cubicOut',
        label: {
          formatter: '{b}\n{d}%',
          color: '#9cc4eb',
          fontSize: 10,
        },
        labelLine: {
          lineStyle: { color: 'rgba(100,117,149,0.4)' },
        },
        data: ipcDist.map((item, idx) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: palette[idx % palette.length] },
        })),
      },
    ],
  }
}
