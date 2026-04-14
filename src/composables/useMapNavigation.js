import * as THREE from 'three'
import gsap from 'gsap'
import {
  ctx, mapRoot, globeSphere, mouseNdc,
  provinceFeatureMap, isFocusProvince,
  particleState, GLOBE_RADIUS, DEFAULT_FOCUS_CENTER, DEFAULT_CAMERA_DISTANCE,
} from './globeState.js'
import { getNormalFromCenter, lonLatToXYZ, xyzToLonLat } from '../utils/geoMath.js'
import { setFeatureStyle } from '../utils/geoBuilders.js'
import {
  resetProvinceLayer, resetProvinceTransforms, dimProvinceLayerExcept, liftProvinceGroup,
  buildCityLayer, clearCityLayer, clearFocusPreview, buildDistrictOutline,
  setFocusCityHighlight, buildFocusBridgeLines,
} from './useGeoLayers.js'
import { clearParticleEffects, createParticleCloud, getPreviewCityAnchor } from './useParticleCloud.js'
import { getLocationMeta, chinaGeo } from '../data/map-scene-data.js'

// ── Globe → lon/lat ray intersection (shared utility) ─────────────────────

export function getGlobeLonLat(event, containerRef) {
  const rect = containerRef.value.getBoundingClientRect()
  mouseNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouseNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  ctx.raycaster.setFromCamera(mouseNdc, ctx.camera)
  const hitPoint = new THREE.Vector3()
  const inverse = new THREE.Matrix4().copy(mapRoot.matrixWorld).invert()
  const localRay = ctx.raycaster.ray.clone().applyMatrix4(inverse)
  return localRay.intersectSphere(globeSphere, hitPoint) ? xyzToLonLat(hitPoint) : null
}

// ── Camera movements ───────────────────────────────────────────────────────

export function focusTo(center, distance = 7.5, duration = 1.25) {
  const normal = getNormalFromCenter(center)
  const target = normal.clone().multiplyScalar(GLOBE_RADIUS)
  const position = normal.clone().multiplyScalar(GLOBE_RADIUS + distance)
  gsap.to(ctx.controls.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power2.inOut' })
  gsap.to(ctx.camera.position, { x: position.x, y: position.y, z: position.z, duration, ease: 'power2.inOut' })
}

export function focusToPoint(point, normal, distance = 3.6, duration = 1.05) {
  const target = point.clone()
  const position = point.clone().add(normal.clone().multiplyScalar(distance))
  gsap.to(ctx.controls.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power2.inOut' })
  gsap.to(ctx.camera.position, { x: position.x, y: position.y, z: position.z, duration, ease: 'power2.inOut' })
}

export function setZoomWindow(minDistance, maxDistance = 28) {
  if (!ctx.controls) return
  ctx.controls.minDistance = minDistance
  ctx.controls.maxDistance = maxDistance
}

// ── Province navigation ────────────────────────────────────────────────────

export function selectProvinceByData(data, state) {
  const { selectedProvince, selectedCity, activeCategory, particleCount } = state
  selectedProvince.value = { code: data.code, name: data.name, center: data.center }
  selectedCity.value = null

  resetProvinceLayer()
  resetProvinceTransforms()
  clearFocusPreview()

  const provinceGroup = provinceFeatureMap.get(String(data.code))
  const isFocus = isFocusProvince(data.code)
  if (provinceGroup) {
    setFeatureStyle(provinceGroup, {
      fillColor: 0x7fc8ff, sideColor: 0x204e98, emissiveColor: 0xbfefff, sideEmissiveColor: 0x6fd8ff,
      opacity: 0.34, emissiveIntensity: 0.72, lineColor: 0xe8fbff, lineOpacity: 1,
      sideOpacity: 0.14, sideEmissiveIntensity: 0.24, scale: isFocus ? 0.008 : 0.05,
    })
    if (!isFocus) liftProvinceGroup(provinceGroup, data.center, 0.95, 1.1)
  }

  dimProvinceLayerExcept(data.code)
  buildCityLayer(data.code)
  buildDistrictOutline(null)
  setZoomWindow(isFocus ? 2.4 : 4.2, 24)
  clearParticleEffects(particleCount)

  if (isFocus) {
    const provinceFeature = chinaGeo.features.find((f) => String(f.properties?.adcode) === String(data.code))
    if (provinceFeature) buildFocusBridgeLines(provinceFeature, GLOBE_RADIUS + 0.13, GLOBE_RADIUS + 0.35)
  }
  focusTo(data.center, isFocus ? 3.8 : 6.2, isFocus ? 1.05 : 1.1)
}

export function selectCityByData(data, state) {
  const { selectedProvince, selectedCity, activeCategory, particleCount } = state
  const meta = getLocationMeta(data.code) || data.entry || null
  if (!meta) return
  selectedCity.value = {
    code: String(data.code), name: data.name,
    center: meta.centroid || meta.center,
    provinceName: selectedProvince.value?.name || '',
  }

  if (isFocusProvince(selectedProvince.value?.code)) setFocusCityHighlight(data.code, selectedProvince.value?.code)
  buildDistrictOutline(data.code)
  createParticleCloud(data.code, selectedProvince.value?.code, activeCategory, particleCount)
  setZoomWindow(1.2, 16)

  const previewAnchor = getPreviewCityAnchor(data.code, selectedProvince.value?.code)
  if (previewAnchor) {
    focusToPoint(previewAnchor.center, previewAnchor.normal, 2.2, 0.95)
  } else {
    focusTo(meta.centroid || meta.center, 3.6)
  }
}

export function selectCityFromMenu(item, state) {
  selectCityByData({
    type: 'city',
    code: String(item.adcode),
    name: item.name,
    center: item.centroid || item.center || getLocationMeta(item.adcode)?.center,
    entry: item,
  }, state)
}

export function resetToNational(state) {
  const { selectedProvince, selectedCity, particleCount } = state
  selectedProvince.value = null
  selectedCity.value = null
  clearParticleEffects(particleCount)
  resetProvinceLayer()
  resetProvinceTransforms()
  clearCityLayer()
  clearFocusPreview()
  setZoomWindow(5.2, 28)
  focusTo(DEFAULT_FOCUS_CENTER, DEFAULT_CAMERA_DISTANCE, 1.1)
}
