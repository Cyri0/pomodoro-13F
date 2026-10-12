import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import {
  CUBE_FACE_NORMALS,
  CUBE_FACE_PRESETS,
  CUBE_FACE_UP,
  MODES,
  type Mode,
} from '../constants'
import { useTimerStore } from '../stores/timerStore'
import { formatTime } from '../utils'

function drawSideLabel(canvas: HTMLCanvasElement, minutes: number) {
  const context = canvas.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.textAlign = 'center'
  context.fillStyle = '#333432'
  context.font = '700 190px Arial, sans-serif'
  context.fillText(String(minutes).padStart(2, '0'), 256, 292)
  context.fillStyle = '#777873'
  context.font = '600 32px Arial, sans-serif'
  context.letterSpacing = '10px'
  context.fillText('PERC', 256, 350)
}

function drawDisplay(canvas: HTMLCanvasElement, seconds: number, progress: number, mode: Mode) {
  const context = canvas.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.beginPath()
  context.arc(256, 256, 226, 0, Math.PI * 2)
  context.fillStyle = '#171817'
  context.fill()

  context.beginPath()
  context.arc(256, 256, 198, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
  context.strokeStyle = 'rgba(255,255,255,0.1)'
  context.lineWidth = 15
  context.stroke()

  context.beginPath()
  context.arc(256, 256, 198, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
  context.strokeStyle = '#ff873f'
  context.lineWidth = 15
  context.lineCap = 'round'
  context.stroke()

  context.textAlign = 'center'
  context.fillStyle = '#f9f8f4'
  context.font = '500 104px monospace'
  context.letterSpacing = '-7px'
  context.fillText(formatTime(seconds), 256, 280)

  context.fillStyle = 'rgba(255,255,255,0.52)'
  context.font = '600 23px Arial, sans-serif'
  context.letterSpacing = '6px'
  context.fillText(mode === 'focus' ? 'FÓKUSZ' : 'SZÜNET', 256, 332)
}

export function CubeScene() {
  const mode = useTimerStore((state) => state.mode)
  const seconds = useTimerStore((state) => state.secondsLeft)
  const customDuration = useTimerStore((state) => state.customDuration)
  const selectDuration = useTimerStore((state) => state.selectDuration)
  const duration = customDuration ?? MODES[mode].duration
  const progress = 1 - seconds / duration
  const selectedMinutes = Math.round(duration / 60)
  const mountRef = useRef<HTMLDivElement>(null)
  const displayRef = useRef({ mode, seconds, progress, selectedMinutes })

  useEffect(() => {
    displayRef.current = { mode, seconds, progress, selectedMinutes }
  }, [mode, progress, seconds, selectedMinutes])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0, 8.2)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-label', 'Interaktív időzítőkocka. Húzd el az időtartam kiválasztásához.')
    renderer.domElement.setAttribute('role', 'img')
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 2.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5)
    keyLight.position.set(-4, 6, 8)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffd8b7, 1.1)
    fillLight.position.set(5, 1, 3)
    scene.add(fillLight)

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: '#f6f5f0',
      roughness: 0.26,
      metalness: 0.02,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
    })
    const cube = new THREE.Mesh(new RoundedBoxGeometry(2.8, 2.8, 2.8, 7, 0.2), bodyMaterial)
    scene.add(cube)

    const faceCanvases = Array.from({ length: 6 }, () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      return canvas
    })
    const faceTextures = faceCanvases.map((canvas) => {
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    })
    const faceGeometry = new THREE.PlaneGeometry(2.35, 2.35)
    const faceMaterials = faceTextures.map(
      (map) => new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false }),
    )
    faceMaterials.forEach((material, index) => {
      const face = new THREE.Mesh(faceGeometry, material)
      const offset = 1.405
      if (index === 0) {
        face.position.x = offset
        face.rotation.y = Math.PI / 2
      } else if (index === 1) {
        face.position.x = -offset
        face.rotation.y = -Math.PI / 2
      } else if (index === 2) {
        face.position.y = offset
        face.rotation.x = -Math.PI / 2
      } else if (index === 3) {
        face.position.y = -offset
        face.rotation.x = Math.PI / 2
      } else if (index === 4) {
        face.position.z = offset
      } else {
        face.position.z = -offset
        face.rotation.y = Math.PI
      }
      cube.add(face)
    })

    const initialRotation = new THREE.Euler(-0.12, -0.17, 0)
    cube.rotation.copy(initialRotation)
    const targetQuaternion = new THREE.Quaternion()
    const desiredFront = new THREE.Vector3(0, 0, 1).applyEuler(initialRotation).normalize()
    const desiredUp = new THREE.Vector3(0, 1, 0)
      .applyEuler(initialRotation)
      .projectOnPlane(desiredFront)
      .normalize()
    const desiredRight = new THREE.Vector3().crossVectors(desiredUp, desiredFront).normalize()
    desiredUp.crossVectors(desiredFront, desiredRight).normalize()
    let isSnapping = false
    let pointerStart: { x: number; y: number; quaternion: THREE.Quaternion } | null = null
    let hasDragged = false
    let previousSelection = CUBE_FACE_PRESETS[4]

    const snapToFace = (faceIndex: number) => {
      const faceNormal = CUBE_FACE_NORMALS[faceIndex]
      const faceUp = CUBE_FACE_UP[faceIndex]
      const faceRight = new THREE.Vector3().crossVectors(faceUp, faceNormal)
      const faceBasis = new THREE.Matrix4().makeBasis(faceRight, faceUp, faceNormal)
      const desiredBasis = new THREE.Matrix4().makeBasis(desiredRight, desiredUp, desiredFront)
      targetQuaternion.setFromRotationMatrix(desiredBasis.multiply(faceBasis.invert()))
      isSnapping = true
    }

    const onPointerDown = (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY, quaternion: cube.quaternion.clone() }
      hasDragged = false
      isSnapping = false
      renderer.domElement.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerStart) return
      const deltaX = event.clientX - pointerStart.x
      const deltaY = event.clientY - pointerStart.y
      if (Math.abs(deltaX) + Math.abs(deltaY) > 4) hasDragged = true

      const dragRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(deltaY * 0.008, deltaX * 0.008, 0, 'XYZ'),
      )
      cube.quaternion.copy(pointerStart.quaternion).multiply(dragRotation)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!pointerStart) return
      pointerStart = null
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId)
      }
      if (!hasDragged) return

      let selectedFace = 0
      let mostFrontFacing = -Infinity
      CUBE_FACE_NORMALS.forEach((normal, index) => {
        const facing = normal.clone().applyQuaternion(cube.quaternion).z
        if (facing > mostFrontFacing) {
          mostFrontFacing = facing
          selectedFace = index
        }
      })

      const selectedPreset = CUBE_FACE_PRESETS[selectedFace]
      previousSelection = selectedPreset
      snapToFace(selectedFace)
      selectDuration(selectedPreset)
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerUp)

    let previousDisplay = ''
    const syncTextures = () => {
      const display = displayRef.current
      const selectedFace = CUBE_FACE_PRESETS.indexOf(display.selectedMinutes)
      const key = `${display.mode}:${display.seconds}:${display.progress}:${selectedFace}`
      if (key === previousDisplay) return
      previousDisplay = key

      faceCanvases.forEach((canvas, index) => {
        if (index === selectedFace) {
          drawDisplay(canvas, display.seconds, display.progress, display.mode)
        } else {
          drawSideLabel(canvas, CUBE_FACE_PRESETS[index])
        }
      })
      faceTextures.forEach((texture) => {
        texture.needsUpdate = true
      })
    }

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    })
    resizeObserver.observe(mount)

    let animationFrame = 0
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animate = () => {
      syncTextures()
      const selection = displayRef.current.selectedMinutes
      if (selection !== previousSelection) {
        previousSelection = selection
        snapToFace(CUBE_FACE_PRESETS.indexOf(selection))
      }
      if (isSnapping) {
        if (prefersReducedMotion.matches) {
          cube.quaternion.copy(targetQuaternion)
          isSnapping = false
        } else {
          cube.quaternion.slerp(targetQuaternion, 0.16)
          if (cube.quaternion.angleTo(targetQuaternion) < 0.002) {
            cube.quaternion.copy(targetQuaternion)
            isSnapping = false
          }
        }
      }
      renderer.render(scene, camera)
      animationFrame = window.requestAnimationFrame(animate)
    }
    animationFrame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      scene.remove(cube)
      cube.geometry.dispose()
      bodyMaterial.dispose()
      faceGeometry.dispose()
      faceMaterials.forEach((material) => material.dispose())
      faceTextures.forEach((texture) => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [selectDuration])

  return <div className="cube-canvas" ref={mountRef} />
}
