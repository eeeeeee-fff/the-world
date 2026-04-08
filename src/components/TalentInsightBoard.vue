<template>
  <div class="talent-insight-grid">
    <section class="talent-graph-panel glass-card">
      <div class="talent-panel-title-row compact">
        <div>
          <p class="talent-mini-label">&#30456;&#20851;&#20154;&#25165;&#22270;&#35889;</p>
          <h3>&#20851;&#31995;&#22270;&#35889;</h3>
        </div>
        <div class="graph-toolbar">
          <span class="graph-hint">&#31227;&#21160; / &#32553;&#25918;</span>
          <button type="button" class="graph-tool-btn" @click="zoomIn(graphState)">+</button>
          <button type="button" class="graph-tool-btn" @click="zoomOut(graphState)">-</button>
        </div>
      </div>

      <div
        ref="graphViewportRef"
        class="talent-graph-canvas"
        :class="{ dragging: graphState.dragging }"
        @mousedown="startDrag(graphState, $event)"
        @wheel.prevent="handleWheel(graphState, $event)"
      >
        <div class="talent-graph-surface" :style="surfaceStyle(graphState)">
          <svg class="talent-graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              v-for="link in resolvedLinks"
              :key="`${link.from}-${link.to}`"
              :x1="link.x1"
              :y1="link.y1"
              :x2="link.x2"
              :y2="link.y2"
              :stroke-width="link.weight"
              :opacity="link.opacity"
            />
          </svg>
          <span
            v-for="node in graphNodes"
            :key="node.id"
            class="talent-graph-node"
            :class="[node.tone, node.importance]"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }"
            :title="node.tooltip"
            @mouseenter="activeGraphTip = node.tooltip"
            @mouseleave="activeGraphTip = defaultGraphTip"
          >
            {{ node.label }}
          </span>
          <span
            v-for="link in resolvedLinks"
            :key="`${link.from}-${link.to}-label`"
            class="talent-graph-label"
            :style="{ left: `${link.labelX}%`, top: `${link.labelY}%` }"
            :title="link.tooltip"
            @mouseenter="activeGraphTip = link.tooltip"
            @mouseleave="activeGraphTip = defaultGraphTip"
          >
            {{ link.label }}
          </span>
        </div>
      </div>
      <p class="graph-status">{{ activeGraphTip }}</p>
    </section>

    <section class="talent-collab-panel glass-card">
      <div class="talent-panel-title-row compact">
        <div>
          <p class="talent-mini-label">&#21512;&#20316;&#20154;&#25165;</p>
          <h3>&#21327;&#21516;&#32593;&#32476;</h3>
        </div>
        <div class="graph-toolbar">
          <span class="graph-hint">&#31227;&#21160; / &#32553;&#25918;</span>
          <button type="button" class="graph-tool-btn" @click="zoomIn(collabState)">+</button>
          <button type="button" class="graph-tool-btn" @click="zoomOut(collabState)">-</button>
        </div>
      </div>

      <div
        ref="collabViewportRef"
        class="talent-graph-canvas collab-canvas"
        :class="{ dragging: collabState.dragging }"
        @mousedown="startDrag(collabState, $event)"
        @wheel.prevent="handleWheel(collabState, $event)"
      >
        <div class="talent-graph-surface" :style="surfaceStyle(collabState)">
          <svg class="talent-graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              v-for="link in collabLinks"
              :key="`${link.from}-${link.to}`"
              :x1="link.x1"
              :y1="link.y1"
              :x2="link.x2"
              :y2="link.y2"
              :stroke-width="link.weight"
              :opacity="link.opacity"
            />
          </svg>
          <span
            v-for="node in collabNodes"
            :key="node.id"
            class="talent-graph-node collab-node"
            :class="[node.tone, node.importance]"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }"
            :title="node.tooltip"
            @mouseenter="activeCollabTip = node.tooltip"
            @mouseleave="activeCollabTip = defaultCollabTip"
          >
            {{ node.label }}
          </span>
        </div>
      </div>
      <p class="graph-status">{{ activeCollabTip }}</p>
    </section>

    <section class="talent-direction-panel glass-card">
      <div class="talent-panel-title-row compact">
        <div>
          <p class="talent-mini-label">&#30740;&#31350;&#26041;&#21521;</p>
          <h3>&#26041;&#21521;&#24378;&#24230;</h3>
        </div>
        <span class="metric-unit">&#24378;&#24230;&#25351;&#25968; / 100</span>
      </div>

      <div class="talent-direction-list">
        <article v-for="item in directionItems" :key="item.name" class="direction-row">
          <div class="direction-row-top">
            <strong :title="item.name">{{ item.name }}</strong>
            <div class="direction-side">
              <span class="direction-value">{{ item.value }}</span>
              <span>{{ item.delta }}</span>
            </div>
          </div>
          <div class="direction-track" :title="`${item.value}/100`">
            <span class="direction-fill" :style="{ width: `${item.width}%` }"></span>
          </div>
        </article>
      </div>
    </section>

    <section class="talent-trend-panel glass-card">
      <div class="talent-panel-title-row compact">
        <div>
          <p class="talent-mini-label">&#30740;&#31350;&#26041;&#21521;&#36235;&#21183;&#22270;</p>
          <h3>&#36235;&#21183;&#28909;&#24230;</h3>
        </div>
        <span class="metric-unit">&#26376;&#24230;&#28909;&#24230;&#25351;&#25968;</span>
      </div>

      <div class="trend-chart-shell">
        <svg class="trend-line-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline :points="trendLinePoints" class="trend-line-path animated" />
          <circle v-for="item in trendItems" :key="`${item.month}-point`" :cx="item.cx" :cy="item.cy" r="2.2" class="trend-line-point" />
        </svg>
        <div class="talent-trend-chart">
          <div v-for="item in trendItems" :key="item.month" class="trend-bar-wrap" @mouseenter="activeTrend = item" @mouseleave="activeTrend = null">
            <span class="trend-value">{{ item.value }}</span>
            <div class="trend-bar-track" :title="`${item.month} ${item.value}`">
              <span class="trend-bar-fill" :style="{ height: `${item.height}%` }"></span>
            </div>
            <span>{{ item.month }}</span>
          </div>
        </div>
        <transition name="fade-slide">
          <div v-if="activeTrend" class="trend-tooltip">
            <strong>{{ activeTrend.month }}</strong>
            <span>&#28909;&#24230;&#25351;&#25968; {{ activeTrend.value }}</span>
          </div>
        </transition>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  talent: { type: Object, required: true }
})

