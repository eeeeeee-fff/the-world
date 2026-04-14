import * as THREE from 'three'
import gsap from 'gsap'
import {
  ctx, mapRoot, provinceRoot, cityRoot, focusRoot, selectionRoot,
  fatLineMaterials, provinceFeatureMap, provincePickables,
  cityPickables, cityHitPickables, cityFeatureMap,
  focusLayerState, pulseProvinceCodes, pulseProvincePhaseMap, pulseProvinceWindowMap, pulseState,
  GLOBE_RADIUS, PROVINCE_PULSE_MIN_COUNT, PROVINCE_PULSE_MAX_COUNT,
  FOCUS_PROVINCE_GEOS, FOCUS_CITY_DISTRICT_GEOS, isFocusProvince, hasDistrictGeo,
} from './globeState.js'
import {
  buildGeoFeatureGroup, buildGeoFeatureHitGroup, buildGeoFeatureLineGroup,
  setFeatureStyle, disposeGroup,
} from '../utils/geoBuilders.js'
import { lonLatToXYZ, getNormalFromCenter, getBasis, geometryToPolygons, sanitizeRing } from '../utils/geoMath.js'
import { getLocationMeta, getProvinceChildren, chinaGeo } from '../data/map-scene-data.js'

// ── Province layer ─────────────────────────────────────────────────────────

const PROVINCE_DEFAULT_STYLE = {
  fillColor: 0x214f97, sideColor: 0x15386d, emissiveColor: 0x2968b6, sideEmissiveColor: 0x1c4b90,
  opacity: 0.18, emissiveIntensity: 0.24, lineColor: 0x9feaff, lineOpacity: 0.88,
  sideOpacity: 0.2, sideEmissiveIntensity: 0.18,
}

export function buildProvinceLayer() {
  provinceRoot.clear()
  provincePickables.length = 0
  provinceFeatureMap.clear()

  chinaGeo.features.forEach((feature) => {
    const group = buildGeoFeatureGroup(feature, {
      type: 'province',
      radius: GLOBE_RADIUS + 0.12,
      baseRadius: GLOBE_RADIUS + 0.03,
      altitudeScale: 0.004,
      renderOrder: 3,
      style: PROVINCE_DEFAULT_STYLE,
    }, GLOBE_RADIUS)
    if (!group) return
    provinceRoot.add(group)
    provinceFeatureMap.set(group.userData.code, group)
    group.children.forEach((child) => provincePickables.push(child))
  })

  initializeProvincePulses()
}

export function resetProvinceLayer() {
  provinceFeatureMap.forEach((group) => {
    setFeatureStyle(group, { ...PROVINCE_DEFAULT_STYLE, scale: 0.004 })
  })
}

export function resetProvinceTransforms() {
  provinceFeatureMap.forEach((group) => {
    gsap.killTweensOf(group.position)
    gsap.killTweensOf(group.scale)
    gsap.to(group.position, { x: 0, y: 0, z: 0, duration: 0.45, ease: 'power2.out' })
    gsap.to(group.scale, { x: 1.004, y: 1.004, z: 1.004, duration: 0.45, ease: 'power2.out' })
  })
}

export function dimProvinceLayerExcept(activeCode) {
  provinceFeatureMap.forEach((group, code) => {
    if (String(code) === String(activeCode)) return
    setFeatureStyle(group, {
      fillColor: 0x17345f, sideColor: 0x10284a, emissiveColor: 0x1e4e8f, sideEmissiveColor: 0x173b73,
      opacity: 0.08, emissiveIntensity: 0.12, lineColor: 0x467da3, lineOpacity: 0.18,
      sideOpacity: 0.08, sideEmissiveIntensity: 0.08, scale: 0.002,
    })
  })
}

export function liftProvinceGroup(group, center, amount = 0.9, scale = 1.12) {
  const normal = getNormalFromCenter(center)
  gsap.killTweensOf(group.position)
  gsap.killTweensOf(group.scale)
  gsap.to(group.position, { x: normal.x * amount, y: normal.y * amount, z: normal.z * amount, duration: 0.85, ease: 'power3.out' })
  gsap.to(group.scale, { x: scale, y: scale, z: scale, duration: 0.85, ease: 'power3.out' })
}

