export function buildTrendOption(dashboard, echarts) {
  const palette = ["#5c8dff", "#38d6c5", "#ff8a62", "#ffbf5a"]

  return {
    color: palette,
    grid: { left: 36, right: 18, top: 24, bottom: 28 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(17, 28, 50, 0.92)",
      borderWidth: 0,
      textStyle: { color: "#eef4ff" }
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: "#647595", fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10
    },
    xAxis: {
      type: "category",
      data: dashboard.trendSeries.months,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "rgba(100, 117, 149, 0.24)" } },
      axisTick: { show: false },
      axisLabel: { color: "#647595", fontSize: 11 }
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(100, 117, 149, 0.14)" } },
      axisLabel: { color: "#647595", fontSize: 11 },
      axisLine: { show: false }
    },
    series: dashboard.trendSeries.series.map((item, index) => ({
      name: item.name,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 3 },
      itemStyle: { color: palette[index % palette.length] },
      areaStyle: index === 0 ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(92, 141, 255, 0.18)" },
          { offset: 1, color: "rgba(92, 141, 255, 0.02)" }
        ])
      } : undefined,
      emphasis: { focus: "series" },
      data: item.data,
      animationDuration: 900 + index * 150
    }))
  }
}

export function buildRankingOption(dashboard, echarts) {
  return {
    grid: { left: 92, right: 18, top: 18, bottom: 24 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(17, 28, 50, 0.92)",
      borderWidth: 0,
      textStyle: { color: "#eef4ff" }
    },
    xAxis: {
      type: "value",
      axisLabel: { color: "#647595", fontSize: 11 },
      splitLine: { lineStyle: { color: "rgba(100, 117, 149, 0.14)" } },
      axisLine: { show: false }
    },
    yAxis: {
      type: "category",
      data: dashboard.rankingData.map(item => item.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: "#32425d", fontSize: 12 }
    },
    series: [{
      type: "bar",
      data: dashboard.rankingData.map(item => ({
        value: item.value,
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: "#38d6c5" },
            { offset: 1, color: "#5c8dff" }
          ])
        }
      })),
      barWidth: 14,
      label: {
        show: true,
        position: "right",
        color: "#32425d",
        fontWeight: 600
      },
      animationDuration: 800
    }]
  }
}
