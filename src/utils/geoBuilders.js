/**
 * Three.js geometry builders for geographic features on the globe.
 * All functions are pure: they accept data and return Three.js objects without
 * mutating any external state (callers push to pickables / fatLineMaterials).
 */
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { lonLatToXYZ, getNormalFromCenter, geometryToPolygons, sanitizeRing, getBasis } from './geoMath.js'
import { getLocationMeta } from '../data/map-scene-data.js'

// ── Spherical patch (fill + wall + outline) ────────────────────────────────
export function buildSphericalPatch(ring, centerNormal, radius, baseRadius, style) {
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
    const pa = spherePoints[a], pb = spherePoints[b], pc = spherePoints[c]
    vertices.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z)
  })

  const fillGeometry = new THREE.BufferGeometry()
  fillGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  fillGeometry.computeVertexNormals()

  const fillMaterial = new THREE.MeshStandardMaterial({
    color: style.fillColor,
    emissive: new THREE.Color(style.emissiveColor),
    emissiveIntensity: style.emissiveIntensity,
    transparent: true, opacity: style.opacity,
    roughness: 0.34, metalness: 0.12,
    side: THREE.DoubleSide, depthWrite: false,
  })

  const mesh = new THREE.Mesh(fillGeometry, fillMaterial)
  mesh.frustumCulled = true

  // Wall
  const wallVertices = []
  const basePoints = cleanRing.map(([lng, lat]) => lonLatToXYZ(lng, lat, baseRadius))
  for (let i = 0; i < spherePoints.length; i++) {
    const next = (i + 1) % spherePoints.length
    const [topA, topB, baseA, baseB] = [spherePoints[i], spherePoints[next], basePoints[i], basePoints[next]]
    wallVertices.push(
      baseA.x, baseA.y, baseA.z, baseB.x, baseB.y, baseB.z, topB.x, topB.y, topB.z,
      baseA.x, baseA.y, baseA.z, topB.x, topB.y, topB.z, topA.x, topA.y, topA.z,
    )
  }

  const wallGeometry = new THREE.BufferGeometry()
  wallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wallVertices, 3))
  wallGeometry.computeVertexNormals()

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: style.sideColor || style.fillColor,
    emissive: new THREE.Color(style.sideEmissiveColor || style.emissiveColor),
    emissiveIntensity: Math.max((style.emissiveIntensity || 0.4) * 0.68, 0.18),
    transparent: true, opacity: Math.max((style.sideOpacity || style.opacity || 0.3) * 0.96, 0.35),
    roughness: 0.16, metalness: 0.28,
    side: THREE.DoubleSide, depthWrite: false,
  })

  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial)
  wallMesh.frustumCulled = true

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(spherePoints)
  const lineMaterial = new THREE.LineBasicMaterial({ color: style.lineColor, transparent: true, opacity: style.lineOpacity })
  const line = new THREE.LineLoop(lineGeometry, lineMaterial)
  line.frustumCulled = true

  const glowPoints = spherePoints.map((p) => p.clone().multiplyScalar((radius + 0.02) / radius))
  const glowGeometry = new THREE.BufferGeometry().setFromPoints(glowPoints)
  const glowMaterial = new THREE.LineBasicMaterial({
    color: style.lineColor, transparent: true,
    opacity: Math.min((style.lineOpacity || 0.7) + 0.18, 1),
  })
  const glowLine = new THREE.LineLoop(glowGeometry, glowMaterial)
  glowLine.frustumCulled = true

  return { mesh, wallMesh, line, glowLine }
}

// ── Feature group builders ─────────────────────────────────────────────────