const graphViewportRef = ref(null)
const collabViewportRef = ref(null)
const defaultGraphTip = '????????????????'
const defaultCollabTip = '???????????????????'
const activeGraphTip = ref(defaultGraphTip)
const activeCollabTip = ref(defaultCollabTip)
const activeTrend = ref(null)

const createCanvasState = ({ scale = 1, minScale = 0.9, maxScale = 1.45 } = {}) => reactive({
  dragging: false,
  startPointerX: 0,
  startPointerY: 0,
  startOffsetX: 0,
  startOffsetY: 0,
  offsetX: 0,
  offsetY: 0,
  viewportWidth: 0,
  viewportHeight: 0,
  surfaceWidth: 0,
  surfaceHeight: 0,
  scale,
  minScale,
  maxScale
})

const graphState = createCanvasState({ scale: 1.18, minScale: 1, maxScale: 1.85 })
const collabState = createCanvasState()

const radialLayout = (items, options = {}) => {
  const centerX = options.centerX ?? 50
  const centerY = options.centerY ?? 50
  const radiusX = options.radiusX ?? 26
  const radiusY = options.radiusY ?? 22
  const startAngle = options.startAngle ?? -90

  if (!items.length) {
    return []
  }

  return items.map((item, index) => {
    const angle = (startAngle + (360 / items.length) * index) * (Math.PI / 180)
    return {
      ...item,
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY
    }
  })
}

const getBounds = (state) => {
  const width = state.surfaceWidth * state.scale
  const height = state.surfaceHeight * state.scale
  return {
    minX: Math.min(0, state.viewportWidth - width),
    minY: Math.min(0, state.viewportHeight - height)
  }
}

const clampOffset = (state, offsetX, offsetY) => {
  const bounds = getBounds(state)
  return {
    x: Math.min(0, Math.max(bounds.minX, offsetX)),
    y: Math.min(0, Math.max(bounds.minY, offsetY))
  }
}

const centerCanvas = (state) => {
  const nextOffset = clampOffset(
    state,
    (state.viewportWidth - state.surfaceWidth * state.scale) / 2,
    (state.viewportHeight - state.surfaceHeight * state.scale) / 2
  )

  state.offsetX = nextOffset.x
  state.offsetY = nextOffset.y
}

const syncCanvas = (state, viewportRef, widthRatio, heightRatio) => {
  const viewport = viewportRef.value
  if (!viewport) {
    return
  }

  state.viewportWidth = viewport.clientWidth
  state.viewportHeight = viewport.clientHeight
  state.surfaceWidth = Math.round(state.viewportWidth * widthRatio)
  state.surfaceHeight = Math.round(state.viewportHeight * heightRatio)
  centerCanvas(state)
}

const syncAllCanvases = () => {
  syncCanvas(graphState, graphViewportRef, 1.18, 1.14)
  syncCanvas(collabState, collabViewportRef, 1.1, 1.08)
}

const startDrag = (state, event) => {
  state.dragging = true
  state.startPointerX = event.clientX
  state.startPointerY = event.clientY
  state.startOffsetX = state.offsetX
  state.startOffsetY = state.offsetY
}

const stopDrag = () => {
  graphState.dragging = false
  collabState.dragging = false
}

const handlePointerMove = (state, event) => {
  if (!state.dragging) {
    return
  }

  const nextOffset = clampOffset(
    state,
    state.startOffsetX + event.clientX - state.startPointerX,
    state.startOffsetY + event.clientY - state.startPointerY
  )

  state.offsetX = nextOffset.x
  state.offsetY = nextOffset.y
}

