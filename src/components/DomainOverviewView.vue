<template>
  <section class="domain-layout" :class="rootClass">
    <aside class="domain-sidebar glass-card">
      <div class="domain-sidebar-head">
        <div>
          <p class="domain-mini-label">{{ config.listLabel }}</p>
          <h3>{{ config.listTitle }}</h3>
        </div>
      </div>

      <label class="domain-search">
        <input
          :value="searchValue"
          type="text"
          :placeholder="config.searchPlaceholder"
          @input="searchValue = $event.target.value"
        />
        <span>&#8989;</span>
      </label>

      <div class="domain-subscribe-list">
        <button
          v-for="item in filteredSubscriptions"
          :key="item.id"
          type="button"
          class="domain-subscribe-item"
          :class="{ active: item.id === selectedId }"
          @click="selectedId = item.id"
        >
          <div class="domain-subscribe-top">
            <strong>{{ item.name }}</strong>
            <span class="domain-heat-chip">{{ item.heat }}</span>
          </div>
          <p>{{ item.subtitle }}</p>
          <div class="domain-subscribe-foot">
            <span>{{ item.meta }}</span>
            <span>{{ item.outputCount }} &#26465;&#21160;&#24577;</span>
          </div>
        </button>
      </div>

      <button type="button" class="domain-add-button">+ &#26032;&#22686;&#35746;&#38405;</button>
    </aside>

    <div class="domain-main-stack compact-domain">
      <section class="domain-top-metrics glass-card" :class="{ 'domain-top-metrics--institution': isInstitution }">
        <template v-if="isInstitution">
          <div class="domain-institution-hero">
            <div class="domain-header-block domain-header-block--institution">
              <p class="domain-mini-label">{{ config.pageLabel }}</p>
              <div class="domain-title-row">
                <h2>{{ selectedItem.name }}</h2>
                <div class="domain-inline-heat">
                  <span>&#35746;&#38405;&#28909;&#24230;</span>
                  <strong>{{ institutionHeat }}</strong>
                </div>
              </div>
              <p v-if="selectedItem.summary" class="domain-summary-line">{{ selectedItem.summary }}</p>
              <div class="domain-tag-row compact">
                <span v-for="tag in selectedItem.tags" :key="tag" class="domain-tag">{{ tag }}</span>
              </div>
            </div>

            <div v-if="trendPanel" class="domain-top-trend-card domain-top-trend-card--embedded">
              <div class="domain-panel-head compact">
                <div>
                  <p class="domain-mini-label">{{ trendPanel.kicker }}</p>
                  <h3>{{ trendPanel.title }}</h3>
                </div>
              </div>
              <div class="domain-line-card domain-line-card--hero">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="domain-line-chart">
                  <defs>
                    <linearGradient id="domainLineGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#73d8ff" />
                      <stop offset="100%" stop-color="#4a63ff" />
                    </linearGradient>
                  </defs>
                  <polyline :points="linePoints(trendPanel.items)" class="domain-line-path" />
                  <circle
                    v-for="point in trendPanel.items"
                    :key="point.label"
                    class="domain-line-dot"
                    :cx="linePointX(trendPanel.items, point.label)"
                    :cy="linePointY(trendPanel.items, point.value)"
                    r="2.2"
                  />
                </svg>
                <div class="domain-line-labels domain-line-labels--hero">
                  <div v-for="point in trendPanel.items" :key="point.label" class="domain-line-label-item">
                    <strong>{{ animatedLineValues[point.label] || 0 }}</strong>
                    <span>{{ point.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="domain-header-block">
            <p class="domain-mini-label">{{ config.pageLabel }}</p>
            <h2>{{ selectedItem.name }}</h2>
            <p v-if="selectedItem.summary" class="domain-summary-line">{{ selectedItem.summary }}</p>
            <div class="domain-tag-row compact">
              <span v-for="tag in selectedItem.tags" :key="tag" class="domain-tag">{{ tag }}</span>
            </div>
          </div>

          <div class="domain-metrics-grid" :class="{ 'domain-metrics-grid--institution': isInstitution }">
            <article v-for="metric in metricCards" :key="metric.label" class="domain-metric-card compact">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.display }}</strong>
            </article>
          </div>

          <div class="domain-mini-trend" :class="{ 'domain-mini-trend--institution': isInstitution }">
            <div class="domain-sparkline-track">
              <span
                v-for="point in selectedItem.trend"
                :key="point"
                class="domain-sparkline-bar"
                :style="{ height: `${point}%` }"
              ></span>
            </div>
            <div class="domain-sparkline-meta">
              <span>{{ selectedItem.meta }}</span>
              <span>&#36235;&#21183;&#23792;&#20540; {{ peakValue }}</span>
            </div>
          </div>
        </template>
      </section>

      <div class="domain-content-grid visual-focus" :class="{ 'institution-grid': isInstitution }">
        <section class="domain-feed glass-card" :class="{ 'domain-feed--institution': isInstitution }">
          <div class="domain-panel-head domain-panel-head--feed">
            <div>
              <p class="domain-mini-label">&#26368;&#26032;&#21160;&#24577;</p>
              <h3>{{ selectedItem.name }} &#30340;&#21160;&#24577;&#27969;</h3>
            </div>
            <span class="domain-count-chip">{{ visibleFeed.length }} &#26465;&#21160;&#24577;</span>
          </div>

          <TransitionGroup name="feed-card" tag="div" class="domain-feed-list">
            <article v-for="feed in visibleFeed" :key="`${feed.date}-${feed.title}`" class="domain-feed-card domain-feed-card--institution">
              <div class="domain-feed-meta domain-feed-meta--institution">
                <div class="domain-feed-meta-left">
                  <span class="domain-type-chip" :class="typeClass(feed.type)">{{ feed.type }}</span>
                  <time>{{ feed.date }}</time>
                </div>
                <div class="domain-score-ring" :style="scoreRingStyle(feed)">
                  <strong>+{{ animatedFeedScores[feed.title] || 0 }}</strong>
                  <span>&#28909;&#24230;</span>
                </div>
              </div>
              <h4>{{ feed.title }}</h4>
              <p class="domain-feed-authors">{{ formatAuthors(feed.authors) }}</p>
              <p class="domain-feed-abstract">{{ feed.abstract }}</p>
              <div class="domain-tag-row compact domain-tag-row--feed">
                <span v-for="keyword in feed.keywords" :key="keyword" class="domain-tag subdued">{{ keyword }}</span>
              </div>
            </article>
          </TransitionGroup>
        </section>

        <div class="domain-insight-grid visual-grid" :class="{ 'institution-insight-grid': isInstitution }">
          <section
            v-for="panel in insightPanels"
            :key="panel.title"
            class="domain-panel glass-card"
            :class="panelClass(panel)"
          >
            <div class="domain-panel-head compact">
              <div>
                <p class="domain-mini-label">{{ panel.kicker }}</p>
                <h3>{{ panel.title }}</h3>
              </div>
            </div>

            <div v-if="panel.type === 'cloud'" class="domain-cloud-panel domain-cloud-panel--institution">
              <span
                v-for="item in panel.items"
                :key="item.label"
                class="domain-cloud-word"
                :class="[`tone-${item.tone || 'blue'}`]"
                :style="cloudWordStyle(item)"
              >
                {{ item.label }}
              </span>
            </div>

            <div v-else-if="panel.type === 'roster'" class="domain-roster-list compact-roster">
              <article v-for="item in panel.items" :key="item.name" class="domain-roster-card compact domain-roster-card--institution">
                <div class="domain-roster-avatar">{{ item.name.slice(0, 1) }}</div>
                <div class="domain-roster-copy">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
                <strong class="domain-roster-value">{{ animatedRosterValues[item.name] || 0 }}</strong>
              </article>
            </div>

            <div v-else-if="panel.type === 'bars'" class="domain-bars-list">
              <article v-for="item in panel.items" :key="item.label" class="domain-bar-row domain-bar-row--institution">
                <div class="domain-bar-top">
                  <strong>{{ item.label }}</strong>
                  <span>{{ animatedBarValues[item.label] || 0 }} {{ item.delta }}</span>
                </div>
                <div class="domain-bar-track">
                  <span class="domain-bar-fill" :style="{ width: `${animatedBarValues[item.label] || 0}%` }"></span>
                </div>
              </article>
            </div>

            <div v-else-if="panel.type === 'funnel'" class="domain-funnel-chart">
              <div
                v-for="item in panel.items"
                :key="item.label"
                class="domain-funnel-row"
                :style="{ width: `${item.value}%` }"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <div v-else-if="panel.type === 'line'" class="domain-line-card">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="domain-line-chart">
                <defs>
                  <linearGradient id="domainLineGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#73d8ff" />
                    <stop offset="100%" stop-color="#4a63ff" />
                  </linearGradient>
                </defs>
                <polyline :points="linePoints(panel.items)" class="domain-line-path" />
                <circle
                  v-for="point in panel.items"
                  :key="point.label"
                  class="domain-line-dot"
                  :cx="linePointX(panel.items, point.label)"
                  :cy="linePointY(panel.items, point.value)"
                  r="2.2"
                />
              </svg>
              <div class="domain-line-labels">
                <div v-for="point in panel.items" :key="point.label" class="domain-line-label-item">
                  <strong>{{ animatedLineValues[point.label] || 0 }}</strong>
                  <span>{{ point.label }}</span>
                </div>
              </div>
            </div>

            <div v-else class="domain-column-chart compact-columns domain-column-chart--institution">
              <div v-for="item in panel.items" :key="item.label" class="domain-column-wrap">
                <div class="domain-column-track">
                  <span class="domain-column-fill" :style="{ height: `${animatedColumnValues[item.label] || 0}%` }"></span>
                </div>
                <strong>{{ animatedColumnValues[item.label] || 0 }}</strong>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  config: { type: Object, required: true }
})

