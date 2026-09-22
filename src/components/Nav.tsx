import { motion, useScroll, useSpring } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

const links = [
  { id: 'about', n: '01' },
  { id: 'work', n: '02' },
  { id: 'tools', n: '03' },
  { id: 'lab', n: '04' },
  { id: 'terminal', n: '05' },
  { id: 'contact', n: '06' },
] as const

export function Nav() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme, lang, setLang, setPaletteOpen } = useAppStore()
  const [active, setActive] = useState('')

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  })

  useEffect(() => {
    const sections = links
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        }),
      { rootMargin: '-45% 0px -50% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const switchLang = () => {
    const next = lang === 'pt' ? 'en' : 'pt'
    setLang(next)
    void i18n.changeLanguage(next)
    document.documentElement.lang = next === 'pt' ? 'pt-BR' : 'en'
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-[var(--bg)]">
      <nav className="mx-auto flex max-w-6xl items-stretch justify-between px-4 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 py-3.5 font-mono text-xs uppercase tracking-widest"
        >
          <span className="grid h-5 w-5 place-items-center border border-[var(--accent)] text-[10px] font-semibold text-[var(--accent)]">
            L
          </span>
          <span>Campos</span>
        </a>

        <ul className="hidden items-stretch md:flex">
          {links.map(({ id, n }) => (
            <li key={id} className="flex">
              <a
                href={`#${id}`}
                className={cn(
                  'flex items-center gap-1.5 border-l px-4 font-mono text-xs uppercase tracking-widest transition-colors',
                  active === id
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--fg-dim)] hover:text-[var(--fg)]',
                )}
              >
                <span
                  className={cn(
                    'text-[10px]',
                    active === id
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--fg-faint)]',
                  )}
                >
                  {n}
                </span>
                {t(`nav.${id}`)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-stretch">
          {/* Em telas pequenas o menu some, então este botão é a única
              navegação que sobra: abre a mesma paleta, tocável. */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="border-l px-3.5 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] transition-colors hover:text-[var(--accent)]"
            aria-label={t('nav.menuLabel')}
          >
            <span className="md:hidden">{t('nav.menu')}</span>
            <span className="hidden md:inline">⌘K</span>
          </button>
          <button
            onClick={switchLang}
            className="border-l px-3.5 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] transition-colors hover:text-[var(--accent)]"
            aria-label="Alternar idioma"
          >
            {lang === 'pt' ? 'PT' : 'EN'}
          </button>
          <button
            onClick={toggleTheme}
            className="border-l px-3.5 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] transition-colors hover:text-[var(--accent)]"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? 'LGT' : 'DRK'}
          </button>
        </div>
      </nav>

      {/* Progresso do scroll como filete de 2px, colado na borda da barra. */}
      <motion.div
        style={{ scaleX: progress }}
        className="h-0.5 origin-left bg-[var(--accent)]"
      />
    </header>
  )
}
