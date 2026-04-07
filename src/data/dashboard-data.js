export const sideMenus = ["科创雷达", "要素画像", "科创智能体", "区域创新", "设置"];

export const tabs = ["技术追踪", "人才动态", "机构速递", "产业洞察", "区域创新"];

export const techCategories = [
    { key: "robot", label: "机器人" },
    { key: "bio", label: "生物医药" },
    { key: "energy", label: "新能源" },
    { key: "ai", label: "人工智能" }
];

export const categoryData = {
                robot: {
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
                    intelDesc: "按时间排序，帮助用户先看到最近发生的核心事件",
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
                    ],
                    tickerItems: [
                        "机器人融资信号增强，资本重点转向量产能力",
                        "示范工厂订单提升机器人落地可信度",
                        "核心零部件政策支持力度继续提升",
                        "跨城扩产成为机器人赛道最新观察点"
                    ]
                },
                bio: {
                    kicker: "TECH TRACKING / BIOMEDICINE",
                    heroTitle: "生物医药赛道更值得看验证而不是热搜",
                    heroDescription: "页面重心从单纯图表转向事件判断，优先展示临床进展、平台建设与制造能力相关情报。",
                    systemSummary: "当前最重要的不是短期话题热度，而是临床资源集中度、平台能力延展和制造环节是否同步增强。",
                    metricCards: [
                        { label: "行业热度", value: "84" },
                        { label: "增长率", value: "+17%" },
                        { label: "活跃企业数", value: "118" },
                        { label: "热点赛道数", value: "6" }
                    ],
                    trendTitle: "行业趋势图",
                    trendDesc: "观察创新药、细胞治疗与合成生物的关注度变化",
                    trendSeries: {
                        months: ["10月", "11月", "12月", "1月", "2月", "3月"],
                        series: [
                            { name: "创新药", data: [44, 46, 49, 55, 63, 71] },
                            { name: "细胞治疗", data: [32, 35, 37, 43, 50, 59] },
                            { name: "合成生物", data: [28, 31, 35, 41, 47, 55] }
                        ]
                    },
                    rankingTitle: "热点赛道排行",
                    rankingDesc: "生物医药赛道的近期高关注方向",
                    rankingData: [
                        { name: "创新药研发", value: 84 },
                        { name: "细胞治疗", value: 76 },
                        { name: "合成生物", value: 71 },
                        { name: "ADC 药物", value: 67 },
                        { name: "生物制造平台", value: 62 },
                        { name: "AI 制药", value: 58 }
                    ],
                    intelTitle: "最新动态",
                    intelDesc: "最新事件优先，突出临床、政策与平台建设",
                    intelCards: [
                        { title: "细胞治疗项目新增高质量临床验证资源", tag: "临床", impact: "利好", time: "03-31 08:20", summary: "头部项目获得新的临床验证入口，验证效率预期上升。", analysis: "高质量临床资源是生物医药赛道里最有判断价值的信号之一。", score: 97 },
                        { title: "创新药平台公司披露多中心合作进展", tag: "合作", impact: "中性", time: "03-31 10:10", summary: "合作内容从单靶点扩展到平台级联合研发。", analysis: "合作本身偏正面，但仍需结合后续临床推进节奏判断真实价值。", score: 89 },
                        { title: "地方政策鼓励生物制造平台建设", tag: "政策", impact: "利好", time: "03-30 16:40", summary: "政策支持从研发端延伸到制造与转化能力建设。", analysis: "平台能力一旦强化，生物医药的产业化确定性会明显提升。", score: 94 },
                        { title: "合成生物企业完成工艺放大合作", tag: "技术", impact: "利好", time: "03-30 14:25", summary: "合作焦点转向工艺稳定性和规模化生产验证。", analysis: "这代表合成生物正逐步摆脱实验室叙事，进入产业化阶段。", score: 91 },
                        { title: "AI 制药热度回升但项目分化明显", tag: "技术", impact: "中性", time: "03-30 09:55", summary: "部分企业重新获得关注，但实际效率提升仍待验证。", analysis: "短期关注回暖不等于长期价值确定，仍需看是否带来明确研发增效。", score: 82 },
                        { title: "部分早期项目融资推进放缓", tag: "融资", impact: "利空", time: "03-29 18:10", summary: "资金更倾向流向具备平台能力和临床资源的项目。", analysis: "融资放缓会压缩纯故事型项目空间，但也会提高赛道筛选质量。", score: 76 }
                    ],
                    activeTalents: [
                        { name: "林舒然", org: "华东医药创新中心", direction: "细胞治疗", score: "热度 91", note: "近期在临床验证和平台合作事件中同时出现，线索密集。" },
                        { name: "顾明舟", org: "苏州生物平台", direction: "合成生物", score: "热度 87", note: "工艺放大和平台建设相关话题连续升温。" },
                        { name: "宋澜", org: "上海创新药研究院", direction: "创新药", score: "热度 84", note: "围绕多中心合作和临床推进的曝光明显上升。" }
                    ],
                    tickerItems: [
                        "临床验证资源继续集中，头部项目优势扩大",
                        "平台建设成为生物医药政策新重点",
                        "合成生物工艺放大合作持续增加",
                        "AI 制药热度回升但仍需看效率兑现"
                    ]
                },
                energy: {
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
                    intelDesc: "围绕订单、扩产和政策的最新事件流",
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
                    ],
                    tickerItems: [
                        "储能订单继续放大新能源景气信号",
                        "光伏装备升级重心转向成本控制",
                        "电池回收政策细化推升相关赛道关注",
                        "扩产频率增加但需警惕阶段性过剩"
                    ]
                },
                ai: {
                    kicker: "TECH TRACKING / AI",
                    heroTitle: "AI 赛道的关键判断已从模型热度转向行业落地",
                    heroDescription: "当前页面优先呈现垂直场景下沉、智能体试点、工业 AI 导入等更接近真实价值的情报。",
                    systemSummary: "今天最值得关注的不是模型参数，而是谁率先把 AI 做成可复用、可交付、可持续付费的行业解决方案。",
                    metricCards: [
                        { label: "行业热度", value: "95" },
                        { label: "增长率", value: "+31%" },
                        { label: "活跃企业数", value: "173" },
                        { label: "热点赛道数", value: "9" }
                    ],
                    trendTitle: "行业趋势图",
                    trendDesc: "观察行业大模型、智能体和工业 AI 的关注变化",
                    trendSeries: {
                        months: ["10月", "11月", "12月", "1月", "2月", "3月"],
                        series: [
                            { name: "行业大模型", data: [52, 57, 64, 76, 88, 95] },
                            { name: "智能体应用", data: [34, 40, 47, 58, 71, 84] },
                            { name: "工业 AI", data: [30, 35, 39, 48, 60, 73] }
                        ]
                    },
                    rankingTitle: "热点赛道排行",
                    rankingDesc: "人工智能赛道近期最热的方向",
                    rankingData: [
                        { name: "行业大模型", value: 95 },
                        { name: "智能体应用", value: 88 },
                        { name: "工业 AI", value: 79 },
                        { name: "AI 芯片", value: 72 },
                        { name: "多模态系统", value: 68 },
                        { name: "AI 安全", value: 61 }
                    ],
                    intelTitle: "最新动态",
                    intelDesc: "围绕落地价值而非单纯热度的事件流",
                    intelCards: [
                        { title: "行业大模型项目继续向垂直场景下沉", tag: "技术", impact: "利好", time: "03-31 09:55", summary: "关注点正在从通用能力转向具体行业交付和场景深耕。", analysis: "这是 AI 进入应用竞争阶段的明确信号，落地价值正在快速上升。", score: 98 },
                        { title: "智能体应用进入企业试点密集期", tag: "应用", impact: "中性", time: "03-31 08:50", summary: "企业试点数量快速增长，但长期留存和复购仍待验证。", analysis: "试点多并不等于价值已确定，下一步应重点看持续使用情况。", score: 90 },
                        { title: "地方政策强调算力与应用协同建设", tag: "政策", impact: "利好", time: "03-30 18:30", summary: "政策关注点从单纯算力建设转向模型与应用协同效率。", analysis: "这说明监管与产业判断更加务实，行业推进逻辑发生变化。", score: 94 },
                        { title: "工业 AI 合作事件持续增加", tag: "合作", impact: "利好", time: "03-30 14:40", summary: "工业场景已从概念验证走向真实导入阶段。", analysis: "工业 AI 是当前最值得跟踪的高价值落地分支之一。", score: 92 },
                        { title: "AI 芯片领域出现新一轮战略合作", tag: "融资", impact: "中性", time: "03-30 10:35", summary: "算力供给和模型能力的耦合继续增强。", analysis: "芯片侧重要性回升，但仍需看实际出货与应用绑定强度。", score: 84 },
                        { title: "部分泛 AI 项目商业化落地延迟", tag: "商业化", impact: "利空", time: "03-29 20:10", summary: "试点转订单周期延长，暴露出交付复杂度问题。", analysis: "这会加速市场出清，把资源推向真正具备交付能力的团队。", score: 78 }
                    ],
                    activeTalents: [
                        { name: "王既", org: "中科院计算体系团队", direction: "行业大模型", score: "热度 96", note: "在行业模型和算力协同议题中持续高频出现。" },
                        { name: "乔俊飞", org: "北京工业大学", direction: "工业 AI", score: "热度 90", note: "工业场景导入相关线索集中，落地价值较高。" },
                        { name: "韩银和", org: "中国科学院", direction: "AI 芯片", score: "热度 86", note: "算力与应用协同议题中关联度持续提升。" }
                    ],
                    tickerItems: [
                        "AI 正从模型竞争走向落地竞争",
                        "智能体企业试点明显增加",
                        "政策更强调算力与应用协同",
                        "工业 AI 成为高价值跟踪方向"
                    ]
                }
            };