/** Full visible province/city group (fill + wall + outline) */
export function buildGeoFeatureGroup(feature, options, globeRadius) {
  const props = feature.properties || {}
  const code = String(props.adcode)
  const center = props.centroid || props.center || getLocationMeta(code)?.centroid || getLocationMeta(code)?.center
  if (!center) return null

  const normal = getNormalFromCenter(center)
  const group = new THREE.Group()
  const sharedData = { type: options.type, code, name: props.name, center, normal, feature, pickRef: group }

  geometryToPolygons(feature.geometry).forEach((polygon) => {
    const patch = buildSphericalPatch(
      polygon[0], normal,
      options.radius,
      options.baseRadius || globeRadius + 0.01,
      options.style,
    )
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

/** Invisible hit-test mesh for focus-preview city polygons */
export function buildGeoFeatureHitGroup(feature, options) {
  const props = feature.properties || {}
  const code = String(props.adcode)
  const center = props.centroid || props.center || getLocationMeta(code)?.centroid || getLocationMeta(code)?.center
  if (!center) return null

  const normal = getNormalFromCenter(center)
  const group = new THREE.Group()
  const sharedData = {
    type: options.type, code, name: props.name, center, normal, feature,
    entry: getLocationMeta(code) || null, layer: options.layer || 'default',
  }

  geometryToPolygons(feature.geometry).forEach((polygon) => {
    const patch = buildSphericalPatch(polygon[0], normal, options.radius, options.baseRadius || options.radius - 0.01, {
      fillColor: 0xffffff, sideColor: 0xffffff, emissiveColor: 0xffffff, sideEmissiveColor: 0xffffff,
      opacity: options.opacity ?? 0.001, emissiveIntensity: 0,
      lineColor: 0xffffff, lineOpacity: 0, sideOpacity: 0.001, sideEmissiveIntensity: 0,
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

/**
 * Line-only group for outlines (supports fat Line2 or standard LineLoop).
 * Returns { group, fatLineMaterials[] } so callers can track materials for resize.
 */
export function buildGeoFeatureLineGroup(feature, options, viewportSize) {
  const props = feature.properties || {}
  const code = String(props.adcode)
  const center = props.centroid || props.center || getLocationMeta(code)?.centroid || getLocationMeta(code)?.center
  if (!center) return null

  const normal = getNormalFromCenter(center)
  const group = new THREE.Group()
  const sharedData = {
    type: options.type, code, name: props.name, center, normal, feature,
    entry: getLocationMeta(code) || null, layer: options.layer || 'default',
  }

  const newFatLineMaterials = []

  geometryToPolygons(feature.geometry).forEach((polygon) => {
    const cleanRing = sanitizeRing(polygon[0])
    if (cleanRing.length < 3) return

    if (options.useFatLine) {
      const points = cleanRing.flatMap(([lng, lat]) => {
        const p = lonLatToXYZ(lng, lat, options.radius)
        return [p.x, p.y, p.z]
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
      const w = viewportSize?.width || 1
      const h = viewportSize?.height || 1
      material.resolution.set(w, h)
      newFatLineMaterials.push(material)

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
      new THREE.LineBasicMaterial({ color: options.glowColor || 0x86ecff, transparent: true, opacity: options.glowOpacity ?? 0.42, depthWrite: false }),
    )
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: options.lineColor || 0xffffff, transparent: true, opacity: options.lineOpacity ?? 1, depthWrite: false }),
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
  return group.children.length ? { group, fatLineMaterials: newFatLineMaterials } : null
}

// ── Style helpers ──────────────────────────────────────────────────────────

export function setFeatureStyle(group, style) {
  if (typeof style.scale === 'number') group.scale.setScalar(1 + style.scale)
  group.children.forEach((child, index) => {
    if (child.isMesh) {
      const isWall = index === 0
      child.material.opacity = isWall ? Math.max((style.sideOpacity || style.opacity || 0.3) * 0.96, 0.35) : style.opacity
      child.material.emissiveIntensity = isWall ? Math.max((style.sideEmissiveIntensity || style.emissiveIntensity || 0.4) * 0.72, 0.24) : style.emissiveIntensity
      child.userData.baseOpacity = child.material.opacity
      child.userData.baseEmissiveIntensity = child.material.emissiveIntensity
      child.material.color.setHex(isWall ? (style.sideColor || style.fillColor) : style.fillColor)
      child.material.emissive.setHex(isWall ? (style.sideEmissiveColor || style.emissiveColor) : style.emissiveColor)
    }
    if (child.isLineLoop || child.isLine) {
      const boost = child.material.opacity > 0.8 ? 0.18 : 0
      child.material.opacity = Math.min((style.lineOpacity || 0.7) + boost, 1)
      child.userData.baseOpacity = child.material.opacity
      child.material.color.setHex(style.lineColor)
    }
  })
}

export function disposeGroup(root) {
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      Array.isArray(child.material)
        ? child.material.forEach((m) => m.dispose())
        : child.material.dispose()
    }
  })
  root.clear()
}
