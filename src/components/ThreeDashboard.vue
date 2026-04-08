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

    <section v-if="selectedProvince && !selectedCity" class="hud province-panel glass-card">
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


    <section v-if="selectedCity && cityQuickEntries.length" class="hud city-quick-panel glass-card">
      <div class="section-head compact">
        <span>{{ CATEGORY_STYLES[activeCategory].label }}&#24555;&#25463;&#20837;&#21475;</span>
        <strong>{{ selectedCity.name }}</strong>
      </div>
      <div class="city-quick-grid">
        <button
          v-for="item in cityQuickEntries"
          :key="item.id"
          class="city-quick-card"
          :style="{ '--quick-color': CHART_CAT_COLORS[activeCategory] }"
          @click="openQuickEntry(item)"
        >
          <span class="city-quick-type">{{ CATEGORY_STYLES[activeCategory].label }}</span>
          <strong :title="item.title">{{ item.name }}</strong>
          <p :title="item.title">{{ item.title }}</p>
          <span class="city-quick-link">&#36827;&#20837;&#35814;&#24773;</span>
        </button>
      </div>
    </section>


    <section class="hud intel-dash-panel glass-card" :class="{ active: !!selectedParticleData }">
      <template v-if="selectedParticleData">

        <!-- ── Common header ─────────────────────────────────── -->
        <div class="dash-header">
          <div class="dash-path">
            <p class="eyebrow">INTEL NODE / {{ CATEGORY_STYLES[selectedParticleData.category].label }}</p>
            <div class="dash-breadcrumb">
              <span>{{ selectedProvince?.name || 'CHINA' }}</span><span class="bc-sep">›</span>
              <span>{{ selectedCity?.name || '--' }}</span><span class="bc-sep">›</span>
              <strong>{{ selectedParticleData.name }}</strong>
            </div>
          </div>
          <div class="dash-header-right">
            <div class="live-badge-sm"><span class="live-dot"></span><span>情报实时</span></div>
            <button class="close-btn" @click="closeParticleDetail">← 返回地图</button>
          </div>
        </div>

        <!-- ── Node identity hero ─────────────────────────────── -->
        <div class="node-hero-row glass-inner" :style="{ '--accent': categoryColorCss }">
          <div class="node-hero-accent-bar" :style="{ background: categoryColorCss }"></div>
          <span class="type-chip node-chip" :style="{ background: categoryColorCss+'28', color: categoryColorCss, borderColor: categoryColorCss+'44' }">
            {{ CATEGORY_STYLES[selectedParticleData.category].label }}
          </span>
          <div class="node-hero-text">
            <h2>{{ selectedParticleData.title }}</h2>
            <p>{{ selectedParticleData.subtitle }}</p>
            <div class="tag-row" style="margin-top:5px" v-if="selectedParticleData.tags?.length">
              <span v-for="tag in selectedParticleData.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="node-value-badge">
            <strong :style="{ color: categoryColorCss }">{{ selectedParticleData.value }}</strong>
            <span>综合指数</span>
          </div>
        </div>

        <!-- ── KPI metrics strip ──────────────────────────────── -->
        <div class="kpi-row" v-if="particleTypeData">
          <div v-for="(m, i) in particleTypeData.metrics" :key="m.label" class="kpi-card glass-inner" :style="{ '--kc': kpiColors[i] }">
            <span class="kpi-label">{{ m.label }}</span>
            <strong class="kpi-value" :style="{ color: kpiColors[i] }">{{ kpiCountedValues[i] ?? m.value }}</strong>
            <div class="kpi-track"><div class="kpi-fill" :style="{ width: kpiWidth(m.value), background: kpiColors[i] }"></div></div>
          </div>
        </div>

        <!-- ── Type-specific panel grid ───────────────────────── -->
        <div class="type-panels-area" v-if="particleTypeData && !sectorLoading">

          <!-- ══ TALENT ══════════════════════════════════════════ -->
          <div v-if="selectedParticleData.category === 'Talent'" class="type-grid">

            <!-- P1: Knowledge graph SVG -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>知识图谱</span><span class="panel-tag">关系网络</span></div>
              <div class="tp-body">
                <svg class="net-svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
                  <line v-for="(l,i) in talentGraph.links" :key="'tl'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
                  <text v-for="(l,i) in talentGraph.links" :key="'tlb'+i" :x="l.lx" :y="l.ly" class="net-link-label">{{ l.label }}</text>
                  <g v-for="n in talentGraph.nodes" :key="n.id">
                    <circle :cx="n.x" :cy="n.y" :r="n.type==='self'?14:n.weight*5+5" :class="['net-node', n.type]" />
                    <text :x="n.x" :y="n.y + (n.type==='self'?24:n.weight*5+16)" class="net-label" :class="n.type">{{ n.label }}</text>
                  </g>
                </svg>
              </div>
            </div>

            <!-- P2: Research directions radar -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>研究方向</span><span class="panel-tag">能力雷达</span></div>
              <div ref="talentRadarRef" class="tp-chart"></div>
            </div>

            <!-- P3: Publication trend -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>发表趋势</span><span class="panel-tag">论文 / 专利</span></div>
              <div ref="talentPubRef" class="tp-chart"></div>
            </div>

            <!-- P4: Activity timeline -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>近期动态</span><span class="panel-tag">时间线</span></div>
              <div class="activity-list">
                <div v-for="(a,i) in particleTypeData.activities" :key="i" class="activity-item" :class="{ clickable: isActivityDetailAvailable(a) }" :style="{'--delay': i*0.08+'s'}" @click="openActivityDetail(a)">
                  <div class="act-dot" :class="a.type"></div>
                  <div class="act-body">
                    <div class="act-meta">
                      <span class="act-tag" :class="a.type">{{ a.tag }}</span>
                      <span :class="['impact-chip', a.impact==='利好'?'pos':a.impact==='利空'?'neg':'neu']">{{ a.impact }}</span>
                      <time>{{ a.date }}</time>
                    </div>
                    <p class="act-title">{{ a.title }}</p>
                    <span v-if="isActivityDetailAvailable(a)" class="act-link">&#26597;&#30475;&#35814;&#24773;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ ENTERPRISE ══════════════════════════════════════ -->
          <div v-else-if="selectedParticleData.category === 'Enterprise'" class="type-grid">

            <!-- P1: Tech tag cloud -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>核心技术</span><span class="panel-tag">标签云</span></div>
              <div class="tp-body tag-cloud-wrap">
                <span
                  v-for="(t,i) in particleTypeData.techTags" :key="i"
                  class="tech-tag"
                  :style="{ fontSize: (10 + t.weight*2.5)+'px', opacity: 0.55 + t.weight*0.09, animationDelay: i*0.04+'s' }"
                >{{ t.label }}</span>
              </div>
            </div>

            <!-- P2: Talent composition donut -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>人才构成</span><span class="panel-tag">圆环</span></div>
              <div ref="entTalentRef" class="tp-chart"></div>
            </div>

            <!-- P3: Output trend stacked bar -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>产出趋势</span><span class="panel-tag">专利 / 论文</span></div>
              <div ref="entOutputRef" class="tp-chart"></div>
            </div>

            <!-- P4: Partner network + activities -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>合作机构</span><span class="panel-tag">网络</span></div>
              <div class="tp-body split-v">
                <svg class="net-svg net-svg-sm" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                  <line v-for="(l,i) in enterpriseGraph.links" :key="'el'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
                  <g v-for="n in enterpriseGraph.nodes" :key="n.id">
                    <circle :cx="n.x" :cy="n.y" :r="n.type==='self'?12:7" :class="['net-node', n.type]" />
                    <text :x="n.x" :y="n.y+20" class="net-label" :class="n.type">{{ n.label?.slice(0,6) }}</text>
                  </g>
                </svg>
                <div class="mini-activity-list">
                  <div v-for="(a,i) in particleTypeData.activities.slice(0,3)" :key="i" class="mini-act" :class="{ clickable: isActivityDetailAvailable(a) }" :style="{'--delay': i*0.1+'s'}" @click="openActivityDetail(a)">
                    <span class="act-tag" :class="a.type">{{ a.tag }}</span>
                    <span class="mini-act-title">{{ a.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ PAPER ══════════════════════════════════════════ -->
          <div v-else-if="selectedParticleData.category === 'Paper'" class="type-grid">

            <!-- P1: Citation network -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>引用网络</span><span class="panel-tag">关系图</span></div>
              <div class="tp-body">
                <svg class="net-svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
                  <line v-for="(l,i) in paperGraph.links" :key="'pl'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
                  <g v-for="n in paperGraph.nodes" :key="n.id">
                    <circle :cx="n.x" :cy="n.y" :r="n.type==='self'?13:6+Math.min(n.citations||0,30)/6" :class="['net-node', n.type]" />
                    <text :x="n.x" :y="n.y+20" class="net-label" :class="n.type">{{ n.label?.slice(0,8) }}</text>
                  </g>
                </svg>
              </div>
            </div>

            <!-- P2: Domain radar -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>研究领域</span><span class="panel-tag">分布雷达</span></div>
              <div ref="paperKeyRef" class="tp-chart"></div>
            </div>

            <!-- P3: Keywords bar -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>关键词权重</span><span class="panel-tag">横向排行</span></div>
              <div ref="paperRelRef" class="tp-chart"></div>
            </div>

            <!-- P4: Authors + related papers -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>作者 & 相关</span><span class="panel-tag">详情</span></div>
              <div class="tp-body split-v">
                <div class="author-list">
                  <div v-for="(a,i) in particleTypeData.authors" :key="i" class="author-row" :class="{main: a.isMain}">
                    <span class="author-dot"></span>
                    <span class="author-name">{{ a.name }}</span>
                    <span class="author-org">{{ a.org }}</span>
                    <span v-if="a.isMain" class="author-badge">通讯</span>
                  </div>
                </div>
                <div class="related-paper-list">
                  <div v-for="(p,i) in particleTypeData.relatedPapers.slice(0,4)" :key="i" class="related-paper" :style="{'--delay': i*0.07+'s'}">
                    <span class="rp-year">{{ p.year }}</span>
                    <span class="rp-title">{{ p.name }}</span>
                    <span class="rp-cite">{{ p.citations }}引</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ PATENT ══════════════════════════════════════════ -->
          <div v-else-if="selectedParticleData.category === 'Patent'" class="type-grid">

            <!-- P1: Tech treemap -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>技术分类</span><span class="panel-tag">树状图</span></div>
              <div ref="patentTreeRef" class="tp-chart"></div>
            </div>

            <!-- P2: Filing trend -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>申请趋势</span><span class="panel-tag">年度走势</span></div>
              <div ref="patentTrendRef" class="tp-chart"></div>
            </div>

            <!-- P3: Applicant network -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>权利人网络</span><span class="panel-tag">关系图</span></div>
              <div class="tp-body">
                <svg class="net-svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
                  <line v-for="(l,i) in patentGraph.links" :key="'ptl'+i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" class="net-line" />
                  <g v-for="n in patentGraph.nodes" :key="n.id">
                    <circle :cx="n.x" :cy="n.y" :r="n.type==='self'?13:8" :class="['net-node', n.type, n.type==='enterprise'?'ent':n.type==='university'?'uni':'']" />
                    <text :x="n.x" :y="n.y+21" class="net-label">{{ n.label?.slice(0,6) }}</text>
                  </g>
                </svg>
              </div>
            </div>

            <!-- P4: IPC + activities -->
            <div class="tp glass-inner">
              <div class="tp-head"><span>IPC 分类</span><span class="panel-tag">分布</span></div>
              <div class="tp-body split-v">
                <div ref="patentIpcRef" class="tp-chart flex-half"></div>
                <div class="mini-activity-list">
                  <div v-for="(a,i) in particleTypeData.activities.slice(0,3)" :key="i" class="mini-act" :class="{ clickable: isActivityDetailAvailable(a) }" :style="{'--delay': i*0.09+'s'}" @click="openActivityDetail(a)">
                    <span class="act-tag" :class="a.type">{{ a.tag }}</span>
                    <span class="mini-act-title">{{ a.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <Transition name="sector-fade">
          <div v-if="sectorLoading" class="sector-loading-overlay">
            <div class="sector-loading-inner">
              <div class="sector-spinner"></div>
              <span>情报数据加载中</span>
              <div class="sector-skel-row">
                <div class="sector-skel" style="width:60%;height:12px"></div>
                <div class="sector-skel" style="width:40%;height:12px"></div>
                <div class="sector-skel" style="width:75%;height:12px"></div>
              </div>
            </div>
          </div>
        </Transition>

      </template>
    </section>

      <div v-if="selectedActivityDetail" class="activity-detail-overlay" @click.self="closeActivityDetail">
        <article class="activity-article-card glass-card">
          <header class="activity-article-hero">
            <div class="activity-article-copy">
              <p class="eyebrow">{{ selectedActivityDetail.kindLabel }} / WUHAN DEMO</p>
              <h3>{{ selectedActivityDetail.title }}</h3>
              <p class="activity-article-lead">{{ selectedActivityDetail.summary }}</p>
            </div>
            <button class="close-btn" @click="closeActivityDetail">&#20851;&#38381;</button>
          </header>

          <div class="activity-article-meta">
            <span>{{ selectedActivityDetail.date }}</span>
            <span>{{ selectedActivityDetail.publisherLabel }}?{{ selectedActivityDetail.publisher }}</span>
            <span>{{ selectedActivityDetail.codeLabel }}?{{ selectedActivityDetail.code }}</span>
          </div>

          <section class="activity-article-main">
            <div class="activity-article-body glass-inner">
              <span class="detail-block-label">&#25688;&#35201;</span>
              <p>{{ selectedActivityDetail.description }}</p>
              <p>{{ selectedActivityDetail.analysis }}</p>
            </div>

            <aside class="activity-article-side">
              <div class="glass-inner activity-side-block">
                <span class="detail-block-label">&#20316;&#32773; / &#30003;&#35831;&#20449;&#24687;</span>
                <ul class="detail-list">
                  <li v-for="item in selectedActivityDetail.people" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="glass-inner activity-side-block">
                <span class="detail-block-label">&#26680;&#24515;&#35201;&#28857;</span>
                <ul class="detail-list">
                  <li v-for="item in selectedActivityDetail.highlights" :key="item">{{ item }}</li>
                </ul>
              </div>
            </aside>
          </section>

          <footer class="activity-article-footer glass-inner">
            <span class="detail-block-label">&#20851;&#38190;&#35789;</span>
            <div class="tag-row">
              <span v-for="tag in selectedActivityDetail.tags" :key="tag">{{ tag }}</span>
            </div>
          </footer>
        </article>
      </div>

    
    <footer class="hud footer-bar glass-card">
      <div class="legend-row">
        <span v-for="filter in FILTERS" :key="filter" class="legend-pill">
          <i :style="{ backgroundColor: colorToCss(CATEGORY_STYLES[filter].color) }"></i>
          {{ CATEGORY_STYLES[filter].label }}
        </span>
      </div>
      <Transition name="hint-fade">
        <span v-if="selectedCity || selectedProvince" class="footer-tip back-hint" key="back">
          <span class="back-hint-path">
            <span :class="['bc-crumb', !selectedProvince ? 'active' : '']" @click="resetToNational">全国</span>
            <template v-if="selectedProvince">
              <span class="bc-arrow">›</span>
              <span :class="['bc-crumb', selectedProvince && !selectedCity ? 'active' : '']" @click="selectedCity ? selectProvinceByData(selectedProvince) : null">{{ selectedProvince.name }}</span>
            </template>
            <template v-if="selectedCity">
              <span class="bc-arrow">›</span>
              <span class="bc-crumb active">{{ selectedCity.name }}</span>
            </template>
          </span>
          <span class="back-hint-tip">ESC / 双击空白 返回上一级</span>
        </span>
        <span v-else class="footer-tip" key="default">真实边界：全国 / 江苏 / 扬州 / 湖北 / 武汉，粒子与高亮已接入 3D 场景</span>
      </Transition>
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
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import gsap from 'gsap'
import * as echarts from 'echarts'
import { fetchSectorData } from '../data/sector-api.js'
import { generateParticleDetail } from '../data/particle-type-data.js'
import { buildTrendOption, buildRankingOption } from '../charts/chart-options.js'
import {
  buildTalentRadarOption, buildTalentPubOption,
  buildEnterpriseOutputOption, buildEnterpriseTalentOption,
  buildPaperKeywordsOption, buildPaperRelatedOption,
  buildPatentTreemapOption, buildPatentTrendOption, buildPatentIpcOption,
} from '../charts/type-charts.js'
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

// ── Type-specific chart refs ─────────────────────────────────────
const talentRadarRef  = ref(null); const talentPubRef   = ref(null)
const entOutputRef    = ref(null); const entTalentRef   = ref(null)
const paperKeyRef     = ref(null); const paperRelRef    = ref(null)
const patentTreeRef   = ref(null); const patentTrendRef = ref(null); const patentIpcRef = ref(null)

let talentRadarChart = null; let talentPubChart   = null
let entOutputChart   = null; let entTalentChart   = null
let paperKeyChart    = null; let paperRelChart    = null
let patentTreeChart  = null; let patentTrendChart = null; let patentIpcChart = null

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
const cityQuickEntries = computed(() => {
  if (!selectedCity.value) return []
  return getDetailItems(selectedCity.value.code, activeCategory.value)
})
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
const currentSectorData = ref(null)
const sectorLoading = ref(false)
const particleTypeData = ref(null)
const selectedActivityDetail = ref(null)
const categoryColorCss = computed(() => selectedParticleData.value ? (CHART_CAT_COLORS[selectedParticleData.value.category] || '#58d5ff') : '#58d5ff')

const WUHAN_ACTIVITY_DETAIL_LIBRARY = {
  paper: [
    {
      title: '\u57fa\u4e8e\u77e5\u8bc6\u56fe\u8c31\u7684\u4ea7\u4e1a\u4f01\u4e1a\u98ce\u9669\u9884\u8b66\u6a21\u578b',
      summary: '\u8fd9\u662f\u4e00\u7bc7\u9762\u5411\u6b66\u6c49\u5149\u7535\u3001\u533b\u5de5\u4e0e\u667a\u80fd\u5236\u9020\u573a\u666f\u7684\u6f14\u793a\u8bba\u6587\u8be6\u60c5\uff0c\u7528\u4e8e\u5c55\u793a\u4ece\u8fd1\u671f\u52a8\u6001\u8df3\u8f6c\u8bba\u6587\u8be6\u60c5\u9875\u7684\u4ea4\u4e92\u3002',
      publisher: '\u534e\u4e2d\u79d1\u6280\u5927\u5b66\u5149\u7535\u56e2\u961f / \u6b66\u6c49\u4ea7\u4e1a\u667a\u80fd\u7814\u7a76\u9662',
      code: '10.1186/wuhan.ii.2025.0412',
      people: ['\u4f5c\u8005\uff1a\u6c88\u660e / \u5218\u742a / \u9648\u7ae0', '\u901a\u8baf\u4f5c\u8005\uff1a\u6c88\u660e', '\u53d1\u8868\u6e20\u9053\uff1aIntelligent Industry Systems'],
      highlights: ['\u5f15\u7528\u6b21\u6570\uff1a148', '\u5173\u952e\u5b9e\u9a8c\u573a\u666f\uff1a\u4f01\u4e1a\u98ce\u9669\u94fe\u8def\u9884\u8b66', '\u65b9\u6cd5\u7ed3\u6784\uff1a\u77e5\u8bc6\u62bd\u53d6 + \u5173\u7cfb\u63a8\u7406 + \u65f6\u5e8f\u8bc4\u4f30', '\u5bf9\u6b66\u6c49\u6837\u672c\u56ed\u533a\u7684\u9884\u8b66\u51c6\u786e\u7387\u63d0\u534712.6%'],
      tags: ['\u77e5\u8bc6\u56fe\u8c31', '\u4f01\u4e1a\u9884\u8b66', '\u4ea7\u4e1a\u98ce\u9669', '\u6b66\u6c49\u6837\u672c'],
      description: '\u8bba\u6587\u4ece\u6b66\u6c49\u4ea7\u4e1a\u60c5\u62a5\u573a\u666f\u4e2d\u62bd\u53d6\u4f01\u4e1a\u3001\u4eba\u624d\u3001\u8bba\u6587\u3001\u4e13\u5229\u7b49\u5b9e\u4f53\uff0c\u6784\u5efa\u4f01\u4e1a\u534f\u540c\u4e0e\u98ce\u9669\u4f20\u5bfc\u5173\u7cfb\u56fe\u3002\u5728\u6b64\u57fa\u7840\u4e0a\uff0c\u4f5c\u8005\u901a\u8fc7\u65f6\u95f4\u5e8f\u5217\u4e8b\u4ef6\u5bf9\u4f01\u4e1a\u5f02\u5e38\u6d3b\u8dc3\u3001\u4e13\u5229\u8f6c\u8ba9\u4e0e\u5408\u4f5c\u6240\u7f29\u7b49\u4fe1\u53f7\u8fdb\u884c\u7efc\u5408\u5224\u65ad\u3002',
      analysis: '\u4e3a\u4e86\u65b9\u4fbf\u5f53\u524d\u6f14\u793a\uff0c\u8fd9\u91cc\u5148\u7528\u5047\u6570\u636e\u5c55\u793a\u4e00\u4e2a\u8bba\u6587\u8be6\u60c5\u9605\u8bfb\u9875\u9762\u3002\u540e\u7eed\u53ef\u4ee5\u76f4\u63a5\u63a5\u5165\u771f\u5b9e DOI\u3001\u6458\u8981\u3001\u4f5c\u8005\u4e0e\u5f15\u7528\u4fe1\u606f\u3002',
    },
    {
      title: '\u57ce\u5e02\u7ea7\u4eba\u624d\u4e0e\u4ea7\u4e1a\u8026\u5408\u7f51\u7edc\u5efa\u6a21\u65b9\u6cd5',
      summary: '\u8be5\u6587\u7ae0\u805a\u7126\u4eba\u624d\u6d41\u52a8\u3001\u4ea7\u4e1a\u9700\u6c42\u4e0e\u6280\u672f\u8282\u70b9\u4e4b\u95f4\u7684\u7ed3\u6784\u6027\u5173\u7cfb\uff0c\u662f\u6b66\u6c49\u4eba\u624d\u7c92\u5b50\u6a21\u5757\u7684\u6f14\u793a\u8be6\u60c5\u5185\u5bb9\u3002',
      publisher: '\u6b66\u6c49\u5927\u5b66 / \u534e\u4e2d\u79d1\u6280\u5927\u5b66',
      code: '10.1016/wuhan.net.2024.1128',
      people: ['\u4f5c\u8005\uff1a\u5468\u5c9a / \u6c88\u660e / \u674e\u73ae', '\u901a\u8baf\u4f5c\u8005\uff1a\u5468\u5c9a', '\u53d1\u8868\u6e20\u9053\uff1aUrban Intelligence Review'],
      highlights: ['\u4f7f\u7528 3 \u7c7b\u4eba\u624d\u6d41\u5411\u6570\u636e\u3001 2 \u7c7b\u4ea7\u4e1a\u6807\u7b7e\u903b\u8f91', '\u7f51\u7edc\u6a21\u578b\u80fd\u8bc6\u522b\u51fa\u9ad8\u4ef7\u503c\u8de8\u673a\u6784\u534f\u4f5c\u8282\u70b9', '\u5bf9\u4eba\u624d\u4f9b\u9700\u9519\u914d\u7684\u8bc6\u522b\u6548\u7387\u63d0\u534718%', '\u9002\u5408\u540e\u7eed\u8fde\u63a5\u5c97\u4f4d\u3001\u9879\u76ee\u4e0e\u6210\u679c\u7ef4\u5ea6'],
      tags: ['\u4eba\u624d\u7f51\u7edc', '\u4ea7\u4e1a\u8026\u5408', '\u57ce\u5e02\u5efa\u6a21', '\u6b66\u6c49'],
      description: '\u8bba\u6587\u4ee5\u6b66\u6c49\u4e3a\u6837\u672c\uff0c\u4ece\u4eba\u624d\u9879\u76ee\u7ecf\u5386\u3001\u7ec4\u7ec7\u534f\u4f5c\u53ca\u6280\u672f\u6807\u7b7e\u51fa\u53d1\uff0c\u5bf9\u57ce\u5e02\u7ea7\u4ea7\u4e1a\u4e0e\u4eba\u624d\u95f4\u7684\u9ad8\u9891\u5173\u8054\u8fdb\u884c\u5efa\u6a21\u3002\u6587\u4e2d\u7ed9\u51fa\u4e86\u4ece\u4eba\u624d\u6ce8\u5165\u5230\u6210\u679c\u4ea7\u51fa\u7684\u94fe\u8def\u89c6\u56fe\uff0c\u4fbf\u4e8e\u7528\u6237\u89c2\u5bdf\u7ed3\u6784\u6027\u53d8\u5316\u3002',
      analysis: '\u5f53\u524d\u4e3a\u6f14\u793a\u5047\u6570\u636e\uff0c\u4f46\u7248\u5f0f\u5df2\u7ecf\u6309\u7167\u6b63\u5f0f\u8bba\u6587\u8be6\u60c5\u9875\u7684\u9605\u8bfb\u65b9\u5f0f\u5728\u505a\uff0c\u540e\u7eed\u53ea\u9700\u66ff\u6362\u6570\u636e\u5373\u53ef\u3002',
    },
  ],
  patent: [
    {
      title: '\u57fa\u4e8e\u89c6\u89c9\u611f\u77e5\u7684\u88c5\u5907\u72b6\u6001\u68c0\u6d4b\u7cfb\u7edf',
      summary: '\u8fd9\u662f\u4e00\u6761\u6b66\u6c49\u4ea7\u4e1a\u60c5\u62a5\u6f14\u793a\u7528\u4e13\u5229\u8be6\u60c5\u3002\u9996\u8981\u76ee\u6807\u662f\u5c55\u793a\u4ece\u8fd1\u671f\u52a8\u6001\u6253\u5f00\u4e13\u5229\u8be6\u60c5\u9875\u540e\u7684\u9605\u8bfb\u6548\u679c\u3002',
      publisher: '\u6b66\u6c49\u667a\u9020\u4e91\u8c37',
      code: 'CN202510318642A',
      people: ['\u7533\u8bf7\u4eba\uff1a\u6b66\u6c49\u667a\u9020\u4e91\u8c37', '\u53d1\u660e\u4eba\uff1a\u5218\u742a / \u9648\u7ae0', '\u6cd5\u5f8b\u72b6\u6001\uff1a\u5b9e\u8d28\u5ba1\u67e5\u9636\u6bb5'],
      highlights: ['IPC\uff1aG06T / B25J', '\u6743\u5229\u8981\u6c42\uff1a12 \u9879', '\u8986\u76d6\u573a\u666f\uff1a\u533b\u5de5\u88c5\u5907\u5f02\u5e38\u68c0\u6d4b', '\u652f\u6301\u591a\u6a21\u6001\u89c6\u9891\u8f93\u5165\u548c\u5f02\u5e38\u5206\u7ea7'],
      tags: ['\u53d1\u660e\u4e13\u5229', '\u89c6\u89c9\u68c0\u6d4b', '\u88c5\u5907\u5065\u5eb7', '\u6b66\u6c49\u667a\u9020'],
      description: '\u8be5\u4e13\u5229\u65b9\u6848\u9488\u5bf9\u9ad8\u7aef\u88c5\u5907\u5728\u590d\u6742\u8fd0\u884c\u73af\u5883\u4e0b\u7684\u72b6\u6001\u611f\u77e5\u95ee\u9898\uff0c\u4ee5\u591a\u6e90\u89c6\u89c9\u5e27\u3001\u8fd0\u884c\u65e5\u5fd7\u4e0e\u544a\u8b66\u4fe1\u53f7\u4f5c\u4e3a\u8f93\u5165\uff0c\u8f93\u51fa\u88c5\u5907\u5f02\u5e38\u7b49\u7ea7\u4e0e\u63a8\u8350\u5904\u7f6e\u8def\u5f84\u3002',
      analysis: '\u5f53\u524d\u662f\u5047\u6570\u636e\u6f14\u793a\uff0c\u4f46\u5df2\u6309\u7167\u4e13\u5229\u8be6\u60c5\u9605\u8bfb\u9875\u8fdb\u884c\u7ed3\u6784\u8bbe\u8ba1\uff0c\u540e\u7eed\u53ef\u65e0\u7f1d\u66ff\u6362\u4e3a\u771f\u5b9e\u516c\u5f00\u53f7\u3001\u6458\u8981\u548c\u6743\u5229\u8981\u6c42\u4fe1\u606f\u3002',
    },
    {
      title: '\u533b\u5de5\u8bbe\u5907\u8fd0\u7ef4\u8c03\u5ea6\u4e0e\u9884\u8b66\u65b9\u6cd5',
      summary: '\u8be5\u4e13\u5229\u8be6\u60c5\u9875\u805a\u7126\u4e8e\u6b66\u6c49\u533b\u5de5\u878d\u5408\u8bbe\u5907\u7684\u8fd0\u7ef4\u8c03\u5ea6\u4e0e\u6545\u969c\u9884\u8b66\u573a\u666f\u3002',
      publisher: '\u5149\u8c37\u533b\u5de5\u79d1\u6280',
      code: 'CN202410227951A',
      people: ['\u7533\u8bf7\u4eba\uff1a\u5149\u8c37\u533b\u5de5\u79d1\u6280', '\u53d1\u660e\u4eba\uff1a\u5468\u5c9a / \u5f20\u8574', '\u6cd5\u5f8b\u72b6\u6001\uff1a\u516c\u5f00\u5f85\u5ba1'],
      highlights: ['IPC\uff1aG06F / A61B', '\u6743\u5229\u8981\u6c42\uff1a9 \u9879', '\u76ee\u6807\u573a\u666f\uff1a\u533b\u7597\u88c5\u5907\u8fd0\u7ef4\u6392\u7a0b', '\u652f\u6301\u65f6\u95f4\u7a97\u53e3\u9884\u6d4b\u4e0e\u5de5\u5355\u5206\u53d1'],
      tags: ['\u8fd0\u7ef4\u8c03\u5ea6', '\u6545\u969c\u9884\u8b66', '\u533b\u5de5\u8bbe\u5907', '\u4ea7\u4e1a\u60c5\u62a5'],
      description: '\u4e13\u5229\u4ee5\u533b\u5de5\u8bbe\u5907\u7684\u8fd0\u884c\u72b6\u6001\u3001\u4fdd\u517b\u8bb0\u5f55\u548c\u7ef4\u4fee\u961f\u5217\u4e3a\u8f93\u5165\uff0c\u901a\u8fc7\u4e8b\u4ef6\u5206\u7ea7\u3001\u4f18\u5148\u7ea7\u8bc4\u5206\u548c\u8c03\u5ea6\u7b56\u7565\u751f\u6210\u673a\u5236\uff0c\u5b9e\u73b0\u9762\u5411\u591a\u8bbe\u5907\u573a\u666f\u7684\u8fd0\u7ef4\u81ea\u52a8\u5316\u3002',
      analysis: '\u8fd9\u91cc\u7684\u6570\u636e\u4e3a\u6f14\u793a\u7528\u5185\u5bb9\uff0c\u4f46\u5df2\u7ecf\u6ee1\u8db3\u8be6\u60c5\u5f39\u5c42\u7684\u7ed3\u6784\u9700\u6c42\uff0c\u5305\u62ec\u7533\u8bf7\u4eba\u3001\u516c\u5f00\u53f7\u3001IPC \u548c\u6838\u5fc3\u6280\u672f\u8981\u70b9\u3002',
    },
  ],
}

function isWuhanActivityContext() {
  return String(selectedCity.value?.code || '') === '420100'
}

function isActivityDetailAvailable(activity) {
  return isWuhanActivityContext() && (activity?.type === 'paper' || activity?.type === 'patent')
}

function buildActivityDetail(activity) {
  if (!selectedParticleData.value || !isActivityDetailAvailable(activity)) return null
  const list = WUHAN_ACTIVITY_DETAIL_LIBRARY[activity.type] || []
  if (!list.length) return null
  const indexSeed = `${selectedParticleData.value.id}-${activity.title}-${activity.date}`
  let seed = 0
  for (const ch of indexSeed) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const picked = list[seed % list.length]
  return {
    kindLabel: activity.type === 'paper' ? '\u8bba\u6587\u8be6\u60c5' : '\u4e13\u5229\u8be6\u60c5',
    title: picked.title,
    date: activity.date,
    publisherLabel: activity.type === 'paper' ? '\u4f5c\u8005\u673a\u6784' : '\u7533\u8bf7\u4e3b\u4f53',
    publisher: picked.publisher,
    codeLabel: activity.type === 'paper' ? 'DOI' : '\u516c\u5f00\u53f7',
    code: picked.code,
    summary: picked.summary,
    people: picked.people,
    highlights: picked.highlights,
    tags: [...picked.tags, selectedParticleData.value.name],
    description: picked.description,
    analysis: picked.analysis,
  }
}

function openActivityDetail(activity) {
  if (!isActivityDetailAvailable(activity)) return
  selectedActivityDetail.value = buildActivityDetail(activity)
}

function closeActivityDetail() {
  selectedActivityDetail.value = null
}

async function loadSectorData(sector) {
  sectorLoading.value = true
  currentSectorData.value = null
  particleTypeData.value = null
  try {
    currentSectorData.value = await fetchSectorData(sector)
    particleTypeData.value = generateParticleDetail(selectedParticleData.value)
  } finally {
    sectorLoading.value = false
  }
}

// ── SVG graph layout helpers ──────────────────────────────────────
function radialLayout(nodes, cx, cy, r) {
  const self = nodes.find(n => n.type === 'self' || n.type === 'core')
  const others = nodes.filter(n => n !== self)
  const positioned = self ? [{ ...self, x: cx, y: cy }] : []
  others.forEach((n, i) => {
    const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2
    positioned.push({ ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  })
  return positioned
}
function resolveLinks(links, posMap) {
  return links.map(l => ({
    ...l,
    x1: posMap.get(l.from)?.x ?? 0, y1: posMap.get(l.from)?.y ?? 0,
    x2: posMap.get(l.to)?.x ?? 0,   y2: posMap.get(l.to)?.y ?? 0,
    lx: ((posMap.get(l.from)?.x ?? 0) + (posMap.get(l.to)?.x ?? 0)) / 2,
    ly: ((posMap.get(l.from)?.y ?? 0) + (posMap.get(l.to)?.y ?? 0)) / 2,
  }))
}

const talentGraph = computed(() => {
  const d = particleTypeData.value
  if (!d?.graphNodes) return { nodes: [], links: [] }
  const nodes = radialLayout(d.graphNodes, 200, 140, 100)
  const posMap = new Map(nodes.map(n => [n.id, n]))
  return { nodes, links: resolveLinks(d.graphLinks, posMap) }
})
const enterpriseGraph = computed(() => {
  const d = particleTypeData.value
  if (!d?.partners) return { nodes: [], links: [] }
  const allNodes = [{ id: 'self', label: selectedParticleData.value?.name || '企业', type: 'self', patents: 0 }, ...d.partners]
  const nodes = radialLayout(allNodes, 200, 140, 100)
  const posMap = new Map(nodes.map(n => [n.id, n]))
  return { nodes, links: resolveLinks(d.partnerLinks || [], posMap) }
})
const patentGraph = computed(() => {
  const d = particleTypeData.value
  if (!d?.claimants) return { nodes: [], links: [] }
  const allNodes = [{ id: 'self', label: selectedParticleData.value?.name || '专利', type: 'self', patents: 0 }, ...d.claimants]
  const nodes = radialLayout(allNodes, 200, 140, 95)
  const posMap = new Map(nodes.map(n => [n.id, n]))
  return { nodes, links: resolveLinks(d.claimantLinks || [], posMap) }
})
const paperGraph = computed(() => {
  const d = particleTypeData.value
  if (!d?.citationNodes) return { nodes: [], links: [] }
  const nodes = radialLayout(d.citationNodes, 200, 140, 100)
  const posMap = new Map(nodes.map(n => [n.id, n]))
  return { nodes, links: resolveLinks(d.citationLinks || [], posMap) }
})

const kpiCountedValues = ref([])

watch(particleTypeData, (data) => {
  if (!data?.metrics) { kpiCountedValues.value = []; return }
  kpiCountedValues.value = data.metrics.map(() => '0')
  data.metrics.forEach((card, i) => {
    const raw = String(card.value)
    const num = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
    const prefix = raw.startsWith('+') ? '+' : ''
    const suffix = raw.includes('%') ? '%' : ''
    const isFloat = raw.includes('.')
    const obj = { v: 0 }
    gsap.to(obj, {
      v: num,
      duration: 1.1,
      delay: i * 0.13,
      ease: 'power2.out',
      onUpdate() {
        kpiCountedValues.value[i] = prefix + (isFloat ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix
      },
      onComplete() {
        kpiCountedValues.value[i] = card.value
      },
    })
  })
})

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
      // 每个散点错开 30ms 弹入
      animationDuration: 500,
      animationDelay: (idx) => idx * 30 + FILTERS.indexOf(cat) * 80,
      animationEasing: 'elasticOut',
    }
  })
  return {
    backgroundColor: 'transparent',
    animation: true,
    grid: { left: 20, right: 12, top: 32, bottom: 16 },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(4,13,28,0.94)',
      borderColor: 'rgba(0,180,255,0.2)',
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
      labelLine: { lineStyle: { color: 'rgba(0,180,255,0.25)' } },
      itemStyle: { borderRadius: 4, borderColor: 'rgba(2,8,20,0.6)', borderWidth: 2 },
      animationType: 'expansion',
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      animationDelay: (idx) => idx * 120,
    }],
  }
}

function ic(refEl, inst) {
  if (!refEl.value) return inst
  return inst || echarts.init(refEl.value, null, { renderer: 'canvas' })
}
function disposeAll(...pairs) {
  pairs.forEach(([inst, setter]) => { inst?.dispose(); setter(null) })
}

async function refreshIntelCharts() {
  await nextTick()
  const td = particleTypeData.value
  if (!td) return
  const cat = selectedParticleData.value?.category

  if (cat === 'Talent') {
    talentRadarChart = ic(talentRadarRef, talentRadarChart)
    talentPubChart   = ic(talentPubRef,   talentPubChart)
    talentRadarChart?.setOption(buildTalentRadarOption(td, echarts), true)
    talentPubChart?.setOption(buildTalentPubOption(td, echarts), true)
    talentRadarChart?.resize(); talentPubChart?.resize()
  } else if (cat === 'Enterprise') {
    entOutputChart = ic(entOutputRef, entOutputChart)
    entTalentChart = ic(entTalentRef, entTalentChart)
    entOutputChart?.setOption(buildEnterpriseOutputOption(td, echarts), true)
    entTalentChart?.setOption(buildEnterpriseTalentOption(td, echarts), true)
    entOutputChart?.resize(); entTalentChart?.resize()
  } else if (cat === 'Paper') {
    paperKeyChart = ic(paperKeyRef, paperKeyChart)
    paperRelChart = ic(paperRelRef, paperRelChart)
    paperKeyChart?.setOption(buildPaperKeywordsOption(td, echarts), true)
    paperRelChart?.setOption(buildPaperRelatedOption(td, echarts), true)
    paperKeyChart?.resize(); paperRelChart?.resize()
  } else if (cat === 'Patent') {
    patentTreeChart  = ic(patentTreeRef,  patentTreeChart)
    patentTrendChart = ic(patentTrendRef, patentTrendChart)
    patentIpcChart   = ic(patentIpcRef,   patentIpcChart)
    patentTreeChart?.setOption(buildPatentTreemapOption(td, echarts), true)
    patentTrendChart?.setOption(buildPatentTrendOption(td, echarts), true)
    patentIpcChart?.setOption(buildPatentIpcOption(td, echarts), true)
    patentTreeChart?.resize(); patentTrendChart?.resize(); patentIpcChart?.resize()
  }
}

function disposeIntelCharts() {
  talentRadarChart?.dispose();  talentRadarChart  = null
  talentPubChart?.dispose();    talentPubChart    = null
  entOutputChart?.dispose();    entOutputChart    = null
  entTalentChart?.dispose();    entTalentChart    = null
  paperKeyChart?.dispose();     paperKeyChart     = null
  paperRelChart?.dispose();     paperRelChart     = null
  patentTreeChart?.dispose();   patentTreeChart   = null
  patentTrendChart?.dispose();  patentTrendChart  = null
  patentIpcChart?.dispose();    patentIpcChart    = null
}

function scheduleChartRender(snapshot, delay = 720) {
  if (chartRenderTimer !== null) { clearTimeout(chartRenderTimer); chartRenderTimer = null }
  chartRenderTimer = setTimeout(async () => {
    chartRenderTimer = null
    // 确保期间没有切换到别的粒子
    if (selectedParticleData.value === snapshot) await refreshIntelCharts()
  }, delay)
}

watch(selectedParticleData, async (val) => {
  if (chartRenderTimer !== null) { clearTimeout(chartRenderTimer); chartRenderTimer = null }
  if (val) {
    disposeIntelCharts()
    // 数据加载不延迟，让 loading 状态尽早到位
    await loadSectorData(currentSector.value)
    // 转场动画总时长约 1.2s（0.28s 镜头 + 0.92s 地球）
    // 面板在 0.56s 出现，所以这里再等 ~720ms 确保转场完全结束后再渲染图表
    scheduleChartRender(val)
  } else {
    if (chartRenderTimer !== null) { clearTimeout(chartRenderTimer); chartRenderTimer = null }
    currentSectorData.value = null
    particleTypeData.value  = null
    sectorLoading.value     = false
    disposeIntelCharts()
  }
})

watch(currentSector, async (sector) => {
  if (selectedParticleData.value) {
    disposeIntelCharts()
    await loadSectorData(sector)
    scheduleChartRender(selectedParticleData.value, 100)  // 切 tab 时不需要等转场
  }
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

// 进入详情时直接赋值（globe 已在移出屏幕，不需要平滑动画）
function setGroupOpacityImmediate(group, meshTarget, lineTarget) {
  if (!group) return
  group.traverse((child) => {
    if (!child.material) return
    if (child.isMesh) child.material.opacity = meshTarget
    if ((child.isLine || child.isLineLoop || child.isLineSegments)) child.material.opacity = lineTarget
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
  if (active) {
    // 进入详情：globe 移出屏幕，opacity 直接赋值，省掉 100+ 个 GSAP tween
    tweenMaterialOpacity(globeMesh?.material, 0.09, dur)
    tweenMaterialOpacity(atmosphere?.material, 0.02, dur)
    tweenMaterialOpacity(globeWire?.material, 0.03, dur)
    tweenMaterialOpacity(heroHalo?.material, 0.004, dur)
    setGroupOpacityImmediate(provinceRoot, 0.05, 0.1)
    setGroupOpacityImmediate(cityRoot, 0.04, 0.08)
    setGroupOpacityImmediate(focusRoot, 0.06, 0.14)
    setGroupOpacityImmediate(selectionRoot, 0.03, 0.06)
  } else {
    // 退出详情：平滑淡回
    tweenMaterialOpacity(globeMesh?.material, 1, dur)
    tweenMaterialOpacity(atmosphere?.material, 0.12, dur)
    tweenMaterialOpacity(globeWire?.material, 0.2, dur)
    tweenMaterialOpacity(heroHalo?.material, 0.02, dur)
    tweenGroupOpacity(provinceRoot, 0.18, 0.88, dur)
    tweenGroupOpacity(cityRoot, 0.22, 0.82, dur)
    tweenGroupOpacity(focusRoot, 0.28, 0.92, dur)
    tweenGroupOpacity(selectionRoot, 0.2, 0.32, dur)
  }
}

function openDetailFromList(item) {
  const pos = item.index >= 0 ? getParticleWorldPosition(particleMeta[item.index], clock.getElapsedTime()) : null
  focusParticleDetail(item, pos)
}

function openQuickEntry(item) {
  if (!item) return
  focusParticleDetail({ ...item }, null)
}

function closeParticleDetail() {
  if (particleDetailTimer !== null) { clearTimeout(particleDetailTimer); particleDetailTimer = null }
  if (chartRenderTimer   !== null) { clearTimeout(chartRenderTimer);   chartRenderTimer   = null }
  selectedActivityDetail.value = null
  selectedParticleData.value = null
  selectedParticleIndex = -1
  setSceneDetailMode(false)
}

let particleDetailTimer = null   // 转场延迟句柄
let chartRenderTimer   = null   // 图表渲染延迟句柄（避免在转场动画中占用主线程）
let scene, camera, renderer, composer, controls, raycaster, clock, stars, heroHalo, atmosphere, globeMesh, globeWire
const fatLineMaterials = []
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
const cityHitPickables = []
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
// ── 共享底层：鼠标 → 球面交点 → 经纬度 ──────────────────────────────
function getGlobeLonLat(event) {
  const rect = containerRef.value.getBoundingClientRect()
  mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouseNdc, camera)
  const hitPoint = new THREE.Vector3()
  const inverse = new THREE.Matrix4().copy(mapRoot.matrixWorld).invert()
  const localRay = raycaster.ray.clone().applyMatrix4(inverse)
  return localRay.intersectSphere(globeSphere, hitPoint) ? xyzToLonLat(hitPoint) : null
}

function pickGeoFeature(event) {
  const lonLat = getGlobeLonLat(event)
  if (!lonLat) return null
  const provinceFeature = chinaGeo.features.find((feature) => pointInFeature(lonLat, feature))
  if (!provinceFeature) return null
  const props = provinceFeature.properties || {}
  return { type: 'province', code: String(props.adcode), name: props.name, center: props.centroid || props.center || getLocationMeta(props.adcode)?.center }
}

// 省份多边形包含检测（普通省用经纬度；焦点省用实际网格射线检测）
function isPointerInCurrentProvince(event) {
  if (!selectedProvince.value) return false
  const provinceCode = String(selectedProvince.value.code)
  if (isFocusProvince(provinceCode)) {
    focusRoot.updateMatrixWorld(true)
    const hits = pickCityTargets(event)
    return hits.some((h) => h.object?.userData?.type === 'city')
  }
  // 普通省用球面经纬度 + 省级多边形包含
  const lonLat = getGlobeLonLat(event)
  if (!lonLat) return false
  const feature = chinaGeo.features.find((f) => String(f.properties?.adcode) === provinceCode)
  return feature ? pointInFeature(lonLat, feature) : false
}

// 兼容旧调用（lonLat 已有的场景）
function lonLatInCurrentProvince(lonLat) {
  if (!selectedProvince.value || !lonLat) return false
  const feature = chinaGeo.features.find((f) => String(f.properties?.adcode) === String(selectedProvince.value.code))
  return feature ? pointInFeature(lonLat, feature) : false
}

// 城市拾取：焦点省用实际升高网格射线，普通省用球面 + 最近城市中心
function pickCityFeature(event) {
  if (!selectedProvince.value) return null
  const provinceCode = String(selectedProvince.value.code)

  if (isFocusProvince(provinceCode)) {
    // focusRoot 由 GSAP 动画抬高+缩放，matrixWorld 在两帧间可能是旧值
    // 射线检测前强制更新，确保用的是当前帧的实际位置
    focusRoot.updateMatrixWorld(true)
    const hits = pickCityTargets(event)
    const hitData = hits[0]?.object?.userData || {}
    if (hitData.type !== 'city' || !hitData.code) return null
    const meta = getLocationMeta(String(hitData.code)) || hitData.entry || {}
    return {
      type: 'city',
      code: String(hitData.code),
      name: hitData.name,
      center: hitData.center || meta.centroid || meta.center,
      entry: meta,
    }
  }

  // 普通省：球面交点 → 最近城市中心（城市标记贴近球面，偏差小）
  const lonLat = getGlobeLonLat(event)
  if (!lonLat) return null
  const cities = getProvinceChildren(provinceCode)
  if (!cities?.length) return null
  let best = null
  let bestDist = Infinity
  for (const city of cities) {
    const center = city.centroid || city.center
    if (!center) continue
    const dx = lonLat[0] - center[0]
    const dy = lonLat[1] - center[1]
    const d = dx * dx + dy * dy
    if (d < bestDist) { bestDist = d; best = city }
  }
  if (!best) return null
  return { type: 'city', code: String(best.adcode), name: best.name, center: best.centroid || best.center, entry: best }
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
  raycaster.params.Line.threshold = 0.09
  raycaster.params.Points.threshold = 0.12
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
      lineColor: 0x467da3,
      lineOpacity: 0.18,
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
  cityHitPickables.length = 0
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

    if (options.useFatLine) {
      const points = cleanRing.flatMap(([lng, lat]) => {
        const point = lonLatToXYZ(lng, lat, options.radius)
        return [point.x, point.y, point.z]
      })
      const geometry = new LineGeometry()
      geometry.setPositions(points)
      const material = new LineMaterial({
        color: options.lineColor || 0xffffff,
        transparent: true,
        opacity: options.lineOpacity ?? 1,
        linewidth: options.lineWidth || 3.2,
        depthWrite: false,
        dashed: false,
      })
      material.resolution.set(containerRef.value?.clientWidth || window.innerWidth || 1, containerRef.value?.clientHeight || window.innerHeight || 1)
      fatLineMaterials.push(material)
      const line = new Line2(geometry, material)
      line.computeLineDistances()
      line.frustumCulled = true
      line.renderOrder = options.renderOrder || 0
      line.userData = { ...sharedData, strokeRole: 'core' }
      group.add(line)
      return
    }

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
    glow.userData = { ...sharedData, strokeRole: 'glow' }
    line.userData = { ...sharedData, strokeRole: 'core' }
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
  const mat = new THREE.LineBasicMaterial({ color: 0x84ebff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false })
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
      opacity: 0.032,
      lineColor: 0xffffff,
      lineOpacity: 1,
      sideOpacity: 0.05,
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
        radius: globeRadius + 0.37,
        renderOrder: 10,
        lineColor: 0x89d8e8,
        lineOpacity: 0.96,
        useFatLine: true,
        lineWidth: 4.4,
      })
      if (hitGroup) {
        focusRoot.add(hitGroup)
        hitGroup.children.forEach((child) => cityHitPickables.push(child))
      }
      if (!lineGroup) return
      focusRoot.add(lineGroup)
      cityFeatureMap.set(lineGroup.userData.code, lineGroup)
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
    group.children.forEach((child) => {
      if (!child.material) return
      if (active) {
        child.material.opacity = 0
        return
      }
      const role = child.userData?.strokeRole
      if (role === 'glow') {
        child.material.color.setHex(0x7fe7f7)
        child.material.opacity = 0.42
      } else {
        child.material.color.setHex(0x89d8e8)
        child.material.opacity = 0.96
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
  const hitSphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), new THREE.MeshBasicMaterial({ color: 0x9fdfff, transparent: true, opacity: 0.95 }))
  hitSphere.position.copy(pos)
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 28), new THREE.MeshBasicMaterial({ color: 0x75e0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }))
  ring.position.copy(pos.clone().multiplyScalar((globeRadius + 0.31) / (globeRadius + 0.26)))
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
  const shared = { type: 'city', code: String(entry.adcode), name: entry.name, center, normal, entry }
  hitSphere.userData = shared
  ring.userData = shared
  cityRoot.add(hitSphere, ring)
  cityPickables.push(hitSphere, ring)
  cityHitPickables.push(hitSphere, ring)
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
  // 取消上一次还没执行完的转场
  if (particleDetailTimer !== null) {
    clearTimeout(particleDetailTimer)
    particleDetailTimer = null
  }

  selectedParticleIndex = typeof meta.index === 'number' ? meta.index : -1
  activeCategory.value = meta.category

  // ① 镜头短暂推近粒子（cinematic punch-in）
  if (pos) {
    const normal = pos.clone().normalize()
    const zoomTo = pos.clone().add(normal.multiplyScalar(2.0))
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)
    gsap.to(controls.target, { x: pos.x, y: pos.y, z: pos.z, duration: 0.28, ease: 'power2.in' })
    gsap.to(camera.position, {
      x: zoomTo.x, y: zoomTo.y, z: zoomTo.z,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => setSceneDetailMode(true),   // ② 推近完成后地球开始撤离
    })
  } else {
    setSceneDetailMode(true)
  }

  // ③ 地球动画进行约一半时，面板 + 数据开始出现
  particleDetailTimer = setTimeout(() => {
    selectedParticleData.value = meta
    particleDetailTimer = null
  }, 560)
}

