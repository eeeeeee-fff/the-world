import {
  ctx, mapRoot, focusRoot, globeSphere, mouseNdc,
  provincePickables, cityPickables, cityHitPickables,
  particleState, isFocusProvince,
} from './globeState.js'
import { getGlobeLonLat } from './useMapNavigation.js'
import { xyzToLonLat, pointInFeature } from '../utils/geoMath.js'
import { chinaGeo, getLocationMeta, getProvinceChildren, CATEGORY_STYLES } from '../data/map-scene-data.js'
import { getParticleWorldPosition } from './useParticleCloud.js'

// ── Low-level raycasting ───────────────────────────────────────────────────

function pickTargets(event, containerRef, targets) {
  const rect = containerRef.value.getBoundingClientRect()
  mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  ctx.raycaster.setFromCamera(mouseNdc, ctx.camera)
  return ctx.raycaster.intersectObjects(targets, false)
}

function pickCityTargets(event, containerRef) {
  return pickTargets(event, containerRef, cityHitPickables)
}

function pick(event, containerRef) {
  return pickTargets(event, containerRef, [...cityPickables, ...particleState.meshes])
}

// ── Geo picking ────────────────────────────────────────────────────────────

export function pickGeoFeature(event, containerRef) {
  const lonLat = getGlobeLonLat(event, containerRef)
  if (!lonLat) return null
  const provinceFeature = chinaGeo.features.find((f) => pointInFeature(lonLat, f))
  if (!provinceFeature) return null
  const props = provinceFeature.properties || {}
  return { type: 'province', code: String(props.adcode), name: props.name, center: props.centroid || props.center || getLocationMeta(props.adcode)?.center }
}

function isPointerInCurrentProvince(event, containerRef, selectedProvince) {
  if (!selectedProvince.value) return false
  const provinceCode = String(selectedProvince.value.code)
  if (isFocusProvince(provinceCode)) {
    focusRoot.updateMatrixWorld(true)
    const hits = pickCityTargets(event, containerRef)
    return hits.some((h) => h.object?.userData?.type === 'city')
  }
  const lonLat = getGlobeLonLat(event, containerRef)
  if (!lonLat) return false
  const feature = chinaGeo.features.find((f) => String(f.properties?.adcode) === provinceCode)
  return feature ? pointInFeature(lonLat, feature) : false
}

export function pickCityFeature(event, containerRef, selectedProvince) {
  if (!selectedProvince.value) return null
  const provinceCode = String(selectedProvince.value.code)

  if (isFocusProvince(provinceCode)) {
    focusRoot.updateMatrixWorld(true)
    const hits = pickCityTargets(event, containerRef)
    const hitData = hits[0]?.object?.userData || {}
    if (hitData.type !== 'city' || !hitData.code) return null
    const meta = getLocationMeta(String(hitData.code)) || hitData.entry || {}
    return { type: 'city', code: String(hitData.code), name: hitData.name, center: hitData.center || meta.centroid || meta.center, entry: meta }
  }

  const lonLat = getGlobeLonLat(event, containerRef)
  if (!lonLat) return null
  const cities = getProvinceChildren(provinceCode)
  if (!cities?.length) return null
  let best = null, bestDist = Infinity
  for (const city of cities) {
    const center = city.centroid || city.center
    if (!center) continue
    const dx = lonLat[0] - center[0], dy = lonLat[1] - center[1]
    const d = dx * dx + dy * dy
    if (d < bestDist) { bestDist = d; best = city }
  }
  if (!best) return null
  return { type: 'city', code: String(best.adcode), name: best.name, center: best.centroid || best.center, entry: best }
}

export function pickParticleFallback(event, containerRef) {
  if (!particleState.meta.length || !containerRef.value) return null
  const rect = containerRef.value.getBoundingClientRect()
  let best = null, bestDist = 48
  const elapsed = ctx.clock.getElapsedTime()
  for (let i = 0; i < particleState.meta.length; i++) {
    const meta = particleState.meta[i]
    const pos = getParticleWorldPosition(meta, elapsed).clone().project(ctx.camera)
    if (pos.z < -1 || pos.z > 1) continue
    const x = ((pos.x + 1) * 0.5) * rect.width + rect.left
    const y = ((1 - pos.y) * 0.5) * rect.height + rect.top
    const dist = Math.hypot(event.clientX - x, event.clientY - y)
    if (dist < bestDist) { bestDist = dist; best = { meta, index: i, pos: getParticleWorldPosition(meta, elapsed) } }
  }
  return best
}

// ── High-level event handlers ──────────────────────────────────────────────

