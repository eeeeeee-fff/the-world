export default {
  kicker: "TECH TRACKING / ROBOTICS",
  heroTitle: "机器人赛道正在从热度叙事转向量产验证",
  heroDescription: "本页优先回答最近发生了什么，再用图表补充支撑判断。当前机器人情报主线集中在融资、扩产、零部件突破和场景订单兑现。",
  systemSummary: "今日最值得盯的是量产能力、核心零部件和场景复制速度。机器人赛道不再只是概念升温，而是在向真实交付和供应链卡位演进。",
  metricCards: [
    { label: "行业热度", value: "92" },
    { label: "增长率", value: "+28%" },
    { label: "活跃企业数", value: "146" },
    { label: "热点赛道数", value: "8" }
  ],
  trendTitle: "行业趋势图",
  trendDesc: "观察机器人细分赛道近六个月关注度变化",
  trendSeries: {
    months: ["10月", "11月", "12月", "1月", "2月", "3月"],
    series: [
      { name: "具身机器人", data: [48, 53, 59, 72, 85, 92] },
      { name: "工业执行", data: [36, 41, 46, 57, 69, 78] },
      { name: "核心零部件", data: [30, 35, 39, 47, 56, 64] }
    ]
  },
  rankingTitle: "热点赛道排行",
  rankingDesc: "当前热度最高的机器人细分方向",
  rankingData: [
    { name: "具身机器人", value: 92 },
    { name: "工业执行系统", value: 83 },
    { name: "灵巧手", value: 77 },
    { name: "机器视觉", value: 71 },
    { name: "协作机器人", value: 66 },
    { name: "核心减速器", value: 59 }
  ],
  intelTitle: "最新动态",
  intelCards: [
    { title: "具身机器人企业完成新一轮产业融资", tag: "融资", impact: "利好", time: "03-31 09:20", summary: "资金用途明显从概念验证转向中试线和量产交付体系建设。", analysis: "资本正在把判断标准从故事能力切换到制造和兑现能力，这会让赛道头部更快拉开差距。", score: 98 },
    { title: "示范工厂新增机器人执行系统订单", tag: "订单", impact: "利好", time: "03-31 08:45", summary: "工业执行系统在制造场景中的成套采购需求显著增加。", analysis: "订单信号比流量更有价值，说明机器人正在进入可复制的行业部署阶段。", score: 94 },
    { title: "地方政策加码机器人核心零部件攻关", tag: "政策", impact: "利好", time: "03-30 18:10", summary: "政策重点从整机展示转向减速器、控制器与执行部件自主化。", analysis: "核心部件决定利润与壁垒，政策向上游倾斜意味着赛道主线更加清晰。", score: 93 },
    { title: "头部厂商启动跨城扩产计划", tag: "扩产", impact: "中性", time: "03-30 15:30", summary: "扩产从单基地升级为跨区域协同布局，交付预期增强。", analysis: "扩产是积极信号，但仍要结合订单兑现率判断是否存在节奏过快的问题。", score: 88 },
    { title: "医疗与物流场景机器人合作密度上升", tag: "合作", impact: "中性", time: "03-30 11:05", summary: "应用合作从展示型场景扩展到更复杂的流程环节。", analysis: "合作频繁说明需求在扩散，但真正的判断仍然取决于后续稳定交付。", score: 84 },
    { title: "灵巧手供应链价格出现阶段性波动", tag: "供应链", impact: "利空", time: "03-29 17:20", summary: "上游关键部件短期供给紧张，引发部分交付节奏调整。", analysis: "这类波动会压缩中小企业利润空间，也会加速供应链向头部集中。", score: 79 }
  ],
  activeTalents: [
    { name: "陈知行", org: "上海智造研究院", direction: "具身控制", score: "热度 94", note: "近期同时出现在具身控制和执行系统相关项目中，联动信号较强。" },
    { name: "刘沛然", org: "苏州机器人实验室", direction: "灵巧手", score: "热度 89", note: "围绕灵巧手与末端执行器的技术曝光度快速提升。" },
    { name: "周越", org: "深圳先进制造中心", direction: "工业执行", score: "热度 86", note: "在示范工厂落地项目中出现频率高，值得持续跟踪。" }
  ]
}
