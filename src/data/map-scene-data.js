import chinaGeo from './map/china.json'
import jiangsuGeo from './map/jiangsu.json'
import yangzhouGeo from './map/yangzhou.json'
import hubeiGeo from './map/hubei.json'
import wuhanGeo from './map/wuhan.json'
import locationIndex from './map/location.json'

export { chinaGeo, jiangsuGeo, yangzhouGeo, hubeiGeo, wuhanGeo, locationIndex }

export const CATEGORY_STYLES = {
  Talent: { color: 0x58d5ff, glow: 0x9edfff, label: '\u4eba\u624d' },
  Enterprise: { color: 0xffa14a, glow: 0xffcf8e, label: '\u4f01\u4e1a' },
  Paper: { color: 0x57e38d, glow: 0x9af7bb, label: '\u8bba\u6587' },
  Patent: { color: 0x42f5b0, glow: 0x93ffd6, label: '\u4e13\u5229' },
}

export const FILTERS = Object.keys(CATEGORY_STYLES)

export function getLocationMeta(code) {
  return locationIndex[String(code)] || null
}

export function getProvinceChildren(provinceCode) {
  const entry = getLocationMeta(provinceCode)
  return entry?.children || []
}

function buildItems(prefix, category, values) {
  return values.map((item, index) => ({
    id: `${prefix}-${category}-${index + 1}`,
    category,
    name: item.name,
    title: item.title,
    subtitle: item.subtitle,
    value: item.value,
    trend: item.trend,
    tags: item.tags,
  }))
}


const wuhanDetails = {
  Talent: buildItems('420100', 'Talent', [
    { name: '沈明', title: '光电与智能感知带头人', subtitle: '华中科技大学光电团队', value: 96, trend: '+11%', tags: ['人才引领', '论文 22 篇'] },
    { name: '刘琪', title: '智能制造算法专家', subtitle: '武汉产业智能研究院', value: 91, trend: '+8%', tags: ['产学研', '专利 8 项'] },
    { name: '陈章', title: '高端装备系统架构师', subtitle: '武汉国家高端装备实验室', value: 84, trend: '+6%', tags: ['转化项目 6 个', '合作节点 17'] },
  ]),
  Enterprise: buildItems('420100', 'Enterprise', [
    { name: '武汉智造云谷', title: '工业互联网平台企业', subtitle: '节点关联强度持续增长', value: 93, trend: '+10%', tags: ['工业云', '合作机构 18 家'] },
    { name: '光谷医工科技', title: '医工融合装备企业', subtitle: '专利和产品线同步推进', value: 87, trend: '+7%', tags: ['医疗装备', '专利 16 项'] },
    { name: '汉江算力', title: '智算底座企业', subtitle: '支撑论文转化与企业协同', value: 80, trend: '+5%', tags: ['算力枢纽', '节点连接'] },
  ]),
  Paper: buildItems('420100', 'Paper', [
    { name: '论文集 A', title: '城市级人才与产业耦合网络建模', subtitle: '作者：沈明 / 刘琪', value: 88, trend: '+9%', tags: ['网络模型', '引文 148'] },
    { name: '论文集 B', title: '基于知识图谱的企业博弈与预警方法', subtitle: '作者：华科 / 武大联合团队', value: 82, trend: '+6%', tags: ['知识图谱', '预警'] },
    { name: '论文集 C', title: '光电产业与医工设备的协同创新路径', subtitle: '作者：武汉理工大学', value: 77, trend: '+4%', tags: ['产学研', '协同'] },
  ]),
  Patent: buildItems('420100', 'Patent', [
    { name: '专利簇 1', title: '基于视觉感知的装备状态检测系统', subtitle: '申请主体：武汉智造云谷', value: 90, trend: '+8%', tags: ['发明专利', '状态检测'] },
    { name: '专利簇 2', title: '医工设备运维调度与预警方法', subtitle: '申请主体：光谷医工科技', value: 83, trend: '+6%', tags: ['运维', '调度'] },
    { name: '专利簇 3', title: '智能型产业情报联动预警引擎', subtitle: '申请主体：武汉产业智能研究院', value: 79, trend: '+5%', tags: ['引擎', '情报联动'] },
  ]),
}

