<template>
  <div class="screen-root" :class="{ 'detail-mode': !!selectedParticleData }">
    <div ref="containerRef" class="screen-canvas"></div>
    <div class="screen-noise"></div>
    <div class="screen-vignette"></div>

    <section class="hud top-brand glass-card">
      <div>
        <p class="eyebrow">INDUSTRIAL INTELLIGENCE / IMMERSIVE MAP</p>
        <h1>产业智能情报 3D 指挥屏</h1>
      </div>
      <div class="brand-badge">
        <span class="live-dot"></span>
        <span>实时演算</span>
      </div>
    </section>

    <section class="hud hero-panel glass-card">
      <div class="hero-copy">
        <p class="eyebrow">{{ drillLabel }}</p>
        <h2>{{ heroTitle }}</h2>
        <p>{{ heroSubtitle }}</p>

        <div class="filter-row">
          <button
            v-for="filter in FILTERS"
            :key="filter"
            :class="['filter-pill', { active: activeCategory === filter }]"
            @click="activeCategory = filter"
          >
            {{ CATEGORY_STYLES[filter].label }}
          </button>
        </div>

        <div class="stat-row">
          <div v-for="item in heroStats" :key="item.label" class="stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedProvince" class="hud province-panel glass-card">
      <div class="section-head compact">
        <span>省级菜单</span>
        <strong>{{ selectedProvince.name }}</strong>
      </div>
      <div class="province-menu-grid">
        <button
          v-for="item in provinceMenuItems"
          :key="item.adcode"
          @click="selectCityFromMenu(item)"
        >
          {{ item.name }}
        </button>
      </div>
      <p class="province-tip">点击省份后可钻取城市。江苏、湖北已接入真实市级边界，扬州、武汉已接入真实城市数据。</p>
    </section>


    <section class="hud intel-dash-panel glass-card" :class="{ active: !!selectedParticleData }">
      <template v-if="selectedParticleData">
        <!-- Header bar -->
        <div class="dash-header">
          <div class="dash-path">
            <p class="eyebrow">INTEL NODE / {{ CATEGORY_STYLES[selectedParticleData.category].label }}</p>
            <div class="dash-breadcrumb">
              <span>{{ selectedProvince?.name || 'CHINA' }}</span>
              <span class="bc-sep">›</span>
              <span>{{ selectedCity?.name || '--' }}</span>
              <span class="bc-sep">›</span>
              <strong>{{ selectedParticleData.name }}</strong>
            </div>
          </div>
          <div class="dash-header-right">
            <div class="live-badge-sm"><span class="live-dot"></span><span>情报实时</span></div>
            <button class="close-btn" @click="closeParticleDetail">← 返回地图</button>
          </div>
        </div>

        <!-- Dashboard body: left main + right side -->
        <div class="dash-body">
          <!-- ── Left main column ───────────────────────────────────── -->
          <div class="dash-left">
            <!-- Node identity + hero value -->
            <div class="node-hero-row glass-inner" :style="{ '--accent': categoryColorCss }">
              <div class="node-hero-accent-bar" :style="{ background: categoryColorCss }"></div>
              <span class="type-chip node-chip" :style="{ background: categoryColorCss + '28', color: categoryColorCss, borderColor: categoryColorCss + '44' }">
                {{ CATEGORY_STYLES[selectedParticleData.category].label }}
              </span>
              <div class="node-hero-text">
                <h2>{{ selectedParticleData.title }}</h2>
                <p>{{ selectedParticleData.subtitle }}</p>
                <div class="tag-row" style="margin-top:6px" v-if="selectedParticleData.tags?.length">
                  <span v-for="tag in selectedParticleData.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="node-value-badge">
                <strong :style="{ color: categoryColorCss }">{{ selectedParticleData.value }}</strong>
                <span>综合指数</span>
              </div>
            </div>

            <!-- KPI cards with colored progress bars -->
            <div class="kpi-row" v-if="currentSectorData">
              <div
                v-for="(m, i) in currentSectorData.metricCards"
                :key="m.label"
                class="kpi-card glass-inner"
                :style="{ '--kc': kpiColors[i] }"
              >
                <span class="kpi-label">{{ m.label }}</span>
                <strong class="kpi-value" :style="{ color: kpiColors[i] }">{{ m.value }}</strong>
                <div class="kpi-track"><div class="kpi-fill" :style="{ width: kpiWidth(m.value), background: kpiColors[i] }"></div></div>
              </div>
            </div>

            <!-- Chart row top: trend (wide) + donut (narrow) -->
            <div class="chart-row-top" v-if="currentSectorData">
              <div class="chart-panel glass-inner">
                <div class="chart-panel-head">
                  <h4>{{ currentSectorData.trendTitle }}</h4>
                  <span class="panel-tag">趋势</span>
                </div>
                <div ref="intelTrendRef" class="intel-chart-box"></div>
              </div>
              <div class="chart-panel glass-inner">
                <div class="chart-panel-head">
                  <h4>节点分布</h4>
                  <span class="panel-tag">类型</span>
                </div>
                <div ref="intelDonutRef" class="intel-chart-box"></div>
              </div>
            </div>

            <!-- Chart row bottom: ranking full width -->
            <div class="chart-row-bot" v-if="currentSectorData">
              <div class="chart-panel glass-inner">
                <div class="chart-panel-head">
                  <h4>{{ currentSectorData.rankingTitle }}</h4>
                  <span class="panel-tag">排行</span>
                </div>
                <div ref="intelRankingRef" class="intel-chart-box"></div>
              </div>
            </div>
          </div>

          <!-- ── Right side column ─────────────────────────────────── -->
          <div class="dash-right">
            <!-- Scatter bubble chart: highlight feature -->
            <div class="chart-panel glass-inner scatter-panel">
              <div class="chart-panel-head">
                <h4>情报节点云图</h4>
                <span class="panel-tag">散布</span>
              </div>
              <div ref="intelScatterRef" class="intel-chart-box scatter-box"></div>
            </div>

            <!-- Sector summary compact -->
            <div class="summary-strip glass-inner" v-if="currentSectorData">
              <p class="eyebrow">{{ currentSectorData.kicker }}</p>
              <p class="summary-body">{{ currentSectorData.systemSummary }}</p>
            </div>

            <!-- Intel flow cards compact -->
            <div class="dash-intel-block" v-if="currentSectorData">
              <div class="block-head">
                <span>{{ currentSectorData.intelTitle }}</span>
                <span class="panel-tag">动态</span>
              </div>
              <article
                v-for="card in currentSectorData.intelCards.slice(0, 3)"
                :key="card.title"
                class="intel-flow-card glass-inner"
              >
                <div class="intel-flow-head">
                  <span class="intel-tag-sm">{{ card.tag }}</span>
                  <span :class="['impact-chip', card.impact === '利好' ? 'pos' : card.impact === '利空' ? 'neg' : 'neu']">{{ card.impact }}</span>
                  <time>{{ card.time }}</time>
                </div>
                <h4>{{ card.title }}</h4>
                <p>{{ card.summary }}</p>
              </article>
            </div>
          </div>
        </div>
      </template>
    </section>

    
    <footer class="hud footer-bar glass-card">
      <div class="legend-row">
        <span v-for="filter in FILTERS" :key="filter" class="legend-pill">
          <i :style="{ backgroundColor: colorToCss(CATEGORY_STYLES[filter].color) }"></i>
          {{ CATEGORY_STYLES[filter].label }}
        </span>
      </div>
      <span class="footer-tip">真实边界：全国 / 江苏 / 扬州 / 湖北 / 武汉，粒子与高亮已接入 3D 场景</span>
    </footer>

    <div v-if="tooltip.visible" class="tooltip" :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      <p>{{ tooltip.title }}</p>
      <span>{{ tooltip.subtitle }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as echarts from 'echarts'
import { categoryData } from '../data/dashboard-data.js'
import { buildTrendOption, buildRankingOption } from '../charts/chart-options.js'
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'
import {
  CATEGORY_STYLES,
  FILTERS,
  chinaGeo,
  getDetailItems,
  getLocationMeta,
  getParticleSource,
  getProvinceChildren,
  getProvinceHero,
  hubeiGeo,
  jiangsuGeo,
  wuhanGeo,
  yangzhouGeo,
} from '../data/map-scene-data'

const containerRef = ref(null)
const selectedProvince = ref(null)
const selectedCity = ref(null)
const activeCategory = ref('Talent')
const selectedParticleData = ref(null)
const particleCount = ref(0)
const tooltip = reactive({ visible: false, x: 0, y: 0, title: '', subtitle: '' })

const intelTrendRef = ref(null)
const intelRankingRef = ref(null)
const intelDonutRef = ref(null)
const intelScatterRef = ref(null)
let intelTrendChart = null
let intelRankingChart = null
let intelDonutChart = null
let intelScatterChart = null

const PARTICLE_SECTOR_MAP = { Talent: 'robot', Paper: 'bio', Enterprise: 'energy', Patent: 'ai' }
const CHART_CAT_COLORS = { Talent: '#58d5ff', Enterprise: '#ffa14a', Paper: '#57e38d', Patent: '#42f5b0' }
const kpiColors = ['#58d5ff', '#ffa14a', '#57e38d', '#b57bee']

const drillLabel = computed(() => {
  if (selectedCity.value) return `CITY / ${selectedProvince.value?.name || ''} / ${selectedCity.value.name}`
  if (selectedProvince.value) return `PROVINCE / ${selectedProvince.value.name}`
  return 'CHINA / NATIONAL INTELLIGENCE SCENE'
})

const heroTitle = computed(() => {
  if (selectedCity.value) return `${selectedCity.value.name} 城市智能情报场`
  if (selectedProvince.value) return `${selectedProvince.value.name} 省域智能情报场`
  return '中国智能情报全域底图'
})

const heroSubtitle = computed(() => {
  if (selectedCity.value) return '区县边界、城市粒子云、节点关系线和分类情报已经联动，可继续点选节点查看详细卡片。'
  if (selectedProvince.value) return '省级轮廓已经锁定，城市节点可继续钻取。江苏、湖北已启用真实市级轮廓，扬州、武汉已启用真实区县边界。'
  return '开屏展示真实中国省级轮廓，暗场地球基座、发光边界和后处理辉光已经启用。'
})

const heroStats = computed(() => {
  if (selectedCity.value) {
    const details = getDetailItems(selectedCity.value.code, activeCategory.value)
    return [
      { label: '情报节点', value: details.length || 0 },
      { label: '行政编码', value: selectedCity.value.code },
      { label: '中心坐标', value: `${selectedCity.value.center[0].toFixed(1)}, ${selectedCity.value.center[1].toFixed(1)}` },
    ]
  }
  if (selectedProvince.value) return getProvinceHero(selectedProvince.value.code)?.stats || []
  return [
    { label: '省级轮廓', value: chinaGeo.features.length },
    { label: '默认聚焦', value: '中国东部' },
    { label: '当前模式', value: '3D Globe' },
  ]
})

const provinceMenuItems = computed(() => !selectedProvince.value ? [] : getProvinceChildren(selectedProvince.value.code))
const detailItems = computed(() => {
  if (selectedParticleData.value) {
    const base = getDetailItems(selectedCity.value?.code || '321000', activeCategory.value)
    return [selectedParticleData.value, ...base.filter((item) => item.id !== selectedParticleData.value.id)]
  }
  return selectedCity.value ? getDetailItems(selectedCity.value.code, activeCategory.value) : []
})
const relatedParticleItems = computed(() => {
  if (!selectedParticleData.value) return []
  const cityCode = selectedCity.value?.code || '321000'
  const sameCategory = getDetailItems(cityCode, selectedParticleData.value.category)
  const otherCategories = FILTERS
    .filter((category) => category !== selectedParticleData.value.category)
    .flatMap((category) => getDetailItems(cityCode, category))
  return [selectedParticleData.value, ...sameCategory.filter((item) => item.id !== selectedParticleData.value.id), ...otherCategories].slice(0, 12)
})

const currentSector = computed(() => PARTICLE_SECTOR_MAP[selectedParticleData.value?.category] || 'robot')
const currentSectorData = computed(() => selectedParticleData.value ? categoryData[currentSector.value] : null)
const categoryColorCss = computed(() => selectedParticleData.value ? (CHART_CAT_COLORS[selectedParticleData.value.category] || '#58d5ff') : '#58d5ff')

function kpiWidth(value) {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  return `${Math.min(100, num)}%`
}

function buildParticleScatterOption(items) {
  const series = FILTERS.map((cat) => {
    const catItems = items.filter((i) => i.category === cat)
    return {
      name: CATEGORY_STYLES[cat].label,
      type: 'scatter',
      data: catItems.map((item, idx) => {
        const val = parseFloat(String(item.value).replace(/[^0-9.]/g, '')) || 50
        return { value: [idx * 20 + FILTERS.indexOf(cat) * 6 + Math.random() * 10, val + (Math.random() - 0.5) * 10, val], name: item.title }
      }),
      symbolSize: (data) => Math.max(8, Math.sqrt(data[2]) * 2.6),
      itemStyle: { color: CHART_CAT_COLORS[cat], opacity: 0.92, shadowBlur: 14, shadowColor: CHART_CAT_COLORS[cat] + '88' },
    }
  })
  return {
    backgroundColor: 'transparent',
    grid: { left: 20, right: 12, top: 32, bottom: 16 },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(4,13,28,0.94)',
      borderColor: 'rgba(123,195,255,0.18)',
      borderWidth: 1,
      textStyle: { color: '#eef4ff', fontSize: 12 },
      formatter: (params) => `<b style="color:${CHART_CAT_COLORS[params.seriesName] || '#fff'}">${params.seriesName}</b><br/>${params.data.name}`,
    },
    legend: { top: 2, right: 0, textStyle: { color: '#647595', fontSize: 10 }, itemWidth: 8, itemHeight: 8 },
    xAxis: { type: 'value', show: false, scale: true },
    yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { color: 'rgba(100,117,149,0.1)' } }, axisLabel: { color: '#647595', fontSize: 10 } },
    series,
  }
}