const searchValue = ref('')
const selectedId = ref(props.config.subscriptions[0]?.id || '')
const animatedMetricValues = ref([])
const animatedFeedScores = ref({})
const animatedRosterValues = ref({})
const animatedBarValues = ref({})
const animatedColumnValues = ref({})
const animatedLineValues = ref({})
const frameIds = new Set()

function requestTrackedFrame(callback) {
  let id = 0
  id = requestAnimationFrame((timestamp) => {
    frameIds.delete(id)
    callback(timestamp)
  })
  frameIds.add(id)
}

const isInstitution = computed(() => props.config.variant === 'institution')
const rootClass = computed(() => ({ 'domain-layout--institution': isInstitution.value }))

const filteredSubscriptions = computed(() => {
  const keyword = searchValue.value.trim().toLowerCase()
  if (!keyword) {
    return props.config.subscriptions
  }

  return props.config.subscriptions.filter((item) => [item.name, item.subtitle, item.meta, ...(item.tags || [])].join(' ').toLowerCase().includes(keyword))
})

const selectedItem = computed(() => {
  return filteredSubscriptions.value.find((item) => item.id === selectedId.value)
    || props.config.subscriptions.find((item) => item.id === selectedId.value)
    || props.config.subscriptions[0]
    || { tags: [], trend: [], feed: [], panels: {} }
})

