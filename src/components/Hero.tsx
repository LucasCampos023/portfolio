import { lazy, Suspense, useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { profile } from '@/data/content'

// Three.js é o maior pedaço do bundle: entra por import() dinâmico, depois do
// primeiro paint. O texto do hero não espera o WebGL para aparecer.
const HeroCanvas = lazy(() =>
  import('./HeroCanvas').then((m) => ({ default: m.HeroCanvas })),
)

/** Marca de canto com rótulo — o "carimbo" da ficha. */
function Corner({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className: string
}) {
  return (
    <div className={`absolute hidden sm:block ${className}`}>
      <span className="stamp block">{label}</span>
      <span className="mt-1 block font-mono text-xs text-[var(--fg-dim)]">
        {value}
      </span>
    </div>
  )
}

export function Hero() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Camadas: quanto mais "à frente" o elemento, mais ele anda. O terreno
  // WebGL fica quase parado, o nome acompanha devagar e o bloco de texto
  // desliza na frente — é a diferença entre eles que cria a profundidade.
  const yTerrain = useTransform(scrollYProgress, [0, 1], [0, 60])
  const yName = useTransform(scrollYProgress, [0, 1], [0, 170])
  const yBlock = useTransform(scrollYProgress, [0, 1], [0, 300])
  const yStamps = useTransform(scrollYProgress, [0, 1], [0, 420])
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const fadeSlow = useTransform(scrollYProgress, [0, 1], [1, 0.15])

  const revision = `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}`

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[calc(100svh-57px)] flex-col justify-between overflow-hidden border-b"
    >
      <motion.div
        style={{ y: yStamps }}
        className="absolute inset-0 -z-20 blueprint opacity-60"
      />
      <motion.div
        style={{ y: yTerrain, opacity: fadeSlow }}
        className="absolute inset-0 -z-10"
      >
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
      </motion.div>

      {/* Réguas: marcam a moldura como folha de desenho. */}
      <div className="ruler-x w-full opacity-70" />

      <Corner
        label={t('hero.rev')}
        value={revision}
        className="bottom-20 right-4 text-right lg:right-8"
      />

      <motion.div
        style={{ opacity: fade }}
        className="relative flex w-full flex-1 flex-col justify-center py-14"
      >
        <div>
          <div className="mx-auto mb-6 flex max-w-6xl items-center gap-4 px-4 sm:px-8">
            <span className="stamp">
              {t('hero.sheet')} 01 / 06
            </span>
            <span className="stamp text-[var(--accent)]">{t('hero.role')}</span>
            <span className="h-px flex-1 bg-[var(--rule)]" />
            <span className="stamp hidden sm:block">
              {t('hero.since', { year: profile.since })}
            </span>
          </div>

          {/*
            O nome sangra de ponta a ponta: sai do container e ocupa a largura
            inteira da viewport. `clamp` deixa a letra crescer com a tela mas
            trava nos extremos, e o tracking negativo fecha os vãos que
            aparecem nesse corpo — em display grande o espacejamento padrão
            da fonte fica largo demais.
          */}
          <motion.h1
            style={{ y: yName }}
            className="display w-full px-4 text-[clamp(3.2rem,15.2vw,15rem)] leading-[0.82] tracking-[-0.045em] sm:px-8"
          >
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Lucas
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="block text-[var(--fg-dim)]"
            >
              Campos
            </motion.span>
          </motion.h1>

          <motion.div
            style={{ y: yBlock }}
            className="mx-auto mt-10 grid max-w-6xl gap-8 border-t px-4 pt-8 sm:px-8 md:grid-cols-[1.1fr_1fr]"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="display text-2xl leading-[1.05] sm:text-4xl"
            >
              {t('hero.headline1')}{' '}
              <span className="text-[var(--accent)]">
                {t('hero.headline2')}
              </span>{' '}
              {t('hero.headline3')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.6 }}
            >
              <p className="prose-serif max-w-sm text-base leading-relaxed dim sm:text-lg">
                {t('hero.sub')}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#work"
                  className="bg-[var(--accent)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[var(--on-accent)] transition-opacity hover:opacity-85"
                >
                  {t('hero.cta')}
                </a>
                <a
                  href="#contact"
                  className="border border-[var(--rule)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {t('hero.ctaAlt')}
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="relative flex items-center justify-between border-t px-4 py-3 sm:px-8">
        <span className="stamp">{profile.location}</span>
        <a href="#about" className="stamp hover:text-[var(--accent)]">
          ↓ {t('hero.scroll')}
        </a>
        <span className="stamp hidden sm:block">
          {profile.handle}
        </span>
      </div>
    </section>
  )
}
