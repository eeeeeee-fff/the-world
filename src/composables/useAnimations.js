import gsap from 'gsap'
import {
  ctx, mapRoot, particleRoot,
  provinceFeatureMap, GLOBE_RADIUS, DEFAULT_FOCUS_CENTER, DEFAULT_CAMERA_DISTANCE,
} from './globeState.js'
import { getNormalFromCenter } from '../utils/geoMath.js'

// ── Material opacity tweens ────────────────────────────────────────────────

export function tweenMaterialOpacity(material, target, duration = 0.55) {
  if (!material || typeof material.opacity !== 'number') return
  material.transparent = true
  gsap.killTweensOf(material)
  gsap.to(material, { opacity: target, duration, ease: 'power2.inOut' })
}

export function tweenGroupOpacity(group, meshTarget, lineTarget, duration = 0.55) {
  if (!group) return
  group.traverse((child) => {
    if (!child.material) return
    if (child.isMesh) tweenMaterialOpacity(child.material, meshTarget, duration)
    if (child.isLine || child.isLineLoop || child.isLineSegments)
      tweenMaterialOpacity(child.material, lineTarget, duration)
  })
}

export function setGroupOpacityImmediate(group, meshTarget, lineTarget) {
  if (!group) return
  group.traverse((child) => {
    if (!child.material) return
    if (child.isMesh) child.material.opacity = meshTarget
    if (child.isLine || child.isLineLoop || child.isLineSegments) child.material.opacity = lineTarget
  })
}

// ── Scene detail-mode transition ──────────────────────────────────────────

export function setSceneDetailMode(active, { provinceRoot, cityRoot, focusRoot, selectionRoot }) {
  const dur = active ? 0.92 : 0.78
  const ease = active ? 'power3.inOut' : 'power2.inOut'

  gsap.killTweensOf(mapRoot.position)
  gsap.killTweensOf(mapRoot.scale)
  gsap.killTweensOf(particleRoot.position)
  gsap.killTweensOf(particleRoot.scale)
  gsap.killTweensOf(mapRoot.rotation)

  gsap.to(mapRoot.position, { x: active ? 7.2 : 0, y: active ? 0.6 : 0, z: active ? -0.5 : 0, duration: dur, ease })
  gsap.to(mapRoot.scale, { x: active ? 0.52 : 1, y: active ? 0.52 : 1, z: active ? 0.52 : 1, duration: dur, ease })
  gsap.to(mapRoot.rotation, { x: active ? -0.06 : 0, y: active ? -1.15 : 0, z: active ? 0.04 : 0, duration: dur, ease })
  gsap.to(particleRoot.position, { x: active ? 7.0 : 0, y: active ? 0.55 : 0, z: active ? -0.5 : 0, duration: dur, ease })
  gsap.to(particleRoot.scale, { x: active ? 0.52 : 1, y: active ? 0.52 : 1, z: active ? 0.52 : 1, duration: dur, ease })

  if (active) {
    tweenMaterialOpacity(ctx.globeMesh?.material, 0.09, dur)
    tweenMaterialOpacity(ctx.atmosphere?.material, 0.02, dur)
    tweenMaterialOpacity(ctx.globeWire?.material, 0.03, dur)
    tweenMaterialOpacity(ctx.heroHalo?.material, 0.004, dur)
    setGroupOpacityImmediate(provinceRoot, 0.05, 0.1)
    setGroupOpacityImmediate(cityRoot, 0.04, 0.08)
    setGroupOpacityImmediate(focusRoot, 0.06, 0.14)
    setGroupOpacityImmediate(selectionRoot, 0.03, 0.06)
  } else {
    tweenMaterialOpacity(ctx.globeMesh?.material, 1, dur)
    tweenMaterialOpacity(ctx.atmosphere?.material, 0.12, dur)
    tweenMaterialOpacity(ctx.globeWire?.material, 0.2, dur)
    tweenMaterialOpacity(ctx.heroHalo?.material, 0.02, dur)
    tweenGroupOpacity(provinceRoot, 0.18, 0.88, dur)
    tweenGroupOpacity(cityRoot, 0.22, 0.82, dur)
    tweenGroupOpacity(focusRoot, 0.28, 0.92, dur)
    tweenGroupOpacity(selectionRoot, 0.2, 0.32, dur)
  }
}

// ── Intro sequence ─────────────────────────────────────────────────────────

export function prepareProvinceIntroCascade() {
  provinceFeatureMap.forEach((group) => {
    group.userData.baseScale = group.scale.x
    group.userData.introStartScale = Math.max(0.985, group.scale.x - 0.016)
    group.scale.setScalar(group.userData.introStartScale)
    group.children.forEach((child) => {
      child.userData.baseOpacity = child.userData.baseOpacity ?? child.material.opacity
      if (child.isMesh) {
        child.userData.baseEmissiveIntensity = child.userData.baseEmissiveIntensity ?? child.material.emissiveIntensity
        child.material.opacity = 0
        child.material.emissiveIntensity = 0
      } else if (child.isLineLoop || child.isLine) {
        child.material.opacity = 0
      }
    })
  })
}

