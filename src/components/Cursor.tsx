import { useEffect, useRef, useState } from 'react'
import { lerp } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/usePointer'

/**
 * Mira de enquadramento em vez de bolinha: um quadrado fino que segue o
 * ponteiro com atraso e abre sobre elementos clicáveis.
 * Só existe em ponteiro fino — em touch seria um fantasma inútil.
 */
export function Cursor() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches)
  }, [])

  useEffect(() => {
    if (!enabled || reduced) return

    const target = { x: innerWidth / 2, y: innerHeight / 2 }
    const box = { ...target }
    let frame = 0

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY

      const element = event.target as HTMLElement | null
      setHovering(Boolean(element?.closest('a, button, input, textarea')))
    }

    const tick = () => {
      box.x = lerp(box.x, target.x, 0.2)
      box.y = lerp(box.y, target.y, 0.2)
      if (boxRef.current) {
        boxRef.current.style.transform = `translate3d(${box.x}px, ${box.y}px, 0) translate(-50%, -50%)`
      }
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled, reduced])

  if (!enabled || reduced) return null

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[200] border border-[var(--accent)] transition-[width,height,opacity] duration-150 ease-out"
      style={{
        width: hovering ? 34 : 16,
        height: hovering ? 34 : 16,
        opacity: hovering ? 1 : 0.55,
      }}
    />
  )
}