function buildCategoryDonutOption(items) {
  const counts = FILTERS
    .map((cat) => ({ name: CATEGORY_STYLES[cat].label, value: items.filter((i) => i.category === cat).length, itemStyle: { color: CHART_CAT_COLORS[cat], shadowBlur: 8, shadowColor: CHART_CAT_COLORS[cat] + '66' } }))
    .filter((d) => d.value > 0)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(4,13,28,0.94)', borderColor: 'rgba(123,195,255,0.18)', borderWidth: 1, textStyle: { color: '#eef4ff' }, formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['50%', '76%'],
      center: ['50%', '52%'],
      data: counts,
      label: { color: '#9cc4eb', fontSize: 10, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: 'rgba(123,195,255,0.28)' } },
      itemStyle: { borderRadius: 4, borderColor: 'rgba(2,8,20,0.6)', borderWidth: 2 },
      animationType: 'expansion',
      animationDuration: 800,
    }],
  }
}

async function refreshIntelCharts() {
  await nextTick()
  if (!currentSectorData.value) return
  const initChart = (refEl, instance) => {
    if (!refEl.value) return instance
    return instance || echarts.init(refEl.value, null, { renderer: 'canvas' })
  }
  intelTrendChart = initChart(intelTrendRef, intelTrendChart)
  intelRankingChart = initChart(intelRankingRef, intelRankingChart)
  intelDonutChart = initChart(intelDonutRef, intelDonutChart)
  intelScatterChart = initChart(intelScatterRef, intelScatterChart)
  intelTrendChart?.setOption(buildTrendOption(currentSectorData.value, echarts), true)
  intelRankingChart?.setOption(buildRankingOption(currentSectorData.value, echarts), true)
  intelDonutChart?.setOption(buildCategoryDonutOption(relatedParticleItems.value), true)
  intelScatterChart?.setOption(buildParticleScatterOption(relatedParticleItems.value), true)
  intelTrendChart?.resize()
  intelRankingChart?.resize()
  intelDonutChart?.resize()
  intelScatterChart?.resize()
}

function disposeIntelCharts() {
  intelTrendChart?.dispose(); intelTrendChart = null
  intelRankingChart?.dispose(); intelRankingChart = null
  intelDonutChart?.dispose(); intelDonutChart = null
  intelScatterChart?.dispose(); intelScatterChart = null
}

watch(selectedParticleData, (val) => {
  if (val) refreshIntelCharts()
  else disposeIntelCharts()
})

watch(currentSector, () => {
  if (selectedParticleData.value) refreshIntelCharts()
})

function tweenMaterialOpacity(material, target, duration = 0.55) {
  if (!material || typeof material.opacity !== 'number') return
  material.transparent = true
  gsap.killTweensOf(material)
  gsap.to(material, {
    opacity: target,
    duration,
    ease: 'power2.inOut',
  })
}

function tweenGroupOpacity(group, meshTarget, lineTarget, duration = 0.55) {
  if (!group) return
  group.traverse((child) => {
    if (!child.material) return
    if (child.isMesh) tweenMaterialOpacity(child.material, meshTarget, duration)
    if (child.isLine || child.isLineLoop || child.isLineSegments) tweenMaterialOpacity(child.material, lineTarget, duration)
  })
}

function setSceneDetailMode(active) {
  tooltip.visible = false
  gsap.killTweensOf(mapRoot.position)
  gsap.killTweensOf(mapRoot.scale)
  gsap.killTweensOf(particleRoot.position)
  gsap.killTweensOf(particleRoot.scale)
  gsap.killTweensOf(mapRoot.rotation)
  const dur = active ? 0.92 : 0.78
  const ease = active ? 'power3.inOut' : 'power2.inOut'
  gsap.to(mapRoot.position, {
    x: active ? 7.2 : 0,
    y: active ? 0.6 : 0,
    z: active ? -0.5 : 0,
    duration: dur,
    ease,
  })
  gsap.to(mapRoot.scale, {
    x: active ? 0.52 : 1,
    y: active ? 0.52 : 1,
    z: active ? 0.52 : 1,
    duration: dur,
    ease,
  })
  gsap.to(mapRoot.rotation, {
    x: active ? -0.06 : 0,
    y: active ? -1.15 : 0,
    z: active ? 0.04 : 0,
    duration: dur,
    ease,
  })
  gsap.to(particleRoot.position, {
    x: active ? 7.0 : 0,
    y: active ? 0.55 : 0,
    z: active ? -0.5 : 0,
    duration: dur,
    ease,
  })
  gsap.to(particleRoot.scale, {
    x: active ? 0.52 : 1,
    y: active ? 0.52 : 1,
    z: active ? 0.52 : 1,
    duration: dur,
    ease,
  })
  tweenMaterialOpacity(globeMesh?.material, active ? 0.09 : 1, dur)
  tweenMaterialOpacity(atmosphere?.material, active ? 0.02 : 0.12, dur)
  tweenMaterialOpacity(globeWire?.material, active ? 0.03 : 0.2, dur)
  tweenMaterialOpacity(heroHalo?.material, active ? 0.004 : 0.02, dur)
  tweenGroupOpacity(provinceRoot, active ? 0.05 : 0.18, active ? 0.1 : 0.88, dur)
  tweenGroupOpacity(cityRoot, active ? 0.04 : 0.22, active ? 0.08 : 0.82, dur)
  tweenGroupOpacity(focusRoot, active ? 0.06 : 0.28, active ? 0.14 : 0.92, dur)
  tweenGroupOpacity(selectionRoot, active ? 0.03 : 0.2, active ? 0.06 : 0.32, dur)
}

function openDetailFromList(item) {
  selectedParticleData.value = item
  selectedParticleIndex = typeof item.index === 'number' ? item.index : selectedParticleIndex
  activeCategory.value = item.category
  setSceneDetailMode(true)
}

function closeParticleDetail() {
  selectedParticleData.value = null
  selectedParticleIndex = -1
  setSceneDetailMode(false)
}

let scene, camera, renderer, composer, controls, raycaster, clock, stars, heroHalo, atmosphere, globeMesh, globeWire
const globeRadius = 5.2
const globeSphere = new THREE.Sphere(new THREE.Vector3(), globeRadius + 0.18)
let rafId = 0
const mouseNdc = new THREE.Vector2()
const dummy = new THREE.Object3D()
const tempColor = new THREE.Color()
const tempDimColor = new THREE.Color(0x33506d)

const FOCUS_PROVINCE_GEOS = {
  '320000': jiangsuGeo,
  '420000': hubeiGeo,
}
const FOCUS_CITY_DISTRICT_GEOS = {
  '321000': yangzhouGeo,
  '420100': wuhanGeo,
}

function isFocusProvince(code) {
  return !!FOCUS_PROVINCE_GEOS[String(code)]
}

function hasDistrictGeo(code) {
  return !!FOCUS_CITY_DISTRICT_GEOS[String(code)]
}

