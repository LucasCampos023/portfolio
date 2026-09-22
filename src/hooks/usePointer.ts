import { useEffect, useRef, useState } from 'react'

export interface Pointer {
  x: number
  y: number
  /** Normalizado em [-1, 1], que é o que os shaders esperam. */
  nx: number
  ny: number
}

const initial: Pointer = { x: 0, y: 0, nx: 0, ny: 0 }

/**
 * Posição do ponteiro. Atualiza um ref a cada evento (para quem lê em rAF,
 * como o Three.js) e o state só a cada frame (para quem renderiza em React).
 */
export function usePointer() {
  const ref = useRef<Pointer>(initial)
  const [pointer, setPointer] = useState<Pointer>(initial)

  useEffect(() => {
    let frame = 0
    let dirty = false

    const onMove = (event: PointerEvent) => {
      ref.current = {
        x: event.clientX,
        y: event.clientY,
        nx: (event.clientX / window.innerWidth) * 2 - 1,
        ny: -((event.clientY / window.innerHeight) * 2 - 1),
      }
      dirty = true
    }

    const tick = () => {
      if (dirty) {
        setPointer(ref.current)
        dirty = false
      }
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return { pointer, pointerRef: ref }
}

/** `true` quando o usuário pediu menos animação no sistema operacional. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}
