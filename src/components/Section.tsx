import { motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { Parallax } from './Parallax'

interface SectionProps {
  id: string
  n: string
  title: string
  sub?: string
  children: ReactNode
  className?: string
}

/**
 * Casca das seções: número, filete, título e o conteúdo.
 * Também registra a visita no store (o Lab exibe esse contador).
 */
export function Section({
  id,
  n,
  title,
  sub,
  children,
  className,
}: SectionProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.08 })
  const markVisited = useAppStore((s) => s.markVisited)

  useEffect(() => {
    if (inView) markVisited(id)
  }, [inView, id, markVisited])

  return (
    <section
      ref={ref}
      id={id}
      className={cn('border-b px-4 py-20 sm:px-8 sm:py-28', className)}
    >
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 grid gap-6 border-b pb-8 md:grid-cols-[1fr_auto] md:items-end md:gap-12"
        >
          <div>
            <span className="stamp mb-4 block text-[var(--accent)]">
              [ {n} ]
            </span>
            <h2 className="display text-4xl sm:text-6xl">{title}</h2>
          </div>

          {sub && (
            // Velocidade baixa: a legenda só flutua em relação ao título.
            <Parallax speed={26}>
              <p className="prose-serif max-w-xs text-sm leading-relaxed dim md:text-right">
                {sub}
              </p>
            </Parallax>
          )}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
