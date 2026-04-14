import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'
import { getNormalFromCenter, lonLatToXYZ } from '../utils/geoMath.js'
import {
  ctx, mapRoot, provinceRoot, cityRoot, focusRoot, selectionRoot, particleRoot,
  fatLineMaterials, GLOBE_RADIUS, DEFAULT_FOCUS_CENTER, DEFAULT_CAMERA_DISTANCE,
} from './globeState.js'

export function useGlobeScene(containerRef) {
  function createStarfield() {
    const starCount = 900
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      size: 0.11, color: 0x7cc6ff, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    ctx.stars = new THREE.Points(geometry, material)
    ctx.scene.add(ctx.stars)
  }

  function createBaseGlobe() {
    ctx.globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 72, 72),
      new THREE.MeshStandardMaterial({ color: 0x06101d, roughness: 0.94, metalness: 0.04, transparent: true, opacity: 1 }),
    )
    mapRoot.add(ctx.globeMesh)

    ctx.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + 0.1, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0x2e93ff, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    mapRoot.add(ctx.atmosphere)

    ctx.globeWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(GLOBE_RADIUS + 0.01, 16, 12)),
      new THREE.LineBasicMaterial({ color: 0x163456, transparent: true, opacity: 0.2 }),
    )
    mapRoot.add(ctx.globeWire)

    const chinaNormal = getNormalFromCenter(DEFAULT_FOCUS_CENTER)
    ctx.heroHalo = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 96),
      new THREE.MeshBasicMaterial({ color: 0x2c7be5, transparent: true, opacity: 0.02, depthWrite: false, blending: THREE.AdditiveBlending }),
    )
    ctx.heroHalo.position.copy(chinaNormal.clone().multiplyScalar(GLOBE_RADIUS + 0.04))
    ctx.heroHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), chinaNormal)
    mapRoot.add(ctx.heroHalo)
  }

  function initScene() {
    ctx.scene = new THREE.Scene()
    ctx.scene.background = new THREE.Color(0x020814)

    ctx.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 320)
    ctx.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
    ctx.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
    ctx.renderer.outputColorSpace = THREE.SRGBColorSpace

    ctx.controls = new OrbitControls(ctx.camera, ctx.renderer.domElement)
    ctx.controls.enableDamping = true
    ctx.controls.dampingFactor = 0.05
    ctx.controls.minDistance = 5.2
    ctx.controls.maxDistance = 28
    ctx.controls.rotateSpeed = 0.6
    ctx.controls.zoomSpeed = 0.9

    const chinaNormal = getNormalFromCenter(DEFAULT_FOCUS_CENTER)
    ctx.controls.target.copy(chinaNormal.clone().multiplyScalar(GLOBE_RADIUS * 0.86))
    ctx.camera.position.copy(chinaNormal.clone().multiplyScalar(GLOBE_RADIUS + DEFAULT_CAMERA_DISTANCE))

    ctx.raycaster = new THREE.Raycaster()
    ctx.raycaster.params.Line.threshold = 0.09
    ctx.raycaster.params.Points.threshold = 0.12
    ctx.clock = new THREE.Clock()

    mapRoot.add(provinceRoot, cityRoot, focusRoot, selectionRoot)
    ctx.scene.add(mapRoot)
    ctx.scene.add(particleRoot)

    ctx.scene.add(new THREE.AmbientLight(0xa5bfe5, 0.7))
    const keyLight = new THREE.DirectionalLight(0x9ad7ff, 1.3)
    keyLight.position.set(10, 14, 8)
    ctx.scene.add(keyLight)
    const fillLight = new THREE.PointLight(0x2d7dff, 2.8, 90)
    fillLight.position.set(-8, 6, -7)
    ctx.scene.add(fillLight)

    createBaseGlobe()
    createStarfield()

    ctx.composer = new EffectComposer(ctx.renderer)
    ctx.composer.addPass(new RenderPass(ctx.scene, ctx.camera))
    ctx.composer.addPass(new EffectPass(ctx.camera, new BloomEffect({ intensity: 0.88, luminanceThreshold: 0.26, mipmapBlur: true })))
  }

  function onResize() {
    if (!containerRef.value) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    ctx.camera.aspect = width / height
    ctx.camera.updateProjectionMatrix()
    ctx.renderer.setSize(width, height)
    ctx.composer.setSize(width, height)
    fatLineMaterials.forEach((mat) => mat.resolution.set(width, height))
  }

  function mountRenderer() {
    containerRef.value.appendChild(ctx.renderer.domElement)
  }

  function dispose() {
    cancelAnimationFrame(ctx.rafId)
    ctx.controls?.dispose()
    ctx.composer?.dispose()
    ctx.renderer?.dispose()
  }

  return { initScene, onResize, mountRenderer, dispose }
}