const provinceRoot = new THREE.Group()
const cityRoot = new THREE.Group()
const focusRoot = new THREE.Group()
const mapRoot = new THREE.Group()
const selectionRoot = new THREE.Group()
const particleRoot = new THREE.Group()

const provincePickables = []
const cityPickables = []
const provinceFeatureMap = new Map()
const cityFeatureMap = new Map()

let particleMeshes = []
let relationLines = null
let orbitDecorations = null
let focusCityOverlay = null
let focusBridge = null
let focusBridgePairs = []
let particleMeta = []
let relationMeta = []
let hoveredParticleIndex = -1
let selectedParticleIndex = -1
const particleAnim = { progress: 0 }

function colorToCss(value) { return `#${new THREE.Color(value).getHexString()}` }
function lonLatToXYZ(lng, lat, radius = globeRadius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}
function getNormalFromCenter(center) { return lonLatToXYZ(center[0], center[1], 1).normalize() }
function geometryToPolygons(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}
function sanitizeRing(ring) {
  const output = ring.map(([lng, lat]) => [Number(lng), Number(lat)])
  if (output.length > 1) {
    const [fx, fy] = output[0]
    const [lx, ly] = output[output.length - 1]
    if (fx === lx && fy === ly) output.pop()
  }
  return output
}
function getBasis(normal) {
  const tangent = new THREE.Vector3(0, 1, 0).cross(normal)
  if (tangent.lengthSq() < 1e-5) tangent.set(1, 0, 0)
  tangent.normalize()
  const bitangent = normal.clone().cross(tangent).normalize()
  return { tangent, bitangent }
}

function xyzToLonLat(point) {
  const radius = point.length() || 1
  const lat = 90 - (Math.acos(point.y / radius) * 180) / Math.PI
  const theta = Math.atan2(point.z, -point.x)
  let lng = (theta * 180) / Math.PI - 180
  if (lng < -180) lng += 360
  if (lng > 180) lng -= 360
  return [lng, lat]
}
function pointInRing(point, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = ((yi > point[1]) !== (yj > point[1])) && (point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || 1e-9) + xi)
    if (intersect) inside = !inside
  }
  return inside
}
function pointInFeature(point, feature) {
  const geometry = feature?.geometry
  if (!geometry) return false
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : []
  return polygons.some((polygon) => polygon?.[0]?.length >= 3 && pointInRing(point, polygon[0]))
}
function pickGeoFeature(event) {
  const rect = containerRef.value.getBoundingClientRect()
  mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouseNdc, camera)
  const hitPoint = new THREE.Vector3()
  const inverse = new THREE.Matrix4().copy(mapRoot.matrixWorld).invert()
  const localRay = raycaster.ray.clone().applyMatrix4(inverse)
  const globeHit = localRay.intersectSphere(globeSphere, hitPoint)
  if (!globeHit) return null
  const lonLat = xyzToLonLat(hitPoint)

  const provinceFeature = chinaGeo.features.find((feature) => pointInFeature(lonLat, feature))
  if (!provinceFeature) return null
  const props = provinceFeature.properties || {}
  return { type: 'province', code: String(props.adcode), name: props.name, center: props.centroid || props.center || getLocationMeta(props.adcode)?.center }
}
function buildSphericalPatch(ring, centerNormal, radius, baseRadius, style) {
  const cleanRing = sanitizeRing(ring)
  if (cleanRing.length < 3) return null

  const spherePoints = cleanRing.map(([lng, lat]) => lonLatToXYZ(lng, lat, radius))
  const centerPoint = centerNormal.clone().multiplyScalar(radius)
  const { tangent, bitangent } = getBasis(centerNormal)
  const shapePoints = spherePoints.map((point) => {
    const offset = point.clone().sub(centerPoint)
    return new THREE.Vector2(offset.dot(tangent), offset.dot(bitangent))
  })
  const triangles = THREE.ShapeUtils.triangulateShape(shapePoints, [])
  const vertices = []

  triangles.forEach(([a, b, c]) => {
    const pa = spherePoints[a]
    const pb = spherePoints[b]
    const pc = spherePoints[c]
    vertices.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z)
  })

  const fillGeometry = new THREE.BufferGeometry()
  fillGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  fillGeometry.computeVertexNormals()

  const fillMaterial = new THREE.MeshStandardMaterial({
    color: style.fillColor,
    emissive: new THREE.Color(style.emissiveColor),
    emissiveIntensity: style.emissiveIntensity,
    transparent: true,
    opacity: style.opacity,
    roughness: 0.34,
    metalness: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const mesh = new THREE.Mesh(fillGeometry, fillMaterial)
  mesh.frustumCulled = true

  const wallVertices = []
  const basePoints = cleanRing.map(([lng, lat]) => lonLatToXYZ(lng, lat, baseRadius))
  for (let i = 0; i < spherePoints.length; i += 1) {
    const next = (i + 1) % spherePoints.length
    const topA = spherePoints[i]
    const topB = spherePoints[next]
    const baseA = basePoints[i]
    const baseB = basePoints[next]
    wallVertices.push(
      baseA.x, baseA.y, baseA.z,
      baseB.x, baseB.y, baseB.z,
      topB.x, topB.y, topB.z,
      baseA.x, baseA.y, baseA.z,
      topB.x, topB.y, topB.z,
      topA.x, topA.y, topA.z,
    )
  }

  const wallGeometry = new THREE.BufferGeometry()
  wallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wallVertices, 3))
  wallGeometry.computeVertexNormals()

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: style.sideColor || style.fillColor,
    emissive: new THREE.Color(style.sideEmissiveColor || style.emissiveColor),
    emissiveIntensity: Math.max((style.emissiveIntensity || 0.4) * 0.68, 0.18),
    transparent: true,
    opacity: Math.max((style.sideOpacity || style.opacity || 0.3) * 0.96, 0.35),
    roughness: 0.16,
    metalness: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial)
  wallMesh.frustumCulled = true

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(spherePoints)
  const lineMaterial = new THREE.LineBasicMaterial({ color: style.lineColor, transparent: true, opacity: style.lineOpacity })
  const line = new THREE.LineLoop(lineGeometry, lineMaterial)
  line.frustumCulled = true

  const glowPoints = spherePoints.map((point) => point.clone().multiplyScalar((radius + 0.02) / radius))
  const glowGeometry = new THREE.BufferGeometry().setFromPoints(glowPoints)
  const glowMaterial = new THREE.LineBasicMaterial({
    color: style.lineColor,
    transparent: true,
    opacity: Math.min((style.lineOpacity || 0.7) + 0.18, 1),
  })
  const glowLine = new THREE.LineLoop(glowGeometry, glowMaterial)
  glowLine.frustumCulled = true

  return { mesh, wallMesh, line, glowLine }
}

function buildGeoFeatureGroup(feature, options) {
  const props = feature.properties || {}
  const code = String(props.adcode)
  const center = props.centroid || props.center || getLocationMeta(code)?.centroid || getLocationMeta(code)?.center
  if (!center) return null

  const normal = getNormalFromCenter(center)
  const group = new THREE.Group()
  const sharedData = { type: options.type, code, name: props.name, center, normal, feature, pickRef: group }

  geometryToPolygons(feature.geometry).forEach((polygon) => {
    const patch = buildSphericalPatch(polygon[0], normal, options.radius, options.baseRadius || globeRadius + 0.01, options.style)
    if (!patch) return
    patch.mesh.userData = sharedData
    patch.wallMesh.userData = sharedData
    patch.line.userData = sharedData
    patch.glowLine.userData = sharedData
    if (options.style?.hideLine) patch.line.visible = false
    if (options.style?.hideGlowLine) patch.glowLine.visible = false
    group.add(patch.wallMesh, patch.mesh, patch.line, patch.glowLine)
  })

  group.userData = { ...sharedData, altitudeScale: options.altitudeScale || 0 }
  group.scale.setScalar(1 + (options.altitudeScale || 0))
  group.renderOrder = options.renderOrder || 0
  return group.children.length ? group : null
}

function setFeatureStyle(group, style) {
  if (typeof style.scale === 'number') group.scale.setScalar(1 + style.scale)
  group.children.forEach((child) => {
    if (child.isMesh) {
      const isWall = group.children.indexOf(child) === 0
      child.material.opacity = isWall ? Math.max((style.sideOpacity || style.opacity || 0.3) * 0.96, 0.35) : style.opacity
      child.material.emissiveIntensity = isWall ? Math.max((style.sideEmissiveIntensity || style.emissiveIntensity || 0.4) * 0.72, 0.24) : style.emissiveIntensity
      child.material.color.setHex(isWall ? (style.sideColor || style.fillColor) : style.fillColor)
      child.material.emissive.setHex(isWall ? (style.sideEmissiveColor || style.emissiveColor) : style.emissiveColor)
    }
    if (child.isLineLoop || child.isLine) {
      const boost = child.material.opacity > 0.8 ? 0.18 : 0
      child.material.opacity = Math.min((style.lineOpacity || 0.7) + boost, 1)
      child.material.color.setHex(style.lineColor)
    }
  })
}

function createStarfield() {
  const starCount = 900
  const positions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 120
    positions[i * 3 + 1] = (Math.random() - 0.5) * 120
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({ size: 0.11, color: 0x7cc6ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
  stars = new THREE.Points(geometry, material)
  scene.add(stars)
}

function createBaseGlobe() {
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius, 72, 72),
    new THREE.MeshStandardMaterial({ color: 0x06101d, roughness: 0.94, metalness: 0.04 }),
  )
  globeMesh = globe
  globeMesh.material.transparent = true
  globeMesh.material.opacity = 1
  mapRoot.add(globeMesh)

  atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius + 0.1, 40, 40),
    new THREE.MeshBasicMaterial({ color: 0x2e93ff, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  mapRoot.add(atmosphere)

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius + 0.01, 16, 12)),
    new THREE.LineBasicMaterial({ color: 0x163456, transparent: true, opacity: 0.2 }),
  )
  globeWire = wire
  mapRoot.add(globeWire)

  const chinaNormal = getNormalFromCenter([104.113106, 37.570693])
  heroHalo = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 96),
    new THREE.MeshBasicMaterial({ color: 0x2c7be5, transparent: true, opacity: 0.02, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  heroHalo.position.copy(chinaNormal.clone().multiplyScalar(globeRadius + 0.04))
  heroHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), chinaNormal)
  mapRoot.add(heroHalo)
}

function initScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020814)

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 5.2
  controls.maxDistance = 28
  controls.rotateSpeed = 0.6
  controls.zoomSpeed = 0.9

  const chinaNormal = getNormalFromCenter([104.113106, 37.570693])
  controls.target.copy(chinaNormal.clone().multiplyScalar(globeRadius * 0.86))
  camera.position.copy(chinaNormal.clone().multiplyScalar(globeRadius + 8.2))

  raycaster = new THREE.Raycaster()
  raycaster.params.Line.threshold = 0.045
  clock = new THREE.Clock()

  mapRoot.add(provinceRoot)
  mapRoot.add(cityRoot)
  mapRoot.add(focusRoot)
  mapRoot.add(selectionRoot)
  scene.add(mapRoot)
  scene.add(particleRoot)
  scene.add(new THREE.AmbientLight(0xa5bfe5, 0.7))

  const keyLight = new THREE.DirectionalLight(0x9ad7ff, 1.3)
  keyLight.position.set(10, 14, 8)
  scene.add(keyLight)

  const fillLight = new THREE.PointLight(0x2d7dff, 2.8, 90)
  fillLight.position.set(-8, 6, -7)
  scene.add(fillLight)

  createBaseGlobe()
  createStarfield()

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new EffectPass(camera, new BloomEffect({ intensity: 0.88, luminanceThreshold: 0.26, mipmapBlur: true })))
}

function resetProvinceLayer() {
  provinceFeatureMap.forEach((group) => {
    setFeatureStyle(group, { fillColor: 0x214f97, sideColor: 0x15386d, emissiveColor: 0x2968b6, sideEmissiveColor: 0x1c4b90, opacity: 0.18, emissiveIntensity: 0.24, lineColor: 0x9feaff, lineOpacity: 0.88, sideOpacity: 0.2, sideEmissiveIntensity: 0.18, scale: 0.004 })
  })
}

function resetProvinceTransforms() {
  provinceFeatureMap.forEach((group) => {
    gsap.killTweensOf(group.position)
    gsap.killTweensOf(group.scale)
    gsap.to(group.position, { x: 0, y: 0, z: 0, duration: 0.45, ease: 'power2.out' })
    gsap.to(group.scale, { x: 1.004, y: 1.004, z: 1.004, duration: 0.45, ease: 'power2.out' })
  })
}

function resetCityRootTransform() {
  gsap.killTweensOf(cityRoot.position)
  gsap.killTweensOf(cityRoot.scale)
  gsap.to(cityRoot.position, { x: 0, y: 0, z: 0, duration: 0.4, ease: 'power2.out' })
  gsap.to(cityRoot.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' })
}

function syncCityRootToProvince(group, amount = 1.45, scale = 1.02) {
  const normal = group.userData.normal
  gsap.killTweensOf(cityRoot.position)
  gsap.killTweensOf(cityRoot.scale)
  gsap.to(cityRoot.position, {
    x: normal.x * amount,
    y: normal.y * amount,
    z: normal.z * amount,
    duration: 0.85,
    ease: 'power3.out',
  })
  gsap.to(cityRoot.scale, {
    x: scale,
    y: scale,
    z: scale,
    duration: 0.85,
    ease: 'power3.out',
  })
}

function liftProvinceGroup(group, center, amount = 0.9, scale = 1.12) {
  const normal = getNormalFromCenter(center)
  gsap.killTweensOf(group.position)
  gsap.killTweensOf(group.scale)
  gsap.to(group.position, {
    x: normal.x * amount,
    y: normal.y * amount,
    z: normal.z * amount,
    duration: 0.85,
    ease: 'power3.out',
  })
  gsap.to(group.scale, {
    x: scale,
    y: scale,
    z: scale,
    duration: 0.85,
    ease: 'power3.out',
  })
}


function dimProvinceLayerExcept(activeCode) {
  provinceFeatureMap.forEach((group, code) => {
    if (String(code) === String(activeCode)) return
    setFeatureStyle(group, {
      fillColor: 0x17345f,
      sideColor: 0x10284a,
      emissiveColor: 0x1e4e8f,
      sideEmissiveColor: 0x173b73,
      opacity: 0.08,
      emissiveIntensity: 0.12,
      lineColor: 0x7fdcff,
      lineOpacity: 0.34,
      sideOpacity: 0.08,
      sideEmissiveIntensity: 0.08,
      scale: 0.002,
    })
  })
}

function buildProvinceLayer() {
  provinceRoot.clear()
  provincePickables.length = 0
  provinceFeatureMap.clear()

  chinaGeo.features.forEach((feature) => {
    const group = buildGeoFeatureGroup(feature, {
      type: 'province',
      radius: globeRadius + 0.12,
      baseRadius: globeRadius + 0.03,
      altitudeScale: 0.004,
      renderOrder: 3,
      style: { fillColor: 0x214f97, sideColor: 0x15386d, emissiveColor: 0x2968b6, sideEmissiveColor: 0x1c4b90, opacity: 0.18, emissiveIntensity: 0.24, lineColor: 0x9feaff, lineOpacity: 0.88, sideOpacity: 0.2, sideEmissiveIntensity: 0.18 },
    })
    if (!group) return
    provinceRoot.add(group)
    provinceFeatureMap.set(group.userData.code, group)
    group.children.forEach((child) => provincePickables.push(child))
  })
}

function disposeGroup(root) {
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) Array.isArray(child.material) ? child.material.forEach((material) => material.dispose()) : child.material.dispose()
  })
  root.clear()
}

function clearCityLayer() {
  cityPickables.length = 0
  cityFeatureMap.clear()
  resetCityRootTransform()
  disposeGroup(cityRoot)
}

function clearFocusPreview() {
  disposeGroup(focusRoot)
  if (focusBridge) {
    selectionRoot.remove(focusBridge)
    focusBridge.geometry.dispose()
    focusBridge.material.dispose()
    focusBridge = null
  }
  focusBridgePairs = []
  if (focusCityOverlay) {
    focusRoot.remove(focusCityOverlay)
    disposeGroup(focusCityOverlay)
    focusCityOverlay = null
  }
}

function buildFocusConnector(center, amount = 1.3) {
  const start = lonLatToXYZ(center[0], center[1], globeRadius + 0.16)
  const normal = getNormalFromCenter(center)
  const end = start.clone().add(normal.clone().multiplyScalar(amount))
  const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(-0.18, 0.24, 0.12))
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
  const points = curve.getPoints(48)
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0.22, depthWrite: false }),
  )
  const glow = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, depthWrite: false }),
  )
  selectionRoot.add(line, glow)
}

function buildGeoFeatureHitGroup(feature, options) {
  const props = feature.properties || {}
  const code = String(props.adcode)
  const center = props.centroid || props.center || getLocationMeta(code)?.centroid || getLocationMeta(code)?.center
  if (!center) return null

  const normal = getNormalFromCenter(center)
  const group = new THREE.Group()
  const sharedData = { type: options.type, code, name: props.name, center, normal, feature, entry: getLocationMeta(code) || null, layer: options.layer || 'default' }

  geometryToPolygons(feature.geometry).forEach((polygon) => {
    const patch = buildSphericalPatch(polygon[0], normal, options.radius, options.baseRadius || options.radius - 0.01, {
      fillColor: 0xffffff,
      sideColor: 0xffffff,
      emissiveColor: 0xffffff,
      sideEmissiveColor: 0xffffff,
      opacity: options.opacity ?? 0.001,
      emissiveIntensity: 0,
      lineColor: 0xffffff,
      lineOpacity: 0,
      sideOpacity: 0.001,
      sideEmissiveIntensity: 0,
    })
    if (!patch) return
    patch.mesh.userData = sharedData
    patch.wallMesh.userData = sharedData
    patch.line.visible = false
    patch.glowLine.visible = false
    patch.wallMesh.visible = false
    group.add(patch.mesh)
  })

  group.userData = sharedData
  return group.children.length ? group : null
}

function buildGeoFeatureLineGroup(feature, options) {
  const props = feature.properties || {}
  const code = String(props.adcode)
  const center = props.centroid || props.center || getLocationMeta(code)?.centroid || getLocationMeta(code)?.center
  if (!center) return null

  const normal = getNormalFromCenter(center)
  const group = new THREE.Group()
  const sharedData = { type: options.type, code, name: props.name, center, normal, feature, entry: getLocationMeta(code) || null, layer: options.layer || 'default' }

  geometryToPolygons(feature.geometry).forEach((polygon) => {
    const cleanRing = sanitizeRing(polygon[0])
    if (cleanRing.length < 3) return
    const points = cleanRing.map(([lng, lat]) => lonLatToXYZ(lng, lat, options.radius))
    const glowPoints = cleanRing.map(([lng, lat]) => lonLatToXYZ(lng, lat, options.radius + (options.glowOffset || 0.016)))
    const glow = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(glowPoints),
      new THREE.LineBasicMaterial({
        color: options.glowColor || 0x86ecff,
        transparent: true,
        opacity: options.glowOpacity ?? 0.42,
        depthWrite: false,
      }),
    )
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: options.lineColor || 0xffffff,
        transparent: true,
        opacity: options.lineOpacity ?? 1,
        depthWrite: false,
      }),
    )
    glow.frustumCulled = true
    line.frustumCulled = true
    glow.renderOrder = (options.renderOrder || 0) - 1
    line.renderOrder = options.renderOrder || 0
    glow.userData = sharedData
    line.userData = sharedData
    group.add(glow, line)
  })

  group.userData = sharedData
  return group.children.length ? group : null
}

function buildFocusBridgeLines(feature, radius = globeRadius + 0.14, previewRadius = globeRadius + 0.35) {
  if (focusBridge) {
    selectionRoot.remove(focusBridge)
    focusBridge.geometry.dispose()
    focusBridge.material.dispose()
    focusBridge = null
  }
  focusBridgePairs = []
  const outer = geometryToPolygons(feature.geometry)[0]?.[0]
  if (!outer) return
  const ring = sanitizeRing(outer)
  const step = Math.max(1, Math.floor(ring.length / 22))
  const sampled = ring.filter((_, index) => index % step === 0).slice(0, 32)
  sampled.forEach(([lng, lat]) => {
    focusBridgePairs.push({
      start: lonLatToXYZ(lng, lat, radius),
      end: lonLatToXYZ(lng, lat, previewRadius),
    })
  })
  const arr = new Float32Array(focusBridgePairs.length * 6)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  const mat = new THREE.LineBasicMaterial({ color: 0x84ebff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })
  focusBridge = new THREE.LineSegments(geo, mat)
  focusBridge.frustumCulled = false
  selectionRoot.add(focusBridge)
}