const yangzhouDetails = {
  Talent: buildItems('321000', 'Talent', [
    { name: '\u5218\u6cfd', title: '\u591a\u6a21\u6001\u667a\u80fd\u8bca\u7597\u4eba\u624d', subtitle: '\u626c\u5dde\u5927\u5b66\u533b\u5de5\u4ea4\u53c9\u56e2\u961f', value: 97, trend: '+12%', tags: ['\u9752\u5e74\u9886\u519b', '\u8bba\u6587 18 \u7bc7'] },
    { name: '\u5f20\u8574', title: '\u4ea7\u4e1a\u7b97\u6cd5\u8d1f\u8d23\u4eba', subtitle: '\u626c\u5dde\u6570\u667a\u4ea7\u4e1a\u7814\u7a76\u9662', value: 91, trend: '+9%', tags: ['\u5408\u4f5c\u8282\u70b9 23', '\u4e13\u5229 6 \u9879'] },
    { name: '\u5468\u5c9a', title: '\u533b\u7597\u88c5\u5907\u4e13\u5bb6', subtitle: '\u626c\u5dde\u9ad8\u7aef\u88c5\u5907\u521b\u65b0\u4e2d\u5fc3', value: 85, trend: '+6%', tags: ['\u8f6c\u5316\u9879\u76ee 4 \u4e2a', '\u8bba\u6587 9 \u7bc7'] },
  ]),
  Enterprise: buildItems('321000', 'Enterprise', [
    { name: '\u626c\u5dde\u667a\u8054\u79d1\u6280', title: '\u667a\u80fd\u5236\u9020\u94fe\u4e3b\u4f01\u4e1a', subtitle: '\u6838\u5fc3\u8282\u70b9\u6570 31', value: 94, trend: '+11%', tags: ['\u4ea7\u4e1a\u56fe\u8c31', '\u8ba2\u5355\u589e\u957f'] },
    { name: '\u626c\u5dde\u6570\u521b\u533b\u7597', title: '\u533b\u7597\u6570\u5b57\u5316\u5e73\u53f0', subtitle: '\u4e13\u5229\u6d3b\u8dc3\u5ea6\u6301\u7eed\u63d0\u5347', value: 88, trend: '+8%', tags: ['\u4e13\u5229 14 \u9879', '\u5408\u4f5c\u673a\u6784 9 \u5bb6'] },
    { name: '\u626c\u5dde\u5149\u8c31\u611f\u77e5', title: '\u591a\u4f20\u611f\u5668\u8bbe\u5907\u4f01\u4e1a', subtitle: '\u8bba\u6587\u8f6c\u5316\u6548\u7387\u8f83\u9ad8', value: 79, trend: '+5%', tags: ['\u4ea7\u5b66\u7814', '\u8bbe\u5907\u5347\u7ea7'] },
  ]),
  Paper: buildItems('321000', 'Paper', [
    { name: '\u8bba\u6587\u96c6 A', title: '\u626c\u5dde\u533a\u57df\u667a\u80fd\u88c5\u5907\u534f\u540c\u7f51\u7edc\u7814\u7a76', subtitle: '\u4f5c\u8005\uff1a\u5218\u6cfd / \u5468\u5c9a', value: 86, trend: '+7%', tags: ['\u534f\u540c\u7f51\u7edc', '\u5f15\u6587 126'] },
    { name: '\u8bba\u6587\u96c6 B', title: '\u533b\u7597\u88c5\u5907\u4f20\u611f\u878d\u5408\u5b9e\u65f6\u8bca\u65ad\u65b9\u6cd5', subtitle: '\u4f5c\u8005\uff1a\u5f20\u8574 / \u987e\u9752', value: 82, trend: '+5%', tags: ['\u9876\u520a', '\u70ed\u5ea6\u4e0a\u5347'] },
    { name: '\u8bba\u6587\u96c6 C', title: '\u4f01\u4e1a\u77e5\u8bc6\u56fe\u8c31\u4e0e\u4eba\u624d\u4f9b\u9700\u5339\u914d\u6a21\u578b', subtitle: '\u4f5c\u8005\uff1a\u626c\u5dde\u5927\u5b66\u56e2\u961f', value: 76, trend: '+4%', tags: ['\u77e5\u8bc6\u56fe\u8c31', '\u5339\u914d'] },
  ]),
  Patent: buildItems('321000', 'Patent', [
    { name: '\u4e13\u5229\u7c07 1', title: '\u57fa\u4e8e\u591a\u5149\u8c31\u611f\u77e5\u7684\u8bca\u7597\u8bbe\u5907\u5b9a\u4f4d\u7cfb\u7edf', subtitle: '\u7533\u8bf7\u4e3b\u4f53\uff1a\u626c\u5dde\u667a\u8054\u79d1\u6280', value: 92, trend: '+10%', tags: ['\u53d1\u660e\u4e13\u5229', '\u88c5\u5907\u5b9a\u4f4d'] },
    { name: '\u4e13\u5229\u7c07 2', title: '\u667a\u80fd\u533b\u7597\u88c5\u5907\u534f\u540c\u63a7\u5236\u65b9\u6cd5', subtitle: '\u7533\u8bf7\u4e3b\u4f53\uff1a\u626c\u5dde\u6570\u521b\u533b\u7597', value: 84, trend: '+7%', tags: ['\u5b9e\u7528\u65b0\u578b', '\u63a7\u5236\u7cfb\u7edf'] },
    { name: '\u4e13\u5229\u7c07 3', title: '\u8bba\u6587\u77e5\u8bc6\u56fe\u8c31\u9a71\u52a8\u7684\u4e13\u5229\u9884\u8b66\u7cfb\u7edf', subtitle: '\u7533\u8bf7\u4e3b\u4f53\uff1a\u626c\u5dde\u5927\u5b66', value: 78, trend: '+5%', tags: ['\u7b97\u6cd5', '\u77e5\u8bc6\u56fe\u8c31'] },
  ]),
}