export function onPointerMove(event, containerRef, state, handlers) {
  const { selectedParticleData, selectedCity, selectedProvince, activeCategory, tooltip, introInteractive } = state
  const { CATEGORY_STYLES: catStyles } = handlers

  tooltip.visible = false
  if (!introInteractive.value) return
  if (selectedParticleData.value) return

  const hits = pick(event, containerRef)
  const hit = hits[0]
  const hitData = hit?.object?.userData || {}

  if (selectedCity.value) {
    if (hitData.type === 'particle-cloud' && typeof hit.instanceId === 'number') {
      particleState.hoveredIndex = hit.instanceId
      const meta = particleState.meta[hit.instanceId]
      if (!meta) { particleState.hoveredIndex = -1; return }
      Object.assign(tooltip, { visible: true, x: event.clientX + 16, y: event.clientY + 16, title: meta.title, subtitle: `${catStyles[meta.category].label} · ${meta.value}` })
    } else {
      particleState.hoveredIndex = -1
      const cityHit = pickCityFeature(event, containerRef, selectedProvince)
      if (cityHit && cityHit.code !== String(selectedCity.value.code)) {
        Object.assign(tooltip, { visible: true, x: event.clientX + 16, y: event.clientY + 16, title: cityHit.name, subtitle: '点击切换城市' })
      } else {
        const geoHit = pickGeoFeature(event, containerRef)
        if (geoHit && geoHit.code !== String(selectedProvince.value?.code)) {
          Object.assign(tooltip, { visible: true, x: event.clientX + 16, y: event.clientY + 16, title: geoHit.name, subtitle: '点击切换省份' })
        }
      }
    }
    return
  }

  particleState.hoveredIndex = -1

  if (selectedProvince.value) {
    const cityHit = pickCityFeature(event, containerRef, selectedProvince)
    if (cityHit) {
      Object.assign(tooltip, { visible: true, x: event.clientX + 16, y: event.clientY + 16, title: cityHit.name, subtitle: '点击钻取城市' })
    } else if (!isPointerInCurrentProvince(event, containerRef, selectedProvince)) {
      const geoHit = pickGeoFeature(event, containerRef)
      if (geoHit && geoHit.code !== String(selectedProvince.value.code)) {
        Object.assign(tooltip, { visible: true, x: event.clientX + 16, y: event.clientY + 16, title: geoHit.name, subtitle: '点击切换省份' })
      }
    }
    return
  }

  const geoHit = pickGeoFeature(event, containerRef)
  if (!geoHit) return
  Object.assign(tooltip, { visible: true, x: event.clientX + 16, y: event.clientY + 16, title: geoHit.name, subtitle: '点击聚焦省份' })
}

export function onClick(event, containerRef, state, navHandlers) {
  const { selectedParticleData, selectedCity, selectedProvince, introInteractive } = state
  const { focusParticleDetail, selectCityByData, selectProvinceByData } = navHandlers

  if (!introInteractive.value) return
  const hits = pick(event, containerRef)
  const hit = hits[0]
  const hitData = hit?.object?.userData || {}

  if (!selectedParticleData.value && hitData.type === 'particle-cloud' && typeof hit?.instanceId === 'number') {
    particleState.hoveredIndex = hit.instanceId
    const meta = particleState.meta[hit.instanceId]
    if (meta) focusParticleDetail(meta, getParticleWorldPosition(meta, ctx.clock.getElapsedTime()))
    return
  }

  if (selectedParticleData.value) return

  if (selectedCity.value) {
    const cityHit = pickCityFeature(event, containerRef, selectedProvince)
    if (cityHit && cityHit.code !== String(selectedCity.value.code)) { selectCityByData(cityHit); return }
    const fallback = pickParticleFallback(event, containerRef)
    if (fallback) { focusParticleDetail(fallback.meta, fallback.pos); return }
    if (!isPointerInCurrentProvince(event, containerRef, selectedProvince)) {
      const geoHit = pickGeoFeature(event, containerRef)
      if (geoHit?.type === 'province' && geoHit.code !== String(selectedProvince.value?.code)) selectProvinceByData(geoHit)
    }
    return
  }

  if (selectedProvince.value) {
    const cityHit = pickCityFeature(event, containerRef, selectedProvince)
    if (cityHit) { selectCityByData(cityHit); return }
    if (isPointerInCurrentProvince(event, containerRef, selectedProvince)) return
    const geoHit = pickGeoFeature(event, containerRef)
    if (geoHit?.type === 'province') selectProvinceByData(geoHit)
    return
  }

  const geoHit = pickGeoFeature(event, containerRef)
  if (geoHit?.type === 'province') selectProvinceByData(geoHit)
}

export function onDblClick(event, containerRef, state, goBackOneLevel) {
  const { selectedParticleData, introInteractive } = state
  if (!introInteractive.value) return
  if (selectedParticleData.value) return
  const hits = pick(event, containerRef)
  const hitType = hits[0]?.object?.userData?.type
  if (hitType === 'particle-cloud' || hitType === 'city') return
  goBackOneLevel()
}

export function onKeyDown(event, introInteractive, goBackOneLevel) {
  if (!introInteractive.value) return
  if (event.key === 'Escape') goBackOneLevel()
}