const metricTargets = computed(() => {
  const item = selectedItem.value || {}
  const base = [item.heat || 0, item.outputCount || 0, item.nodeCount || 0]
  if (isInstitution.value) {
    base.push(item.peak || Math.max(...(item.trend || [0])))
  }
  return (props.config.metricLabels || []).map((label, index) => ({ label, value: base[index] || 0 }))
})

const metricCards = computed(() => metricTargets.value.map((metric, index) => ({
  ...metric,
  display: animatedMetricValues.value[index] ?? 0
})))

const trendPanel = computed(() => selectedItem.value?.panels?.extra || null)

const insightPanels = computed(() => {
  const panels = selectedItem.value?.panels || {}
  const basePanels = [panels.primary, panels.secondary, panels.tertiary, panels.quaternary]
  return isInstitution.value ? basePanels.filter(Boolean) : [...basePanels, panels.extra].filter(Boolean)
})

const visibleFeed = computed(() => {
  const feed = selectedItem.value?.feed || []
  return isInstitution.value ? feed.slice(0, 5) : feed
})

const peakValue = computed(() => selectedItem.value?.peak || Math.max(...(selectedItem.value?.trend || [0])))
const institutionHeat = computed(() => animatedMetricValues.value[0] ?? selectedItem.value?.heat ?? 0)