// ── Province pulse animation ───────────────────────────────────────────────

function initializeProvincePulses() {
  pulseProvinceCodes.clear()
  pulseProvincePhaseMap.clear()
  pulseProvinceWindowMap.clear()
  pulseState.nextSwapAt = 0
}

export function refreshProvincePulses(elapsed, selectedProvinceCode) {
  if (elapsed < pulseState.nextSwapAt && pulseProvinceCodes.size) return
  const excluded = String(selectedProvinceCode || '')
  const codes = [...provinceFeatureMap.keys()].filter((code) => String(code) !== excluded)

  pulseProvinceCodes.clear()
  pulseProvincePhaseMap.clear()
  pulseProvinceWindowMap.clear()

  if (!codes.length) {
    pulseState.nextSwapAt = elapsed + 2.8
    return
  }

  const shuffled = codes.slice().sort(() => Math.random() - 0.5)
  const minCount = Math.min(codes.length, PROVINCE_PULSE_MIN_COUNT)
  const maxCount = Math.min(codes.length, PROVINCE_PULSE_MAX_COUNT)
  const count = maxCount <= minCount ? minCount : minCount + Math.floor(Math.random() * (maxCount - minCount + 1))
  const duration = 2.8 + Math.random() * 0.9

  shuffled.slice(0, count).forEach((code) => {
    pulseProvinceCodes.add(code)
    pulseProvincePhaseMap.set(code, Math.random() * Math.PI * 2)
    pulseProvinceWindowMap.set(code, { start: elapsed, end: elapsed + duration })
  })
  pulseState.nextSwapAt = elapsed + duration + 0.45
}

export function animateProvincePulses(elapsed, selectedProvinceCode) {
  provinceFeatureMap.forEach((group, code) => {
    if (String(code) === String(selectedProvinceCode || '')) return
    const isActivePulse = pulseProvinceCodes.has(code)
    const phase = pulseProvincePhaseMap.get(code) || 0
    const window = pulseProvinceWindowMap.get(code)
    let envelope = 0
    if (isActivePulse && window) {
      const total = Math.max(0.001, window.end - window.start)
      const progress = Math.min(1, Math.max(0, (elapsed - window.start) / total))
      if (progress < 0.28) envelope = progress / 0.28
      else if (progress < 0.72) envelope = 1
      else envelope = 1 - ((progress - 0.72) / 0.28)
      envelope = Math.max(0, Math.min(1, envelope))
    }
    const wave = envelope > 0 ? (0.35 + ((Math.sin(elapsed * 2.4 + phase) + 1) * 0.5) * 0.65) * envelope : 0
    group.children.forEach((child, index) => {
      if (!child.isMesh) return
      const base = child.userData?.baseEmissiveIntensity ?? 0
      child.material.emissiveIntensity = base + wave * (index === 0 ? 0.46 : 0.62)
    })
  })
}

export function animateSelectedProvince(elapsed, selectedProvinceCode) {
  const group = provinceFeatureMap.get(String(selectedProvinceCode || ''))
  if (!group) return
  group.children.forEach((child, index) => {
    if (child.isMesh)
      child.material.emissiveIntensity = (index === 0 ? 1.18 : 1.5) + Math.sin(elapsed * 2.5) * 0.24
  })
}

// ── City layer ─────────────────────────────────────────────────────────────

