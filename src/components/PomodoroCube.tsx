import { useCallback, useEffect, useRef, useState, type PointerEvent, type TransitionEvent } from 'react'
import CubeFace from './CubeFace'
import { POMODORO_MODES } from '../store/pomodoroStore'
import { usePomodoroStore } from '../store/pomodoroStore'
import type { FaceId } from '../utils/getTopFace'
import { getFrontFace } from '../utils/getTopFace'
import './PomodoroCube.css'

type Rotation = { x: number; y: number }
type DragStart = Rotation & { pointerX: number; pointerY: number }
type ModeRequest = { modeId: FaceId; requestId: number } | null

type PomodoroCubeProps = {
  selectionRequest: ModeRequest
}

const BASE_ROTATION: Rotation = { x: -26, y: -32 }
const DEGREES_PER_PIXEL = 1.5
const DRAG_THRESHOLD = 4
const SNAP_THRESHOLD = 24
const ANIMATION_DURATION_MS = 850

function shortestAngleDelta(target: number, current: number): number {
  return (((target - current) % 360) + 540) % 360 - 180
}

function snapAngle(degrees: number, baseAngle: number): number {
  return baseAngle + Math.round((degrees - baseAngle) / 90) * 90
}

function snapDragAngle(rawAngle: number, startAngle: number, baseAngle: number): number {
  const closestAngle = snapAngle(rawAngle, baseAngle)
  const dragDistance = rawAngle - startAngle

  if (closestAngle === startAngle && Math.abs(dragDistance) >= SNAP_THRESHOLD) {
    return startAngle + Math.sign(dragDistance) * 90
  }

  return closestAngle !== startAngle && Math.abs(dragDistance) < SNAP_THRESHOLD
    ? startAngle
    : closestAngle
}

function getRotationForMode(modeId: FaceId, current: Rotation): Rotation {
  let bestRotation: Rotation | undefined
  let bestDistance = Number.POSITIVE_INFINITY

  for (let x = BASE_ROTATION.x; x < BASE_ROTATION.x + 360; x += 90) {
    for (let y = BASE_ROTATION.y; y < BASE_ROTATION.y + 360; y += 90) {
      if (getFrontFace(x, y) !== modeId) continue

      const deltaX = shortestAngleDelta(x, current.x)
      const deltaY = shortestAngleDelta(y, current.y)
      const distance = Math.abs(deltaX) + Math.abs(deltaY)

      if (distance < bestDistance) {
        bestDistance = distance
        bestRotation = { x: current.x + deltaX, y: current.y + deltaY }
      }
    }
  }

  if (!bestRotation) {
    throw new Error(`No cube orientation found for mode: ${modeId}`)
  }

  return bestRotation
}