function cancelFrames() {
  frameIds.forEach((id) => cancelAnimationFrame(id))
  frameIds.clear()
}

function animateNumberMap(targetRef, sourceMap, duration = 720) {
  const from = { ...targetRef.value }
  const start = performance.now()

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const next = {}
    Object.entries(sourceMap).forEach(([key, value]) => {
      const initial = from[key] || 0
      next[key] = Math.round(initial + (value - initial) * eased)
    })
    targetRef.value = next

    if (progress < 1) {
      requestTrackedFrame(step)
    }
  }

  requestTrackedFrame(step)
}

function animateMetricList(targets, duration = 760) {
  const startValues = [...animatedMetricValues.value]
  const start = performance.now()

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedMetricValues.value = targets.map((value, index) => {
      const initial = startValues[index] || 0
      return Math.round(initial + (value - initial) * eased)
    })

    if (progress < 1) {
      requestTrackedFrame(step)
    }
  }

  requestTrackedFrame(step)
}

function syncAnimations(item) {
  if (!item) {
    return
  }

  cancelFrames()
  animateMetricList(metricTargets.value.map((metric) => metric.value))
  animateNumberMap(animatedFeedScores, Object.fromEntries((item.feed || []).map((feed) => [feed.title, Number(feed.score) || 0])))
  animateNumberMap(animatedRosterValues, Object.fromEntries(((item.panels?.secondary?.items) || []).map((entry) => [entry.name, entry.value || 0])))
  animateNumberMap(animatedBarValues, Object.fromEntries(((item.panels?.tertiary?.items) || []).map((entry) => [entry.label, entry.value || 0])))
  animateNumberMap(animatedColumnValues, Object.fromEntries(((item.panels?.quaternary?.items) || []).map((entry) => [entry.label, entry.value || 0])))
  animateNumberMap(animatedLineValues, Object.fromEntries(((item.panels?.extra?.items) || []).map((entry) => [entry.label, entry.value || 0])))
}

function scoreRingStyle(score) {
  const safe = Math.max(0, Math.min(Number(animatedFeedScores.value[score.title] || 0), 20))
  const degree = 90 + (safe / 20) * 270
  return {
    background: `conic-gradient(from 180deg, rgba(115,216,255,0.95) 0deg, rgba(74,99,255,0.95) ${degree}deg, rgba(233,239,253,0.82) ${degree}deg 360deg)`
  }
}

function cloudWordStyle(item) {
  const value = Number(item.value || 0)
  const size = 12 + (value / 100) * 20
  return {
    fontSize: `${size}px`,
    transform: `scale(${0.92 + value / 500})`
  }
}

function panelClass(panel) {
  return {
    'domain-panel--line': panel.type === 'line',
    'domain-panel--cloud': panel.type === 'cloud'
  }
}

function typeClass(type) {
  return {
    'type-patent': type.includes('\u4e13\u5229'),
    'type-utility': type.includes('\u5b9e\u7528'),
    'type-flash': type.includes('\u5feb\u8baf')
  }
}

function formatAuthors(authors = []) {
  return authors.join(' / ')
}

function linePointX(items, label) {
  const index = items.findIndex((item) => item.label === label)
  if (index < 0) {
    return 0
  }
  return items.length === 1 ? 50 : (index / (items.length - 1)) * 100
}

function linePointY(items, value) {
  const max = Math.max(...items.map((item) => item.value || 0), 1)
  return 92 - ((value || 0) / max) * 68
}

function linePoints(items) {
  return items.map((item) => `${linePointX(items, item.label)},${linePointY(items, animatedLineValues.value[item.label] || 0)}`).join(' ')
}

watch(filteredSubscriptions, (list) => {
  if (list.length && !list.some((item) => item.id === selectedId.value)) {
    selectedId.value = list[0].id
  }
}, { immediate: true })

watch(selectedItem, (item) => {
  syncAnimations(item)
}, { immediate: true })

onBeforeUnmount(() => {
  cancelFrames()
})
</script>
