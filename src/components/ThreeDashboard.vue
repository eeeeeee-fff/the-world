<template>
  <div ref="screenRootRef" class="screen-root" :class="{ 'detail-mode': !!selectedParticleData, 'intro-lock': !introInteractive }">
    <div ref="containerRef" class="screen-canvas"></div>
    <div class="screen-noise"></div>
    <div class="screen-vignette"></div>

    <!-- Top brand HUD -->
    <section ref="topBrandRef" class="hud top-brand glass-card">
      <div>
        <p class="eyebrow">INDUSTRIAL INTELLIGENCE / IMMERSIVE MAP</p>
        <h1>产业智能情报 3D 指挥屏</h1>
      </div>
      <div ref="topMetricsRef" class="top-metrics">
        <div class="brand-badge">
          <span class="live-dot"></span>
          <span>实时演算</span>
        </div>
        <div class="title-metric-strip">
          <div v-for="item in headlineMetrics" :key="item.key" class="title-metric">
            <span>{{ item.label }}</span>
            <strong>{{ item.display }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Hero panel -->
    <section ref="heroPanelRef" class="hud hero-panel glass-card">
      <div class="hero-copy">
        <p class="eyebrow">{{ drillLabel }}</p>
        <h2>{{ heroTitle }}</h2>
        <p>{{ heroSubtitle }}</p>
        <div class="filter-row">
          <button
            v-for="filter in FILTERS" :key="filter"
            :class="['filter-pill', { active: activeCategory === filter }]"
            @click="activeCategory = filter"
          >{{ CATEGORY_STYLES[filter].label }}</button>
        </div>
        <div class="stat-row">
          <div v-for="item in heroStats" :key="item.label" class="stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Province panel -->
    <section v-if="selectedProvince && !selectedCity" class="hud province-panel glass-card">
      <div class="section-head compact">
        <span>省级菜单</span>
        <strong>{{ selectedProvince.name }}</strong>
      </div>
      <div class="province-menu-grid">
        <button v-for="item in provinceMenuItems" :key="item.adcode" @click="onSelectCityFromMenu(item)">
          {{ item.name }}
        </button>
      </div>
      <p class="province-tip">{{ PROVINCE_PANEL_COPY }}</p>
    </section>

    <!-- City quick-entry panel -->
    <section v-if="selectedCity && cityQuickEntries.length" class="hud city-quick-panel glass-card">
      <div class="section-head compact">
        <span>{{ CATEGORY_STYLES[activeCategory].label }}快捷入口</span>
        <strong>{{ selectedCity.name }}</strong>
      </div>
      <div class="city-quick-grid">
        <button
          v-for="item in cityQuickEntries" :key="item.id"
          class="city-quick-card"
          :style="{ '--quick-color': CHART_CAT_COLORS[activeCategory] }"
          @click="onOpenQuickEntry(item)"
        >
          <span class="city-quick-type">{{ CATEGORY_STYLES[activeCategory].label }}</span>
          <strong :title="item.title">{{ item.name }}</strong>
          <p :title="item.title">{{ item.title }}</p>
          <span class="city-quick-link">进入详情</span>
        </button>
      </div>
    </section>

    <!-- Intel dashboard panel -->
    <IntelDashPanel
      :particle-data="selectedParticleData"
      :type-data="particleTypeData"
      :loading="sectorLoading"
      :accent-color="categoryColorCss"
      :category-styles="CATEGORY_STYLES"
      :kpi-colors="kpiColors"
      :kpi-counted-values="kpiCountedValues"
      :kpi-width="kpiWidth"
      :province-name="selectedProvince?.name"
      :city-name="selectedCity?.name"
      :talent-graph="talentGraph"
      :enterprise-graph="enterpriseGraph"
      :paper-graph="paperGraph"
      :patent-graph="patentGraph"
      :is-activity-detail-available="isActivityDetailAvailable"
      @close="closeParticleDetail"
      @open-activity="openActivityDetail"
    />

    <!-- Activity detail modal -->
    <ActivityDetailModal
      v-if="selectedActivityDetail"
      :detail="selectedActivityDetail"
      :city-name="selectedCity?.name"
      @close="selectedActivityDetail = null"
    />

    <!-- Footer bar -->
    <footer ref="footerBarRef" class="hud footer-bar glass-card">
      <div class="legend-row">
        <span v-for="filter in FILTERS" :key="filter" class="legend-pill">
          <i :style="{ backgroundColor: colorToCss(CATEGORY_STYLES[filter].color) }"></i>
          {{ CATEGORY_STYLES[filter].label }}
        </span>
      </div>
      <Transition name="hint-fade">
        <span v-if="selectedCity || selectedProvince" class="footer-tip back-hint" key="back">
          <span class="back-hint-path">
            <span :class="['bc-crumb', !selectedProvince ? 'active' : '']" @click="onResetToNational">全国</span>
            <template v-if="selectedProvince">
              <span class="bc-arrow">›</span>
              <span :class="['bc-crumb', selectedProvince && !selectedCity ? 'active' : '']" @click="selectedCity ? onSelectProvince(selectedProvince) : null">{{ selectedProvince.name }}</span>
            </template>
            <template v-if="selectedCity">
              <span class="bc-arrow">›</span>
              <span class="bc-crumb active">{{ selectedCity.name }}</span>
            </template>
          </span>
          <span class="back-hint-tip">ESC / 双击空白 返回上一级</span>
        </span>
        <span v-else class="footer-tip" key="default">{{ FOOTER_DEFAULT_COPY }}</span>
      </Transition>
    </footer>

    <!-- Tooltip -->
    <div v-if="tooltip.visible" class="tooltip" :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      <p>{{ tooltip.title }}</p>
      <span>{{ tooltip.subtitle }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import gsap from 'gsap'

import '../styles/three-dashboard.css'

// ── Data imports ─────────────────────────────────────────────────────────────
import {
  FOOTER_DEFAULT_COPY, PROVINCE_PANEL_COPY,
  getDrillLabel, getHeroSubtitle, getHeroTitle,
} from '../data/dashboard-copy.js'
import { fetchSectorData } from '../data/sector-api.js'
import {
  CATEGORY_STYLES, FILTERS, chinaGeo,
  getDetailItems, getProvinceHero, getProvinceChildren,
  hubeiGeo, jiangsuGeo, wuhanGeo, yangzhouGeo,
} from '../data/map-scene-data.js'
import { buildWuhanActivityDetail } from '../data/activity-details.js'

// ── Composables ───────────────────────────────────────────────────────────────
import { useGlobeScene } from '../composables/useGlobeScene.js'
import { useIntelData, CHART_CAT_COLORS, kpiColors } from '../composables/useIntelData.js'
import { colorToCss } from '../utils/geoMath.js'
import {
  ctx, FOCUS_PROVINCE_GEOS, FOCUS_CITY_DISTRICT_GEOS,
  provinceFeatureMap, particleState, pulseProvinceCodes,
  provinceRoot, cityRoot, focusRoot, selectionRoot,
} from '../composables/globeState.js'
import { buildProvinceLayer } from '../composables/useGeoLayers.js'
import {
  refreshProvincePulses, animateProvincePulses, animateSelectedProvince,
  updateFocusBridge, animateOrbitDecorations,
} from '../composables/useGeoLayers.js'
import { updateParticles, getParticleWorldPosition } from '../composables/useParticleCloud.js'
import {
  selectProvinceByData, selectCityByData, selectCityFromMenu, resetToNational,
  focusTo, focusToPoint, setZoomWindow,
} from '../composables/useMapNavigation.js'
import {
  onPointerMove as _onPointerMove,
  onClick as _onClick,
  onDblClick as _onDblClick,
  onKeyDown as _onKeyDown,
} from '../composables/useMapInteraction.js'
import { playIntroSequence, setSceneDetailMode } from '../composables/useAnimations.js'

// ── Sub-components ────────────────────────────────────────────────────────────
import IntelDashPanel from './dashboard/IntelDashPanel.vue'
import ActivityDetailModal from './dashboard/ActivityDetailModal.vue'

// ── Populate focus geo maps ───────────────────────────────────────────────────
FOCUS_PROVINCE_GEOS['320000'] = jiangsuGeo
FOCUS_PROVINCE_GEOS['420000'] = hubeiGeo
FOCUS_CITY_DISTRICT_GEOS['321000'] = yangzhouGeo
FOCUS_CITY_DISTRICT_GEOS['420100'] = wuhanGeo

// ── DOM refs ──────────────────────────────────────────────────────────────────
const screenRootRef = ref(null)
const containerRef  = ref(null)
const topBrandRef   = ref(null)
const topMetricsRef = ref(null)
const heroPanelRef  = ref(null)
const footerBarRef  = ref(null)

// ── Reactive state ────────────────────────────────────────────────────────────
const selectedProvince     = ref(null)
const selectedCity         = ref(null)
const activeCategory       = ref('Talent')
const selectedParticleData = ref(null)
const particleCount        = ref(0)
const introInteractive     = ref(false)
const tooltip              = reactive({ visible: false, x: 0, y: 0, title: '', subtitle: '' })
const headlineMetricValues = reactive({ particles: 0, provinces: 0, pulses: 0 })
const selectedActivityDetail = ref(null)

// Shared state object passed to navigation helpers
const mapState = { selectedProvince, selectedCity, activeCategory, particleCount, selectedParticleData, introInteractive }

// ── Composables ───────────────────────────────────────────────────────────────
const { initScene, onResize, mountRenderer, dispose: disposeScene } = useGlobeScene(containerRef)

const {
  particleTypeData, sectorLoading, currentSector,
  categoryColorCss, talentGraph, enterpriseGraph, patentGraph, paperGraph,
  kpiCountedValues, kpiWidth, loadSectorData, resetIntelData,
} = useIntelData(selectedParticleData)

// ── Timers & stable handler refs ─────────────────────────────────────────────
let particleDetailTimer = null
let chartRenderTimer    = null
let _keydownHandler     = null

// ── Headline metrics ──────────────────────────────────────────────────────────
function formatMetric(value) { return new Intl.NumberFormat('zh-CN').format(Math.max(0, Math.round(value))) }

function animateHeadlineMetrics(duration = 0.7) {
  const targets = {
    particles: selectedCity.value ? particleCount.value : Math.max(chinaGeo.features.length * FILTERS.length, particleCount.value),
    provinces: chinaGeo.features.length,
    pulses: Math.max(pulseProvinceCodes.size, 6),
  }
  Object.entries(targets).forEach(([key, value], index) => {
    const proxy = { value: headlineMetricValues[key] || 0 }
    gsap.to(proxy, { value, duration, delay: index * 0.05, ease: 'power2.out', onUpdate() { headlineMetricValues[key] = proxy.value }, onComplete() { headlineMetricValues[key] = value } })
  })
}

const headlineMetrics = computed(() => ([
  { key: 'particles', label: '粒子池',  display: formatMetric(headlineMetricValues.particles) },
  { key: 'provinces', label: '省数',    display: formatMetric(headlineMetricValues.provinces) },
  { key: 'pulses',    label: '脉冲省数', display: formatMetric(headlineMetricValues.pulses) },
]))

watch([particleCount, selectedCity, selectedProvince], () => {
  if (!introInteractive.value) return
  animateHeadlineMetrics(0.45)
})

// ── Derived display state ─────────────────────────────────────────────────────
const drillLabel = computed(() => getDrillLabel(selectedProvince.value, selectedCity.value))
const heroTitle  = computed(() => getHeroTitle(selectedProvince.value, selectedCity.value))
const heroSubtitle = computed(() => getHeroSubtitle(selectedProvince.value, selectedCity.value))

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

const provinceMenuItems = computed(() =>
  !selectedProvince.value ? [] : getProvinceChildren(selectedProvince.value.code),
)
const cityQuickEntries = computed(() =>
  selectedCity.value ? getDetailItems(selectedCity.value.code, activeCategory.value) : [],
)

// ── Activity detail ───────────────────────────────────────────────────────────
function isWuhanContext() { return String(selectedCity.value?.code || '') === '420100' }
function isActivityDetailAvailable(activity) { return isWuhanContext() && (activity?.type === 'paper' || activity?.type === 'patent') }

function openActivityDetail(activity) {
  if (!isActivityDetailAvailable(activity)) return
  selectedActivityDetail.value = buildWuhanActivityDetail(activity, selectedParticleData.value)
}

// ── Particle detail panel ─────────────────────────────────────────────────────
const layerRoots = { provinceRoot, cityRoot, focusRoot, selectionRoot }

function focusParticleDetail(meta, pos) {
  if (particleDetailTimer !== null) { clearTimeout(particleDetailTimer); particleDetailTimer = null }
  particleState.selectedIndex = typeof meta.index === 'number' ? meta.index : -1
  activeCategory.value = meta.category

  if (pos) {
    const normal = pos.clone().normalize()
    const zoomTo = pos.clone().add(normal.multiplyScalar(2.0))
    gsap.killTweensOf(ctx.camera.position)
    gsap.killTweensOf(ctx.controls.target)
    gsap.to(ctx.controls.target, { x: pos.x, y: pos.y, z: pos.z, duration: 0.28, ease: 'power2.in' })
    gsap.to(ctx.camera.position, {
      x: zoomTo.x, y: zoomTo.y, z: zoomTo.z, duration: 0.28, ease: 'power2.in',
      onComplete: () => setSceneDetailMode(true, layerRoots),
    })
  } else {
    setSceneDetailMode(true, layerRoots)
  }

  particleDetailTimer = setTimeout(() => {
    selectedParticleData.value = meta
    particleDetailTimer = null
  }, 560)
}

function closeParticleDetail() {
  if (particleDetailTimer !== null) { clearTimeout(particleDetailTimer); particleDetailTimer = null }
  if (chartRenderTimer !== null)   { clearTimeout(chartRenderTimer);   chartRenderTimer = null }
  selectedActivityDetail.value = null
  selectedParticleData.value = null
  particleState.selectedIndex = -1
  setSceneDetailMode(false, layerRoots)
  tooltip.visible = false
}

watch(selectedParticleData, async (val) => {
  if (chartRenderTimer !== null) { clearTimeout(chartRenderTimer); chartRenderTimer = null }
  if (val) {
    await loadSectorData(currentSector.value)
  } else {
    resetIntelData()
  }
})

watch(currentSector, async (sector) => {
  if (selectedParticleData.value) await loadSectorData(sector)
})

// ── Navigation adapters ───────────────────────────────────────────────────────
function onSelectProvince(data) {
  closeParticleDetail()
  selectProvinceByData(data, mapState)
}
function onSelectCity(data) {
  closeParticleDetail()
  particleState.hoveredIndex = -1
  selectCityByData(data, mapState)
}
function onSelectCityFromMenu(item) {
  closeParticleDetail()
  selectCityFromMenu(item, mapState)
}
function onOpenQuickEntry(item) {
  if (!item) return
  focusParticleDetail({ ...item }, null)
}
function onResetToNational() {
  closeParticleDetail()
  resetToNational(mapState)
}
function goBackOneLevel() {
  if (selectedParticleData.value) { closeParticleDetail(); return }
  if (selectedCity.value) { onSelectProvince(selectedProvince.value); return }
  if (selectedProvince.value) onResetToNational()
}

// ── Render loop ───────────────────────────────────────────────────────────────
function animate() {
  ctx.rafId = requestAnimationFrame(animate)
  const elapsed = ctx.clock.getElapsedTime()

  if (ctx.stars) {
    ctx.stars.rotation.y += 0.00045
    ctx.stars.rotation.x = Math.sin(elapsed * 0.08) * 0.03
  }
  if (introInteractive.value) {
    if (ctx.heroHalo) ctx.heroHalo.material.opacity = 0.025 + Math.sin(elapsed * 1.2) * 0.01
    if (ctx.atmosphere) ctx.atmosphere.material.opacity = 0.09 + Math.sin(elapsed * 1.1) * 0.03
    refreshProvincePulses(elapsed, selectedProvince.value?.code)
    animateProvincePulses(elapsed, selectedProvince.value?.code)
    if (selectedProvince.value) animateSelectedProvince(elapsed, selectedProvince.value.code)
  }
  animateOrbitDecorations(elapsed)
  updateFocusBridge()
  updateParticles(elapsed, activeCategory)
  ctx.controls.update()
  ctx.composer.render()
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  initScene()
  buildProvinceLayer()
  mountRenderer()

  const el = containerRef.value
  el.addEventListener('pointermove', (e) => _onPointerMove(e, containerRef, { selectedParticleData, selectedCity, selectedProvince, activeCategory, tooltip, introInteractive }, { CATEGORY_STYLES }))
  el.addEventListener('click', (e) => _onClick(e, containerRef, { selectedParticleData, selectedCity, selectedProvince, introInteractive }, { focusParticleDetail, selectCityByData: onSelectCity, selectProvinceByData: onSelectProvince }))
  el.addEventListener('dblclick', (e) => _onDblClick(e, containerRef, { selectedParticleData, introInteractive }, goBackOneLevel))
  el.addEventListener('pointerleave', () => { tooltip.visible = false })
  _keydownHandler = (e) => _onKeyDown(e, introInteractive, goBackOneLevel)
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', _keydownHandler)

  onResize()
  animate()
  nextTick(() => playIntroSequence({ topBrandRef, heroPanelRef, footerBarRef, topMetricsRef }, introInteractive, animateHeadlineMetrics))
})

onBeforeUnmount(() => {
  ctx.introTimeline?.kill()
  cancelAnimationFrame(ctx.rafId)
  window.removeEventListener('resize', onResize)
  if (_keydownHandler) window.removeEventListener('keydown', _keydownHandler)
  disposeScene()
})
</script>