export const pageData = {
                "人才动态": {
                    kicker: "TALENT DYNAMICS",
                    heroTitle: "人才动态页面保留原有入口，仅做样式兼容",
                    heroDescription: "本轮只重构技术追踪页的信息结构，其他一级页面不改变全局导航和核心定位。",
                    systemSummary: "当前页面用于保持整体结构稳定，后续可单独深化人才关系与核心人物情报。",
                    metricCards: [
                        { label: "核心人才", value: "42" },
                        { label: "合作次数", value: "28" },
                        { label: "重点机构", value: "16" },
                        { label: "研究方向", value: "9" }
                    ],
                    trendTitle: "人才活跃趋势",
                    trendDesc: "保留基础辅助图表",
                    trendSeries: {
                        months: ["10月", "11月", "12月", "1月", "2月", "3月"],
                        series: [{ name: "人才活跃度", data: [30, 34, 38, 44, 51, 58] }]
                    },
                    rankingTitle: "重点方向",
                    rankingDesc: "基础占位视图",
                    rankingData: [
                        { name: "机器人", value: 58 },
                        { name: "工业智能", value: 54 },
                        { name: "生物医药", value: 47 },
                        { name: "新能源", value: 43 }
                    ],
                    intelTitle: "人才动态简报",
                    intelDesc: "当前保留兼容展示，不影响技术追踪页改造",
                    intelCards: [
                        { title: "重点人才合作事件保持活跃", tag: "人才", impact: "中性", time: "03-31 09:00", summary: "跨机构合作仍是人才页面的主要观察对象。", analysis: "后续可单独扩展为人才关系图与机构联动。", score: 80 },
                        { title: "青年科研团队曝光度提升", tag: "研究", impact: "利好", time: "03-30 15:20", summary: "新生力量开始进入重点观察名单。", analysis: "这类变化适合在下一轮人才页迭代中强化。", score: 78 },
                        { title: "头部机构人才流动趋稳", tag: "机构", impact: "中性", time: "03-29 17:40", summary: "当前页面仅做兼容占位。", analysis: "后续可基于真实数据进一步增强。", score: 70 }
                    ],
                    activeTalents: [],
                    tickerItems: ["人才动态页面当前保持稳定", "本轮重点在技术追踪页", "后续可单独增强人才关系图"]
                },
                "机构速递": {
                    kicker: "INSTITUTION TRACKING",
                    heroTitle: "机构速递页面保留原结构入口",
                    heroDescription: "本次不改全局导航，只保证页面在统一样式下正常展示。",
                    systemSummary: "机构页后续更适合强化机构价值判断、合作网络和技术优势归因。",
                    metricCards: [
                        { label: "活跃机构", value: "36" },
                        { label: "新增合作", value: "19" },
                        { label: "重点院所", value: "12" },
                        { label: "转化事件", value: "14" }
                    ],
                    trendTitle: "机构活跃趋势",
                    trendDesc: "基础占位视图",
                    trendSeries: {
                        months: ["10月", "11月", "12月", "1月", "2月", "3月"],
                        series: [{ name: "机构热度", data: [28, 33, 37, 42, 49, 53] }]
                    },
                    rankingTitle: "机构类型排行",
                    rankingDesc: "基础占位视图",
                    rankingData: [
                        { name: "高校", value: 53 },
                        { name: "研究院", value: 48 },
                        { name: "企业研究中心", value: 44 },
                        { name: "实验室", value: 39 }
                    ],
                    intelTitle: "机构速递简报",
                    intelDesc: "当前为兼容展示",
                    intelCards: [
                        { title: "多家研究机构联合推进项目合作", tag: "机构", impact: "利好", time: "03-31 10:00", summary: "合作事件密度提升。", analysis: "后续适合拓展机构合作网络可视化。", score: 81 },
                        { title: "头部院所继续加码重点方向布局", tag: "布局", impact: "中性", time: "03-30 16:00", summary: "资源继续向重点方向集中。", analysis: "兼容占位数据，用于保持页面完整性。", score: 76 },
                        { title: "机构成果转化节奏趋稳", tag: "转化", impact: "中性", time: "03-29 18:10", summary: "当前结构不做深改。", analysis: "后续可与产业洞察联动增强。", score: 72 }
                    ],
                    activeTalents: [],
                    tickerItems: ["机构页保持结构稳定", "本轮不改机构主内容", "后续可增强合作网络"]
                },
                "产业洞察": {
                    kicker: "INDUSTRY INSIGHT",
                    heroTitle: "产业洞察页面保留基础展示",
                    heroDescription: "本轮优化先集中在技术追踪页，让用户进来先看到最近发生了什么。",
                    systemSummary: "产业页后续适合强化结构图、企业梯队和区域协同判断。",
                    metricCards: [
                        { label: "重点产业", value: "11" },
                        { label: "增长行业", value: "6" },
                        { label: "龙头企业", value: "24" },
                        { label: "区域集群", value: "8" }
                    ],
                    trendTitle: "产业趋势",
                    trendDesc: "基础占位视图",
                    trendSeries: {
                        months: ["10月", "11月", "12月", "1月", "2月", "3月"],
                        series: [{ name: "产业热度", data: [35, 38, 41, 47, 52, 60] }]
                    },
                    rankingTitle: "热点产业排行",
                    rankingDesc: "基础占位视图",
                    rankingData: [
                        { name: "机器人", value: 60 },
                        { name: "生物医药", value: 57 },
                        { name: "人工智能", value: 63 },
                        { name: "新能源", value: 59 }
                    ],
                    intelTitle: "产业洞察简报",
                    intelDesc: "兼容展示，不影响技术追踪页重构",
                    intelCards: [
                        { title: "重点产业链景气度保持高位", tag: "产业", impact: "利好", time: "03-31 09:35", summary: "产业链协同事件仍在增加。", analysis: "后续适合扩展为更完整的产业链情报视图。", score: 82 },
                        { title: "区域集群带动上下游合作升温", tag: "区域", impact: "中性", time: "03-30 14:15", summary: "协同效应逐步增强。", analysis: "当前为兼容数据。", score: 76 },
                        { title: "部分赛道估值分化加剧", tag: "资本", impact: "中性", time: "03-29 19:20", summary: "市场开始更重兑现能力。", analysis: "这类变化后续可与技术页联动。", score: 73 }
                    ],
                    activeTalents: [],
                    tickerItems: ["产业页当前保持占位稳定", "后续可加强产业链结构图", "本轮聚焦技术追踪页"]
                },
                "区域创新": {
                    kicker: "REGIONAL INNOVATION",
                    heroTitle: "区域创新页面维持兼容展示",
                    heroDescription: "当前只确保统一样式下正常呈现，不改变其他主页面的整体结构。",
                    systemSummary: "区域页后续适合强化创新指数、技术流动和城市协同判断。",
                    metricCards: [
                        { label: "重点城市", value: "18" },
                        { label: "创新强市", value: "7" },
                        { label: "输出区域", value: "5" },
                        { label: "输入区域", value: "6" }
                    ],
                    trendTitle: "区域活跃趋势",
                    trendDesc: "基础占位视图",
                    trendSeries: {
                        months: ["10月", "11月", "12月", "1月", "2月", "3月"],
                        series: [{ name: "区域活跃度", data: [26, 30, 34, 41, 46, 52] }]
                    },
                    rankingTitle: "区域排行",
                    rankingDesc: "基础占位视图",
                    rankingData: [
                        { name: "上海", value: 52 },
                        { name: "深圳", value: 49 },
                        { name: "苏州", value: 46 },
                        { name: "杭州", value: 44 }
                    ],
                    intelTitle: "区域创新简报",
                    intelDesc: "当前为兼容展示",
                    intelCards: [
                        { title: "重点城市创新协同继续增强", tag: "区域", impact: "利好", time: "03-31 08:30", summary: "技术与产业资源流动频率持续提升。", analysis: "后续适合升级为区域创新流动图。", score: 80 },
                        { title: "城市间技术输出能力分化加深", tag: "技术", impact: "中性", time: "03-30 13:50", summary: "头部城市优势仍在扩大。", analysis: "兼容占位数据，用于保持页面完整。", score: 74 },
                        { title: "产学研协同示范项目数量提升", tag: "协同", impact: "利好", time: "03-29 16:40", summary: "协同类事件更密集。", analysis: "后续可与机构页联动增强。", score: 77 }
                    ],
                    activeTalents: [],
                    tickerItems: ["区域创新页当前保持兼容", "后续可增强城市流动关系", "本轮不改变全局结构"]
                }
            };