export function primeIntroScene({ topBrandRef, heroPanelRef, footerBarRef, topMetricsRef, introInteractive }) {
  const chinaNormal = getNormalFromCenter(DEFAULT_FOCUS_CENTER)
  const target = chinaNormal.clone().multiplyScalar(GLOBE_RADIUS * 0.86)
  const startPosition = chinaNormal.clone().multiplyScalar(GLOBE_RADIUS + (DEFAULT_CAMERA_DISTANCE * 25))

  ctx.controls.enabled = false
  introInteractive.value = false
  ctx.controls.target.copy(target)
  ctx.camera.position.copy(startPosition)
  ctx.camera.lookAt(target)

  if (ctx.globeMesh) ctx.globeMesh.material.opacity = 0
  if (ctx.atmosphere) ctx.atmosphere.material.opacity = 0
  if (ctx.globeWire) ctx.globeWire.material.opacity = 0
  if (ctx.heroHalo) ctx.heroHalo.material.opacity = 0

  prepareProvinceIntroCascade()

  gsap.set(topBrandRef.value, { autoAlpha: 0, y: -54 })
  gsap.set(heroPanelRef.value, { autoAlpha: 0, x: -72 })
  gsap.set(footerBarRef.value, { autoAlpha: 0, y: 54 })
  gsap.set(topMetricsRef.value, { autoAlpha: 0, x: 64 })
}

export function playIntroSequence(domRefs, introInteractive, animateHeadlineMetrics) {
  if (!ctx.camera || !ctx.controls) return
  ctx.introTimeline?.kill()
  primeIntroScene({ ...domRefs, introInteractive })

  const chinaNormal = getNormalFromCenter(DEFAULT_FOCUS_CENTER)
  const target = chinaNormal.clone().multiplyScalar(GLOBE_RADIUS * 0.86)

  const provinces = [...provinceFeatureMap.values()].sort((a, b) => {
    const latDiff = (b.userData.center?.[1] || 0) - (a.userData.center?.[1] || 0)
    return Math.abs(latDiff) > 0.2 ? latDiff : ((a.userData.center?.[0] || 0) - (b.userData.center?.[0] || 0))
  })

  const introCameraState = { distance: GLOBE_RADIUS + DEFAULT_CAMERA_DISTANCE * 25 }

  ctx.introTimeline = gsap.timeline()
  ctx.introTimeline.to(introCameraState, {
    distance: GLOBE_RADIUS + DEFAULT_CAMERA_DISTANCE,
    duration: 1.65,
    ease: 'power2.out',
    onUpdate() {
      ctx.camera.position.copy(chinaNormal.clone().multiplyScalar(introCameraState.distance))
      ctx.camera.lookAt(target)
    },
  }, 0)
  ctx.introTimeline.to(ctx.globeMesh.material, { opacity: 1, duration: 0.72, ease: 'power2.out' }, 0.8)
  ctx.introTimeline.to(ctx.atmosphere.material, { opacity: 0.12, duration: 0.72, ease: 'power2.out' }, 0.82)
  ctx.introTimeline.to(ctx.globeWire.material, { opacity: 0.2, duration: 0.62, ease: 'power2.out' }, 0.84)
  ctx.introTimeline.to(ctx.heroHalo.material, { opacity: 0.02, duration: 0.62, ease: 'power2.out' }, 0.86)

  provinces.forEach((group, index) => {
    const at = 1.2 + index * 0.022
    ctx.introTimeline.to(group.scale, {
      x: group.userData.baseScale || 1,
      y: group.userData.baseScale || 1,
      z: group.userData.baseScale || 1,
      duration: 0.3, ease: 'power2.out',
    }, at)
    group.children.forEach((child) => {
      if (child.isMesh) {
        ctx.introTimeline.to(child.material, {
          opacity: child.userData.baseOpacity ?? 0.18,
          emissiveIntensity: child.userData.baseEmissiveIntensity ?? 0.24,
          duration: 0.26, ease: 'power2.out',
        }, at)
      } else if (child.isLineLoop || child.isLine) {
        ctx.introTimeline.to(child.material, { opacity: child.userData.baseOpacity ?? 0.88, duration: 0.22, ease: 'power2.out' }, at)
      }
    })
  })

  ctx.introTimeline.to(domRefs.topBrandRef.value, { autoAlpha: 1, y: 0, duration: 0.48, ease: 'power3.out' }, 1.8)
  ctx.introTimeline.to(domRefs.heroPanelRef.value, { autoAlpha: 1, x: 0, duration: 0.48, ease: 'power3.out' }, 1.84)
  ctx.introTimeline.to(domRefs.footerBarRef.value, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.88)
  ctx.introTimeline.to(domRefs.topMetricsRef.value, { autoAlpha: 1, x: 0, duration: 0.42, ease: 'power3.out' }, 1.92)
  ctx.introTimeline.call(() => animateHeadlineMetrics(0.55), null, 2.2)
  ctx.introTimeline.call(() => {
    introInteractive.value = true
    ctx.controls.enabled = true
  }, null, 2.5)
}