function updateFocusBridge() {
  if (!focusBridge || !focusBridgePairs.length) return
  const arr = focusBridge.geometry.attributes.position.array
  for (let i = 0; i < focusBridgePairs.length; i += 1) {
    const pair = focusBridgePairs[i]
    const endWorld = focusRoot.localToWorld(pair.end.clone())
    const a = i * 6
    arr[a] = pair.start.x
    arr[a + 1] = pair.start.y
    arr[a + 2] = pair.start.z
    arr[a + 3] = endWorld.x
    arr[a + 4] = endWorld.y
    arr[a + 5] = endWorld.z
  }
  focusBridge.geometry.attributes.position.needsUpdate = true
}

function buildProvinceFocusPreview(provinceCode) {
  clearFocusPreview()
  const code = String(provinceCode)
  const provinceFeature = chinaGeo.features.find((feature) => String(feature.properties?.adcode) == code)
  const meta = getLocationMeta(code)
  if (!provinceFeature || !meta) return

  const normal = getNormalFromCenter(meta.centroid || meta.center)
  const preview = buildGeoFeatureGroup(provinceFeature, {
    type: 'province-focus',
    radius: globeRadius + 0.33,
    baseRadius: globeRadius + 0.21,
    altitudeScale: 0.01,
    renderOrder: 8,
    style: {
      fillColor: 0x9befff,
      sideColor: 0x3677c7,
      emissiveColor: 0xdffdff,
      opacity: 0.08,
      lineColor: 0xffffff,
      lineOpacity: 1,
      sideOpacity: 0.12,
      sideEmissiveIntensity: 0.14,
      hideLine: true,
      hideGlowLine: true,
    },
  })
  if (!preview) return
  focusRoot.add(preview)

  if (FOCUS_PROVINCE_GEOS[code]) {
    FOCUS_PROVINCE_GEOS[code].features.forEach((feature) => {
      const hitGroup = buildGeoFeatureHitGroup(feature, {
        type: 'city',
        layer: 'focus-preview',
        radius: globeRadius + 0.345,
        baseRadius: globeRadius + 0.33,
        opacity: 0.003,
      })
      const lineGroup = buildGeoFeatureLineGroup(feature, {
        type: 'city',
        layer: 'focus-preview',
        radius: globeRadius + 0.35,
        renderOrder: 10,
        lineColor: 0xffffff,
        lineOpacity: 0.96,
        glowColor: 0xb6f6ff,
        glowOpacity: 0.52,
        glowOffset: 0.03,
      })
      if (hitGroup) {
        focusRoot.add(hitGroup)
        hitGroup.children.forEach((child) => cityPickables.push(child))
      }
      if (!lineGroup) return
      focusRoot.add(lineGroup)
      cityFeatureMap.set(lineGroup.userData.code, lineGroup)
      lineGroup.children.forEach((child) => cityPickables.push(child))
    })
    setFocusCityHighlight(null)
  }

  focusRoot.position.set(0, 0, 0)
  focusRoot.scale.setScalar(0.78)
  gsap.killTweensOf(focusRoot.position)
  gsap.killTweensOf(focusRoot.scale)
  gsap.to(focusRoot.position, {
    x: normal.x * 1.28,
    y: normal.y * 1.28,
    z: normal.z * 1.28,
    duration: 0.95,
    ease: 'power3.out',
  })
  gsap.to(focusRoot.scale, {
    x: 1.2,
    y: 1.2,
    z: 1.2,
    duration: 0.95,
    ease: 'power3.out',
  })
}
function setFocusCityHighlight(cityCode = null) {
  cityFeatureMap.forEach((group, code) => {
    const active = cityCode && String(code) == String(cityCode)
    group.children.forEach((child, index) => {
      if (!child.material) return
      if (active) {
        child.material.opacity = 0
        return
      }
      if (index % 2 == 0) {
        child.material.color.setHex(0x9eeeff)
        child.material.opacity = 0.32
      } else {
        child.material.color.setHex(0xffffff)
        child.material.opacity = 0.92
      }
    })
  })
  buildFocusCityOverlay(cityCode)
}


function buildFocusCityOverlay(cityCode) {
  if (focusCityOverlay) {
    focusRoot.remove(focusCityOverlay)
    disposeGroup(focusCityOverlay)
    focusCityOverlay = null
  }
  const provinceCode = String(selectedProvince.value?.code || '')
  const provinceGeo = FOCUS_PROVINCE_GEOS[provinceCode]
  if (!cityCode || !provinceGeo) return
  const feature = provinceGeo.features.find((item) => String(item.properties?.adcode) === String(cityCode))
  if (!feature) return
  focusCityOverlay = new THREE.Group()
  const fillGroup = buildGeoFeatureGroup(feature, {
    type: 'focus-city-overlay',
    radius: globeRadius + 0.352,
    baseRadius: globeRadius + 0.335,
    altitudeScale: 0.002,
    renderOrder: 12,
    style: {
      fillColor: 0xe9fbff,
      sideColor: 0x71dfff,
      emissiveColor: 0xffffff,
      sideEmissiveColor: 0x9cebff,
      opacity: 0.16,
      emissiveIntensity: 0.92,
      lineColor: 0xffffff,
      lineOpacity: 1,
      sideOpacity: 0.04,
      sideEmissiveIntensity: 0.1,
    },
  })
  const lineGroup = buildGeoFeatureLineGroup(feature, {
    type: 'focus-city-overlay-line',
    radius: globeRadius + 0.37,
    renderOrder: 14,
    lineColor: 0xffffff,
    lineOpacity: 1,
    glowColor: 0xcafcff,
    glowOpacity: 0.9,
    glowOffset: 0.045,
  })
  if (fillGroup) focusCityOverlay.add(fillGroup)
  if (lineGroup) focusCityOverlay.add(lineGroup)
  if (focusCityOverlay.children.length) focusRoot.add(focusCityOverlay)
}


function buildMarkerCity(entry) {
  const center = entry.centroid || entry.center
  const normal = getNormalFromCenter(center)
  const pos = lonLatToXYZ(center[0], center[1], globeRadius + 0.26)
  const hitSphere = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 18), new THREE.MeshBasicMaterial({ color: 0x9fdfff, transparent: true, opacity: 0.95 }))
  hitSphere.position.copy(pos)
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 28), new THREE.MeshBasicMaterial({ color: 0x75e0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }))
  ring.position.copy(pos.clone().multiplyScalar((globeRadius + 0.31) / (globeRadius + 0.26)))
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
  const shared = { type: 'city', code: String(entry.adcode), name: entry.name, center, normal, entry }
  hitSphere.userData = shared
  ring.userData = shared
  cityRoot.add(hitSphere, ring)
  cityPickables.push(hitSphere, ring)
}

function buildCityLayer(provinceCode) {
  clearCityLayer()
  clearFocusPreview()
  const code = String(provinceCode)
  if (isFocusProvince(code)) {
    buildProvinceFocusPreview(code)
    return
  }
  getProvinceChildren(code).forEach((entry) => buildMarkerCity(entry))
}
function buildOrbitDecorations(cityMeta) {
  if (orbitDecorations) {
    selectionRoot.remove(orbitDecorations)
    disposeGroup(orbitDecorations)
  }
  orbitDecorations = new THREE.Group()
  const normal = getNormalFromCenter(cityMeta.center)
  const center = lonLatToXYZ(cityMeta.center[0], cityMeta.center[1], globeRadius + 0.31)

  ;[[0.42, 0.48], [0.6, 0.66]].forEach(([inner, outer], index) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 64),
      new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x90f1ff : 0x5576ff,
        transparent: true,
        opacity: index === 0 ? 0.34 : index === 1 ? 0.22 : 0.14,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    ring.position.copy(center.clone().multiplyScalar((globeRadius + 0.33) / (globeRadius + 0.31)))
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    ring.userData.spin = index === 0 ? 0.18 : index === 1 ? -0.11 : 0.07
    ring.userData.pulse = 1 + index * 0.8
    orbitDecorations.add(ring)
  })
  selectionRoot.add(orbitDecorations)
}

function buildDistrictOutline(cityCode) {
  disposeGroup(selectionRoot)
  orbitDecorations = null
  const cityMeta = getLocationMeta(cityCode)
  if (cityMeta && hasDistrictGeo(cityCode)) buildOrbitDecorations({ center: cityMeta.centroid || cityMeta.center })
}

function clearParticleEffects() {
  if (particleMeshes.length) {
    particleMeshes.forEach((mesh) => {
      particleRoot.remove(mesh)
      mesh.geometry.dispose()
      mesh.material.dispose()
    })
    particleMeshes = []
  }
  if (relationLines) {
    particleRoot.remove(relationLines)
    relationLines.geometry.dispose()
    relationLines.material.dispose()
    relationLines = null
  }
  particleMeta = []
  relationMeta = []
  hoveredParticleIndex = -1
  selectedParticleIndex = -1
  particleCount.value = 0
}

function getPreviewCityAnchor(cityCode) {
  if (!isFocusProvince(selectedProvince.value?.code)) return null
  const cityMeta = getLocationMeta(cityCode)
  if (!cityMeta) return null
  const previewCenterLocal = lonLatToXYZ(cityMeta.center[0], cityMeta.center[1], globeRadius + 0.35)
  const previewCenterWorld = focusRoot.localToWorld(previewCenterLocal.clone())
  const previewOriginWorld = focusRoot.localToWorld(new THREE.Vector3())
  const normal = previewCenterWorld.clone().sub(previewOriginWorld).normalize()
  const { tangent, bitangent } = getBasis(normal)
  const scale = focusRoot.scale.x || 1
  const liftedCenter = previewCenterWorld.clone().add(normal.clone().multiplyScalar(0.34 * scale))
  return {
    center: liftedCenter,
    normal,
    tangent,
    bitangent,
    scale,
  }
}

function getParticleFocusIndex() {
  return selectedParticleIndex >= 0 ? selectedParticleIndex : hoveredParticleIndex
}

function getCategoryVisual(category) {
  if (category === 'Talent') return { radius: [0.08, 0.14], scale: 1.18 }
  if (category === 'Paper') return { radius: [0.16, 0.24], scale: 1.04 }
  if (category === 'Enterprise') return { radius: [0.22, 0.32], scale: 1.1 }
  return { radius: [0.24, 0.36], scale: 1 }
}

