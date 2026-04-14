import * as THREE from 'three'

export function colorToCss(value) {
  return `#${new THREE.Color(value).getHexString()}`
}

export function lonLatToXYZ(lng, lat, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

export function getNormalFromCenter(center, radius) {
  return lonLatToXYZ(center[0], center[1], radius ?? 1).normalize()
}

export function geometryToPolygons(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

export function sanitizeRing(ring) {
  const output = ring.map(([lng, lat]) => [Number(lng), Number(lat)])
  if (output.length > 1) {
    const [fx, fy] = output[0]
    const [lx, ly] = output[output.length - 1]
    if (fx === lx && fy === ly) output.pop()
  }
  return output
}

export function getBasis(normal) {
  const tangent = new THREE.Vector3(0, 1, 0).cross(normal)
  if (tangent.lengthSq() < 1e-5) tangent.set(1, 0, 0)
  tangent.normalize()
  const bitangent = normal.clone().cross(tangent).normalize()
  return { tangent, bitangent }
}

export function xyzToLonLat(point) {
  const radius = point.length() || 1
  const lat = 90 - (Math.acos(point.y / radius) * 180) / Math.PI
  const theta = Math.atan2(point.z, -point.x)
  let lng = (theta * 180) / Math.PI - 180
  if (lng < -180) lng += 360
  if (lng > 180) lng -= 360
  return [lng, lat]
}

export function pointInRing(point, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
      (point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || 1e-9) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

export function pointInFeature(point, feature) {
  const geometry = feature?.geometry
  if (!geometry) return false
  const polygons = geometry.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon'
      ? geometry.coordinates
      : []
  return polygons.some((polygon) => polygon?.[0]?.length >= 3 && pointInRing(point, polygon[0]))
}