export function resetCityRootTransform() {
  gsap.killTweensOf(cityRoot.position)
  gsap.killTweensOf(cityRoot.scale)
  gsap.to(cityRoot.position, { x: 0, y: 0, z: 0, duration: 0.4, ease: 'power2.out' })
  gsap.to(cityRoot.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' })
}

export function syncCityRootToProvince(group, amount = 1.45, scale = 1.02) {
  const normal = group.userData.normal
  gsap.killTweensOf(cityRoot.position)
  gsap.killTweensOf(cityRoot.scale)
  gsap.to(cityRoot.position, { x: normal.x * amount, y: normal.y * amount, z: normal.z * amount, duration: 0.85, ease: 'power3.out' })
  gsap.to(cityRoot.scale, { x: scale, y: scale, z: scale, duration: 0.85, ease: 'power3.out' })
}

export function clearCityLayer() {
  cityPickables.length = 0
  cityHitPickables.length = 0
  cityFeatureMap.clear()
  resetCityRootTransform()
  disposeGroup(cityRoot)
}

function buildMarkerCity(entry) {
  const center = entry.centroid || entry.center
  const normal = getNormalFromCenter(center)
  const pos = lonLatToXYZ(center[0], center[1], GLOBE_RADIUS + 0.26)

  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0x9fdfff, transparent: true, opacity: 0.95 }),
  )
  hitSphere.position.copy(pos)

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.28, 28),
    new THREE.MeshBasicMaterial({ color: 0x75e0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
  )
  ring.position.copy(pos.clone().multiplyScalar((GLOBE_RADIUS + 0.31) / (GLOBE_RADIUS + 0.26)))
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)

  const shared = { type: 'city', code: String(entry.adcode), name: entry.name, center, normal, entry }
  hitSphere.userData = shared
  ring.userData = shared

  cityRoot.add(hitSphere, ring)
  cityPickables.push(hitSphere, ring)
  cityHitPickables.push(hitSphere, ring)
}

// ── Focus province preview ─────────────────────────────────────────────────

export function clearFocusPreview() {
  disposeGroup(focusRoot)
  const { focusBridge, focusBridgePairs } = focusLayerState
  if (focusBridge) {
    selectionRoot.remove(focusBridge)
    focusBridge.geometry.dispose()
    focusBridge.material.dispose()
    focusLayerState.focusBridge = null
  }
  focusLayerState.focusBridgePairs = []
  if (focusLayerState.focusCityOverlay) {
    focusRoot.remove(focusLayerState.focusCityOverlay)
    disposeGroup(focusLayerState.focusCityOverlay)
    focusLayerState.focusCityOverlay = null
  }
}

export function setFocusCityHighlight(cityCode = null, provinceCode = null) {
  cityFeatureMap.forEach((group, code) => {
    const active = cityCode && String(code) === String(cityCode)
    group.children.forEach((child) => {
      if (!child.material) return
      if (active) { child.material.opacity = 0; return }
      const role = child.userData?.strokeRole
      if (role === 'glow') { child.material.color.setHex(0x7fe7f7); child.material.opacity = 0.42 }
      else { child.material.color.setHex(0x89d8e8); child.material.opacity = 0.96 }
    })
  })
  buildFocusCityOverlay(cityCode, provinceCode)
}

function buildFocusCityOverlay(cityCode, provinceCode) {
  if (focusLayerState.focusCityOverlay) {
    focusRoot.remove(focusLayerState.focusCityOverlay)
    disposeGroup(focusLayerState.focusCityOverlay)
    focusLayerState.focusCityOverlay = null
  }
  const resolvedProvinceCode = String(provinceCode || '')
  const provinceGeo = FOCUS_PROVINCE_GEOS[resolvedProvinceCode]
  if (!cityCode || !provinceGeo) return

  const feature = provinceGeo.features.find((f) => String(f.properties?.adcode) === String(cityCode))
  if (!feature) return

  focusLayerState.focusCityOverlay = new THREE.Group()
  const fillGroup = buildGeoFeatureGroup(feature, {
    type: 'focus-city-overlay', radius: GLOBE_RADIUS + 0.352, baseRadius: GLOBE_RADIUS + 0.335,
    altitudeScale: 0.002, renderOrder: 12,
    style: {
      fillColor: 0xe9fbff, sideColor: 0x71dfff, emissiveColor: 0xffffff, sideEmissiveColor: 0x9cebff,
      opacity: 0.16, emissiveIntensity: 0.92, lineColor: 0xffffff, lineOpacity: 1,
      sideOpacity: 0.04, sideEmissiveIntensity: 0.1,
    },
  }, GLOBE_RADIUS)

  const viewportSize = { width: ctx.renderer?.domElement.clientWidth || 1, height: ctx.renderer?.domElement.clientHeight || 1 }
  const lineResult = buildGeoFeatureLineGroup(feature, {
    type: 'focus-city-overlay-line', radius: GLOBE_RADIUS + 0.37, renderOrder: 14,
    lineColor: 0xffffff, lineOpacity: 1, glowColor: 0xcafcff, glowOpacity: 0.9, glowOffset: 0.045,
  }, viewportSize)

  if (fillGroup) focusLayerState.focusCityOverlay.add(fillGroup)
  if (lineResult?.group) focusLayerState.focusCityOverlay.add(lineResult.group)
  if (focusLayerState.focusCityOverlay.children.length) focusRoot.add(focusLayerState.focusCityOverlay)
}