function buildRelationMeta(items) {
  const talents = []
  const papers = []
  const enterprises = []
  items.forEach((item, index) => {
    if (item.category === 'Talent') talents.push(index)
    else if (item.category === 'Paper') papers.push(index)
    else if (item.category === 'Enterprise') enterprises.push(index)
  })

  const links = []
  const connect = (source, target, strength) => {
    if (source == null || target == null || source === target) return
    links.push({ source, target, strength })
  }

  papers.forEach((idx, i) => connect(idx, talents[i % Math.max(talents.length, 1)], 0.72))
  enterprises.forEach((idx, i) => {
    connect(idx, talents[i % Math.max(talents.length, 1)], 0.88)
    if (papers.length) connect(idx, papers[i % papers.length], 0.46)
  })
  for (let i = 1; i < talents.length; i += 1) connect(talents[0], talents[i], 0.58)

  return links
}

function getParticleWorldPosition(meta, elapsed) {
  const phase = elapsed * meta.speed * 0.3 + meta.angle
  const scale = meta.anchorScale || 1
  if (meta.shellDirection && meta.orbitAxis) {
    const direction = meta.shellDirection.clone().applyAxisAngle(meta.orbitAxis, phase)
    const shellRadius = (meta.shellRadiusBase + meta.shellRadiusSwing * particleAnim.progress) * scale
    return meta.center.clone().add(direction.multiplyScalar(shellRadius))
  }
  const radial = (meta.orbitRadius + meta.radialOffset * particleAnim.progress) * scale
  const lift = (meta.liftBase + Math.sin(phase * 1.4 + meta.band) * meta.liftSwing) * scale
  return meta.center.clone()
    .add(meta.tangent.clone().multiplyScalar(Math.cos(phase) * radial))
    .add(meta.bitangent.clone().multiplyScalar(Math.sin(phase) * radial))
    .add(meta.normal.clone().multiplyScalar(lift + meta.orbitTilt * 0.08 * scale))
}

function createParticleCloud(cityCode) {
  clearParticleEffects()
  const cityMeta = getLocationMeta(cityCode)
  if (!cityMeta) return

  const previewAnchor = getPreviewCityAnchor(cityCode)
  const center = previewAnchor?.center || lonLatToXYZ(cityMeta.center[0], cityMeta.center[1], globeRadius + 0.34)
  const normal = previewAnchor?.normal || getNormalFromCenter(cityMeta.center)
  const tangent = previewAnchor?.tangent || getBasis(normal).tangent
  const bitangent = previewAnchor?.bitangent || getBasis(normal).bitangent
  const anchorScale = previewAnchor?.scale || 1
  const items = getParticleSource(cityCode)
  particleCount.value = items.length
  particleAnim.progress = 0

  particleMeta = items.map((item, index) => {
    const randomDirection = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ).normalize()
    const axis = randomDirection.clone().cross(new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize())
    if (axis.lengthSq() < 1e-5) axis.set(0, 1, 0)
    axis.normalize()
    const visual = getCategoryVisual(item.category)
    return {
      ...item,
      index,
      center,
      normal,
      tangent,
      bitangent,
      anchorScale,
      scaleBoost: visual.scale,
      liftBase: previewAnchor ? 0.1 : 0.16,
      liftSwing: previewAnchor ? 0.025 : 0.06,
      shellDirection: previewAnchor ? randomDirection : null,
      orbitAxis: previewAnchor ? axis : null,
      shellRadiusBase: previewAnchor ? (visual.radius[0] + Math.random() * (visual.radius[1] - visual.radius[0])) : 0,
      shellRadiusSwing: previewAnchor ? (0.035 + Math.random() * 0.04) : 0,
      connections: new Set(),
    }
  })

  relationMeta = buildRelationMeta(particleMeta)
  relationMeta.forEach((link) => {
    particleMeta[link.source]?.connections.add(link.target)
    particleMeta[link.target]?.connections.add(link.source)
  })

  FILTERS.forEach((category) => {
    const metaIndices = particleMeta.filter((item) => item.category === category).map((item) => item.index)
    if (!metaIndices.length) return
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 8, 8),
      new THREE.MeshBasicMaterial({
        color: CATEGORY_STYLES[category].color,
        transparent: true,
        opacity: category === activeCategory.value ? 1 : 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
      metaIndices.length,
    )
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.frustumCulled = true
    mesh.userData = { type: 'particle-cloud', category, metaIndices }
    mesh.renderOrder = 30
    particleRoot.add(mesh)
    particleMeshes.push(mesh)
  })

  gsap.to(particleAnim, { progress: 1, duration: 1.3, ease: 'power2.out' })

  const lineArray = new Float32Array(relationMeta.length * 6)
  relationLines = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x6bd8ff, transparent: true, opacity: 0.06, depthWrite: false, depthTest: false }),
  )
  relationLines.geometry.setAttribute('position', new THREE.BufferAttribute(lineArray, 3))
  relationLines.frustumCulled = true
  particleRoot.add(relationLines)
}

function focusToPoint(point, normal, distance = 3.6, duration = 1.05) {
  const target = point.clone()
  const position = point.clone().add(normal.clone().multiplyScalar(distance))
  gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power2.inOut' })
  gsap.to(camera.position, { x: position.x, y: position.y, z: position.z, duration, ease: 'power2.inOut' })
}

function setZoomWindow(minDistance, maxDistance = 28) {
  if (!controls) return
  controls.minDistance = minDistance
  controls.maxDistance = maxDistance
}

function focusTo(center, distance = 7.5, duration = 1.25) {
  const normal = getNormalFromCenter(center)
  const target = normal.clone().multiplyScalar(globeRadius)
  const position = normal.clone().multiplyScalar(globeRadius + distance)
  gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power2.inOut' })
  gsap.to(camera.position, { x: position.x, y: position.y, z: position.z, duration, ease: 'power2.inOut' })
}

function selectProvinceByData(data) {
  selectedProvince.value = { code: data.code, name: data.name, center: data.center }
  selectedCity.value = null
  closeParticleDetail()
  hoveredParticleIndex = -1
  resetProvinceLayer()
  resetProvinceTransforms()
  clearFocusPreview()
  const provinceGroup = provinceFeatureMap.get(String(data.code))
  const isFocus = isFocusProvince(data.code)
  if (provinceGroup) {
    setFeatureStyle(provinceGroup, { fillColor: 0x7fc8ff, sideColor: 0x204e98, emissiveColor: 0xbfefff, sideEmissiveColor: 0x6fd8ff, opacity: 0.34, emissiveIntensity: 0.72, lineColor: 0xe8fbff, lineOpacity: 1, sideOpacity: 0.14, sideEmissiveIntensity: 0.24, scale: isFocus ? 0.008 : 0.05, hideGlowLine: true })
    if (!isFocus) liftProvinceGroup(provinceGroup, data.center, 0.95, 1.1)
  }
  dimProvinceLayerExcept(data.code)
  buildCityLayer(data.code)
  buildDistrictOutline(null)
  if (isFocus) buildFocusConnector(data.center, 1.15)
  setZoomWindow(isFocus ? 2.4 : 4.2, 24)
  clearParticleEffects()
  if (isFocus) {
    const provinceFeature = chinaGeo.features.find((feature) => String(feature.properties?.adcode) === String(data.code))
    if (provinceFeature) buildFocusBridgeLines(provinceFeature, globeRadius + 0.13, globeRadius + 0.35)
  }
  focusTo(data.center, isFocus ? 3.8 : 6.2, isFocus ? 1.05 : 1.1)
}

function selectCityByData(data) {
  const meta = getLocationMeta(data.code) || data.entry || null
  if (!meta) return
  selectedCity.value = { code: String(data.code), name: data.name, center: meta.centroid || meta.center, provinceName: selectedProvince.value?.name || '' }
  closeParticleDetail()
  hoveredParticleIndex = -1
  if (isFocusProvince(selectedProvince.value?.code)) setFocusCityHighlight(data.code)
  buildDistrictOutline(data.code)
  createParticleCloud(data.code)
  setZoomWindow(1.2, 16)
  const previewAnchor = getPreviewCityAnchor(data.code)
  if (previewAnchor) {
    focusToPoint(previewAnchor.center, previewAnchor.normal, 2.2, 0.95)
  } else {
    focusTo(meta.centroid || meta.center, 3.6)
  }
}

function selectCityFromMenu(item) {
  selectCityByData({
    type: 'city',
    code: String(item.adcode),
    name: item.name,
    center: item.centroid || item.center || getLocationMeta(item.adcode)?.center,
    entry: item,
  })
}

function pickParticleFallback(event) {
  if (!particleMeta.length || !containerRef.value) return null
  const rect = containerRef.value.getBoundingClientRect()
  let best = null
  let bestDist = 48
  const elapsed = clock.getElapsedTime()
  for (let i = 0; i < particleMeta.length; i += 1) {
    const meta = particleMeta[i]
    const pos = getParticleWorldPosition(meta, elapsed).clone().project(camera)
    if (pos.z < -1 || pos.z > 1) continue
    const x = ((pos.x + 1) * 0.5) * rect.width + rect.left
    const y = ((1 - pos.y) * 0.5) * rect.height + rect.top
    const dist = Math.hypot(event.clientX - x, event.clientY - y)
    if (dist < bestDist) {
      bestDist = dist
      best = { meta, index: i, pos: getParticleWorldPosition(meta, elapsed) }
    }
  }
  return best
}

function focusParticleDetail(meta, pos) {
  selectedParticleData.value = meta
  selectedParticleIndex = typeof meta.index === 'number' ? meta.index : -1
  activeCategory.value = meta.category
  setSceneDetailMode(true)
}

function pick(event) {
  const rect = containerRef.value.getBoundingClientRect()
  mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouseNdc, camera)
  const targets = [...cityPickables, ...particleMeshes]
  return raycaster.intersectObjects(targets, false)
}

