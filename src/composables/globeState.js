/**
 * Shared module-level state for the 3D globe.
 * All composables that need Three.js objects import from here.
 * This is intentionally NOT reactive — Three.js objects should never
 * be wrapped in Vue refs.
 */
import * as THREE from 'three'

export const GLOBE_RADIUS = 5.2
export const DEFAULT_FOCUS_CENTER = [104.113106, 37.570693]
export const DEFAULT_CAMERA_DISTANCE = 8.2
export const PROVINCE_PULSE_MIN_COUNT = 4
export const PROVINCE_PULSE_MAX_COUNT = 6

// Three.js singleton objects (assigned during initScene / createBaseGlobe)
export const ctx = {
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  controls: null,
  raycaster: null,
  clock: null,
  globeMesh: null,
  atmosphere: null,
  globeWire: null,
  heroHalo: null,
  stars: null,
  introTimeline: null,
  rafId: 0,
}

// Scene graph groups (created once, never replaced)
export const mapRoot = new THREE.Group()
export const provinceRoot = new THREE.Group()
export const cityRoot = new THREE.Group()
export const focusRoot = new THREE.Group()
export const selectionRoot = new THREE.Group()
export const particleRoot = new THREE.Group()

// Shared reusable objects
export const globeSphere = new THREE.Sphere(new THREE.Vector3(), GLOBE_RADIUS + 0.18)
export const mouseNdc = new THREE.Vector2()
export const dummy = new THREE.Object3D()
export const tempColor = new THREE.Color()

// Fat line materials — collected across layers; need resolution update on resize
export const fatLineMaterials = []

// Province layer state
export const provinceFeatureMap = new Map()
export const provincePickables = []
export const pulseProvinceCodes = new Set()
export const pulseProvincePhaseMap = new Map()
export const pulseProvinceWindowMap = new Map()
export const pulseState = { nextSwapAt: 0 }

// City layer state
export const cityPickables = []
export const cityHitPickables = []
export const cityFeatureMap = new Map()
export const focusLayerState = {
  focusCityOverlay: null,
  focusBridge: null,
  focusBridgePairs: [],
  orbitDecorations: null,
}

// Particle cloud state
export const particleState = {
  meshes: [],
  relationLines: null,
  meta: [],
  relationMeta: [],
  hoveredIndex: -1,
  selectedIndex: -1,
  anim: { progress: 0 },
}

export const FOCUS_PROVINCE_GEOS = {}   // populated in useGeoLayers after geo imports
export const FOCUS_CITY_DISTRICT_GEOS = {}

export function isFocusProvince(code) {
  return !!FOCUS_PROVINCE_GEOS[String(code)]
}

export function hasDistrictGeo(code) {
  return !!FOCUS_CITY_DISTRICT_GEOS[String(code)]
}
