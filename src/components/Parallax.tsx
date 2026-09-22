import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/hooks/usePointer'
import { cn } from '@/lib/utils'

/**
 * Deslocamento vertical proporcional ao progresso do elemento pela viewport.
 *
 * `speed` é a distância, em pixels, que a camada percorre para cada lado do
 * centro: positivo sobe (camada "à frente", anda mais que a página), negativo
 * desce (camada "ao fundo", fica para trás). Valores entre 20 e 120 funcionam;
 * acima disso o olho percebe o truque.
 *
 * O `offset` vai de "o elemento acabou de entrar por baixo" até "acabou de sair
 * por cima", então o deslocamento é zero exatamente quando ele está no centro
 * da tela — que é onde o leitor costuma parar.
 */
export function useParallax(speed = 60) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [speed, -speed],
  )

  // A mola tira o degrau do scroll do mouse (que chega em saltos de ~100px).
  const y = useSpring(raw, { stiffness: 90, damping: 24, restDelta: 0.5 })

  return { ref, y }
}

/** Envolve um bloco e o desloca conforme ele atravessa a viewport. */
export function Parallax({
  children,
  speed = 60,
  className,
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const { ref, y } = useParallax(speed)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}
