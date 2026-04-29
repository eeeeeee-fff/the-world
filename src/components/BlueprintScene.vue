<template>
  <div class="blueprint-root">
    <div ref="stageRef" class="blueprint-stage"></div>

    <div class="blueprint-hud">
      <div class="blueprint-status">
        <div class="blueprint-status-kicker">Scene State</div>
        <div class="blueprint-status-title">{{ statusTitle }}</div>
        <div class="blueprint-status-body">{{ statusBody }}</div>
      </div>
    </div>

    <div class="blueprint-footer">
      <div class="blueprint-legend">
        <span><i class="blueprint-dot" style="color:#86e4ff"></i>Main</span>
        <span><i class="blueprint-dot" style="color:#78a3ff"></i>Branch</span>
        <span><i class="blueprint-dot" style="color:#fff4c4"></i>Pulse</span>
      </div>
      <div class="blueprint-actions">
        <span>Esc reset</span>
        <button type="button" @click="onReset">Back To Overview</button>
        <button type="button" class="blueprint-back" @click="emit('exit')">← Back to Map</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  OutlineEffect,
  RenderPass,
  SelectiveBloomEffect,
  ShockWaveEffect
} from 'postprocessing'

const emit = defineEmits(['exit'])

const stageRef = ref(null)
const statusTitle = ref('Overview')
const statusBody = ref('Click any floating sector. The camera moves in, the core pulse fires, the main chain grows first, then branch nodes wake up.')

let resetSceneFn = () => {}
const onReset = () => resetSceneFn()

let cleanup = () => {}