function onPointerMove(event) {
  tooltip.visible = false

  // Detail panel mode: suppress all map hover
  if (selectedParticleData.value) return

  const hits = pick(event)
  const hit = hits[0]
  const hitData = hit?.object?.userData || {}

  // ── City level (particles visible): only particle hover ──────────────
  if (selectedCity.value) {
    if (hitData.type === 'particle-cloud' && typeof hit.instanceId === 'number') {
      hoveredParticleIndex = hit.instanceId
      const meta = particleMeta[hit.instanceId]
      if (!meta) { hoveredParticleIndex = -1; return }
      tooltip.visible = true
      tooltip.x = event.clientX + 16
      tooltip.y = event.clientY + 16
      tooltip.title = meta.title
      tooltip.subtitle = `${CATEGORY_STYLES[meta.category].label} · ${meta.value}`
    } else {
      hoveredParticleIndex = -1
    }
    return
  }

  hoveredParticleIndex = -1

  // ── Province level: only city-marker hover (no globe geo pick) ────────
  if (selectedProvince.value) {
    if (hitData.type === 'city') {
      tooltip.visible = true
      tooltip.x = event.clientX + 16
      tooltip.y = event.clientY + 16
      tooltip.title = hitData.name
      tooltip.subtitle = '点击钻取城市'
    }
    return
  }

  // ── National level: province geo hover ───────────────────────────────
  const geoHit = pickGeoFeature(event)
  if (!geoHit) return
  tooltip.visible = true
  tooltip.x = event.clientX + 16
  tooltip.y = event.clientY + 16
  tooltip.title = geoHit.name
  tooltip.subtitle = '点击聚焦省份'
}

function onClick(event) {
  const hits = pick(event)
  const hit = hits[0]
  const hitData = hit?.object?.userData || {}

  // ── Particle click: highest priority at any level ─────────────────────
  if (!selectedParticleData.value && hitData.type === 'particle-cloud' && typeof hit?.instanceId === 'number') {
    hoveredParticleIndex = hit.instanceId
    const meta = particleMeta[hit.instanceId]
    if (meta) focusParticleDetail(meta, getParticleWorldPosition(meta, clock.getElapsedTime()))
    return
  }

  // ── Detail mode: map clicks are suppressed (use close button) ─────────
  if (selectedParticleData.value) return

  // ── City level: fallback particle pick only ───────────────────────────
  if (selectedCity.value) {
    const fallback = pickParticleFallback(event)
    if (fallback) focusParticleDetail(fallback.meta, fallback.pos)
    return
  }

  // ── Province level: city marker click ────────────────────────────────
  if (selectedProvince.value) {
    if (hitData.type === 'city') {
      selectCityByData(hitData)
      return
    }
    return
  }

  // ── National level: province geo click ───────────────────────────────
  const geoHit = pickGeoFeature(event)
  if (geoHit?.type === 'province') selectProvinceByData(geoHit)
}

