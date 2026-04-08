export function buildTrendOption(dashboard, echarts) {
  const palette = ['#58d5ff', '#57e38d', '#ffa14a', '#b57bee']

  return {
    color: palette,
    animation: true,
    animationDuration: 1400,
    animationEasing: 'cubicOut',
    grid: { left: 36, right: 18, top: 28, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(4, 13, 28, 0.94)',
      borderColor: 'rgba(0, 180, 255, 0.2)',
      borderWidth: 1,
      textStyle: { color: '#eef4ff', fontSize: 12 }
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#647595', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10
    },
    xAxis: {
      type: 'category',
      data: dashboard.trendSeries.months,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(100, 117, 149, 0.24)' } },
      axisTick: { show: false },
      axisLabel: { color: '#647595', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(100, 117, 149, 0.1)' } },
      axisLabel: { color: '#647595', fontSize: 11 },
      axisLine: { show: false }
    },
    series: dashboard.trendSeries.series.map((item, index) => ({
      name: item.name,
      type: 'line',
      smooth: 0.5,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 2.5 },
      itemStyle: { color: palette[index % palette.length] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: palette[index % palette.length] + '30' },
          { offset: 1, color: palette[index % palette.length] + '00' }
        ])
      },
      emphasis: { focus: 'series' },
      data: item.data,
      // 每条线错开 220ms，形成逐条描绘效果
      animationDuration: 1200,
      animationDelay: index * 220,
      animationEasing: 'cubicOut',
    }))
  }
}

export function buildRankingOption(dashboard, echarts) {
  return {
    animation: true,
    animationDuration: 900,
    animationEasing: 'cubicOut',
    grid: { left: 92, right: 36, top: 10, bottom: 16 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(4, 13, 28, 0.94)',
      borderColor: 'rgba(0, 180, 255, 0.2)',
      borderWidth: 1,
      textStyle: { color: '#eef4ff' }
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#647595', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(100, 117, 149, 0.1)' } },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: dashboard.rankingData.map(item => item.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#8fbdf0', fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: dashboard.rankingData.map((item, idx) => ({
        value: item.value,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0040cc' },
            { offset: 1, color: '#00d4ff' }
          ])
        }
      })),
      barWidth: 12,
      label: {
        show: true,
        position: 'right',
        color: '#8fbdf0',
        fontWeight: 700,
        fontSize: 11
      },
      // 每条柱错开 80ms 从0增长，形成瀑布入场
      animationDuration: 800,
      animationDelay: idx => idx * 80,
      animationEasing: 'quarticOut',
    }]
  }
}
