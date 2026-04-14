import * as THREE from 'three'
import gsap from 'gsap'
import {
  ctx, particleRoot, focusRoot,
  particleState, dummy, GLOBE_RADIUS, isFocusProvince,
} from './globeState.js'
import { lonLatToXYZ, getNormalFromCenter, getBasis } from '../utils/geoMath.js'
import { CATEGORY_STYLES, FILTERS, getLocationMeta, getParticleSource } from '../data/map-scene-data.js'

function getCategoryVisual(category) {
  if (category === 'Talent')     return { radius: [0.08, 0.14], scale: 1.18 }
  if (category === 'Paper')      return { radius: [0.16, 0.24], scale: 1.04 }
  if (category === 'Enterprise') return { radius: [0.22, 0.32], scale: 1.1 }
  return { radius: [0.24, 0.36], scale: 1 }
}

function buildRelationMeta(items) {
  const talents = [], papers = [], enterprises = []
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
  for (let i = 1; i < talents.length; i++) connect(talents[0], talents[i], 0.58)
  return links
}

export function getParticleWorldPosition(meta, elapsed) {
  const phase = elapsed * meta.speed * 0.3 + meta.angle
  const scale = meta.anchorScale || 1
  if (meta.shellDirection && meta.orbitAxis) {
    const direction = meta.shellDirection.clone().applyAxisAngle(meta.orbitAxis, phase)
    const shellRadius = (meta.shellRadiusBase + meta.shellRadiusSwing * particleState.anim.progress) * scale
    return meta.center.clone().add(direction.multiplyScalar(shellRadius))
  }
  const radial = (meta.orbitRadius + meta.radialOffset * particleState.anim.progress) * scale
  const lift = (meta.liftBase + Math.sin(phase * 1.4 + meta.band) * meta.liftSwing) * scale
  return meta.center.clone()
    .add(meta.tangent.clone().multiplyScalar(Math.cos(phase) * radial))
    .add(meta.bitangent.clone().multiplyScalar(Math.sin(phase) * radial))
    .add(meta.normal.clone().multiplyScalar(lift + meta.orbitTilt * 0.08 * scale))
}

export function getPreviewCityAnchor(cityCode, selectedProvinceCode) {
  if (!isFocusProvince(selectedProvinceCode)) return null
  const cityMeta = getLocationMeta(cityCode)
  if (!cityMeta) return null

  const previewCenterLocal = lonLatToXYZ(cityMeta.center[0], cityMeta.center[1], GLOBE_RADIUS + 0.35)
  const previewCenterWorld = focusRoot.localToWorld(previewCenterLocal.clone())
  const previewOriginWorld = focusRoot.localToWorld(new THREE.Vector3())
  const normal = previewCenterWorld.clone().sub(previewOriginWorld).normalize()
  const { tangent, bitangent } = getBasis(normal)
  const scale = focusRoot.scale.x || 1
  const liftedCenter = previewCenterWorld.clone().add(normal.clone().multiplyScalar(0.34 * scale))
  return { center: liftedCenter, normal, tangent, bitangent, scale }
}

export function clearParticleEffects(particleCount) {
  particleState.meshes.forEach((mesh) => {
    particleRoot.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
  })
  particleState.meshes = []

  if (particleState.relationLines) {
    particleRoot.remove(particleState.relationLines)
    particleState.relationLines.geometry.dispose()
    particleState.relationLines.material.dispose()
    particleState.relationLines = null
  }

  particleState.meta = []
  particleState.relationMeta = []
  particleState.hoveredIndex = -1
  particleState.selectedIndex = -1
  if (particleCount) particleCount.value = 0
}

export function createParticleCloud(cityCode, selectedProvinceCode, activeCategory, particleCount) {
  clearParticleEffects(particleCount)
  const cityMeta = getLocationMeta(cityCode)
  if (!cityMeta) return

  const previewAnchor = getPreviewCityAnchor(cityCode, selectedProvinceCode)
  const center = previewAnchor?.center || lonLatToXYZ(cityMeta.center[0], cityMeta.center[1], GLOBE_RADIUS + 0.34)
  const normal = previewAnchor?.normal || getNormalFromCenter(cityMeta.center)
  const { tangent, bitangent } = previewAnchor || getBasis(normal)
  const anchorScale = previewAnchor?.scale || 1
  const items = getParticleSource(cityCode)
  particleCount.value = items.length
  particleState.anim.progress = 0

  particleState.meta = items.map((item, index) => {
    const randomDirection = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
    const axis = randomDirection.clone().cross(new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize())
    if (axis.lengthSq() < 1e-5) axis.set(0, 1, 0)
    axis.normalize()
    const visual = getCategoryVisual(item.category)
    return {
      ...item, index, center, normal, tangent, bitangent, anchorScale,
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

  particleState.relationMeta = buildRelationMeta(particleState.meta)
  particleState.relationMeta.forEach((link) => {
    particleState.meta[link.source]?.connections.add(link.target)
    particleState.meta[link.target]?.connections.add(link.source)
  })

  FILTERS.forEach((category) => {
    const metaIndices = particleState.meta.filter((m) => m.category === category).map((m) => m.index)
    if (!metaIndices.length) return
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 8, 8),
      new THREE.MeshBasicMaterial({
        color: CATEGORY_STYLES[category].color,
        transparent: true,
        opacity: category === activeCategory.value ? 1 : 0.26,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false,
      }),
      metaIndices.length,
    )
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.frustumCulled = true
    mesh.userData = { type: 'particle-cloud', category, metaIndices }
    mesh.renderOrder = 30
    particleRoot.add(mesh)
    particleState.meshes.push(mesh)
  })

  gsap.to(particleState.anim, { progress: 1, duration: 1.3, ease: 'power2.out' })

  const lineArray = new Float32Array(particleState.relationMeta.length * 6)
  particleState.relationLines = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x6bd8ff, transparent: true, opacity: 0.06, depthWrite: false, depthTest: false }),
  )
  particleState.relationLines.geometry.setAttribute('position', new THREE.BufferAttribute(lineArray, 3))
  particleState.relationLines.frustumCulled = true
  particleRoot.add(particleState.relationLines)
}

export function updateParticles(elapsed, activeCategory) {
  if (!particleState.meshes.length || !particleState.meta.length) return
  const focusIndex = particleState.selectedIndex >= 0 ? particleState.selectedIndex : particleState.hoveredIndex

  particleState.meshes.forEach((mesh) => {
    const metaIndices = mesh.userData.metaIndices || []
    const category = mesh.userData.category
    const isActiveCategory = category === activeCategory.value
    mesh.material.opacity = focusIndex >= 0
      ? (isActiveCategory ? 0.78 : 0.12)
      : (isActiveCategory ? 0.92 : 0.22)

    metaIndices.forEach((metaIndex, localIndex) => {
      const meta = particleState.meta[metaIndex]
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

  if (particleState.relationLines?.geometry?.attributes?.position) {
    const attribute = particleState.relationLines.geometry.attributes.position
    particleState.relationMeta.forEach((link, i) => {
      const pa = getParticleWorldPosition(particleState.meta[link.source], elapsed)
      const pb = getParticleWorldPosition(particleState.meta[link.target], elapsed)
      const base = i * 6
      attribute.array[base] = pa.x; attribute.array[base + 1] = pa.y; attribute.array[base + 2] = pa.z
      attribute.array[base + 3] = pb.x; attribute.array[base + 4] = pb.y; attribute.array[base + 5] = pb.z
    })
    particleState.relationLines.material.opacity = focusIndex >= 0 ? 0.12 : 0.06
    attribute.needsUpdate = true
  }
}
