const WUHAN_ACTIVITY_DETAIL_LIBRARY = {
  paper: [
    {
      title: '基于知识图谱的产业企业风险预警模型',
      summary: '文章围绕武汉光电、医工与智能制造场景，讨论企业风险识别和情报联动方法。',
      publisher: '华中科技大学光电团队 / 武汉产业智能研究院',
      code: '10.1186/wuhan.ii.2025.0412',
      people: ['作者：沈明 / 刘琪 / 陈章', '通讯作者：沈明', '发表渠道：Intelligent Industry Systems'],
      highlights: ['引用次数：148', '关键场景：企业风险链路预警', '方法结构：知识抽取 + 关系推理 + 时序评估', '武汉样本园区预警准确率提升 12.6%'],
      tags: ['知识图谱', '企业预警', '产业风险', '武汉样本'],
      description: '论文从武汉产业情报场景中抽取企业、人才、论文、专利等实体，构建企业协同与风险传导关系图，并结合时间序列事件识别企业异常活跃、专利转让和合作收缩等变化。',
      analysis: '文章更适合用于观察企业风险在城市产业网络中的扩散路径，也能为节点详情页补充研究背景和方法依据。',
    },
    {
      title: '城市级人才与产业耦合网络建模方法',
      summary: '文章聚焦人才流动、产业需求与技术节点之间的结构关系，重点分析武汉样本的协同特征。',
      publisher: '武汉大学 / 华中科技大学',
      code: '10.1016/wuhan.net.2024.1128',
      people: ['作者：周岚 / 沈明 / 李玲', '通讯作者：周岚', '发表渠道：Urban Intelligence Review'],
      highlights: ['使用 3 类人才流向数据和 2 类产业标签逻辑', '可识别高价值跨机构协作节点', '人才供需错配识别效率提升 18%', '适合联动岗位、项目与成果维度'],
      tags: ['人才网络', '产业耦合', '城市建模', '武汉'],
      description: '论文以武汉为样本，从人才项目经历、组织协作和技术标签出发，对城市级产业与人才之间的高频关联进行建模，并给出从人才注入到成果产出的链路视图。',
      analysis: '这类研究更适合放在人才节点详情中，帮助用户理解城市内部的人才结构、协作关系和成果转化路径。',
    }
  ],
  patent: [
    {
      title: '基于视觉感知的装备状态检测系统',
      summary: '专利聚焦高端装备在复杂运行环境下的状态感知与异常识别。',
      publisher: '武汉智造云谷',
      code: 'CN202510318642A',
      people: ['申请人：武汉智造云谷', '发明人：刘琪 / 陈章', '法律状态：实质审查阶段'],
      highlights: ['IPC：G06T / B25J', '权利要求：12 项', '覆盖场景：医工装备异常检测', '支持多模态视频输入和异常分级'],
      tags: ['发明专利', '视觉检测', '装备健康', '武汉智造'],
      description: '该专利方案以多源视觉帧、运行日志与告警信号作为输入，输出设备异常等级与推荐处置路径，适合用于高端装备的持续监测和风险分层。',
      analysis: '专利内容与装备运行监测、告警联动和处置建议关系较强，适合挂接在产业节点的技术详情区。',
    },
    {
      title: '医工设备运维调度与预警方法',
      summary: '专利关注武汉医工融合设备的运维调度与故障预警场景。',
      publisher: '光谷医工科技',
      code: 'CN202410227951A',
      people: ['申请人：光谷医工科技', '发明人：周岚 / 张蕴', '法律状态：公开待审'],
      highlights: ['IPC：G06F / A61B', '权利要求：9 项', '目标场景：医疗装备运维排程', '支持时间窗口预测与工单分发'],
      tags: ['运维调度', '故障预警', '医工设备', '产业情报'],
      description: '专利以医工设备的运行状态、保养记录和维修队列为输入，通过事件分级、优先级评分和调度策略生成机制，实现多设备场景下的运维自动化。',
      analysis: '这类内容适合用于说明节点背后的技术路线，也有助于串起申请主体、公开信息和核心能力点。',
    }
  ]
}

export function buildWuhanActivityDetail(activity, selectedParticleData) {
  if (!selectedParticleData) return null

  const list = WUHAN_ACTIVITY_DETAIL_LIBRARY[activity?.type] || []
  if (!list.length) return null

  const indexSeed = `${selectedParticleData.id}-${activity.title}-${activity.date}`
  let seed = 0
  for (const ch of indexSeed) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0

  const picked = list[seed % list.length]

  return {
    kindLabel: activity.type === 'paper' ? '论文详情' : '专利详情',
    title: picked.title,
    date: activity.date,
    publisherLabel: activity.type === 'paper' ? '作者机构' : '申请主体',
    publisher: picked.publisher,
    codeLabel: activity.type === 'paper' ? 'DOI' : '公开号',
    code: picked.code,
    summary: picked.summary,
    people: picked.people,
    highlights: picked.highlights,
    tags: [...picked.tags, selectedParticleData.name],
    description: picked.description,
    analysis: picked.analysis,
  }
}