export function buildFocusBridgeLines(feature, radius = GLOBE_RADIUS + 0.14, previewRadius = GLOBE_RADIUS + 0.35) {
  if (focusLayerState.focusBridge) {
    selectionRoot.remove(focusLayerState.focusBridge)
    focusLayerState.focusBridge.geometry.dispose()
    focusLayerState.focusBridge.material.dispose()
    focusLayerState.focusBridge = null
  }
  focusLayerState.focusBridgePairs = []

  const polygons = geometryToPolygons(feature.geometry)
  const outerRing = polygons[0]?.[0]
  if (!outerRing) return
  const ring = sanitizeRing(outerRing)

  const step = Math.max(1, Math.floor(ring.length / 22))
  const sampled = ring.filter((_, i) => i % step === 0).slice(0, 32)
  sampled.forEach(([lng, lat]) => {
    focusLayerState.focusBridgePairs.push({
      start: lonLatToXYZ(lng, lat, radius),
      end: lonLatToXYZ(lng, lat, previewRadius),
    })
  })

  const arr = new Float32Array(focusLayerState.focusBridgePairs.length * 6)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  const mat = new THREE.LineBasicMaterial({ color: 0x84ebff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false })
  focusLayerState.focusBridge = new THREE.LineSegments(geo, mat)
  focusLayerState.focusBridge.frustumCulled = false
  selectionRoot.add(focusLayerState.focusBridge)
}

export function updateFocusBridge() {
  const { focusBridge, focusBridgePairs } = focusLayerState
  if (!focusBridge || !focusBridgePairs.length) return
  const arr = focusBridge.geometry.attributes.position.array
  for (let i = 0; i < focusBridgePairs.length; i++) {
    const pair = focusBridgePairs[i]
    const endWorld = focusRoot.localToWorld(pair.end.clone())
    const a = i * 6
    arr[a] = pair.start.x; arr[a + 1] = pair.start.y; arr[a + 2] = pair.start.z
    arr[a + 3] = endWorld.x; arr[a + 4] = endWorld.y; arr[a + 5] = endWorld.z
  }
  focusBridge.geometry.attributes.position.needsUpdate = true
}

