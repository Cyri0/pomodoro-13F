import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { TimerMode } from '../store/timerStore'

interface TimerSceneProps {
  progress: number
  time: string
  mode: TimerMode
  onSelectDuration: (minutes: number) => void
  running: boolean
}

const modeNames: Record<TimerMode, string> = {
  focus: 'FOCUS',
  shortBreak: 'SHORT REST',
  longBreak: 'LONG REST',
}

const faceDurations = [25, 20, 30, 15, 10, 5] as const

export function TimerScene({ progress, time, mode, onSelectDuration, running }: TimerSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(progress)
  const runningRef = useRef(running)
  const modeRef = useRef(mode)
  const onSelectDurationRef = useRef(onSelectDuration)
  const rotateByRef = useRef<(axis: 'horizontal' | 'vertical', direction: number) => void>(() => {})

  useEffect(() => { progressRef.current = progress }, [progress])
  useEffect(() => { runningRef.current = running }, [running])
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { onSelectDurationRef.current = onSelectDuration }, [onSelectDuration])
  useEffect(() => {
    const mount = mountRef.current
    const display = displayRef.current
    if (!mount || !display) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100)
    camera.position.set(4.1, 3.2, 7.6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.setClearColor(0x000000, 0)
    mount.prepend(renderer.domElement)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbab5a9, 2.3)
    scene.add(hemiLight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2)
    keyLight.position.set(-4, 7, 8)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xe8ae6e, 1.8)
    rimLight.position.set(4, 3, -3)
    scene.add(rimLight)

    const clock = new THREE.Group()
    scene.add(clock)
    const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: '#f7f5ef', roughness: 0.24, metalness: 0.02, clearcoat: 0.45, clearcoatRoughness: 0.22 })
    const body = new THREE.Mesh(new RoundedBoxGeometry(2.75, 2.75, 2.55, 8, 0.2), bodyMaterial)
    body.castShadow = true
    body.receiveShadow = true
    clock.add(body)

    const dial = new THREE.Group()
    dial.position.z = 1.29
    clock.add(dial)

    const bezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.085, 18, 88),
      new THREE.MeshStandardMaterial({ color: '#e5e1d8', roughness: 0.28, metalness: 0.06 }),
    )
    dial.add(bezel)
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.865, 88),
      new THREE.MeshStandardMaterial({ color: '#191b1b', roughness: 0.42, metalness: 0.08 }),
    )
    face.position.z = 0.012
    dial.add(face)

    const inactiveMaterial = new THREE.MeshStandardMaterial({ color: '#41413d', roughness: 0.54, metalness: 0.05, emissive: '#171512', emissiveIntensity: 0.2 })
    const activeMaterial = new THREE.MeshStandardMaterial({ color: '#e59a50', roughness: 0.36, emissive: '#54290f', emissiveIntensity: 0.5 })
    const restMaterial = new THREE.MeshStandardMaterial({ color: '#85a899', roughness: 0.4, emissive: '#1f473e', emissiveIntensity: 0.45 })
    const ticks: THREE.Mesh[] = []
    const tickGeometry = new THREE.BoxGeometry(0.045, 0.13, 0.022)
    for (let index = 0; index < 60; index += 1) {
      const angle = Math.PI / 2 - index * Math.PI * 2 / 60
      const tick = new THREE.Mesh(tickGeometry, inactiveMaterial)
      tick.position.set(Math.cos(angle) * 0.71, Math.sin(angle) * 0.71, 0.04)
      tick.rotation.z = angle - Math.PI / 2
      if (index % 5 === 0) tick.scale.set(1.18, 1.28, 1)
      ticks.push(tick)
      dial.add(tick)
    }

    const faceLabels: THREE.Mesh[] = []
    const faceLabelTexture = (minutes: number) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 128
      const context = canvas.getContext('2d')
      if (context) {
        context.fillStyle = '#4b4a45'
        context.font = '600 68px Arial, sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(String(minutes), 128, 64)
      }
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    }
    const addFaceLabel = (minutes: number, position: THREE.Vector3, rotation: THREE.Euler) => {
      const texture = faceLabelTexture(minutes)
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.57, 0.285),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
      )
      label.position.copy(position)
      label.rotation.copy(rotation)
      faceLabels.push(label)
      clock.add(label)
    }
    addFaceLabel(faceDurations[0], new THREE.Vector3(0, 1.12, 1.29), new THREE.Euler())
    addFaceLabel(faceDurations[1], new THREE.Vector3(0, 1.12, -1.29), new THREE.Euler(0, Math.PI, 0))
    addFaceLabel(faceDurations[2], new THREE.Vector3(1.39, 1.12, 0), new THREE.Euler(0, Math.PI / 2, 0))
    addFaceLabel(faceDurations[3], new THREE.Vector3(-1.39, 1.12, 0), new THREE.Euler(0, -Math.PI / 2, 0))
    addFaceLabel(faceDurations[4], new THREE.Vector3(0, 1.39, 1.12), new THREE.Euler(-Math.PI / 2, 0, Math.PI))
    addFaceLabel(faceDurations[5], new THREE.Vector3(0, -1.39, 1.12), new THREE.Euler(Math.PI / 2, 0, 0))

    let dragging = false
    let dragMoved = false
    let previousX = 0
    let previousY = 0
    const targetOrientation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.045, 0.035, 0))
    const faceNormals = [
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
    ]
    const faceDialPositions = [
      new THREE.Vector3(0, 0, 1.39),
      new THREE.Vector3(0, 0, -1.39),
      new THREE.Vector3(1.39, 0, 0),
      new THREE.Vector3(-1.39, 0, 0),
      new THREE.Vector3(0, 1.39, 0),
      new THREE.Vector3(0, -1.39, 0),
    ]
    const faceDialRotations = [
      new THREE.Euler(),
      new THREE.Euler(0, Math.PI, 0),
      new THREE.Euler(0, Math.PI / 2, 0),
      new THREE.Euler(0, -Math.PI / 2, 0),
      new THREE.Euler(-Math.PI / 2, 0, Math.PI),
      new THREE.Euler(Math.PI / 2, 0, 0),
    ]
    const viewDirection = new THREE.Vector3()
    const cameraRight = new THREE.Vector3()
    const cameraUp = new THREE.Vector3()
    const updateCameraAxes = () => {
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld(true)
      cameraRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize()
      cameraUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize()
      viewDirection.copy(camera.position).normalize()
    }
    updateCameraAxes()
    const selectFacingFace = () => {
      let selectedIndex = 0
      let greatestAlignment = -Infinity
      faceNormals.forEach((normal, index) => {
        const alignment = normal.clone().applyQuaternion(targetOrientation).dot(viewDirection)
        if (alignment > greatestAlignment) {
          greatestAlignment = alignment
          selectedIndex = index
        }
      })
      const faceNormal = faceNormals[selectedIndex].clone().applyQuaternion(targetOrientation)
      dial.position.copy(faceDialPositions[selectedIndex])
      dial.rotation.copy(faceDialRotations[selectedIndex])
      targetOrientation.premultiply(new THREE.Quaternion().setFromUnitVectors(faceNormal, viewDirection))
      onSelectDurationRef.current(faceDurations[selectedIndex])
    }
    const rotateBy = (axis: 'horizontal' | 'vertical', direction: number) => {
      const rotationAxis = axis === 'horizontal' ? cameraUp : cameraRight
      const rotation = new THREE.Quaternion().setFromAxisAngle(rotationAxis, direction * Math.PI / 2)
      targetOrientation.premultiply(rotation)
      selectFacingFace()
    }
    rotateByRef.current = rotateBy
    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      dragMoved = false
      previousX = event.clientX
      previousY = event.clientY
      mount.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      if (Math.abs(event.clientX - previousX) + Math.abs(event.clientY - previousY) > 3) dragMoved = true
      const horizontalRotation = new THREE.Quaternion().setFromAxisAngle(cameraUp, (event.clientX - previousX) * 0.008)
      const verticalRotation = new THREE.Quaternion().setFromAxisAngle(cameraRight, (event.clientY - previousY) * 0.006)
      targetOrientation.premultiply(horizontalRotation).premultiply(verticalRotation)
      previousX = event.clientX
      previousY = event.clientY
    }
    const onPointerUp = () => {
      if (!dragging) return
      dragging = false
      if (!dragMoved) return
      dragMoved = false
      selectFacingFace()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') rotateBy('horizontal', -1)
      else if (event.key === 'ArrowRight') rotateBy('horizontal', 1)
      else if (event.key === 'ArrowUp') rotateBy('vertical', -1)
      else if (event.key === 'ArrowDown') rotateBy('vertical', 1)
      else return
      event.preventDefault()
    }
    mount.addEventListener('pointerdown', onPointerDown)
    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerup', onPointerUp)
    mount.addEventListener('pointercancel', onPointerUp)
    mount.addEventListener('keydown', onKeyDown)

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.position.z = width < 440 ? 9.2 : width < 650 ? 8.5 : 7.6
      camera.updateProjectionMatrix()
      updateCameraAxes()
    })
    resizeObserver.observe(mount)

    const projectedCenter = new THREE.Vector3()
    const projectedEdge = new THREE.Vector3()
    let animationFrame = 0
    const animate = (now: number) => {
      animationFrame = window.requestAnimationFrame(animate)
      clock.quaternion.slerp(targetOrientation, 0.13)
      clock.position.y = Math.sin(now * 0.0008) * (runningRef.current ? 0.025 : 0.012)

      const litTicks = Math.round(progressRef.current * ticks.length)
      const progressMaterial = modeRef.current === 'focus' ? activeMaterial : restMaterial
      ticks.forEach((tick, index) => { tick.material = index < litTicks ? progressMaterial : inactiveMaterial })

      dial.getWorldPosition(projectedCenter)
      projectedCenter.project(camera)
      projectedEdge.set(0.68, 0, 0)
      dial.localToWorld(projectedEdge)
      projectedEdge.project(camera)
      const centerX = (projectedCenter.x + 1) * 50
      const centerY = (1 - projectedCenter.y) * 50
      const radiusPixels = Math.abs(projectedEdge.x - projectedCenter.x) * mount.clientWidth / 2
      display.style.left = `${centerX}%`
      display.style.top = `${centerY}%`
      display.style.setProperty('--dial-font-size', `${THREE.MathUtils.clamp(radiusPixels * 0.53, 25, 46)}px`)
      display.style.setProperty('--dial-width', `${radiusPixels * 1.48}px`)
      renderer.render(scene, camera)
    }
    animationFrame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      mount.removeEventListener('pointerdown', onPointerDown)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerup', onPointerUp)
      mount.removeEventListener('pointercancel', onPointerUp)
      mount.removeEventListener('keydown', onKeyDown)
      rotateByRef.current = () => {}
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className={`timer-scene${running ? ' is-running' : ''}`}>
      <div className="clock-canvas" ref={mountRef} role="application" tabIndex={0} aria-label="Interactive timer cube. Drag or use arrow keys to select a focus duration." />
      <div className="cube-rotate-controls" role="group" aria-label="Rotate timer cube">
        <button type="button" aria-label="Rotate cube left" title="Rotate left" onClick={() => rotateByRef.current('horizontal', -1)}>←</button>
        <button type="button" aria-label="Rotate cube up" title="Rotate up" onClick={() => rotateByRef.current('vertical', -1)}>↑</button>
        <button type="button" aria-label="Rotate cube down" title="Rotate down" onClick={() => rotateByRef.current('vertical', 1)}>↓</button>
        <button type="button" aria-label="Rotate cube right" title="Rotate right" onClick={() => rotateByRef.current('horizontal', 1)}>→</button>
      </div>
      <div className="clock-readout" ref={displayRef} aria-live="off">
        <span className="readout-mode">{modeNames[mode]}</span>
        <span className="readout-time">{time}</span>
        <span className="readout-units">MIN <i /> SEC</span>
      </div>
      <span className="sr-only" role="timer" aria-label={`${modeNames[mode]} timer: ${time}`}>{time}</span>
    </div>
  )
}