export function getDetailItems(cityCode, category) {
  const key = String(cityCode)
  const cityItems = key === '321000' ? yangzhouDetails : key === '420100' ? wuhanDetails : null
  return cityItems?.[category] || []
}

export function getParticleSource(cityCode, category = null) {
  const city = String(cityCode)
  const items = category ? getDetailItems(city, category) : FILTERS.flatMap((itemCategory) => getDetailItems(city, itemCategory))
  if (!items.length) return []
  const list = []
  const total = Math.max(items.length, category ? 10 : 12)

  for (let i = 0; i < total; i += 1) {
    const item = items[i % items.length]
    list.push({
      ...item,
      id: `${item.id}-particle-${i}`,
      angle: Math.random() * Math.PI * 2,
      orbitRadius: 0.42 + Math.random() * 0.9,
      orbitTilt: (Math.random() - 0.5) * 0.7,
      radialOffset: 0.18 + Math.random() * 0.46,
      speed: 0.38 + Math.random() * 0.72,
      size: 0.014 + Math.random() * 0.01,
      band: i % 3,
    })
  }

  return list
}

export function getProvinceHero(provinceCode) {
  const entry = getLocationMeta(provinceCode)
  if (!entry) return null

  return {
    title: entry.name,
    subtitle: entry.level === 'province' ? '\u7701\u57df\u667a\u80fd\u60c5\u62a5\u805a\u7126' : '\u533a\u57df\u60c5\u62a5\u805a\u7126',
    stats: [
      { label: '\u57ce\u5e02\u8282\u70b9', value: entry.childrenNum || 0 },
      { label: '\u4e2d\u5fc3\u5750\u6807', value: `${entry.center?.[0]?.toFixed?.(1) || '--'}, ${entry.center?.[1]?.toFixed?.(1) || '--'}` },
      { label: '\u884c\u653f\u7f16\u7801', value: String(provinceCode) },
    ],
  }
}
