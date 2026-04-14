import { computed, ref, watch } from 'vue'
import gsap from 'gsap'
import { fetchSectorData } from '../data/sector-api.js'
import { generateParticleDetail } from '../data/particle-type-data.js'

const PARTICLE_SECTOR_MAP = { Talent: 'robot', Paper: 'bio', Enterprise: 'energy', Patent: 'ai' }
export const CHART_CAT_COLORS = { Talent: '#58d5ff', Enterprise: '#ffa14a', Paper: '#57e38d', Patent: '#42f5b0' }
export const kpiColors = ['#58d5ff', '#ffa14a', '#57e38d', '#b57bee']

// ── SVG graph layout helpers ───────────────────────────────────────────────

function radialLayout(nodes, cx, cy, r) {
  const self = nodes.find((n) => n.type === 'self' || n.type === 'core')
  const others = nodes.filter((n) => n !== self)
  const positioned = self ? [{ ...self, x: cx, y: cy }] : []
  others.forEach((n, i) => {
    const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2
    positioned.push({ ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  })
  return positioned
}

function resolveLinks(links, posMap) {
  return links.map((l) => ({
    ...l,
    x1: posMap.get(l.from)?.x ?? 0, y1: posMap.get(l.from)?.y ?? 0,
    x2: posMap.get(l.to)?.x ?? 0,   y2: posMap.get(l.to)?.y ?? 0,
    lx: ((posMap.get(l.from)?.x ?? 0) + (posMap.get(l.to)?.x ?? 0)) / 2,
    ly: ((posMap.get(l.from)?.y ?? 0) + (posMap.get(l.to)?.y ?? 0)) / 2,
  }))
}

// ── Composable ─────────────────────────────────────────────────────────────

export function useIntelData(selectedParticleData) {
  const particleTypeData = ref(null)
  const sectorLoading = ref(false)

  const currentSector = computed(() =>
    PARTICLE_SECTOR_MAP[selectedParticleData.value?.category] || 'robot',
  )

  const categoryColorCss = computed(() =>
    selectedParticleData.value ? (CHART_CAT_COLORS[selectedParticleData.value.category] || '#58d5ff') : '#58d5ff',
  )

  // ── SVG graph computeds ──────────────────────────────────────────────────

  const talentGraph = computed(() => {
    const d = particleTypeData.value
    if (!d?.graphNodes) return { nodes: [], links: [] }
    const nodes = radialLayout(d.graphNodes, 200, 140, 100)
    const posMap = new Map(nodes.map((n) => [n.id, n]))
    return { nodes, links: resolveLinks(d.graphLinks, posMap) }
  })

  const enterpriseGraph = computed(() => {
    const d = particleTypeData.value
    if (!d?.partners) return { nodes: [], links: [] }
    const allNodes = [{ id: 'self', label: selectedParticleData.value?.name || '企业', type: 'self', patents: 0 }, ...d.partners]
    const nodes = radialLayout(allNodes, 200, 140, 100)
    const posMap = new Map(nodes.map((n) => [n.id, n]))
    return { nodes, links: resolveLinks(d.partnerLinks || [], posMap) }
  })

  const patentGraph = computed(() => {
    const d = particleTypeData.value
    if (!d?.claimants) return { nodes: [], links: [] }
    const allNodes = [{ id: 'self', label: selectedParticleData.value?.name || '专利', type: 'self', patents: 0 }, ...d.claimants]
    const nodes = radialLayout(allNodes, 200, 140, 95)
    const posMap = new Map(nodes.map((n) => [n.id, n]))
    return { nodes, links: resolveLinks(d.claimantLinks || [], posMap) }
  })

  const paperGraph = computed(() => {
    const d = particleTypeData.value
    if (!d?.citationNodes) return { nodes: [], links: [] }
    const nodes = radialLayout(d.citationNodes, 200, 140, 100)
    const posMap = new Map(nodes.map((n) => [n.id, n]))
    return { nodes, links: resolveLinks(d.citationLinks || [], posMap) }
  })

  // ── KPI counter animation ────────────────────────────────────────────────

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
        v: num, duration: 1.1, delay: i * 0.13, ease: 'power2.out',
        onUpdate() { kpiCountedValues.value[i] = prefix + (isFloat ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix },
        onComplete() { kpiCountedValues.value[i] = card.value },
      })
    })
  })

  function kpiWidth(value) {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
    return `${Math.min(100, num)}%`
  }

  // ── Sector data loading ──────────────────────────────────────────────────

  async function loadSectorData(sector) {
    sectorLoading.value = true
    particleTypeData.value = null
    try {
      await fetchSectorData(sector)
      particleTypeData.value = generateParticleDetail(selectedParticleData.value)
    } finally {
      sectorLoading.value = false
    }
  }

  function resetIntelData() {
    particleTypeData.value = null
    sectorLoading.value = false
  }

  return {
    particleTypeData,
    sectorLoading,
    currentSector,
    categoryColorCss,
    talentGraph,
    enterpriseGraph,
    patentGraph,
    paperGraph,
    kpiCountedValues,
    kpiWidth,
    loadSectorData,
    resetIntelData,
  }
}