function updateParticles(elapsed) {
  if (!particleMeshes.length || !particleMeta.length) return
  const focusIndex = getParticleFocusIndex()

  particleMeshes.forEach((mesh) => {
    const metaIndices = mesh.userData.metaIndices || []
    const category = mesh.userData.category
    const isActiveCategory = category === activeCategory.value
    mesh.material.opacity = focusIndex >= 0
      ? (isActiveCategory ? 0.78 : 0.12)
      : (isActiveCategory ? 0.92 : 0.22)

    metaIndices.forEach((metaIndex, localIndex) => {
      const meta = particleMeta[metaIndex]
      const pos = getParticleWorldPosition(meta, elapsed)
      const isFocused = metaIndex === focusIndex
      const isLinked = focusIndex >= 0 && meta.connections?.has(focusIndex)
      let emphasis = isActiveCategory ? 1 : 0.48
      if (focusIndex >= 0) emphasis = isFocused || isLinked ? 1.06 : emphasis * 0.28
      const scale = meta.size * meta.scaleBoost * (0.92 + emphasis * 0.24 + Math.sin(elapsed * 1.2 + metaIndex) * 0.02)
      dummy.position.copy(pos)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(localIndex, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  if (relationLines?.geometry?.attributes?.position) {
    const attribute = relationLines.geometry.attributes.position
    relationMeta.forEach((link, i) => {
      const a = particleMeta[link.source]
      const b = particleMeta[link.target]
      const pa = getParticleWorldPosition(a, elapsed)
      const pb = getParticleWorldPosition(b, elapsed)
      const base = i * 6
      attribute.array[base] = pa.x
      attribute.array[base + 1] = pa.y
      attribute.array[base + 2] = pa.z
      attribute.array[base + 3] = pb.x
      attribute.array[base + 4] = pb.y
      attribute.array[base + 5] = pb.z
    })
    relationLines.material.opacity = focusIndex >= 0 ? 0.12 : 0.06
    attribute.needsUpdate = true
  }
}

function animate() {
  rafId = requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()
  if (stars) {
    stars.rotation.y += 0.00045
    stars.rotation.x = Math.sin(elapsed * 0.08) * 0.03
  }
  if (heroHalo) heroHalo.material.opacity = 0.025 + Math.sin(elapsed * 1.2) * 0.01
  if (atmosphere) atmosphere.material.opacity = 0.09 + Math.sin(elapsed * 1.1) * 0.03
  if (orbitDecorations) orbitDecorations.children.forEach((child, index) => {
    child.rotation.z += child.userData.spin || 0
    const pulse = 1 + Math.sin(elapsed * (child.userData.pulse || 1.2) + index) * 0.08
    child.scale.setScalar(pulse)
    child.material.opacity = Math.max(0.08, Math.min(0.38, (index === 0 ? 0.3 : index === 1 ? 0.2 : 0.14) + Math.sin(elapsed * (child.userData.pulse || 1.2) + index) * 0.06))
  })
  if (selectedProvince.value) {
    const provinceGroup = provinceFeatureMap.get(String(selectedProvince.value.code))
    if (provinceGroup) provinceGroup.children.forEach((child, index) => { if (child.isMesh) child.material.emissiveIntensity = (index === 0 ? 1.18 : 1.5) + Math.sin(elapsed * 2.5) * 0.24 })
  }
  updateFocusBridge()
  updateParticles(elapsed)
  controls.update()
  composer.render()
}

function onResize() {
  if (!containerRef.value) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
  intelTrendChart?.resize()
  intelRankingChart?.resize()
  intelDonutChart?.resize()
  intelScatterChart?.resize()
}

onMounted(() => {
  initScene()
  buildProvinceLayer()
  containerRef.value.appendChild(renderer.domElement)
  containerRef.value.addEventListener('pointermove', onPointerMove)
  containerRef.value.addEventListener('click', onClick)
  containerRef.value.addEventListener('pointerleave', () => { tooltip.visible = false })
  window.addEventListener('resize', onResize)
  onResize()
  animate()
})


onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  if (containerRef.value) {
    containerRef.value.removeEventListener('pointermove', onPointerMove)
    containerRef.value.removeEventListener('click', onClick)
  }
  clearParticleEffects()
  disposeIntelCharts()
  disposeGroup(selectionRoot)
  disposeGroup(focusRoot)
  disposeGroup(cityRoot)
  disposeGroup(provinceRoot)
  controls?.dispose()
  composer?.dispose()
  renderer?.dispose()
})
</script>
<style scoped>
.screen-root { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: radial-gradient(circle at 18% 12%, rgba(35, 92, 176, 0.2), transparent 22%), radial-gradient(circle at 82% 28%, rgba(35, 150, 255, 0.16), transparent 24%), linear-gradient(180deg, #010611 0%, #020b18 42%, #01050c 100%); color: #e8f5ff; font-family: 'Segoe UI', 'PingFang SC', sans-serif; }
.screen-canvas, .screen-noise, .screen-vignette { position: absolute; inset: 0; }
.screen-noise { pointer-events: none; opacity: 0.18; background-image: linear-gradient(rgba(116, 188, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(116, 188, 255, 0.04) 1px, transparent 1px); background-size: 32px 32px; mask-image: radial-gradient(circle at center, black 30%, transparent 92%); }
.screen-vignette { pointer-events: none; background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.42) 100%); }
.hud { position: absolute; z-index: 10; }
.glass-card { background: linear-gradient(180deg, rgba(10, 23, 48, 0.76), rgba(6, 15, 32, 0.62)); border: 1px solid rgba(123, 195, 255, 0.18); box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(123, 195, 255, 0.06); backdrop-filter: blur(14px); }
.glass-inner { background: linear-gradient(180deg, rgba(21, 45, 93, 0.48), rgba(9, 20, 44, 0.4)); border: 1px solid rgba(122, 188, 255, 0.12); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03); }
.top-brand { top: 18px; left: 18px; right: 18px; border-radius: 18px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
.eyebrow { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.18em; color: #7fb9ff; }
.top-brand h1 { margin: 0; font-size: 24px; font-weight: 700; }
.brand-badge { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; background: rgba(82, 164, 255, 0.12); border: 1px solid rgba(126, 198, 255, 0.24); }
.live-dot { width: 10px; height: 10px; border-radius: 50%; background: #54f3d2; box-shadow: 0 0 12px #54f3d2; }
.hero-panel { top: 96px; left: 18px; width: min(560px, calc(100vw - 420px)); border-radius: 18px; padding: 10px 12px; display: block; pointer-events: none; transition: opacity 0.45s ease, transform 0.45s ease; }
.hero-copy { pointer-events: auto; }
.hero-copy h2 { margin: 0 0 6px; font-size: 22px; line-height: 1.15; }
.hero-copy p:last-of-type { margin: 0; max-width: 520px; font-size: 12px; line-height: 1.4; color: #a9cbf3; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.filter-row, .tag-row, .legend-row { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-row { margin-top: 8px; }
.filter-pill, .province-menu-grid button { border: 1px solid rgba(128, 199, 255, 0.16); background: rgba(46, 82, 148, 0.28); color: #dcf4ff; border-radius: 999px; padding: 6px 11px; cursor: pointer; pointer-events: auto; }
.filter-pill.active { background: linear-gradient(90deg, rgba(63, 111, 255, 0.95), rgba(67, 224, 255, 0.8)); box-shadow: 0 0 22px rgba(84, 173, 255, 0.24); }
.stat-row { margin-top: 8px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; max-width: 540px; }
.stat-card, .meta-grid > div { border-radius: 12px; padding: 8px 10px; background: rgba(31, 59, 116, 0.36); border: 1px solid rgba(123, 192, 255, 0.12); }
.stat-card span, .meta-grid span, .section-head span, .trend-col span { font-size: 10px; color: #8fbdf0; }
.stat-card strong, .meta-grid strong, .section-head strong { display: block; margin-top: 3px; font-size: 15px; }
.hero-trend { border-radius: 15px; padding: 10px 12px; pointer-events: auto; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.section-head.compact strong { margin-top: 0; }
.trend-bars { margin-top: 8px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; align-items: end; min-height: 74px; }
.trend-col { display: grid; justify-items: center; gap: 6px; }
.trend-track { width: 16px; height: 46px; border-radius: 999px; background: rgba(197, 222, 255, 0.08); display: flex; align-items: end; overflow: hidden; }
.trend-fill { width: 100%; border-radius: 999px; background: linear-gradient(180deg, #85f1ff, #4c79ff); box-shadow: 0 0 14px rgba(86, 167, 255, 0.35); transition: height 0.45s ease; }
.province-panel { left: 18px; top: 228px; width: 228px; border-radius: 16px; padding: 10px 12px; pointer-events: none; transition: opacity 0.45s ease, transform 0.45s ease; }
.province-menu-grid { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.province-tip { display: none; }
.detail-top { display: flex; align-items: center; justify-content: space-between; }
.type-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 58px; padding: 6px 10px; border-radius: 999px; background: rgba(77, 136, 220, 0.24); color: #d8f6ff; font-size: 12px; }

/* ── Intel Dashboard Panel ─────────────────────────────────────── */
.intel-dash-panel {
  top: 96px; left: 18px; right: 18px; bottom: 78px;
  border-radius: 20px; overflow: hidden;
  display: flex; flex-direction: column;
  z-index: 14; opacity: 0;
  transform: translateX(-56px) scale(0.97);
  pointer-events: none;
  transition: opacity 0.72s cubic-bezier(0.16, 1, 0.3, 1), transform 0.72s cubic-bezier(0.16, 1, 0.3, 1);
}
.intel-dash-panel.active { opacity: 1; transform: translateX(0) scale(1); pointer-events: auto; }

/* Transparent glass overrides — panel floats over the globe background */
.intel-dash-panel.glass-card {
  background: rgba(2, 6, 18, 0.18);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  border-color: rgba(88, 213, 255, 0.1);
  box-shadow: 0 0 100px rgba(20, 60, 180, 0.1), inset 0 0 0 1px rgba(88, 213, 255, 0.05);
}
.intel-dash-panel .glass-inner {
  background: rgba(10, 24, 58, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-color: rgba(88, 213, 255, 0.09);
  box-shadow: none;
}
.intel-dash-panel .dash-header {
  background: rgba(5, 14, 36, 0.38);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.intel-dash-panel .dash-intel-block {
  background: rgba(6, 14, 36, 0.2);
  border-color: rgba(88, 213, 255, 0.09);
}

/* Header */
.dash-header {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 11px 18px 10px;
  border-bottom: 1px solid rgba(123, 195, 255, 0.1);
  background: linear-gradient(90deg, rgba(21, 45, 93, 0.55), rgba(9, 20, 44, 0.42));
  animation: dash-fade-in 0.5s 0.05s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.dash-path .eyebrow { margin: 0 0 3px; font-size: 10px; }
.dash-breadcrumb { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; }
.dash-breadcrumb .bc-sep { color: rgba(123, 195, 255, 0.32); }
.dash-breadcrumb strong { color: #7fe8ff; }
.dash-header-right { display: flex; align-items: center; gap: 11px; }
.live-badge-sm { display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px; border-radius: 999px; background: rgba(82, 164, 255, 0.1); border: 1px solid rgba(126, 198, 255, 0.16); font-size: 11px; color: #a8d8ff; }

/* Body grid */
.dash-body {
  flex: 1; min-height: 0;
  display: grid; grid-template-columns: 1fr 352px;
  gap: 10px; padding: 10px; overflow: hidden;
}
.dash-left { display: flex; flex-direction: column; gap: 9px; min-height: 0; overflow: hidden; }
.dash-right {
  display: flex; flex-direction: column; gap: 9px; min-height: 0;
  overflow-y: auto; padding-right: 2px;
}
.dash-right::-webkit-scrollbar { width: 3px; }
.dash-right::-webkit-scrollbar-track { background: transparent; }
.dash-right::-webkit-scrollbar-thumb { background: rgba(123,195,255,0.15); border-radius: 999px; }

/* Node hero row */
.node-hero-row {
  flex-shrink: 0; border-radius: 14px; padding: 13px 15px;
  display: flex; align-items: center; gap: 13px; overflow: hidden; position: relative;
  animation: dash-fade-up 0.55s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.node-hero-accent-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 2px; }
.node-chip { flex-shrink: 0; font-size: 11px; border: 1px solid; padding: 4px 10px; }
.node-hero-text { flex: 1; min-width: 0; }
.node-hero-text h2 { margin: 0 0 4px; font-size: 16px; font-weight: 700; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.node-hero-text p { margin: 0; font-size: 12px; color: #9cc4eb; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.node-value-badge { flex-shrink: 0; text-align: center; padding: 8px 14px; border-radius: 12px; background: rgba(10, 20, 44, 0.6); border: 1px solid rgba(123, 195, 255, 0.14); }
.node-value-badge strong { display: block; font-size: 28px; line-height: 1; font-weight: 800; }
.node-value-badge span { display: block; font-size: 10px; color: #7fb9ff; margin-top: 3px; }

/* KPI row */
.kpi-row {
  flex-shrink: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  animation: dash-fade-up 0.55s 0.17s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.kpi-card { border-radius: 12px; padding: 10px 12px; border-left: 2px solid var(--kc, #58d5ff); }
.kpi-label { display: block; font-size: 10px; color: #8fbdf0; margin-bottom: 4px; }
.kpi-value { display: block; font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.kpi-track { height: 3px; background: rgba(123,195,255,0.1); border-radius: 999px; overflow: hidden; }
.kpi-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 0 8px currentColor; }

/* Chart rows */
.chart-row-top {
  flex-shrink: 0; display: grid; grid-template-columns: 3fr 2fr; gap: 9px;
  animation: dash-fade-up 0.55s 0.24s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.chart-row-bot {
  flex: 1; min-height: 0;
  animation: dash-fade-up 0.55s 0.31s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.chart-row-bot > .chart-panel { height: 100%; }
.chart-panel { border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; overflow: hidden; }
.chart-panel-head { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.chart-panel-head h4 { margin: 0; font-size: 12px; font-weight: 600; color: #b8d8f8; }
.intel-chart-box { flex: 1; min-height: 120px; }
.scatter-box { min-height: 180px; }

/* Right column */
.scatter-panel {
  flex-shrink: 0;
  animation: dash-fade-left 0.6s 0.12s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.summary-strip {
  flex-shrink: 0; border-radius: 14px; padding: 11px 14px;
  animation: dash-fade-left 0.6s 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.summary-strip .eyebrow { margin: 0 0 5px; }
.summary-body { margin: 0; font-size: 12px; color: #9cc4eb; line-height: 1.6; }
.dash-intel-block {
  flex-shrink: 0; border-radius: 14px; padding: 11px 13px;
  background: linear-gradient(180deg, rgba(10,23,48,0.52), rgba(6,15,32,0.42));
  border: 1px solid rgba(123,195,255,0.1);
  animation: dash-fade-left 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.block-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; font-size: 12px; font-weight: 600; color: #b8d8f8; }
.intel-flow-card { border-radius: 12px; padding: 10px 12px; margin-bottom: 7px; }
.intel-flow-card:last-child { margin-bottom: 0; }
.intel-flow-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.intel-flow-head time { margin-left: auto; font-size: 10px; color: #7fb9ff; }
.intel-flow-card h4 { margin: 0 0 4px; font-size: 12px; line-height: 1.45; font-weight: 600; color: #dff0ff; }
.intel-flow-card p { margin: 0; font-size: 11px; color: #9cc4eb; line-height: 1.5; }
.intel-tag-sm { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 999px; background: rgba(77,136,220,0.22); color: #d8f6ff; font-size: 10px; }
.impact-chip { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 600; }
.impact-chip.pos { background: rgba(42,200,120,0.15); color: #52e8a4; border: 1px solid rgba(42,200,120,0.25); }
.impact-chip.neg { background: rgba(255,92,92,0.13); color: #ff8a8a; border: 1px solid rgba(255,92,92,0.22); }
.impact-chip.neu { background: rgba(200,180,80,0.13); color: #f0d060; border: 1px solid rgba(200,180,80,0.22); }

/* Shared components */
.panel-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; background: rgba(42,82,148,0.3); border: 1px solid rgba(123,192,255,0.14); color: #9cc4eb; font-size: 10px; }

@keyframes dash-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes dash-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes dash-fade-left { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
.tag-row { margin-top: 12px; }
.tag-row span, .legend-pill { border-radius: 999px; padding: 6px 10px; background: rgba(70, 104, 167, 0.22); border: 1px solid rgba(123, 192, 255, 0.14); color: #d4ebff; font-size: 12px; }
.footer-bar { left: 18px; right: 18px; bottom: 18px; border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.legend-pill { display: inline-flex; align-items: center; gap: 8px; }
.legend-pill i { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 12px currentColor; }
.footer-tip { color: #96bde6; font-size: 12px; }
.tooltip { position: fixed; z-index: 30; min-width: 180px; pointer-events: none; border-radius: 12px; padding: 10px 12px; background: rgba(4, 13, 28, 0.94); border: 1px solid rgba(129, 206, 255, 0.18); box-shadow: 0 16px 30px rgba(0, 0, 0, 0.28); }
.tooltip p { margin: 0; font-size: 13px; font-weight: 700; }
.tooltip span { display: block; margin-top: 4px; color: #9fc5ec; font-size: 12px; }
.close-btn { border: 1px solid rgba(123, 192, 255, 0.14); background: rgba(70, 104, 167, 0.22); color: #d4ebff; border-radius: 999px; padding: 6px 10px; cursor: pointer; }
@media (max-width: 1380px) {
  .detail-page { left: 18px; width: auto; }
  .hero-panel { width: auto; right: 18px; grid-template-columns: 1fr; }
  .province-panel { top: 236px; width: 210px; }
  .node-detail-panel { width: calc(100vw - 36px); bottom: 78px; }
}
.screen-root.detail-mode .top-brand { opacity: 0.62; transform: translateY(-3px); transition: opacity 0.7s ease, transform 0.7s ease; }
.screen-root.detail-mode .screen-canvas { cursor: default; }
.screen-root.detail-mode .hero-panel,
.screen-root.detail-mode .province-panel { opacity: 0; transform: translateX(-32px); pointer-events: none; }
.screen-root.detail-mode .footer-bar { opacity: 0.4; transition: opacity 0.6s ease; }
.screen-root.detail-mode .intel-dash-panel { opacity: 1; transform: translateX(0) scale(1); pointer-events: auto; }
</style>










