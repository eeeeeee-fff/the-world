export function getDrillLabel(selectedProvince, selectedCity) {
  if (selectedCity) return `CITY / ${selectedProvince?.name || ''} / ${selectedCity.name}`
  if (selectedProvince) return `PROVINCE / ${selectedProvince.name}`
  return 'CHINA / NATIONAL INTELLIGENCE SCENE'
}

export function getHeroTitle(selectedProvince, selectedCity) {
  if (selectedCity) return `${selectedCity.name} 城市智能情报场`
  if (selectedProvince) return `${selectedProvince.name} 省域智能情报场`
  return '中国智能情报全域底图'
}

export function getHeroSubtitle(selectedProvince, selectedCity) {
  if (selectedCity) return '当前已进入城市视角，可以继续查看区县范围、节点关系和详情卡片。'
  if (selectedProvince) return '当前已进入省域视角，可以继续下钻到城市。江苏、湖北支持市级边界，扬州、武汉可继续查看区县。'
  return '当前展示全国省级边界，可以直接选择省份进入。'
}

export const PROVINCE_PANEL_COPY = '点击省份后可继续进入城市。江苏、湖北支持市级边界，扬州、武汉可继续查看区县。'

export const FOOTER_DEFAULT_COPY = '当前可查看全国、省级，以及江苏、湖北下的扬州、武汉边界数据。'