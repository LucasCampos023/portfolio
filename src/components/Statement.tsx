import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useParallax } from './Parallax'
import { useInView } from '@/hooks/useInView'

/**
 * Bloco de cor sólida entre duas seções. Existe por ritmo: depois de várias
 * telas de preto, uma faixa saturada reseta o olho e separa os assuntos
 * melhor do que qualquer divisória fina conseguiria.
 *
 * As palavras sobem uma a uma quando o bloco entra — mesma ideia do título
 * do "Sobre", mas aqui sem o GSAP, porque são poucas palavras.
 */
export function Statement() {
  const { t } = useTranslation()
  const { ref, y } = useParallax(38)
  const { ref: inViewRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.35,
  })

  const words = (t('statement.line') as string).split(' ')

  return (
    <section
      ref={inViewRef}
      // Âmbar, e não ciano, justamente por ser o único bloco de cor cheia da
      // página: em ciano ele repetiria a tinta que já está em todo o resto e
      // deixaria de ser uma quebra de ritmo.
      className="relative overflow-hidden border-b bg-[var(--accent-2)] py-20 text-[var(--on-accent-2)] sm:py-28"
    >
      <div ref={ref} className="mx-auto max-w-6xl px-4 sm:px-8">
        <motion.div style={{ y }}>
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">
            / {t('statement.kicker')}
          </span>

          {/*
            leading folgado de propósito: a máscara de cada palavra é
            `overflow-hidden`, e com entrelinha apertada ela corta os acentos
            das maiúsculas (CÓDIGO, DOCUMENTAÇÃO). O `pt` dentro da máscara
            devolve o espaço do glifo acentuado.
          */}
          <p className="display mt-5 text-[clamp(2rem,6.4vw,5.5rem)] leading-[1.06]">
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="inline-block overflow-hidden pt-[0.12em] align-bottom"
              >
                <motion.span
                  initial={{ y: '110%' }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block pr-[0.22em]"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </p>

          <p className="prose-serif mt-7 max-w-lg text-base leading-relaxed opacity-75 sm:text-lg">
            {t('statement.sub')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