const updateScale = (state, nextScale) => {
  state.scale = Math.min(state.maxScale, Math.max(state.minScale, nextScale))
  const nextOffset = clampOffset(state, state.offsetX, state.offsetY)
  state.offsetX = nextOffset.x
  state.offsetY = nextOffset.y
}

const handleWheel = (state, event) => {
  updateScale(state, state.scale - event.deltaY * 0.001)
}

const zoomIn = (state) => updateScale(state, state.scale + 0.1)
const zoomOut = (state) => updateScale(state, state.scale - 0.1)

const surfaceStyle = (state) => ({
  width: `${state.surfaceWidth}px`,
  height: `${state.surfaceHeight}px`,
  transform: `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`,
  transformOrigin: 'top left'
})

const graphNodes = computed(() => {
  const coreNode = props.talent.graphNodes.find((node) => node.id === 'core') || {
    id: 'core',
    label: props.talent.name,
    tone: 'core'
  }
  const linkedNodes = props.talent.graphNodes.filter((node) => node.id !== 'core')

  return [
    {
      ...coreNode,
      x: 50,
      y: 50,
      tone: 'core',
      importance: 'major',
      tooltip: `${props.talent.name} - ${props.talent.title}`
    },
    ...radialLayout(linkedNodes, { radiusX: 34, radiusY: 25, centerY: 51 }).map((node, index) => ({
      ...node,
      importance: index === 0 ? 'major' : 'minor',
      tooltip: `${node.label} - ${props.talent.org}`
    }))
  ]
})

const resolvedLinks = computed(() => {
  const map = new Map(graphNodes.value.map((node) => [node.id, node]))
  const weightMap = {
    '????': 3.2,
    '????': 2.4,
    '????': 2.8,
    '????': 2.6,
    '????': 2.2
  }

  return props.talent.graphLinks.map((link) => {
    const from = map.get(link.from)
    const to = map.get(link.to)

    return {
      ...link,
      x1: from?.x || 50,
      y1: from?.y || 50,
      x2: to?.x || 50,
      y2: to?.y || 50,
      labelX: ((from?.x || 50) + (to?.x || 50)) / 2,
      labelY: ((from?.y || 50) + (to?.y || 50)) / 2,
      weight: weightMap[link.label] || 2.2,
      opacity: link.label === '????' ? 0.75 : 0.92,
      tooltip: `${link.label} - ${from?.label || ''} / ${to?.label || ''}`
    }
  })
})

const collabNodes = computed(() => {
  const collaboratorNodes = props.talent.collaborators.map((person) => ({
    id: person.name,
    label: person.name,
    tone: person.strength.includes('??') ? 'warm' : person.strength.includes('??') ? 'cool' : 'warm',
    tooltip: `${person.name} - ${person.relation} - ${person.strength}`,
    importance: person.strength.includes('??') ? 'major' : 'minor'
  }))

  return [
    {
      id: 'core',
      label: props.talent.name,
      x: 50,
      y: 50,
      tone: 'core',
      importance: 'major',
      tooltip: `${props.talent.name} - ${props.talent.title}`
    },
    ...radialLayout(collaboratorNodes, { radiusX: 35, radiusY: 25, centerY: 51 }).map((node) => ({
      ...node
    }))
  ]
})

const collabLinks = computed(() => {
  return collabNodes.value
    .filter((node) => node.id !== 'core')
    .map((node) => ({
      from: 'core',
      to: node.id,
      x1: 50,
      y1: 50,
      x2: node.x,
      y2: node.y,
      weight: node.tooltip.includes('??') ? 3.6 : node.tooltip.includes('??') ? 3 : 2.4,
      opacity: node.tooltip.includes('??') ? 0.78 : 0.92
    }))
})

const directionItems = computed(() => {
  return props.talent.directions.map((item) => ({
    ...item,
    width: Math.max(8, Math.min(100, item.value))
  }))
})

const trendItems = computed(() => {
  const maxValue = Math.max(...props.talent.trend.values, 1)
  const total = props.talent.trend.months.length
  return props.talent.trend.months.map((month, index) => {
    const value = props.talent.trend.values[index]
    const height = Math.max(16, Math.round((value / maxValue) * 100))
    const cx = total === 1 ? 50 : 8 + (index * (84 / (total - 1)))
    const cy = 100 - height
    return { month, value, height, cx, cy }
  })
})

const trendLinePoints = computed(() => trendItems.value.map((item) => `${item.cx},${item.cy}`).join(' '))

const handleGlobalPointerMove = (event) => {
  handlePointerMove(graphState, event)
  handlePointerMove(collabState, event)
}

onMounted(() => {
  syncAllCanvases()
  window.addEventListener('resize', syncAllCanvases)
  window.addEventListener('mousemove', handleGlobalPointerMove)
  window.addEventListener('mouseup', stopDrag)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncAllCanvases)
  window.removeEventListener('mousemove', handleGlobalPointerMove)
  window.removeEventListener('mouseup', stopDrag)
})
</script>
