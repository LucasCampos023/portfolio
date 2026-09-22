import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/usePointer'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

/**
 * Narrativa guiada pelo scroll (scrollytelling).
 *
 * A seção é fixada na tela por 5 alturas de viewport e o progresso do scroll
 * vira o índice do passo atual — a página "trava" e o conteúdo avança no lugar
 * dela. Cada passo conta uma etapa real do carregamento deste site, com os
 * números que saíram do build de produção.
 *
 * O pin fica num wrapper e o conteúdo animado fica dentro: pinar o mesmo
 * elemento que se anima faz o ScrollTrigger recalcular a própria altura a
 * cada frame e o scroll começa a tremer.
 */

const STEPS = 6

export function Pipeline() {
  const { t } = useTranslation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const wrapper = wrapperRef.current
    const pin = pinRef.current
    if (!wrapper || !pin || reduced) return

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${window.innerHeight * STEPS}`,
      pin,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress)
        // O último passo precisa de faixa própria, daí o STEPS - 1.
        const index = Math.min(
          Math.floor(self.progress * STEPS),
          STEPS - 1,
        )
        setStep(index)
      },
    })

    return () => {
      trigger.kill()
    }
  }, [reduced])

  const steps = Array.from({ length: STEPS }, (_, i) => ({
    n: String(i + 1).padStart(2, '0'),
    title: t(`pipeline.steps.${i}.title`),
    detail: t(`pipeline.steps.${i}.detail`),
    metric: t(`pipeline.steps.${i}.metric`),
  }))

  // Sem pin: vira uma lista comum, legível e sem movimento.
  if (reduced) {
    return (
      <section className="border-b px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="stamp text-[var(--accent)]">/ {t('pipeline.kicker')}</span>
          <h2 className="display mt-4 text-4xl sm:text-5xl">
            {t('pipeline.title')}
          </h2>
          <ol className="mt-10 space-y-6">
            {steps.map((s) => (
              <li key={s.n} className="border-t pt-5">
                <span className="stamp">{s.n}</span>
                <h3 className="display mt-2 text-2xl">{s.title}</h3>
                <p className="prose-serif mt-2 max-w-xl dim">{s.detail}</p>
                <p className="mt-2 font-mono text-sm text-[var(--accent)]">
                  {s.metric}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <div ref={wrapperRef} className="relative border-b">
      <div ref={pinRef} className="h-[100svh] overflow-hidden">
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-8">
          <div className="mb-10 flex items-baseline gap-4">
            <span className="stamp text-[var(--accent)]">
              / {t('pipeline.kicker')}
            </span>
            <span className="h-px flex-1 bg-[var(--rule)]" />
            <span className="stamp">
              {String(step + 1).padStart(2, '0')} / {String(STEPS).padStart(2, '0')}
            </span>
          </div>

          <div className="grid gap-10 md:grid-cols-[1fr_1.15fr] md:items-center">
            {/* Trilha: cada passo acende quando chega a vez dele. */}
            <ol className="order-2 space-y-1 md:order-1">
              {steps.map((s, i) => (
                <li
                  key={s.n}
                  className={cn(
                    'flex items-center gap-4 border-l-2 py-2.5 pl-4 transition-all duration-500',
                    i === step
                      ? 'border-[var(--accent)] opacity-100'
                      : i < step
                        ? 'border-[var(--rule)] opacity-45'
                        : 'border-transparent opacity-20',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[11px] transition-colors',
                      i === step ? 'text-[var(--accent)]' : 'faint',
                    )}
                  >
                    {s.n}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-xs uppercase tracking-widest',
                      i === step && 'text-[var(--fg)]',
                    )}
                  >
                    {s.title}
                  </span>
                </li>
              ))}
            </ol>

            {/* Painel do passo atual. A `key` força o remonte, e com ele a
                animação de entrada dispara a cada troca. */}
            <div className="order-1 md:order-2">
              <div key={step} className="animate-[fadeUp_0.5s_ease-out]">
                <p className="display text-[clamp(2rem,5vw,4rem)] leading-[1.02]">
                  {steps[step].title}
                </p>
                <p className="prose-serif mt-5 max-w-lg text-base leading-relaxed dim sm:text-lg">
                  {steps[step].detail}
                </p>
                <p className="mt-6 border-t pt-4 font-mono text-2xl text-[var(--accent)] sm:text-3xl">
                  {steps[step].metric}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progresso da narrativa inteira. */}
          {/* A barra corre de ciano a âmbar: a cor na ponta diz o quanto
              falta, sem precisar de número. */}
          <div className="mt-12 h-px w-full bg-[var(--rule)]">
            <div
              className="h-px bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] transition-none"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
