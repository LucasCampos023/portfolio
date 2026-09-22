import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/hooks/usePointer'
import { cn } from '@/lib/utils'

/**
 * Inclinação 3D seguindo o ponteiro, com um brilho que acompanha o cursor.
 *
 * A perspectiva vai no elemento de fora e a rotação no de dentro: aplicar as
 * duas no mesmo nó faz o ponto de fuga girar junto e o efeito "entorta".
 *
 * Tudo em motion values — o movimento acontece fora do ciclo de render do
 * React, então inclinar dez cards não custa dez re-renders.
 */
export function Tilt({
  children,
  className,
  max = 7,
  glare = true,
}: {
  children: ReactNode
  className?: string
  /** Rotação máxima em graus. Acima de ~10 o conteúdo fica difícil de ler. */
  max?: number
  glare?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Posição do ponteiro dentro do card, de -0.5 a 0.5.
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const spring = { stiffness: 220, damping: 22, mass: 0.5 }
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring)

  // Brilho que segue o ponteiro. Montado aqui em cima, e não dentro do JSX:
  // hook depois do early return de `reduced` seria chamada condicional.
  const glareBackground = useTransform(
    [px, py],
    ([x, y]: number[]) =>
      `radial-gradient(420px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 60%)`,
  )

  const onMove = (event: React.PointerEvent) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const reset = () => {
    px.set(0)
    py.set(0)
  }

  if (reduced) return <div className={className}>{children}</div>

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn('[perspective:1100px]', className)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full will-change-transform"
      >
        {children}

        {glare && (
          <motion.div
            aria-hidden
            style={{ background: glareBackground }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </motion.div>
    </div>
  )
}