onMounted(() => {
  const stage = stageRef.value
  if (!stage) return

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  stage.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x030712)
  scene.fog = new THREE.FogExp2(0x04101d, 0.026)

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 160)
  const overviewCameraBase = new THREE.Vector3(-0.75, 1.18, 12.8)
  const overviewLookBase = new THREE.Vector3(-0.6, 0.2, 0)
  const orbitCenter = new THREE.Vector3(-0.25, 0, -1.1)
  camera.position.copy(overviewCameraBase)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomEffect = new SelectiveBloomEffect(scene, camera, {
    blendFunction: BlendFunction.ADD,
    mipmapBlur: true,
    luminanceThreshold: 0.18,
    luminanceSmoothing: 0.24,
    intensity: 2.4
  })
  bloomEffect.ignoreBackground = true

  const outlineEffect = new OutlineEffect(scene, camera, {
    blendFunction: BlendFunction.SCREEN,
    edgeStrength: 3.1,
    pulseSpeed: 0,
    visibleEdgeColor: 0xb8ecff,
    hiddenEdgeColor: 0x08131f,
    xRay: true,
    blur: false
  })

  const shockWaveEffect = new ShockWaveEffect(camera, new THREE.Vector3(), {
    speed: 1.25,
    maxRadius: 0.42,
    waveSize: 0.18,
    amplitude: 0.06
  })

  composer.addPass(new EffectPass(camera, bloomEffect, outlineEffect, shockWaveEffect))

  const world = new THREE.Group()
  const driftGroup = new THREE.Group()
  world.add(driftGroup)
  scene.add(world)

  const ambient = new THREE.AmbientLight(0x7fb8ff, 0.7)
  const key = new THREE.DirectionalLight(0x6bc8ff, 1.5)
  key.position.set(5, 7, 8)
  const rim = new THREE.DirectionalLight(0x5d7cff, 1.1)
  rim.position.set(-6, 2, -8)
  scene.add(ambient, key, rim)

  const clock = new THREE.Clock()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  const driftTarget = new THREE.Vector3()
  const lookTarget = overviewLookBase.clone()
  const lookTargetProxy = lookTarget.clone()
  const hoverTarget = new THREE.Vector2()
  const sectorHitAreas = []
  const sectors = []
  const chainGroup = new THREE.Group()
  driftGroup.add(chainGroup)

  const sceneState = {
    busy: false,
    focusedSector: null,
    mainProgress: 0,
    branchProgress: 0,
    pulse: 0
  }

  let currentTimeline = null
  let activeChain = null
  let rafId = null

  function makeLabelSprite(text, color, scale = 1) {
    const canvas = document.createElement('canvas')
    canvas.width = 420
    canvas.height = 132
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.shadowBlur = 24
    ctx.shadowColor = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0.42)`
    ctx.lineWidth = 8
    ctx.strokeStyle = 'rgba(10, 22, 38, 0.45)'
    ctx.fillStyle = 'rgba(236, 246, 255, 0.98)'
    ctx.font = '600 42px "Segoe UI", "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2 + 2)
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0 })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(3.5 * scale, 0.82 * scale, 1)
    return sprite
  }

  function createStarField() {
    const count = 1500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 45
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.55
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 8
      color.setHSL(0.54 + Math.random() * 0.08, 0.72, 0.55 + Math.random() * 0.3)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({
      size: 0.14,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const points = new THREE.Points(geometry, material)
    driftGroup.add(points)
    return points
  }

  function createGridTunnel() {
    const group = new THREE.Group()
    const material = new THREE.LineBasicMaterial({ color: 0x173252, transparent: true, opacity: 0.45 })
    for (let i = -7; i <= 7; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * 1.6, -3.8, 6),
        new THREE.Vector3(i * 2.8, -3.8, -42)
      ])
      group.add(new THREE.Line(geo, material))
    }
    for (let j = 0; j < 12; j++) {
      const z = 6 - j * 4.2
      const width = 14 + j * 2.4
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-width, -3.8, z),
        new THREE.Vector3(width, -3.8, z)
      ])
      group.add(new THREE.Line(geo, material))
    }
    driftGroup.add(group)
    return group
  }

  function setObjectOpacity(root, opacity) {
    root.traverse((child) => {
      if (!child.material) return
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if ('opacity' in material) {
          material.transparent = true
          material.opacity = opacity
        }
      })
    })
  }

  function createSectorNode(data) {
    const group = new THREE.Group()
    group.position.copy(data.position)
    const basePosition = data.position.clone()
    const orbitOffset = basePosition.clone().sub(orbitCenter)
    group.userData.basePosition = basePosition
    group.userData.orbitRadius = Math.hypot(orbitOffset.x, orbitOffset.z)
    group.userData.orbitAngle = Math.atan2(orbitOffset.z, orbitOffset.x)
    group.userData.orbitYOffset = basePosition.y
    group.userData.data = data
    group.userData.state = { opacity: 1, glow: 0.8, ring: 0.3 }

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.24, 4),
      new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 1.35,
        metalness: 0.18,
        roughness: 0.22,
        transparent: true,
        opacity: 1
      })
    )

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.08, 18, 120),
      new THREE.MeshBasicMaterial({
        color: data.color.clone().lerp(new THREE.Color(0xffffff), 0.28),
        transparent: true,
        opacity: 0.86,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    )
    halo.rotation.x = Math.PI * 0.55

    const spindle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 3.4, 16),
      new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.16 })
    )
    spindle.rotation.z = Math.PI * 0.5

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 16, 16),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    )
    hit.userData.owner = group

    const label = makeLabelSprite(data.name, data.color, 1)
    label.position.set(0, 2.58, 0)

    group.add(spindle, halo, shell, hit, label)
    group.userData.shell = shell
    group.userData.halo = halo
    group.userData.label = label
    group.userData.hit = hit

    bloomEffect.selection.add(shell)
    bloomEffect.selection.add(halo)
    sectorHitAreas.push(hit)
    driftGroup.add(group)
    sectors.push(group)
    return group
  }

  const sectorData = [
    { name: 'IC', color: new THREE.Color('#6ab6ff'), position: new THREE.Vector3(-6.8, 2.8, -1.6), chain: { main: ['Materials', 'Wafer', 'Packaging', 'Compute'], branches: [{ from: 1, labels: ['Resist', 'Etch'] }, { from: 2, labels: ['Advanced Pack', 'Auto Chip'] }] } },
    { name: 'Bio', color: new THREE.Color('#6bffcf'), position: new THREE.Vector3(-8.2, -1.4, -3.5), chain: { main: ['R and D', 'Clinical', 'Manufacture', 'Medical Use'], branches: [{ from: 1, labels: ['CRO', 'AI Screen'] }, { from: 2, labels: ['Cold Chain', 'RWD'] }] } },
    { name: 'Robotics', color: new THREE.Color('#86e4ff'), position: new THREE.Vector3(-2.6, -3.2, 0.4), chain: { main: ['Components', 'Control', 'System', 'Industry'], branches: [{ from: 0, labels: ['Reducer', 'Servo'] }, { from: 2, labels: ['Service', 'Industrial', 'Special'] }] } },
    { name: 'Aerospace', color: new THREE.Color('#9ca8ff'), position: new THREE.Vector3(5.8, 2.5, -3.8), chain: { main: ['Materials', 'Avionics', 'Assembly', 'High End'], branches: [{ from: 1, labels: ['Sensors', 'Control SW'] }, { from: 2, labels: ['Satellite', 'Rocket'] }] } },
    { name: 'Low Alt', color: new THREE.Color('#8fd1ff'), position: new THREE.Vector3(7.9, -0.8, -1.2), chain: { main: ['Flight Ctrl', 'Airspace', 'Dispatch', 'Services'], branches: [{ from: 1, labels: ['Digital ATC', 'Route Gov'] }, { from: 2, labels: ['Logistics', 'Emergency'] }] } },
    { name: 'Storage', color: new THREE.Color('#7bfff2'), position: new THREE.Vector3(1.6, 4.3, 1.1), chain: { main: ['Materials', 'Cell', 'System', 'Grid Sync'], branches: [{ from: 0, labels: ['Cathode', 'Electrolyte'] }, { from: 2, labels: ['C and I', 'VPP'] }] } }
  ]

  const stars = createStarField()
  const tunnel = createGridTunnel()
  sectorData.forEach(createSectorNode)

  function createNode(label, color, scale = 0.42) {
    const group = new THREE.Group()
    const state = { opacity: 0, glow: 0, scale: 0.1 }
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(scale, 0),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.0,
        metalness: 0.12,
        roughness: 0.16,
        transparent: true,
        opacity: 0.0
      })
    )
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(scale * 1.7, scale * 0.1, 12, 44),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    )
    ring.rotation.x = Math.PI * 0.5
    const labelSprite = makeLabelSprite(label, color, 0.65)
    labelSprite.position.set(0, scale * 2.3, 0)
    group.add(ring, core, labelSprite)
    group.scale.setScalar(state.scale)
    group.userData = { state, core, ring, label: labelSprite }
    setObjectOpacity(group, 0)
    return group
  }

  function buildGrowthLine(points, color, opacity = 0.92, tubeRadius = 0.025) {
    const curve = new THREE.CatmullRomCurve3(points)
    const tubularSegments = 120
    const radialSegments = 6
    const geometry = new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, false)
    const indicesPerRing = radialSegments * 6
    geometry.setDrawRange(0, 0)
    const tube = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    )
    bloomEffect.selection.add(tube)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    chainGroup.add(head)
    return { curve, line: tube, head, tubularSegments, indicesPerRing }
  }

  function updateGrowth(lineObject, progress) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1)
    const rings = Math.floor(lineObject.tubularSegments * clamped)
    lineObject.line.geometry.setDrawRange(0, rings * lineObject.indicesPerRing)
    lineObject.head.position.copy(lineObject.curve.getPoint(Math.max(0.001, clamped)))
    lineObject.head.visible = clamped > 0.001 && clamped < 0.995
  }

  function clearChain() {
    if (activeChain) {
      activeChain.nodes.forEach((node) => {
        bloomEffect.selection.delete(node.userData.core)
        outlineEffect.selection.delete(node.userData.core)
      })
      activeChain.branchNodes.forEach((node) => {
        bloomEffect.selection.delete(node.userData.core)
        outlineEffect.selection.delete(node.userData.core)
      })
      ;[activeChain.mainLine, ...activeChain.branchLines].forEach((lo) => {
        bloomEffect.selection.delete(lo.line)
      })
      chainGroup.clear()
    }
    activeChain = null
    sceneState.mainProgress = 0
    sceneState.branchProgress = 0
  }

  function buildChainForSector(sector) {
    clearChain()
    const data = sector.userData.data
    const growthDir = new THREE.Vector3(1, 0.03, -0.14).normalize()
    const sideDir = new THREE.Vector3(0, 1, 0)
    const center = new THREE.Vector3(-2.65, 0.12, 1.02)
    const mainPoints = [
      center,
      center.clone().add(new THREE.Vector3(1.95, 0.12, -0.16)),
      center.clone().add(new THREE.Vector3(4.65, 0.62, -0.64)),
      center.clone().add(new THREE.Vector3(8.0, 0.12, -1.24)),
      center.clone().add(new THREE.Vector3(11.5, 0.42, -1.86))
    ]

    const mainLine = buildGrowthLine(mainPoints, data.color, 0.95)
    chainGroup.add(mainLine.line)

    const centerOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 24, 24),
      new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    centerOrb.position.copy(center)
    chainGroup.add(centerOrb)
    bloomEffect.selection.add(centerOrb)

    const nodes = data.chain.main.map((label, index) => {
      const node = createNode(label, data.color.clone().lerp(new THREE.Color(0xffffff), 0.2), 0.4 + index * 0.04)
      node.position.copy(mainPoints[index + 1])
      chainGroup.add(node)
      return node
    })

    const branchLines = []
    const branchNodes = []
    data.chain.branches.forEach((branch, branchIndex) => {
      const origin = mainPoints[branch.from + 1].clone()
      const branchSign = branchIndex % 2 === 0 ? 1 : -1
      branch.labels.forEach((label, itemIndex) => {
        const offsetIndex = itemIndex - (branch.labels.length - 1) / 2
        const end = origin.clone().add(new THREE.Vector3(
          2.3 + branchIndex * 0.85 + itemIndex * 0.55,
          branchSign * (1.8 + Math.abs(offsetIndex) * 0.9),
          -1.08 - branchIndex * 0.35 - itemIndex * 0.48
        ))
        const mid = origin.clone().lerp(end, 0.56).add(new THREE.Vector3(0.65, branchSign * 0.55, -0.3))
        const lineObject = buildGrowthLine([origin, mid, end], data.color.clone().lerp(new THREE.Color('#8aa7ff'), 0.48), 0.68, 0.016)
        lineObject.line.visible = false
        lineObject.head.visible = false
        chainGroup.add(lineObject.line)
        branchLines.push(lineObject)
        const node = createNode(label, data.color.clone().lerp(new THREE.Color('#8aa7ff'), 0.46), 0.28)
        node.position.copy(end)
        chainGroup.add(node)
        branchNodes.push(node)
      })
    })

    activeChain = { center, centerOrb, growthDir, sideDir, mainLine, nodes, branchLines, branchNodes }
    updateGrowth(mainLine, 0.001)
    branchLines.forEach((line) => updateGrowth(line, 0.001))
    return activeChain
  }

  function activateNode(node) {
    const { state, core, ring, label } = node.userData
    outlineEffect.selection.add(core)
    bloomEffect.selection.add(core)
    gsap.to(state, { opacity: 0.95, glow: 1.8, scale: 1, duration: 0.55, ease: 'power2.out', onUpdate: () => {
      core.material.opacity = state.opacity
      core.material.emissiveIntensity = state.glow
      ring.material.opacity = state.opacity * 0.65
      label.material.opacity = state.opacity
      node.scale.setScalar(state.scale)
    }})
  }

  function triggerPulse(position, color) {
    shockWaveEffect.epicenter.copy(position)
    shockWaveEffect.explode()
    sceneState.pulse = 1
    gsap.fromTo(sceneState, { pulse: 1 }, { pulse: 0, duration: 1.6, ease: 'power2.out' })
    if (activeChain?.centerOrb) {
      activeChain.centerOrb.material.color.copy(color)
      gsap.fromTo(activeChain.centerOrb.scale, { x: 0.3, y: 0.3, z: 0.3 }, { x: 3.4, y: 3.4, z: 3.4, duration: 0.8, ease: 'power2.out' })
      gsap.fromTo(activeChain.centerOrb.material, { opacity: 1 }, { opacity: 0.05, duration: 0.8, ease: 'power2.out' })
    }
  }

  function focusSector(sector) {
    if (sceneState.busy) return
    sceneState.busy = true
    sceneState.focusedSector = sector
    if (currentTimeline) currentTimeline.kill()
    const chain = buildChainForSector(sector)
    const color = sector.userData.data.color

    statusTitle.value = sector.userData.data.name
    statusBody.value = 'Focus locked. The sector compresses into a left anchor, then the main chain grows to the right before branch nodes unfold around it.'

    const cameraTarget = { x: 0.95, y: 1.02, z: 8.9 }
    const overviewCameraTarget = { x: 1.55, y: 2.18, z: 12.6 }
    const overviewLookTarget = { x: 2.35, y: 0.28, z: -0.34 }

    currentTimeline = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: () => { sceneState.busy = false } })

    sectors.forEach((item) => {
      const base = item.userData.basePosition.clone()
      const state = item.userData.state
      if (item === sector) {
        currentTimeline.to(item.position, { x: -4.1, y: 0.18, z: 1.2, duration: 1.15 }, 0)
        currentTimeline.to(item.scale, { x: 0.94, y: 0.94, z: 0.94, duration: 1.15 }, 0)
        currentTimeline.to(state, { opacity: 0.94, glow: 1.72, ring: 0.92, duration: 1.15, onUpdate: () => {
          item.userData.shell.material.opacity = state.opacity
          item.userData.shell.material.emissiveIntensity = state.glow
          item.userData.halo.material.opacity = 0.22 + state.ring * 0.18
          item.userData.label.material.opacity = 0.9
        }}, 0)
      } else {
        const push = base.clone().normalize().multiplyScalar(3.5)
        currentTimeline.to(item.position, {
          x: base.x + push.x,
          y: base.y + push.y * 0.7,
          z: base.z - 10 - Math.abs(push.x) * 0.24,
          duration: 1.05
        }, 0)
        currentTimeline.to(item.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 1.05 }, 0)
        currentTimeline.to(item.userData.state, { opacity: 0.08, glow: 0.06, ring: 0.08, duration: 1.05, onUpdate: () => {
          const s = item.userData.state
          item.userData.shell.material.opacity = s.opacity
          item.userData.shell.material.emissiveIntensity = s.glow
          item.userData.halo.material.opacity = s.ring
          item.userData.label.material.opacity = Math.min(0.16, s.opacity)
        }}, 0)
      }
    })

    currentTimeline.to(driftTarget, { x: 0.18, y: 0.02, z: 0, duration: 1.25 }, 0)
    currentTimeline.to(camera.position, { ...cameraTarget, duration: 1.34 }, 0.26)
    currentTimeline.to(lookTarget, { x: 0.62, y: 0.28, z: -0.2, duration: 1.34 }, 0.26)

    currentTimeline.call(() => triggerPulse(chain.center, color), null, 1.06)
    currentTimeline.to(sceneState, {
      mainProgress: 1,
      duration: 1.75,
      ease: 'power2.out',
      onUpdate: () => {
        updateGrowth(chain.mainLine, sceneState.mainProgress)
        const followPoint = chain.mainLine.curve.getPoint(Math.min(sceneState.mainProgress, 0.88))
        lookTarget.lerp(followPoint.clone().add(new THREE.Vector3(0.45, 0.1, -0.08)), 0.14)
      }
    }, 1.12)

    chain.nodes.forEach((node, index) => {
      currentTimeline.call(() => activateNode(node), null, 1.38 + index * 0.22)
    })

    currentTimeline.call(() => {
      chain.branchLines.forEach((line) => {
        line.line.visible = true
        line.head.visible = true
      })
    }, null, 2.26)

    currentTimeline.to(sceneState, {
      branchProgress: 1,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        chain.branchLines.forEach((line) => updateGrowth(line, sceneState.branchProgress))
      }
    }, 2.28)

    chain.branchNodes.forEach((node, index) => {
      currentTimeline.call(() => activateNode(node), null, 2.58 + index * 0.14)
    })

    currentTimeline.to(camera.position, { ...overviewCameraTarget, duration: 1.18, ease: 'power2.inOut' }, 2.8)
    currentTimeline.to(lookTarget, { ...overviewLookTarget, duration: 1.18, ease: 'power2.inOut' }, 2.8)
    currentTimeline.to(driftTarget, { x: 0.04, y: 0.02, z: 0, duration: 1.18, ease: 'power2.inOut' }, 2.8)
  }

  function resetScene() {
    if (currentTimeline) currentTimeline.kill()
    sceneState.busy = false
    sceneState.focusedSector = null
    sceneState.mainProgress = 0
    sceneState.branchProgress = 0
    driftTarget.set(0, 0, 0)
    lookTarget.copy(overviewLookBase)
    statusTitle.value = 'Overview'
    statusBody.value = 'Click any floating sector. The camera moves in, the core pulse fires, the main chain grows first, then branch nodes wake up.'
    clearChain()

    gsap.to(camera.position, { x: overviewCameraBase.x, y: overviewCameraBase.y, z: overviewCameraBase.z, duration: 1.15, ease: 'power3.out' })
    gsap.to(lookTarget, { x: overviewLookBase.x, y: overviewLookBase.y, z: overviewLookBase.z, duration: 1.15, ease: 'power3.out' })

    sectors.forEach((sector) => {
      const base = sector.userData.basePosition
      const state = sector.userData.state
      gsap.to(sector.position, { x: base.x, y: base.y, z: base.z, duration: 1.05, ease: 'power3.out' })
      gsap.to(sector.scale, { x: 1.18, y: 1.18, z: 1.18, duration: 1.05, ease: 'power3.out' })
      gsap.to(state, { opacity: 1, glow: 1.4, ring: 0.92, duration: 1.05, ease: 'power3.out', onUpdate: () => {
        sector.userData.shell.material.opacity = state.opacity
        sector.userData.shell.material.emissiveIntensity = state.glow
        sector.userData.halo.material.opacity = state.ring
        sector.userData.label.material.opacity = 0.96
      }})
    })
  }

  resetSceneFn = resetScene

  function onPointerMove(event) {
    hoverTarget.x = (event.clientX / window.innerWidth) * 2 - 1
    hoverTarget.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  function onPointerDown(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(sectorHitAreas, false)[0]
    if (hit?.object?.userData?.owner) {
      focusSector(hit.object.userData.owner)
    }
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
  }

  function onKeydown(event) {
    if (event.key === 'Escape') resetScene()
  }

  function onDblClick() {
    resetScene()
  }

  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('dblclick', onDblClick)

  resetScene()

  function render() {
    const elapsed = clock.getElapsedTime()
    const overviewMode = !sceneState.focusedSector
    sectors.forEach((sector, index) => {
      if (sceneState.focusedSector === sector) return
      const base = sector.userData.basePosition
      const orbitRadius = sector.userData.orbitRadius
      const orbitAngle = sector.userData.orbitAngle
      const orbitDrift = elapsed * 0.05 + index * 0.08
      const orbitWave = 1 + Math.sin(elapsed * 0.42 + index * 0.9) * 0.035
      const orbitX = orbitCenter.x + Math.cos(orbitAngle + orbitDrift) * orbitRadius * orbitWave
      const orbitZ = orbitCenter.z + Math.sin(orbitAngle + orbitDrift) * orbitRadius * orbitWave
      const targetX = overviewMode ? orbitX : base.x
      const targetZ = overviewMode ? orbitZ : base.z
      const targetY = sector.userData.orbitYOffset + Math.sin(elapsed * 0.9 + index * 0.85) * 0.22
      sector.position.x += (targetX - sector.position.x) * 0.018
      sector.position.y += (targetY - sector.position.y) * 0.04
      sector.position.z += (targetZ - sector.position.z) * 0.018
      sector.rotation.y += 0.0032
      sector.userData.halo.rotation.z += 0.006 + index * 0.0003
      sector.userData.halo.rotation.x = 1.2 + Math.sin(elapsed * 0.7 + index) * 0.08
      sector.userData.shell.position.y = Math.sin(elapsed * 1.15 + index) * 0.14
      sector.userData.label.position.y = 2.58 + Math.sin(elapsed * 1.15 + index) * 0.12
    })

    if (sceneState.focusedSector) {
      const focus = sceneState.focusedSector
      focus.userData.halo.rotation.z += 0.02
      focus.userData.halo.rotation.x = 1.4 + Math.sin(elapsed * 2.4) * 0.14
      focus.userData.shell.position.y = Math.sin(elapsed * 2.2) * 0.08
      focus.userData.label.position.y = 2.25 + Math.sin(elapsed * 2.2) * 0.12
    }

    const parallaxX = hoverTarget.x * 0.36
    const parallaxY = hoverTarget.y * 0.22
    driftGroup.position.x += (driftTarget.x + parallaxX - driftGroup.position.x) * 0.05
    driftGroup.position.y += (driftTarget.y + parallaxY - driftGroup.position.y) * 0.05

    if (overviewMode) {
      const overviewCamX = overviewCameraBase.x + Math.cos(elapsed * 0.18) * 0.18
      const overviewCamY = overviewCameraBase.y + Math.sin(elapsed * 0.24) * 0.08
      const overviewCamZ = overviewCameraBase.z + Math.sin(elapsed * 0.18) * 0.16
      camera.position.x += (overviewCamX - camera.position.x) * 0.02
      camera.position.y += (overviewCamY - camera.position.y) * 0.02
      camera.position.z += (overviewCamZ - camera.position.z) * 0.02
      lookTarget.x += ((overviewLookBase.x + Math.sin(elapsed * 0.16) * 0.12) - lookTarget.x) * 0.02
      lookTarget.y += ((overviewLookBase.y + Math.cos(elapsed * 0.22) * 0.03) - lookTarget.y) * 0.02
      lookTarget.z += ((overviewLookBase.z + Math.sin(elapsed * 0.14) * 0.08) - lookTarget.z) * 0.02
    }

    lookTargetProxy.lerp(lookTarget, 0.09)
    camera.lookAt(lookTargetProxy)

    if (activeChain) {
      activeChain.centerOrb.rotation.y += 0.03
      activeChain.centerOrb.material.opacity = 0.2 + sceneState.pulse * 0.8
      activeChain.centerOrb.scale.setScalar(1 + sceneState.pulse * 2.2)
      activeChain.nodes.concat(activeChain.branchNodes).forEach((node, index) => {
        node.rotation.y += 0.01 + index * 0.0008
        node.userData.ring.rotation.z += 0.02
        node.position.y += Math.sin(elapsed * 1.8 + index * 0.55) * 0.0015
      })
    }

    stars.rotation.y += 0.0005
    tunnel.position.z = -Math.sin(elapsed * 0.18) * 0.4
    composer.render()
    rafId = requestAnimationFrame(render)
  }

  render()

  cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId)
    if (currentTimeline) currentTimeline.kill()
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(lookTarget)
    sectors.forEach((sector) => {
      gsap.killTweensOf(sector.position)
      gsap.killTweensOf(sector.scale)
      gsap.killTweensOf(sector.userData.state)
    })
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('dblclick', onDblClick)
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => {
          if (m.map) m.map.dispose()
          m.dispose()
        })
      }
    })
    composer.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement)
  }
})

onBeforeUnmount(() => cleanup())
</script>

<style scoped>
.blueprint-root {
  position: fixed;
  inset: 0;
  z-index: 200;
  overflow: hidden;
  background: radial-gradient(circle at top, #081628 0%, #020711 56%, #01040a 100%);
  font-family: "Segoe UI", "PingFang SC", sans-serif;
  color: rgba(235, 246, 255, 0.96);
}

.blueprint-stage {
  position: absolute;
  inset: 0;
}

.blueprint-stage :deep(canvas) {
  display: block;
}

.blueprint-hud {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 5;
  pointer-events: none;
}

.blueprint-status {
  width: 248px;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(133, 205, 255, 0.18);
  background: rgba(8, 14, 26, 0.56);
  backdrop-filter: blur(16px);
  box-shadow: 0 0 28px rgba(25, 96, 180, 0.14);
}

.blueprint-status-kicker {
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(128, 191, 225, 0.72);
}

.blueprint-status-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(235, 246, 255, 0.96);
}

.blueprint-status-body {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(170, 196, 216, 0.78);
}

.blueprint-footer {
  position: fixed;
  right: 20px;
  bottom: 18px;
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 5;
  pointer-events: none;
}

.blueprint-legend,
.blueprint-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(133, 205, 255, 0.18);
  background: rgba(7, 14, 27, 0.52);
  backdrop-filter: blur(16px);
  pointer-events: auto;
}

.blueprint-legend span,
.blueprint-actions span,
.blueprint-actions button {
  font-size: 12px;
  color: rgba(189, 214, 232, 0.9);
}

.blueprint-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  box-shadow: 0 0 12px currentColor;
}

.blueprint-actions button {
  border: 0;
  border-radius: 999px;
  padding: 9px 14px;
  background: linear-gradient(135deg, rgba(98, 198, 255, 0.2), rgba(100, 125, 255, 0.16));
  color: rgba(235, 246, 255, 0.96);
  cursor: pointer;
  font-family: inherit;
}

.blueprint-actions button.blueprint-back {
  background: linear-gradient(135deg, rgba(255, 158, 90, 0.28), rgba(255, 110, 130, 0.22));
}
</style>