function PomodoroCube({ selectionRequest }: PomodoroCubeProps) {
  const [rotation, setRotation] = useState<Rotation>(BASE_ROTATION)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const rotationRef = useRef(rotation)
  const dragStartRef = useRef<DragStart | null>(null)
  const animationPendingRef = useRef(false)
  const animationTimeoutRef = useRef<number | null>(null)
  const lastRequestIdRef = useRef(0)
  const setActiveMode = usePomodoroStore((state) => state.setActiveMode)

  const updateRotation = useCallback((nextRotation: Rotation) => {
    rotationRef.current = nextRotation
    setRotation(nextRotation)
    animationPendingRef.current = true
    setIsAnimating(true)
  }, [])

  const finishRotation = useCallback(() => {
    if (!animationPendingRef.current) return

    animationPendingRef.current = false
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    setIsAnimating(false)
    setActiveMode(getFrontFace(rotationRef.current.x, rotationRef.current.y))
  }, [setActiveMode])

  useEffect(() => {
    if (!isAnimating) return

    animationTimeoutRef.current = window.setTimeout(finishRotation, ANIMATION_DURATION_MS)
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current)
        animationTimeoutRef.current = null
      }
    }
  }, [isAnimating, finishRotation])

  useEffect(() => {
    if (!selectionRequest || isAnimating || selectionRequest.requestId === lastRequestIdRef.current) return

    lastRequestIdRef.current = selectionRequest.requestId

    const nextRotation = getRotationForMode(selectionRequest.modeId, rotationRef.current)
    if (nextRotation.x === rotationRef.current.x && nextRotation.y === rotationRef.current.y) {
      setActiveMode(selectionRequest.modeId)
      return
    }

    updateRotation(nextRotation)
  }, [selectionRequest, isAnimating, setActiveMode, updateRotation])

  useEffect(
    () => () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current)
      }
    },
    [],
  )

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isAnimating || event.target instanceof HTMLButtonElement) return

    event.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      ...rotationRef.current,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current
    if (!dragStart) return

    const nextRotation = {
      x: dragStart.x - (event.clientY - dragStart.pointerY) / DEGREES_PER_PIXEL,
      y: dragStart.y + (event.clientX - dragStart.pointerX) / DEGREES_PER_PIXEL,
    }

    rotationRef.current = nextRotation
    setRotation(nextRotation)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current
    dragStartRef.current = null
    setIsDragging(false)
    if (!dragStart) return

    const deltaX = event.clientY - dragStart.pointerY
    const deltaY = event.clientX - dragStart.pointerX
    if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
      rotationRef.current = dragStart
      setRotation(dragStart)
      return
    }

    const rawRotation = {
      x: dragStart.x - deltaX / DEGREES_PER_PIXEL,
      y: dragStart.y + deltaY / DEGREES_PER_PIXEL,
    }
    const nextRotation = {
      x: snapDragAngle(rawRotation.x, dragStart.x, BASE_ROTATION.x),
      y: snapDragAngle(rawRotation.y, dragStart.y, BASE_ROTATION.y),
    }

    if (nextRotation.x !== dragStart.x || nextRotation.y !== dragStart.y) {
      updateRotation(nextRotation)
    } else {
      rotationRef.current = dragStart
      setRotation(dragStart)
    }
  }

  const onPointerCancel = () => {
    const dragStart = dragStartRef.current
    dragStartRef.current = null
    setIsDragging(false)
    if (!dragStart) return

    const restoredRotation = { x: dragStart.x, y: dragStart.y }
    rotationRef.current = restoredRotation
    setRotation(restoredRotation)
  }

  const selectMode = (modeId: FaceId) => {
    if (isAnimating) return
    const nextRotation = getRotationForMode(modeId, rotationRef.current)

    if (nextRotation.x === rotationRef.current.x && nextRotation.y === rotationRef.current.y) {
      setActiveMode(modeId)
      return
    }

    updateRotation(nextRotation)
  }

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === 'transform') {
      finishRotation()
    }
  }

  return (
    <div
      className={`cube-stage${isAnimating ? ' is-animating' : ''}${isDragging ? ' is-dragging' : ''}`}
      role="group"
      aria-label="Pomodoro-kocka. Húzd el a kívánt időzítőoldal előre fordításához."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onPointerCancel}
    >
      <div className="cube-perspective">
        <div
          className={`pomodoro-cube${isAnimating ? ' is-animating' : ''}`}
          style={{ transform: `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {POMODORO_MODES.map((mode) => (
            <CubeFace
              key={mode.id}
              mode={mode}
              rotationX={rotation.x}
              rotationY={rotation.y}
            />
          ))}
        </div>
      </div>
      <div className="cube-quick-picks" aria-label="Gyors módválasztás">
        {POMODORO_MODES.map((mode) => (
          <button
            className="cube-quick-pick"
            key={mode.id}
            type="button"
            onClick={() => selectMode(mode.id)}
            disabled={isAnimating}
            aria-label={`${mode.name} kiválasztása`}
          >
            {mode.shortName}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PomodoroCube
