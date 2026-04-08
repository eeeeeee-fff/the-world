export default {
  kicker: "TECH TRACKING / NEW ENERGY",
  heroTitle: "新能源赛道的核心在于订单和供需节奏",
  heroDescription: "页面优先展示扩产、订单、设备升级等强信号，再辅以图表帮助判断景气度变化。",
  systemSummary: "新能源当前仍是高景气赛道，但比热度更重要的是企业对未来需求的真实投入和供需平衡变化。",
  metricCards: [
    { label: "行业热度", value: "86" },
    { label: "增长率", value: "+21%" },
    { label: "活跃企业数", value: "132" },
    { label: "热点赛道数", value: "7" }
  ],
  trendTitle: "行业趋势图",
  trendDesc: "观察储能、光伏装备与动力电池的景气变化",
  trendSeries: {
    months: ["10月", "11月", "12月", "1月", "2月", "3月"],
    series: [
      { name: "储能系统", data: [40, 45, 51, 59, 69, 78] },
      { name: "光伏装备", data: [34, 38, 43, 50, 57, 65] },
      { name: "动力电池", data: [37, 39, 42, 47, 55, 61] }
    ]
  },
  rankingTitle: "热点赛道排行",
  rankingDesc: "新能源赛道近期最热的细分方向",
  rankingData: [
    { name: "储能系统", value: 86 },
    { name: "光伏装备", value: 79 },
    { name: "动力电池", value: 73 },
    { name: "电池回收", value: 66 },
    { name: "氢能设备", value: 61 },
    { name: "新能源材料", value: 57 }
  ],
  intelTitle: "最新动态",
  intelCards: [
    { title: "储能企业签下新一轮大额订单", tag: "订单", impact: "利好", time: "03-31 09:40", summary: "储能系统订单延续高位，景气度信号继续强化。", analysis: "订单比热搜更关键，说明终端需求对未来交付仍有较强信心。", score: 98 },
    { title: "光伏装备企业发布新一代产线方案", tag: "技术", impact: "利好", time: "03-31 08:35", summary: "设备升级逻辑从效率竞争转向综合成本控制。", analysis: "装备环节正在重新定义行业竞争方式，值得提升跟踪权重。", score: 93 },
    { title: "动力电池回收政策进入细化阶段", tag: "政策", impact: "利好", time: "03-30 17:10", summary: "回收与再利用标准进一步明确，相关企业受益预期增强。", analysis: "政策细化会改变企业排序，也会提升回收赛道的中长期确定性。", score: 92 },
    { title: "多家企业同步扩充储能产能", tag: "扩产", impact: "中性", time: "03-30 13:20", summary: "储能环节扩产信号频繁出现，供给侧动作加快。", analysis: "中性偏正面，但需要继续观察是否会形成阶段性产能过剩。", score: 86 },
    { title: "氢能设备合作信号开始升温", tag: "合作", impact: "中性", time: "03-30 10:00", summary: "合作密度增加但绝对热度尚未形成主线。", analysis: "可持续观察，但还不足以成为当前新能源赛道的核心主题。", score: 80 },
    { title: "部分材料价格波动压缩毛利空间", tag: "供应链", impact: "利空", time: "03-29 19:00", summary: "上游价格波动对中小制造企业经营稳定性形成压力。", analysis: "成本波动会加剧企业分化，后续应重点观察头部厂商的成本转嫁能力。", score: 75 }
  ],
  activeTalents: [
    { name: "郑维", org: "宁波储能研究院", direction: "储能系统", score: "热度 92", note: "订单与扩产相关线索中频繁出现，是当前高价值跟踪对象。" },
    { name: "韩澈", org: "无锡光伏装备中心", direction: "光伏装备", score: "热度 88", note: "新一代产线方案与设备升级议题相关性高。" },
    { name: "罗敬之", org: "合肥动力电池实验室", direction: "电池回收", score: "热度 83", note: "政策细化带动其在回收链条中的曝光明显提升。" }
  ]
}