export function buildProvinceFocusPreview(provinceCode) {
  clearFocusPreview()
  const code = String(provinceCode)
  const provinceFeature = chinaGeo.features.find((f) => String(f.properties?.adcode) === code)
  const meta = getLocationMeta(code)
  if (!provinceFeature || !meta) return

  const normal = getNormalFromCenter(meta.centroid || meta.center)
  const preview = buildGeoFeatureGroup(provinceFeature, {
    type: 'province-focus', radius: GLOBE_RADIUS + 0.33, baseRadius: GLOBE_RADIUS + 0.21,
    altitudeScale: 0.01, renderOrder: 8,
    style: {
      fillColor: 0x9befff, sideColor: 0x3677c7, emissiveColor: 0xdffdff, opacity: 0.032,
      lineColor: 0xffffff, lineOpacity: 1, sideOpacity: 0.05, sideEmissiveIntensity: 0.14,
      hideLine: true, hideGlowLine: true,
    },
  }, GLOBE_RADIUS)
  if (preview) focusRoot.add(preview)

  const provinceGeo = FOCUS_PROVINCE_GEOS[code]
  if (provinceGeo) {
    const viewportSize = { width: ctx.renderer?.domElement.clientWidth || 1, height: ctx.renderer?.domElement.clientHeight || 1 }
    provinceGeo.features.forEach((feature) => {
      const hitGroup = buildGeoFeatureHitGroup(feature, { type: 'city', layer: 'focus-preview', radius: GLOBE_RADIUS + 0.345, baseRadius: GLOBE_RADIUS + 0.33, opacity: 0.003 })
      const lineResult = buildGeoFeatureLineGroup(feature, {
        type: 'city', layer: 'focus-preview', radius: GLOBE_RADIUS + 0.37, renderOrder: 10,
        lineColor: 0x89d8e8, lineOpacity: 0.96, useFatLine: true, lineWidth: 4.4,
      }, viewportSize)
      if (hitGroup) {
        focusRoot.add(hitGroup)
        hitGroup.children.forEach((child) => cityHitPickables.push(child))
      }
      if (!lineResult) return
      focusRoot.add(lineResult.group)
      fatLineMaterials.push(...lineResult.fatLineMaterials)
      cityFeatureMap.set(lineResult.group.userData.code, lineResult.group)
    })
    setFocusCityHighlight(null)
  }

  focusRoot.position.set(0, 0, 0)
  focusRoot.scale.setScalar(0.78)
  gsap.killTweensOf(focusRoot.position)
  gsap.killTweensOf(focusRoot.scale)
  gsap.to(focusRoot.position, { x: normal.x * 1.28, y: normal.y * 1.28, z: normal.z * 1.28, duration: 0.95, ease: 'power3.out' })
  gsap.to(focusRoot.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.95, ease: 'power3.out' })
}

export function buildCityLayer(provinceCode) {
  clearCityLayer()
  clearFocusPreview()
  const code = String(provinceCode)
  if (isFocusProvince(code)) {
    buildProvinceFocusPreview(code)
    return
  }
  getProvinceChildren(code).forEach((entry) => buildMarkerCity(entry))
}

// ── Selection / orbit decorations ─────────────────────────────────────────

export function buildOrbitDecorations(cityMeta) {
  const { orbitDecorations } = focusLayerState
  if (orbitDecorations) {
    selectionRoot.remove(orbitDecorations)
    disposeGroup(orbitDecorations)
  }
  const newDecorations = new THREE.Group()
  const normal = getNormalFromCenter(cityMeta.center)
  const center = lonLatToXYZ(cityMeta.center[0], cityMeta.center[1], GLOBE_RADIUS + 0.31)

  ;[[0.42, 0.48], [0.6, 0.66]].forEach(([inner, outer], index) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 64),
      new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x90f1ff : 0x5576ff,
        transparent: true,
        opacity: index === 0 ? 0.34 : 0.22,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    )
    ring.position.copy(center.clone().multiplyScalar((GLOBE_RADIUS + 0.33) / (GLOBE_RADIUS + 0.31)))
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    ring.userData.spin = index === 0 ? 0.18 : -0.11
    ring.userData.pulse = 1 + index * 0.8
    newDecorations.add(ring)
  })

  focusLayerState.orbitDecorations = newDecorations
  selectionRoot.add(newDecorations)
}

export function buildDistrictOutline(cityCode) {
  disposeGroup(selectionRoot)
  focusLayerState.orbitDecorations = null
  const cityMeta = getLocationMeta(cityCode)
  if (cityMeta && hasDistrictGeo(cityCode)) buildOrbitDecorations({ center: cityMeta.centroid || cityMeta.center })
}

export function animateOrbitDecorations(elapsed) {
  const { orbitDecorations } = focusLayerState
  if (!orbitDecorations) return
  orbitDecorations.children.forEach((child, index) => {
    child.rotation.z += child.userData.spin || 0
    const pulse = 1 + Math.sin(elapsed * (child.userData.pulse || 1.2) + index) * 0.08
    child.scale.setScalar(pulse)
    child.material.opacity = Math.max(0.08, Math.min(0.38,
      (index === 0 ? 0.3 : 0.2) + Math.sin(elapsed * (child.userData.pulse || 1.2) + index) * 0.06,
    ))
  })
}