function pickTargets(event, targets) {
  const rect = containerRef.value.getBoundingClientRect()
  mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouseNdc, camera)
  return raycaster.intersectObjects(targets, false)
}

function pick(event) {
  return pickTargets(event, [...cityPickables, ...particleMeshes])
}

function pickCityTargets(event) {
  return pickTargets(event, cityHitPickables)
}

function onPointerMove(event) {
  tooltip.visible = false

  // Detail panel mode: suppress all map hover
  if (selectedParticleData.value) return

  const hits = pick(event)
  const hit = hits[0]
  const hitData = hit?.object?.userData || {}

  // ── City level: particle hover → city-switch hover → province hover ──
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
      const cityHit = pickCityFeature(event)
      if (cityHit && cityHit.code !== String(selectedCity.value.code)) {
        tooltip.visible = true
        tooltip.x = event.clientX + 16
        tooltip.y = event.clientY + 16
        tooltip.title = cityHit.name
        tooltip.subtitle = '点击切换城市'
      } else {
        const geoHit = pickGeoFeature(event)
        if (geoHit && geoHit.code !== String(selectedProvince.value?.code)) {
          tooltip.visible = true
          tooltip.x = event.clientX + 16
          tooltip.y = event.clientY + 16
          tooltip.title = geoHit.name
          tooltip.subtitle = '点击切换省份'
        }
      }
    }
    return
  }

  hoveredParticleIndex = -1

  // ── Province level: city hover (geo) → other-province hover ──────────
  if (selectedProvince.value) {
    const cityHit = pickCityFeature(event)
    if (cityHit) {
      tooltip.visible = true
      tooltip.x = event.clientX + 16
      tooltip.y = event.clientY + 16
      tooltip.title = cityHit.name
      tooltip.subtitle = '点击钻取城市'
    } else {
      // 先验证是否仍在当前省内，防止因抬高轮廓的视差误判为邻省
      if (!isPointerInCurrentProvince(event)) {
        const geoHit = pickGeoFeature(event)
        if (geoHit && geoHit.code !== String(selectedProvince.value.code)) {
          tooltip.visible = true
          tooltip.x = event.clientX + 16
          tooltip.y = event.clientY + 16
          tooltip.title = geoHit.name
          tooltip.subtitle = '点击切换省份'
        }
      }
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

  // ── City level: geo city → particle → geo province ──────────────────
  if (selectedCity.value) {
    const cityHit = pickCityFeature(event)
    if (cityHit && cityHit.code !== String(selectedCity.value.code)) {
      selectCityByData(cityHit)
      return
    }
    const fallback = pickParticleFallback(event)
    if (fallback) {
      focusParticleDetail(fallback.meta, fallback.pos)
      return
    }
    if (!isPointerInCurrentProvince(event)) {
      const geoHit = pickGeoFeature(event)
      if (geoHit?.type === 'province' && geoHit.code !== String(selectedProvince.value?.code)) {
        selectProvinceByData(geoHit)
      }
    }
    return
  }

  // ── Province level: geo city → geo province（屏蔽当前省内误穿透）────
  if (selectedProvince.value) {
    const cityHit = pickCityFeature(event)
    if (cityHit) {
      selectCityByData(cityHit)
      return
    }
    // 若仍在当前省内（含焦点省网格），吸收点击，不切换省
    if (isPointerInCurrentProvince(event)) return
    const geoHit = pickGeoFeature(event)
    if (geoHit?.type === 'province') selectProvinceByData(geoHit)
    return
  }

  // ── National level: province geo click ───────────────────────────────
  const geoHit = pickGeoFeature(event)
  if (geoHit?.type === 'province') selectProvinceByData(geoHit)
}

function resetToNational() {
  selectedProvince.value = null
  selectedCity.value = null
  clearParticleEffects()
  resetProvinceLayer()
  resetProvinceTransforms()
  clearCityLayer()
  clearFocusPreview()
  setZoomWindow(5.2, 28)
  focusTo([104.113106, 37.570693], 8.2, 1.1)
}

function goBackOneLevel() {
  if (selectedParticleData.value) {
    closeParticleDetail()
    return
  }
  if (selectedCity.value) {
    // 退回省级：重新进入当前省（复用 selectProvinceByData 的完整重置逻辑）
    selectProvinceByData(selectedProvince.value)
    return
  }
  if (selectedProvince.value) {
    resetToNational()
  }
}

function onDblClick(event) {
  // 详情面板模式下不响应（有专属关闭按钮）
  if (selectedParticleData.value) return
  // 双击在粒子或城市标记上不退回
  const hits = pick(event)
  const hitType = hits[0]?.object?.userData?.type
  if (hitType === 'particle-cloud' || hitType === 'city') return
  goBackOneLevel()
}

function onKeyDown(event) {
  if (event.key === 'Escape') goBackOneLevel()
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
  fatLineMaterials.forEach((material) => material.resolution.set(width, height))
  ;[talentRadarChart, talentPubChart, entOutputChart, entTalentChart,
    paperKeyChart, paperRelChart, patentTreeChart, patentTrendChart, patentIpcChart]
    .forEach(c => c?.resize())
}

onMounted(() => {
  initScene()
  buildProvinceLayer()
  containerRef.value.appendChild(renderer.domElement)
  containerRef.value.addEventListener('pointermove', onPointerMove)
  containerRef.value.addEventListener('click', onClick)
  containerRef.value.addEventListener('dblclick', onDblClick)
  containerRef.value.addEventListener('pointerleave', () => { tooltip.visible = false })
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKeyDown)
  onResize()
  animate()
})


onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeyDown)
  if (containerRef.value) {
    containerRef.value.removeEventListener('pointermove', onPointerMove)
    containerRef.value.removeEventListener('click', onClick)
    containerRef.value.removeEventListener('dblclick', onDblClick)
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
.stat-row { margin-top: 8px; margin-bottom: 4px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; max-width: 540px; }
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
.province-panel { left: 18px; top: 292px; width: 228px; border-radius: 16px; padding: 10px 12px; pointer-events: none; transition: opacity 0.45s ease, transform 0.45s ease; }
.city-quick-panel { left: 18px; top: 292px; width: 268px; border-radius: 18px; padding: 12px; pointer-events: auto; transition: opacity 0.45s ease, transform 0.45s ease; }
.city-quick-grid { margin-top: 10px; display: grid; grid-template-columns: 1fr; gap: 8px; }
.city-quick-card { width: 100%; text-align: left; border: 1px solid rgba(128, 199, 255, 0.12); background: linear-gradient(180deg, rgba(19, 37, 77, 0.82), rgba(10, 22, 48, 0.88)); border-radius: 14px; padding: 12px; color: #dff2ff; cursor: pointer; transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
.city-quick-card:hover { transform: translateX(4px); border-color: color-mix(in srgb, var(--quick-color) 55%, rgba(128, 199, 255, 0.12)); box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18); }
.city-quick-type { display: inline-flex; align-items: center; margin-bottom: 8px; padding: 4px 9px; border-radius: 999px; font-size: 11px; color: #08111f; background: var(--quick-color); }
.city-quick-card strong { display: block; font-size: 15px; line-height: 1.35; color: #eef9ff; }
.city-quick-card p { margin: 6px 0 0; font-size: 12px; line-height: 1.45; color: #9fc5ec; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.city-quick-link { display: inline-block; margin-top: 10px; font-size: 11px; color: var(--quick-color); letter-spacing: 0.04em; }
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
.back-hint { display: flex; align-items: center; gap: 14px; }
.back-hint-path { display: flex; align-items: center; gap: 5px; }
.bc-crumb { color: #5a88b0; font-size: 12px; cursor: default; transition: color 0.2s; }
.bc-crumb.active { color: #b8d8f8; }
.bc-crumb:not(.active) { cursor: pointer; }
.bc-crumb:not(.active):hover { color: #00d4ff; }
.bc-arrow { color: #3a5a78; font-size: 11px; }
.back-hint-tip { font-size: 13px; color: #6289ac; letter-spacing: 0.04em; font-weight: 600; }
.hint-fade-enter-active, .hint-fade-leave-active { transition: opacity 0.4s ease; }
.hint-fade-enter-from, .hint-fade-leave-to { opacity: 0; }
.tooltip { position: fixed; z-index: 30; min-width: 180px; pointer-events: none; border-radius: 12px; padding: 10px 12px; background: rgba(4, 13, 28, 0.94); border: 1px solid rgba(129, 206, 255, 0.18); box-shadow: 0 16px 30px rgba(0, 0, 0, 0.28); }
.tooltip p { margin: 0; font-size: 13px; font-weight: 700; }
.tooltip span { display: block; margin-top: 4px; color: #9fc5ec; font-size: 12px; }
.close-btn { border: 1px solid rgba(123, 192, 255, 0.14); background: rgba(70, 104, 167, 0.22); color: #d4ebff; border-radius: 999px; padding: 6px 10px; cursor: pointer; }
@media (max-width: 1380px) {
  .detail-page { left: 18px; width: auto; }
  .hero-panel { width: auto; right: 18px; grid-template-columns: 1fr; }
  .province-panel { top: 300px; width: 210px; }
  .city-quick-panel { top: 300px; width: 230px; }
  .node-detail-panel { width: calc(100vw - 36px); bottom: 78px; }
}
.screen-root.detail-mode .top-brand { opacity: 0.62; transform: translateY(-3px); transition: opacity 0.7s ease, transform 0.7s ease; }
.screen-root.detail-mode .screen-canvas { cursor: default; }
.screen-root.detail-mode .hero-panel,
.screen-root.detail-mode .province-panel,
.screen-root.detail-mode .city-quick-panel { opacity: 0; transform: translateX(-32px); pointer-events: none; }
.screen-root.detail-mode .footer-bar { opacity: 0.4; transition: opacity 0.6s ease; }
.screen-root.detail-mode .intel-dash-panel { opacity: 1; transform: translateX(0) scale(1); pointer-events: auto; }

/* ── Type panel layout ──────────────────────────────────── */
.type-panels-area {
  flex: 1; min-height: 0; overflow: hidden; padding: 0 10px 10px;
}
.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 9px;
  height: 100%;
}
.tp {
  border-radius: 14px; padding: 10px 12px;
  display: flex; flex-direction: column; overflow: hidden; min-height: 0;
}
.tp-head {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 7px; font-size: 12px; font-weight: 600; color: #b8d8f8;
}
.tp-chart { flex: 1; min-height: 0; }
.tp-body  { flex: 1; min-height: 0; overflow: hidden; }
.flex-half { flex: 1; min-height: 60px; }
.split-v  { display: flex; flex-direction: column; gap: 8px; }

/* ── SVG network graph ──────────────────────────────────── */
.net-svg { width: 100%; height: 100%; }
.net-svg-sm { height: 50%; }
.net-line { stroke: rgba(0,180,255,0.25); stroke-width: 1; }
.net-node { fill: rgba(0,140,255,0.55); }
.net-node.self { fill: #00f5d4; filter: drop-shadow(0 0 6px #00f5d4); }
.net-node.collab { fill: #5c8dff; }
.net-node.institution { fill: #ffa14a; }
.net-node.cited  { fill: rgba(0,140,255,0.6); }
.net-node.citing { fill: rgba(255,100,120,0.6); }
.net-node.enterprise, .net-node.ent { fill: #ffa14a; }
.net-node.university, .net-node.uni { fill: #57e38d; }
.net-node.institute { fill: #b57bee; }
.net-label { font-size: 9px; fill: #8fbdf0; text-anchor: middle; pointer-events: none; }
.net-label.self { font-size: 10px; fill: #00f5d4; font-weight: 700; }
.net-link-label { font-size: 8px; fill: rgba(100,180,255,0.55); text-anchor: middle; pointer-events: none; }

/* ── Activity timeline ──────────────────────────────────── */
.activity-list { display: flex; flex-direction: column; gap: 7px; overflow-y: auto; height: 100%; padding-right: 2px; }
.activity-list::-webkit-scrollbar { width: 3px; }
.activity-list::-webkit-scrollbar-thumb { background: rgba(0,180,255,0.2); border-radius: 2px; }
.activity-item {
  display: flex; gap: 9px; align-items: flex-start;
  animation: actFadeIn 0.4s ease var(--delay, 0s) both;
}
.activity-item.clickable, .mini-act.clickable { cursor: pointer; }
.activity-item.clickable:hover .act-title, .mini-act.clickable:hover .mini-act-title { color: #eef9ff; }
.act-link { display: inline-block; margin-top: 6px; font-size: 10px; color: #7fe7f7; letter-spacing: 0.04em; }
.activity-detail-overlay { position: absolute; inset: 0; z-index: 32; padding: 24px; overflow: hidden; background: rgba(2, 8, 20, 0.76); backdrop-filter: blur(10px); }
.activity-article-card { width: min(1080px, 100%); height: 100%; max-height: calc(100vh - 120px); margin: 0 auto; padding: 20px; display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; gap: 14px; overflow: hidden; }
.activity-article-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(123, 192, 255, 0.14); }
.activity-article-copy { max-width: 760px; min-width: 0; }
.activity-article-copy h3 { margin: 8px 0 0; font-size: 30px; line-height: 1.2; color: #f4fbff; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.activity-article-lead { margin: 12px 0 0; font-size: 14px; line-height: 1.7; color: #c7e0f7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.activity-article-meta { display: flex; flex-wrap: wrap; gap: 8px 14px; color: #88b1d8; font-size: 12px; }
.activity-article-main { min-height: 0; display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.95fr); gap: 14px; }
.activity-article-body { min-height: 0; padding: 16px; overflow: hidden; }
.activity-article-body p { margin: 0; color: #cbe4fb; line-height: 1.85; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
.activity-article-body p + p { margin-top: 12px; }
.activity-article-side { min-height: 0; display: flex; flex-direction: column; gap: 12px; }
.activity-side-block { min-height: 0; padding: 14px; overflow: hidden; }
.activity-article-footer { padding: 14px 16px; overflow: hidden; }
.activity-article-footer .tag-row { margin-top: 0; display: flex; flex-wrap: wrap; gap: 8px; max-height: 74px; overflow: hidden; }
.detail-block-label { display: block; margin-bottom: 10px; font-size: 11px; color: #7fe7f7; letter-spacing: 0.08em; }
.detail-list { margin: 0; padding-left: 18px; color: #cbe4fb; line-height: 1.7; max-height: 182px; overflow: hidden; }
.detail-list li + li { margin-top: 6px; }
@media (max-width: 980px) { .activity-detail-overlay { padding: 16px; } .activity-article-card { max-height: calc(100vh - 88px); grid-template-rows: auto auto auto auto; } .activity-article-main { grid-template-columns: 1fr; } .activity-article-copy h3 { font-size: 24px; } .activity-article-body p { -webkit-line-clamp: 4; } .detail-list { max-height: none; } }
@keyframes actFadeIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
.act-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; background: #5c8dff; }
.act-dot.paper  { background: #57e38d; box-shadow: 0 0 6px #57e38d; }
.act-dot.patent { background: #ffa14a; box-shadow: 0 0 6px #ffa14a; }
.act-dot.award  { background: #f0d060; box-shadow: 0 0 6px #f0d060; }
.act-dot.project, .act-dot.cooperation { background: #00d4ff; box-shadow: 0 0 6px #00d4ff; }
.act-dot.grant  { background: #52e8a4; box-shadow: 0 0 6px #52e8a4; }
.act-dot.citation { background: #b57bee; box-shadow: 0 0 6px #b57bee; }
.act-body { flex: 1; min-width: 0; }
.act-meta { display: flex; align-items: center; gap: 5px; margin-bottom: 2px; flex-wrap: wrap; }
.act-title { margin: 0; font-size: 11px; color: #c8e4ff; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.act-tag { display: inline-flex; padding: 1px 6px; border-radius: 999px; font-size: 10px; font-weight: 600; }
.act-tag.paper   { background: rgba(87,227,141,0.15); color: #57e38d; }
.act-tag.patent  { background: rgba(255,161,74,0.15);  color: #ffa14a; }
.act-tag.award   { background: rgba(240,208,96,0.15);  color: #f0d060; }
.act-tag.project, .act-tag.cooperation { background: rgba(0,212,255,0.12); color: #00d4ff; }
.act-tag.grant   { background: rgba(82,232,164,0.15); color: #52e8a4; }
.act-tag.citation { background: rgba(181,123,238,0.15); color: #b57bee; }
.act-tag.product { background: rgba(92,141,255,0.15); color: #5c8dff; }

/* ── Mini activity list ─────────────────────────────────── */
.mini-activity-list { display: flex; flex-direction: column; gap: 5px; overflow: hidden; }
.mini-act { display: flex; align-items: center; gap: 6px; animation: actFadeIn 0.35s ease var(--delay,0s) both; }
.mini-act-title { font-size: 11px; color: #9cc4eb; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; flex: 1; }

/* ── Tech tag cloud ─────────────────────────────────────── */
.tag-cloud-wrap {
  display: flex; flex-wrap: wrap; gap: 7px 10px;
  align-content: flex-start; padding: 4px 2px; overflow: hidden;
}
.tech-tag {
  padding: 3px 9px; border-radius: 999px;
  background: rgba(0,80,200,0.25); border: 1px solid rgba(0,180,255,0.22);
  color: #a8d8ff; cursor: default; transition: all 0.2s ease;
  animation: tagPop 0.4s ease var(--delay,0s) both;
}
.tech-tag:hover { background: rgba(0,120,255,0.4); border-color: rgba(0,210,255,0.5); color: #e0f4ff; transform: scale(1.06); }
@keyframes tagPop { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }

/* ── Author list ────────────────────────────────────────── */
.author-list { display: flex; flex-direction: column; gap: 5px; }
.author-row { display: flex; align-items: center; gap: 7px; }
.author-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(0,180,255,0.5); flex-shrink: 0; }
.author-row.main .author-dot { background: #00f5d4; box-shadow: 0 0 6px #00f5d4; }
.author-name { font-size: 12px; color: #c8e4ff; font-weight: 600; flex-shrink: 0; }
.author-org  { font-size: 10px; color: #5a88b0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.author-badge { font-size: 9px; padding: 1px 5px; border-radius: 4px; background: rgba(0,245,212,0.15); color: #00f5d4; flex-shrink: 0; }
.related-paper-list { display: flex; flex-direction: column; gap: 5px; overflow: hidden; }
.related-paper { display: flex; align-items: center; gap: 7px; animation: actFadeIn 0.35s ease var(--delay,0s) both; }
.rp-year  { font-size: 10px; color: #5a88b0; flex-shrink: 0; width: 32px; }
.rp-title { font-size: 11px; color: #9cc4eb; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.rp-cite  { font-size: 10px; color: #5c8dff; flex-shrink: 0; }

/* ── Intel dash panel layout overrides ─────────────────── */
.intel-dash-panel { display: flex; flex-direction: column; }
.intel-dash-panel .dash-header { flex-shrink: 0; }
.intel-dash-panel .node-hero-row { flex-shrink: 0; margin: 8px 10px 0; }
.intel-dash-panel .kpi-row { flex-shrink: 0; margin: 8px 10px 0; }

/* ── Sector loading overlay ─────────────────────────────── */
.sector-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 6, 18, 0.72);
  backdrop-filter: blur(6px);
  border-radius: inherit;
}
.sector-loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.sector-loading-inner span {
  font-size: 12px;
  color: #5ec8ff;
  letter-spacing: 0.12em;
}
.sector-spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(0, 180, 255, 0.15);
  border-top-color: #00d4ff;
  animation: spinnerRot 0.8s linear infinite;
}
@keyframes spinnerRot { to { transform: rotate(360deg); } }
.sector-skel-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 200px;
}
.sector-skel {
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(0,100,200,0.18) 25%, rgba(0,180,255,0.28) 50%, rgba(0,100,200,0.18) 75%);
  background-size: 400% 100%;
  animation: skelShimmer 1.4s ease-in-out infinite;
}
@keyframes skelShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
.sector-fade-enter-active, .sector-fade-leave-active { transition: opacity 0.25s ease; }
.sector-fade-enter-from, .sector-fade-leave-to { opacity: 0; }
</style>










